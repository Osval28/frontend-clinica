import { useRef, useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, Wallet, UserRound, CalendarDays, ArrowRight } from 'lucide-react';
import { obtenerServicio } from '../../../api/servicios';
import { obtenerOdontologos } from '../../../api/odontologos';
import { obtenerHorasOcupadas } from '../../../api/citas';
import { DIAS_SEMANA, DIAS_EDITOR } from '../../../data/diasSemana';
import { CLINICA } from '../../../data/clinica';
import EncabezadoFlujo from '../../../components/public/EncabezadoFlujo';
import {
  hoyISO,
  desdeISO,
  sumarDias,
  formatearFechaLarga,
  formatearPrecio,
  minutosDelDia,
} from '../../../utils/formato';

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

const SEMANAS_INICIALES = 3;
const SEMANAS_MAXIMAS = 9;
const ENCABEZADO_DIAS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

const diaDeSemana = (iso) => DIAS_SEMANA[desdeISO(iso).getDay()];

const ABREVIATURA_DIA = {
  Lunes: 'Lun',
  Martes: 'Mar',
  Miércoles: 'Mié',
  Jueves: 'Jue',
  Viernes: 'Vie',
  Sabado: 'Sáb',
  Domingo: 'Dom',
};

// Resume el horario agrupando días seguidos con la misma franja:
// "Lun a Vie 08:00–17:00 · Sáb 08:00–12:00".
function resumirHorario(horario) {
  const grupos = [];

  DIAS_EDITOR.forEach((dia, indice) => {
    const franja = horario.find((h) => h.dia === dia);
    const anterior = grupos[grupos.length - 1];

    if (!franja) return;

    const rango = `${franja.horaInicio}–${franja.horaFin}`;
    if (anterior && anterior.rango === rango && anterior.ultimoIndice === indice - 1) {
      anterior.hasta = dia;
      anterior.ultimoIndice = indice;
    } else {
      grupos.push({ desde: dia, hasta: dia, rango, ultimoIndice: indice });
    }
  });

  return grupos
    .map(({ desde, hasta, rango }) =>
      desde === hasta
        ? `${ABREVIATURA_DIA[desde]} ${rango}`
        : `${ABREVIATURA_DIA[desde]} a ${ABREVIATURA_DIA[hasta]} ${rango}`
    )
    .join(' · ');
}

