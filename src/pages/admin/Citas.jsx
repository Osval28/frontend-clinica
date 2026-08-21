import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { obtenerCitasPorFecha } from '../../api/citas';

// Fecha local de hoy en formato YYYY-MM-DD (evita el corrimiento de día
// que da toISOString() si se usa directamente sobre "new Date()" en UTC).
const hoyISO = () => {
  const hoy = new Date();
  const offsetMs = hoy.getTimezoneOffset() * 60 * 1000;
  return new Date(hoy.getTime() - offsetMs).toISOString().slice(0, 10);
};

function Citas() {
  const [fecha, setFecha] = useState(hoyISO());

  const { data, status } = useQuery({
    queryKey: ['citas', fecha],
    queryFn: () => obtenerCitasPorFecha(fecha),
  });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Citas</h1>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          Fecha:
          <input
            type="date"
            value={fecha}
            onChange={(event) => setFecha(event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-teal-500 focus:outline-none"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        {status === 'pending' && (
          <p className="p-6 text-center text-slate-500">Cargando citas...</p>
        )}

        {status === 'error' && (
          <p className="p-6 text-center text-red-600">No se pudieron cargar las citas.</p>
        )}

        {status === 'success' &&
          (data.citas.length === 0 ? (
            <p className="p-6 text-center text-slate-500">
              No hay citas registradas para esta fecha.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Paciente</th>
                    <th className="px-4 py-3">Teléfono</th>
                    <th className="px-4 py-3">Correo</th>
                    <th className="px-4 py-3">Hora</th>
                    <th className="px-4 py-3">Servicio</th>
                    <th className="px-4 py-3">Precio</th>
                    <th className="px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.citas.map((cita) => (
                    <tr key={cita._id}>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {cita.paciente?.nombre} {cita.paciente?.apellido}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{cita.paciente?.telefono}</td>
                      <td className="px-4 py-3 text-slate-600">{cita.paciente?.correo}</td>
                      <td className="px-4 py-3 text-slate-600">{cita.hora}</td>
                      <td className="px-4 py-3 text-slate-600">{cita.servicio?.nombre}</td>
                      <td className="px-4 py-3 text-slate-600">${cita.servicio?.precio}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
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
