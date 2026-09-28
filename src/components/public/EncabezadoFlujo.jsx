import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Stethoscope } from 'lucide-react';
import { CLINICA } from '../../data/clinica';
import { PASOS_AGENDAMIENTO } from '../../data/agendamiento';

// Cabecera de las pantallas /agendar/*: marca (vuelve al inicio), enlace de
// retroceso y el indicador de progreso. `pasoActual` es el índice (0-based)
// en PASOS_AGENDAMIENTO; con PASOS_AGENDAMIENTO.length se muestran todos
// completos (pantalla de confirmación).
function EncabezadoFlujo({ pasoActual, volver }) {
  const total = PASOS_AGENDAMIENTO.length;
  const terminado = pasoActual >= total;

  return (
    <header className="border-b border-slate-100 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-marca-600 text-white">
            <Stethoscope className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-base font-bold tracking-tight text-slate-800">
            {CLINICA.nombre}
          </span>
        </Link>

        {volver && (
          <Link
            to={volver.to}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {volver.label}
          </Link>
        )}
      </div>

      <nav aria-label="Progreso de tu cita" className="mx-auto max-w-3xl px-4 pb-4">
        <p className="mb-2 text-xs font-medium text-slate-500 sm:hidden">
          {terminado
            ? 'Listo: tu cita quedó registrada'
            : `Paso ${pasoActual + 1} de ${total} · ${PASOS_AGENDAMIENTO[pasoActual].titulo}`}
        </p>

        <ol className="flex items-center">
          {PASOS_AGENDAMIENTO.map((paso, indice) => {
            const hecho = indice < pasoActual;
            const actual = indice === pasoActual;

            return (
              <li
                key={paso.id}
                className={`flex items-center ${indice < total - 1 ? 'flex-1' : ''}`}
                aria-current={actual ? 'step' : undefined}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition ${
                      hecho
                        ? 'bg-marca-600 text-white'
                        : actual
                          ? 'border-2 border-marca-600 bg-white text-marca-700'
                          : 'border border-slate-300 bg-white text-slate-400'
                    }`}
                  >
                    {hecho ? <Check className="h-4 w-4" aria-hidden="true" /> : indice + 1}
                  </span>
                  <span
                    className={`hidden whitespace-nowrap text-sm sm:inline ${
                      actual ? 'font-semibold text-slate-800' : hecho ? 'text-slate-600' : 'text-slate-400'
                    }`}
                  >
                    {paso.titulo}
                    {hecho && <span className="sr-only"> (completado)</span>}
                  </span>
                </span>

                {indice < total - 1 && (
                  <span
                    className={`mx-3 h-px flex-1 ${hecho ? 'bg-marca-600' : 'bg-slate-200'}`}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </header>
  );
}

export default EncabezadoFlujo;