// Calendario por semanas (Lunes→Domingo) desde la semana actual. Los días
// pasados o sin atención quedan deshabilitados, así el paciente ve de un
// vistazo qué días puede elegir en vez de probar fechas a ciegas.
function CalendarioDias({ fecha, onElegir, diasConAtencion }) {
  const [semanas, setSemanas] = useState(SEMANAS_INICIALES);
  const hoy = hoyISO();
  const lunes = sumarDias(hoy, -((desdeISO(hoy).getDay() + 6) % 7));
  const dias = Array.from({ length: semanas * 7 }, (_, i) => sumarDias(lunes, i));

  const primerMes = desdeISO(dias[0]).toLocaleDateString('es-CO', { month: 'long' });
  const ultimoMes = desdeISO(dias[dias.length - 1]).toLocaleDateString('es-CO', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-slate-500 first-letter:uppercase">
        {primerMes === ultimoMes.split(' ')[0] ? ultimoMes : `${primerMes} – ${ultimoMes}`}
      </p>

      <div className="grid grid-cols-7 gap-1.5 text-center" role="group" aria-label="Días disponibles">
        {ENCABEZADO_DIAS.map((dia) => (
          <span key={dia} className="pb-1 text-xs font-medium text-slate-400" aria-hidden="true">
            {dia}
          </span>
        ))}

        {dias.map((iso) => {
          const pasado = iso < hoy;
          const abierto = diasConAtencion.has(diaDeSemana(iso));
          const disponible = !pasado && abierto;
          const elegido = iso === fecha;
          const numero = desdeISO(iso).getDate();

          return (
            <button
              key={iso}
              type="button"
              disabled={!disponible}
              onClick={() => onElegir(iso)}
              aria-pressed={elegido}
              aria-label={`${formatearFechaLarga(iso)}${disponible ? '' : ' (sin atención)'}`}
              className={`relative flex h-11 flex-col items-center justify-center rounded-lg text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 ${
                elegido
                  ? 'bg-marca-600 font-semibold text-white shadow-sm'
                  : disponible
                    ? 'bg-marca-50 font-medium text-marca-800 hover:bg-marca-100'
                    : 'cursor-not-allowed text-slate-300'
              } ${pasado ? 'invisible' : ''}`}
            >
              {numero === 1 && !pasado && (
                <span className={`text-[10px] leading-none ${elegido ? 'text-marca-100' : 'text-slate-400'}`}>
                  {desdeISO(iso).toLocaleDateString('es-CO', { month: 'short' }).replace('.', '')}
                </span>
              )}
              {numero}
              {iso === hoy && (
                <span
                  className={`absolute bottom-1 h-1 w-1 rounded-full ${elegido ? 'bg-white' : 'bg-marca-600'}`}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      {semanas < SEMANAS_MAXIMAS && (
        <button
          type="button"
          onClick={() => setSemanas((prev) => prev + SEMANAS_INICIALES)}
          className="mt-3 text-sm font-semibold text-marca-700 transition hover:text-marca-800"
        >
          Ver más fechas
        </button>
      )}
    </div>
  );
}

function BotonHora({ hora, elegida, onElegir }) {
  return (
    <button
      type="button"
      onClick={() => onElegir(hora)}
      aria-pressed={elegida}
      className={`rounded-full border px-4 py-2 text-sm font-medium tabular-nums transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 ${
        elegida
          ? 'border-marca-600 bg-marca-600 text-white'
          : 'border-slate-300 text-slate-700 hover:border-marca-400 hover:text-marca-700'
      }`}
    >
      {hora}
    </button>
  );
}

function ServicioDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agendamiento, actualizarAgendamiento } = useOutletContext();
  const horasRef = useRef(null);
  const continuarRef = useRef(null);

  // Si el paciente vuelve desde "Tus datos" para cambiar algo, se conserva
  // lo que ya había elegido para este mismo servicio.
  const previo = agendamiento.servicio?._id === id ? agendamiento : null;
  const [fecha, setFecha] = useState(previo?.fecha ?? '');
  const [horaSeleccionada, setHoraSeleccionada] = useState(previo?.hora ?? null);

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

  const diaSeleccionado = fecha ? diaDeSemana(fecha) : null;
  const horarioDelDia = odontologo?.horario.find((h) => h.dia === diaSeleccionado);
  const diasConAtencion = new Set(odontologo?.horario.map((h) => h.dia) ?? []);

  const horasOcupadasQuery = useQuery({
    queryKey: ['horasOcupadas', odontologo?._id, fecha],
    queryFn: () => obtenerHorasOcupadas(odontologo._id, fecha),
    enabled: Boolean(odontologo?._id && fecha && horarioDelDia),
  });

  // Si la fecha es hoy, no se ofrecen horas que ya pasaron.
  const ahora = new Date();
  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();
  const esHoy = fecha === hoyISO();

  const horasDisponibles = horarioDelDia
    ? generarSlots(horarioDelDia.horaInicio, horarioDelDia.horaFin).filter(
        (hora) =>
          !horasOcupadasQuery.data?.horasOcupadas.includes(hora) &&
          (!esHoy || minutosDelDia(hora) > minutosAhora)
      )
    : [];

  const horasManana = horasDisponibles.filter((hora) => minutosDelDia(hora) < 12 * 60);
  const horasTarde = horasDisponibles.filter((hora) => minutosDelDia(hora) >= 12 * 60);

  const elegirFecha = (iso) => {
    setFecha(iso);
    setHoraSeleccionada(null);
    // En móvil las horas quedan debajo del calendario, fuera de la vista.
    requestAnimationFrame(() =>
      horasRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    );
  };

  const elegirHora = (hora) => {
    setHoraSeleccionada(hora);
    requestAnimationFrame(() =>
      continuarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    );
  };

  const handleContinuar = () => {
    actualizarAgendamiento({
      servicio: servicioQuery.data.servicio,
      odontologo,
      fecha,
      hora: horaSeleccionada,
    });
    navigate('/agendar/datos');
  };

  const encabezado = (
    <EncabezadoFlujo pasoActual={1} volver={{ to: '/#servicios', label: 'Servicios' }} />
  );

  if (servicioQuery.status === 'pending' || odontologosQuery.status === 'pending') {
    return (
      <div className="min-h-screen bg-slate-50">
        {encabezado}
        <p className="p-10 text-center text-slate-500">Cargando el servicio...</p>
      </div>
    );
  }

  if (servicioQuery.status === 'error') {
    return (
      <div className="min-h-screen bg-slate-50">
        {encabezado}
        <p className="p-10 text-center text-slate-600">
          No pudimos cargar este servicio. Vuelve a intentarlo en un momento o llámanos al{' '}
          <a href={CLINICA.telefonoLink} className="font-semibold text-marca-700 underline underline-offset-2">
            {CLINICA.telefono}
          </a>
          .
        </p>
      </div>
    );
  }

  const servicio = servicioQuery.data.servicio;

  return (
    <div className="min-h-screen bg-slate-50">
      {encabezado}

      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {servicio.imagen && (
            <img src={servicio.imagen} alt={servicio.nombre} className="h-64 w-full object-cover" />
          )}
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">{servicio.nombre}</h1>
            <p className="mt-3 max-w-prose text-slate-600">{servicio.descripcion}</p>

            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-slate-100 pt-5 text-sm">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-marca-600" aria-hidden="true" />
                <dt className="sr-only">Precio</dt>
                <dd className="font-semibold text-slate-800">{formatearPrecio(servicio.precio)}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-marca-600" aria-hidden="true" />
                <dt className="sr-only">Duración</dt>
                <dd className="text-slate-700">{servicio.duracion} minutos</dd>
              </div>
              {odontologo && (
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-marca-600" aria-hidden="true" />
                  <dt className="sr-only">Te atiende</dt>
                  <dd className="text-slate-700">
                    Te atiende {odontologo.nombre} {odontologo.apellido}
                    {odontologo.especialidad?.nombre && (
                      <span className="text-slate-500"> · {odontologo.especialidad.nombre}</span>
                    )}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-slate-800">¿Qué día te queda bien?</h2>

          {(!odontologo || diasConAtencion.size === 0) && (
            <p className="mt-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
              En este momento no hay agenda disponible en línea. Llámanos al{' '}
              <a href={CLINICA.telefonoLink} className="font-semibold underline underline-offset-2">
                {CLINICA.telefono}
              </a>{' '}
              y te ayudamos a agendar.
            </p>
          )}

          {odontologo && diasConAtencion.size > 0 && (
            <>
              {odontologo.horario.length > 0 && (
                <p className="mt-1 text-sm text-slate-500">
                  Horario de atención: {resumirHorario(odontologo.horario)}. Los días resaltados
                  tienen atención.
                </p>
              )}

              <div className="mt-5">
                <CalendarioDias
                  fecha={fecha}
                  onElegir={elegirFecha}
                  diasConAtencion={diasConAtencion}
                />
              </div>

              <div ref={horasRef} className="scroll-mb-6">
                {fecha && horarioDelDia && (
                  <div className="mt-8 border-t border-slate-100 pt-6">
                    <h3 className="font-semibold text-slate-800">
                      Horas libres el{' '}
                      <span className="text-marca-700">{formatearFechaLarga(fecha)}</span>
                    </h3>

                    {horasOcupadasQuery.status === 'pending' && (
                      <p className="mt-4 text-sm text-slate-500">Consultando horas disponibles...</p>
                    )}

                    {horasOcupadasQuery.status === 'error' && (
                      <p className="mt-4 text-sm text-red-600">
                        No pudimos consultar las horas de ese día. Prueba de nuevo o elige otra fecha.
                      </p>
                    )}

                    {horasOcupadasQuery.status === 'success' &&
                      (horasDisponibles.length === 0 ? (
                        <p className="mt-4 text-sm text-slate-500">
                          Ese día ya no quedan horas libres. Elige otra fecha en el calendario.
                        </p>
                      ) : (
                        <div className="mt-4 space-y-4">
                          {[
                            ['Mañana', horasManana],
                            ['Tarde', horasTarde],
                          ]
                            .filter(([, horas]) => horas.length > 0)
                            .map(([titulo, horas]) => (
                              <div key={titulo}>
                                <p className="mb-2 text-xs font-medium text-slate-500">{titulo}</p>
                                <div className="flex flex-wrap gap-2">
                                  {horas.map((hora) => (
                                    <BotonHora
                                      key={hora}
                                      hora={hora}
                                      elegida={horaSeleccionada === hora}
                                      onElegir={elegirHora}
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div ref={continuarRef} className="mt-8 scroll-mb-6 border-t border-slate-100 pt-6">
                <p className="mb-3 flex items-center gap-2 text-sm text-slate-600" aria-live="polite">
                  <CalendarDays className="h-4 w-4 shrink-0 text-marca-600" aria-hidden="true" />
                  {horaSeleccionada ? (
                    <span>
                      Tu cita: <strong className="font-semibold text-slate-800">{formatearFechaLarga(fecha)}</strong>{' '}
                      a las <strong className="font-semibold text-slate-800">{horaSeleccionada}</strong>
                    </span>
                  ) : fecha ? (
                    'Ahora elige una hora.'
                  ) : (
                    'Elige un día en el calendario para ver las horas libres.'
                  )}
                </p>

                <button
                  type="button"
                  disabled={!horaSeleccionada}
                  onClick={handleContinuar}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-marca-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-marca-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continuar con mis datos
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default ServicioDetalle;
