import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { CLINICA, NAV_LINKS } from '../../data/clinica';
// Recorte del logo original (media/logo.jpg) ajustado al óvalo, sin el
// margen blanco, para que se lea bien a la altura del navbar.
import logoImg from '../../../media/logo-navbar.jpg';

function Navbar() {
  const [abierto, setAbierto] = useState(false);

  return (
    <nav className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="flex w-full items-center justify-between gap-6 px-4 py-2 sm:px-6 lg:px-10">
        {/* El logo ya incluye el nombre de la clínica: el alt lo anuncia a
            lectores de pantalla sin repetirlo como texto visible. */}
        <a href="#inicio" className="shrink-0">
          <img
            src={logoImg}
            alt={CLINICA.nombre}
            className="h-14 w-auto lg:h-16"
            width="452"
            height="214"
          />
        </a>

        <ul className="hidden items-center gap-8 text-base font-medium text-slate-700 lg:flex xl:gap-10">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="transition hover:text-marca-600">
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#servicios"
              className="rounded-full bg-marca-600 px-6 py-2.5 font-semibold text-white transition hover:bg-marca-700"
            >
              Agendar cita
            </a>
          </li>
        </ul>

        <div className="flex items-center gap-2 lg:hidden">
          <a
            href="#servicios"
            onClick={() => setAbierto(false)}
            className="rounded-full bg-marca-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-marca-700"
          >
            Agendar cita
          </a>
          <button
            type="button"
            onClick={() => setAbierto((prev) => !prev)}
            className="p-1 text-slate-700"
            aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={abierto}
          >
            {abierto ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {abierto && (
        <ul className="flex flex-col border-t border-slate-100 px-4 py-2 sm:px-6 lg:hidden">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setAbierto(false)}
                className="block py-3 text-base font-medium text-slate-700 hover:text-marca-600"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}

export default Navbar;
