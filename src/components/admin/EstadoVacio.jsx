import { Plus } from 'lucide-react';

// Estado vacío de las tablas del panel: qué va a aparecer ahí, para qué
// sirve y el botón para crear el primer registro.
function EstadoVacio({ icono: Icono, titulo, texto, accion, onAccion, children }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-marca-50 text-marca-600">
        <Icono className="h-6 w-6" aria-hidden="true" />
      </span>
      <h2 className="mt-4 font-semibold text-slate-800">{titulo}</h2>
      <p className="mt-1 max-w-md text-sm text-slate-500">{texto}</p>
      {accion && (
        <button
          type="button"
          onClick={onAccion}
          className="mt-5 flex items-center gap-2 rounded-full bg-marca-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-marca-700"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {accion}
        </button>
      )}
      {children}
    </div>
  );
}

export default EstadoVacio;
