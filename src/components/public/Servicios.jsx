import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { obtenerServicios } from '../../api/servicios';
import { PASOS_AGENDAMIENTO } from '../../data/agendamiento';
import { formatearPrecio } from '../../utils/formato';
import imagenPorDefecto from '../../../media/la-importancia-de-la-odontologia-preventiva.webp';
import FondoDientes from './FondoDientes';

function TarjetaServicio({ servicio }) {
  return (
    <Link
      to={`/agendar/servicio/${servicio._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:flex-row"
    >
      <img
        src={servicio.imagen || imagenPorDefecto}
        alt={servicio.nombre}
        className="h-44 w-full object-cover sm:h-auto sm:w-2/5"
      />

      <div className="flex flex-1 flex-col justify-center p-6">
        <h3 className="text-lg font-semibold text-slate-800 transition group-hover:text-marca-600">
          {servicio.nombre}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-slate-600">
          {servicio.descripcion}
        </p>
        <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="font-semibold text-slate-800">{formatearPrecio(servicio.precio)}</span>
          <span className="flex items-center gap-1 text-slate-500">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {servicio.duracion} min
          </span>
        </p>
        <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-marca-600">
          Ver horarios y agendar
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

// Guía de cómo funciona el agendamiento. Va justo encima de las tarjetas
// porque es a donde llevan todos los botones "Agendar cita" del sitio: el
// paciente nuevo entiende el proceso antes de elegir.
function ComoAgendar() {
  return (
    <ol className="mb-12 grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 md:grid-cols-3 md:gap-0">
      {PASOS_AGENDAMIENTO.map((paso, indice) => (
        <li key={paso.id} className="relative flex gap-4 md:flex-col md:gap-3 md:px-6 md:first:pl-0 md:last:pr-0">
          <div className="flex items-center md:w-full">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                indice === 0 ? 'bg-marca-600 text-white' : 'bg-marca-50 text-marca-700'
              }`}
            >
              {indice + 1}
            </span>
            {indice < PASOS_AGENDAMIENTO.length - 1 && (
              <span className="ml-4 hidden h-px flex-1 bg-slate-200 md:block" aria-hidden="true" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{paso.titulo}</h3>
            <p className="mt-1 text-sm text-slate-600">{paso.texto}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Servicios() {
  const { data, status } = useQuery({
    queryKey: ['servicios'],
    queryFn: obtenerServicios,
  });

  return (
    <section id="servicios" className="relative isolate overflow-hidden px-4 py-20">
      <FondoDientes />
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-marca-600">
            Lo que hacemos
          </span>
          <h2 className="mt-2 text-3xl font-bold text-slate-800 sm:text-4xl">
            Nuestros servicios
          </h2>
          <p className="mt-4 text-slate-600">
            Agenda en línea en tres pasos, sin llamadas y sin crear una cuenta. Empieza
            eligiendo el servicio que necesitas.
          </p>
        </div>

        <ComoAgendar />

        {status === 'pending' && (
          <p className="text-center text-slate-500">Cargando servicios...</p>
        )}

        {status === 'error' && (
          <p className="text-center text-red-600">
            No se pudieron cargar los servicios. Intenta de nuevo más tarde.
          </p>
        )}

        {status === 'success' &&
          (data.servicios.length === 0 ? (
            <p className="text-center text-slate-500">
              No hay servicios disponibles por el momento.
            </p>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {data.servicios.map((servicio) => (
                <TarjetaServicio key={servicio._id} servicio={servicio} />
              ))}
            </div>
          ))}
      </div>
    </section>
  );
}

export default Servicios;
