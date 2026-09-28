import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarX2, ChevronLeft, ChevronRight } from 'lucide-react';
import { obtenerCitasPorFecha } from '../../api/citas';
import EncabezadoPagina from '../../components/admin/EncabezadoPagina';
import EstadoVacio from '../../components/admin/EstadoVacio';
import ChecklistConfiguracion from '../../components/admin/ChecklistConfiguracion';
import { hoyISO, sumarDias, formatearFechaLarga, formatearPrecio } from '../../utils/formato';

const COLOR_ESTADO = {
  Pendiente: 'bg-amber-50 text-amber-700',
  Confirmada: 'bg-marca-50 text-marca-700',
  Cancelada: 'bg-red-50 text-red-700',
  Finalizada: 'bg-slate-100 text-slate-600',
};

function Citas() {
  const [fecha, setFecha] = useState(hoyISO());
  const esHoy = fecha === hoyISO();

  const { data, status } = useQuery({
    queryKey: ['citas', fecha],
    queryFn: () => obtenerCitasPorFecha(fecha),
  });

  // Ordenadas por hora para leer la agenda del día de arriba hacia abajo.
  const citas = [...(data?.citas ?? [])].sort((a, b) => a.hora.localeCompare(b.hora));

  return (
    <div>
      <EncabezadoPagina
        titulo="Citas"
        descripcion="Agenda del día. Aquí aparecen las citas que los pacientes solicitan desde el sitio web."
      />

      <ChecklistConfiguracion />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg font-semibold text-slate-800 first-letter:uppercase">
          {esHoy ? 'Hoy, ' : ''}
          {formatearFechaLarga(fecha)}
          {status === 'success' && (
            <span className="ml-2 text-sm font-normal text-slate-500">
              · {citas.length} {citas.length === 1 ? 'cita' : 'citas'}
            </span>
          )}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFecha((prev) => sumarDias(prev, -1))}
            className="rounded-md border border-slate-300 bg-white p-1.5 text-slate-600 transition hover:border-marca-400 hover:text-marca-700"
            aria-label="Día anterior"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setFecha(hoyISO())}
            disabled={esHoy}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-marca-400 hover:text-marca-700 disabled:cursor-default disabled:opacity-50 disabled:hover:border-slate-300 disabled:hover:text-slate-600"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => setFecha((prev) => sumarDias(prev, 1))}
            className="rounded-md border border-slate-300 bg-white p-1.5 text-slate-600 transition hover:border-marca-400 hover:text-marca-700"
            aria-label="Día siguiente"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
          <label className="sr-only" htmlFor="fecha-citas">
            Ir a una fecha
          </label>
          <input
            id="fecha-citas"
            type="date"
            value={fecha}
            onChange={(event) => event.target.value && setFecha(event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-marca-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        {status === 'pending' && (
          <p className="p-6 text-center text-slate-500">Cargando citas...</p>
        )}

        {status === 'error' && (
          <p className="p-6 text-center text-red-600">
            No se pudieron cargar las citas. Revisa tu conexión y recarga la página.
          </p>
        )}

        {status === 'success' &&
          (citas.length === 0 ? (
            <EstadoVacio
              icono={CalendarX2}
              titulo={esHoy ? 'No hay citas para hoy' : 'No hay citas este día'}
              texto="Cuando un paciente agende desde el sitio web, su cita aparecerá aquí con sus datos de contacto. Usa las flechas para revisar otros días."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Hora</th>
                    <th className="px-4 py-3">Paciente</th>
                    <th className="px-4 py-3">Teléfono</th>
                    <th className="px-4 py-3">Correo</th>
                    <th className="px-4 py-3">Servicio</th>
                    <th className="px-4 py-3">Precio</th>
                    <th className="px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {citas.map((cita) => (
                    <tr key={cita._id} className="align-top">
                      <td className="px-4 py-3 font-semibold tabular-nums text-slate-800">{cita.hora}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {cita.paciente?.nombre} {cita.paciente?.apellido}
                        {cita.observaciones && (
                          <p className="mt-0.5 max-w-xs text-xs font-normal text-slate-500">
                            “{cita.observaciones}”
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <a href={`tel:${cita.paciente?.telefono}`} className="hover:text-marca-700 hover:underline">
                          {cita.paciente?.telefono}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <a href={`mailto:${cita.paciente?.correo}`} className="hover:text-marca-700 hover:underline">
                          {cita.paciente?.correo}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{cita.servicio?.nombre}</td>
                      <td className="px-4 py-3 tabular-nums text-slate-600">
                        {formatearPrecio(cita.servicio?.precio)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            COLOR_ESTADO[cita.estado] ?? 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {cita.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Citas;
