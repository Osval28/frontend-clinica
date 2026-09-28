import { NavLink } from 'react-router-dom';
import { Calendar, Stethoscope, UserRound, Tag, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import FondoDientes from '../public/FondoDientes';

const LINKS = [
  { to: '/admin/citas', label: 'Citas', icono: Calendar },
  { to: '/admin/servicios', label: 'Servicios', icono: Stethoscope },
  { to: '/admin/odontologos', label: 'Odontólogos', icono: UserRound },
  { to: '/admin/especialidades', label: 'Especialidades', icono: Tag },
];

function Sidebar({ abierto = false, onCerrar = () => {} }) {
  const { administrador, logout } = useAuth();

  const contenido = (
    <>
      <div>
        <div className="mb-8 hidden px-2 md:block">
          <span className="text-lg font-bold text-slate-800">Panel administrativo</span>
        </div>

        <nav className="space-y-1">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onCerrar}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-marca-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <link.icono className="h-5 w-5 shrink-0" aria-hidden="true" />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <p className="px-2 text-sm text-slate-500">
          Sesión de <span className="font-medium text-slate-800">{administrador?.nombre}</span>
        </p>
        <button
          type="button"
          onClick={logout}
          className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Sidebar fijo, siempre visible en pantallas md en adelante. Usa el
          mismo fondo animado de dientes que el sitio público. */}
      <aside className="relative isolate hidden w-64 shrink-0 flex-col justify-between overflow-hidden border-r border-slate-200 px-4 py-6 text-slate-700 md:flex">
        <FondoDientes />
        {contenido}
      </aside>

      {/* En móvil: panel deslizante + fondo oscuro, controlado por AdminLayout */}
      {abierto && (
        <div className="fixed inset-0 z-20 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onCerrar}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 isolate flex w-64 flex-col justify-between overflow-y-auto px-4 py-6 text-slate-700">
            <FondoDientes />
            <button
              type="button"
              onClick={onCerrar}
              className="mb-4 self-end text-slate-500 hover:text-slate-800"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            {contenido}
          </aside>
        </div>
      )}
    </>
  );
}

export default Sidebar;
