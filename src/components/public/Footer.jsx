import { Link } from 'react-router-dom';
import { CLINICA, NAV_LINKS } from '../../data/clinica';
import logoImg from '../../../media/logo-navbar.jpg';

function Footer() {
  return (
    // pb extra en móvil para que el botón flotante de WhatsApp no tape el copyright.
    <footer className="border-t border-slate-200 bg-white px-4 pt-10 pb-24 text-slate-600 sm:pb-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <img src={logoImg} alt={CLINICA.nombre} className="h-16 w-auto" width="452" height="214" />
          <p className="text-sm text-slate-500">{CLINICA.eslogan}</p>
        </div>

        <ul className="flex flex-wrap justify-center gap-5 text-sm">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="transition hover:text-marca-600">
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <Link to="/admin/login" className="transition hover:text-marca-600">
              Panel administrativo
            </Link>
          </li>
        </ul>
      </div>

      <p className="mx-auto mt-8 max-w-6xl border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {CLINICA.nombre}. Todos los derechos reservados.
      </p>
    </footer>
  );
}

export default Footer;
