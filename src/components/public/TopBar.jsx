import { Phone, Mail } from 'lucide-react';
import { CLINICA } from '../../data/clinica';

// Barra superior de contacto: va por encima del menú de navegación
// y usa un color propio (más oscuro) para diferenciarse del navbar blanco.
function TopBar() {
  return (
    <div className="bg-teal-800 text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-1 px-4 py-2 text-xs sm:flex-row sm:text-sm">
        <div className="flex items-center gap-4">
          <a
            href={CLINICA.telefonoLink}
            className="flex items-center gap-1.5 transition hover:text-teal-200"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="font-medium">{CLINICA.telefono}</span>
          </a>
          <a
            href={`mailto:${CLINICA.correo}`}
            className="hidden items-center gap-1.5 transition hover:text-teal-200 sm:flex"
          >
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{CLINICA.correo}</span>
          </a>
        </div>

        <span className="hidden text-teal-100 lg:block">{CLINICA.horario}</span>
      </div>
    </div>
  );
}

export default TopBar;
