import { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { obtenerServicio } from '../../../api/servicios';
import { obtenerOdontologos } from '../../../api/odontologos';
import { obtenerHorasOcupadas } from '../../../api/citas';

// Debe coincidir exactamente con el enum de Odontologo.horario.dia del backend
// (incluye "Sabado" sin tilde).
const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sabado'];

// Genera horas candidatas cada 30 minutos entre horaInicio y horaFin.
// Se usa un paso fijo (no la duración del servicio) porque el backend
// detecta choques por igualdad exacta de "hora" (odontologo+fecha+hora),
// no por solapamiento de rangos — así que las horas que ofrecemos aquí
// tienen que caer en la misma granularidad que el backend compara.
function generarSlots(horaInicio, horaFin, pasoMinutos = 30) {
  const slots = [];
  let [h, m] = horaInicio.split(':').map(Number);
  const [hFin, mFin] = horaFin.split(':').map(Number);

  while (h < hFin || (h === hFin && m < mFin)) {
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    m += pasoMinutos;
    if (m >= 60) {
      m -= 60;
      h += 1;
    }
  }

  return slots;
}

function ServicioDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { actualizarAgendamiento } = useOutletContext();

  const [fecha, setFecha] = useState('');
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);

  const servicioQuery = useQuery({
    queryKey: ['servicio', id],
    queryFn: () => obtenerServicio(id),
  });

  const odontologosQuery = useQuery({
    queryKey: ['odontologos'],
    queryFn: obtenerOdontologos,
  });

  // La clínica tiene un solo odontólogo por ahora: se asigna automáticamente
  // el primero que esté activo (decisión ya tomada — se evaluará selección
  // manual si el negocio escala a más de uno).
  const odontologo = odontologosQuery.data?.odontologos.find((o) => o.activo);

  const diaSeleccionado = fecha
    ? DIAS_SEMANA[new Date(`${fecha}T00:00:00`).getDay()]
    : null;

  const horarioDelDia = odontologo?.horario.find((h) => h.dia === diaSeleccionado);

  const horasOcupadasQuery = useQuery({
    queryKey: ['horasOcupadas', odontologo?._id, fecha],
    queryFn: () => obtenerHorasOcupadas(odontologo._id, fecha),
    enabled: Boolean(odontologo?._id && fecha && horarioDelDia),
  });

  const horasDisponibles = horarioDelDia
    ? generarSlots(horarioDelDia.horaInicio, horarioDelDia.horaFin).filter(
        (hora) => !horasOcupadasQuery.data?.horasOcupadas.includes(hora)
      )
    : [];

  const handleContinuar = () => {
    actualizarAgendamiento({
      servicio: servicioQuery.data.servicio,
      odontologo,
      fecha,
      hora: horaSeleccionada,
    });
    navigate('/agendar/datos');
  };

  if (servicioQuery.status === 'pending' || odontologosQuery.status === 'pending') {
    return <p className="p-10 text-center text-slate-500">Cargando...</p>;
  }

  if (servicioQuery.status === 'error') {
    return (
      <p className="p-10 text-center text-red-600">No se pudo cargar el servicio.</p>
    );
  }

  const servicio = servicioQuery.data.servicio;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {servicio.imagen && (
            <img
              src={servicio.imagen}
              alt={servicio.nombre}
              className="h-64 w-full object-cover"
            />
          )}
          <div className="p-8">
            <h1 className="text-2xl font-bold text-slate-800">{servicio.nombre}</h1>
            <p className="mt-3 text-slate-600">{servicio.descripcion}</p>
            <div className="mt-5 flex gap-6 text-sm">
              <span className="font-semibold text-teal-600">${servicio.precio}</span>
              <span className="text-slate-500">{servicio.duracion} minutos</span>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Elige fecha y hora</h2>

          {!odontologo && (
            <p className="mt-4 text-red-600">
              No hay odontólogos disponibles en este momento.
            </p>
          )}

          {odontologo && (
            <>
              <label className="mt-4 block text-sm text-slate-600">
                Fecha
                <input
                  type="date"
                  value={fecha}
                  onChange={(event) => {
                    setFecha(event.target.value);
                    setHoraSeleccionada(null);
                  }}
                  className="mt-1 block rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                />
              </label>

              {fecha && !horarioDelDia && (
                <p className="mt-4 text-sm text-slate-500">
                  No hay atención los días {diaSeleccionado}. Elige otra fecha.
                </p>
              )}

              {fecha && horarioDelDia && horasOcupadasQuery.status === 'pending' && (
                <p className="mt-4 text-sm text-slate-500">
                  Consultando horas disponibles...
                </p>
              )}

              {fecha && horarioDelDia && horasOcupadasQuery.status === 'success' && (
                <>
                  {horasDisponibles.length === 0 ? (
                    <p className="mt-4 text-sm text-slate-500">
                      No quedan horas disponibles ese día.
                    </p>
                  ) : (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {horasDisponibles.map((hora) => (
                        <button
                          key={hora}
                          type="button"
                          onClick={() => setHoraSeleccionada(hora)}
                          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                            horaSeleccionada === hora
                              ? 'border-teal-600 bg-teal-600 text-white'
                              : 'border-slate-300 text-slate-600 hover:border-teal-400'
                          }`}
                        >
                          {hora}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              <button
                type="button"
                disabled={!horaSeleccionada}
                onClick={handleContinuar}
                className="mt-8 w-full rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continuar con mis datos
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default ServicioDetalle;
