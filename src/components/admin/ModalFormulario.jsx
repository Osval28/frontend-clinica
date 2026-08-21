import { useEffect } from 'react';
import { X } from 'lucide-react';

// Chrome compartido por los 3 CRUD admin: overlay oscuro + tarjeta blanca
// centrada, cierre con click afuera o Escape. El formulario en sí lo arma
// cada pantalla y se pasa como children.
function ModalFormulario({ titulo, onCerrar, children }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCerrar();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCerrar]);

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCerrar} aria-hidden="true" />

      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">{titulo}</h2>
          <button
            type="button"
            onClick={onCerrar}
            className="text-slate-400 transition hover:text-slate-600"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

export default ModalFormulario;
