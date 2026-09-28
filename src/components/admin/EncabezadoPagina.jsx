// Título + una línea que explica para qué sirve la sección, y a la derecha
// la acción principal (children). Compartido por las pantallas del panel.
function EncabezadoPagina({ titulo, descripcion, children }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">{titulo}</h1>
        {descripcion && <p className="mt-1 max-w-2xl text-sm text-slate-500">{descripcion}</p>}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}

export default EncabezadoPagina;
