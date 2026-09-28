import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, ArrowRight } from 'lucide-react';
import { obtenerEspecialidades } from '../../api/especialidades';
import { obtenerOdontologos } from '../../api/odontologos';
import { obtenerServicios } from '../../api/servicios';

// Guía de primera configuración: lo mínimo para que los pacientes puedan
// agendar desde el sitio público. Se oculta sola cuando todo está listo.
//
// El paso que realmente habilita el agendamiento es "odontólogo activo con
// horario": ServicioDetalle.jsx toma el primer odontólogo activo y arma los
// días disponibles con su horario.
function ChecklistConfiguracion() {
  const especialidades = useQuery({ queryKey: ['especialidades'], queryFn: obtenerEspecialidades });
  const odontologos = useQuery({ queryKey: ['odontologos'], queryFn: obtenerOdontologos });
  const servicios = useQuery({ queryKey: ['servicios'], queryFn: obtenerServicios });

  if ([especialidades, odontologos, servicios].some((q) => q.status !== 'success')) {
    return null;
  }

  const pasos = [
    {
      titulo: 'Crea al menos una especialidad',
      texto: 'Cada odontólogo necesita una (por ejemplo, Ortodoncia o Radiología).',
      hecho: especialidades.data.especialidades.length > 0,
      to: '/admin/especialidades',
    },
    {
      titulo: 'Registra un odontólogo con su horario',
      texto: 'Los días y horas de su horario son los que el sitio ofrece a los pacientes.',
      // Mismo criterio que el sitio público: se usa el primer odontólogo activo.
      hecho: odontologos.data.odontologos.find((o) => o.activo)?.horario?.length > 0,
      to: '/admin/odontologos',
    },
    {
      titulo: 'Publica tus servicios',
      texto: 'Aparecen en la página de inicio con su precio y duración.',
      hecho: servicios.data.servicios.length > 0,
      to: '/admin/servicios',
    },
  ];

  const completados = pasos.filter((p) => p.hecho).length;
  if (completados === pasos.length) {
    return null;
  }

  return (
    <section className="mb-6 rounded-lg border border-marca-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold text-slate-800">Deja lista la agenda en línea</h2>
        <span className="text-sm text-slate-500">
          {completados} de {pasos.length} listos
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Mientras falte algún paso, los pacientes no podrán agendar desde el sitio.
      </p>

      <ol className="mt-4 divide-y divide-slate-100">
        {pasos.map((paso, indice) => (
          <li key={paso.to} className="flex items-center gap-4 py-3">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                paso.hecho ? 'bg-marca-600 text-white' : 'border border-slate-300 text-slate-500'
              }`}
            >
              {paso.hecho ? <Check className="h-4 w-4" aria-label="Listo" /> : indice + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${paso.hecho ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                {paso.titulo}
              </p>
              {!paso.hecho && <p className="text-xs text-slate-500">{paso.texto}</p>}
            </div>
            {!paso.hecho && (
              <Link
                to={paso.to}
                className="flex shrink-0 items-center gap-1 text-sm font-semibold text-marca-700 hover:text-marca-800"
              >
                Ir
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

export default ChecklistConfiguracion;
