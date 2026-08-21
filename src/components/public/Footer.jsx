import { Link } from 'react-router-dom';
import { CLINICA, NAV_LINKS } from '../../data/clinica';

function Footer() {
  return (
    <footer className="bg-slate-900 px-4 py-10 text-slate-400">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="text-center sm:text-left">
          <span className="text-base font-bold text-white">{CLINICA.nombre}</span>
          <p className="mt-1 text-sm">{CLINICA.eslogan}</p>
        </div>

        <ul className="flex flex-wrap justify-center gap-5 text-sm">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="transition hover:text-teal-400">
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <Link to="/admin/login" className="transition hover:text-teal-400">
              Panel administrativo
            </Link>
          </li>
        </ul>
      </div>

      <p className="mx-auto mt-8 max-w-6xl border-t border-slate-800 pt-6 text-center text-xs">
        © {new Date().getFullYear()} {CLINICA.nombre}. Todos los derechos reservados.
      </p>
    </footer>
  );
}

export default Footer;
