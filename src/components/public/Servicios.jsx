import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { obtenerServicios } from '../../api/servicios';
import imagenPorDefecto from '../../../media/la-importancia-de-la-odontologia-preventiva.webp';

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
        <h3 className="text-lg font-semibold text-slate-800 transition group-hover:text-teal-600">
          {servicio.nombre}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-slate-600">
          {servicio.descripcion}
        </p>
        <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-teal-600">
          Ver más información
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

function Servicios() {
  const { data, status } = useQuery({
    queryKey: ['servicios'],
    queryFn: obtenerServicios,
  });

  return (
    <section id="servicios" className="bg-slate-50 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-teal-600">
            Lo que hacemos
          </span>
          <h2 className="mt-2 text-3xl font-bold text-slate-800 sm:text-4xl">
            Nuestros servicios
          </h2>
          <p className="mt-4 text-slate-600">
            Selecciona el servicio que necesitas para ver los detalles, el precio y
            agendar tu cita en línea.
          </p>
        </div>

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
