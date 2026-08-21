import { useState } from 'react';
import { Stethoscope, Menu, X } from 'lucide-react';
import { CLINICA, NAV_LINKS } from '../../data/clinica';

function Navbar() {
  const [abierto, setAbierto] = useState(false);

  return (
    <nav className="border-b border-slate-100 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <a href="#inicio" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-white">
            <Stethoscope className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-800">
            {CLINICA.nombre}
          </span>
        </a>

        <ul className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="transition hover:text-teal-600">
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#servicios"
              className="rounded-full bg-teal-600 px-5 py-2 text-white transition hover:bg-teal-700"
            >
              Agendar cita
            </a>
          </li>
        </ul>

        <button
          type="button"
          onClick={() => setAbierto((prev) => !prev)}
          className="text-slate-700 md:hidden"
          aria-label="Abrir menú"
          aria-expanded={abierto}
        >
          {abierto ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {abierto && (
        <ul className="flex flex-col border-t border-slate-100 px-4 py-2 md:hidden">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setAbierto(false)}
                className="block py-2.5 text-sm font-medium text-slate-600 hover:text-teal-600"
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
