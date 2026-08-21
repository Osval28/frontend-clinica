import { NavLink } from 'react-router-dom';
import { Calendar, Stethoscope, UserRound, Tag, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
          <span className="text-lg font-bold text-white">Panel administrativo</span>
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
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <link.icono className="h-5 w-5 shrink-0" aria-hidden="true" />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="border-t border-slate-800 pt-4">
        <p className="px-2 text-sm text-slate-400">
          Sesión de <span className="text-white">{administrador?.nombre}</span>
        </p>
        <button
          type="button"
          onClick={logout}
          className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Sidebar fijo, siempre visible en pantallas md en adelante */}
      <aside className="hidden w-64 shrink-0 flex-col justify-between bg-slate-900 px-4 py-6 text-slate-200 md:flex">
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
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col justify-between overflow-y-auto bg-slate-900 px-4 py-6 text-slate-200">
            <button
              type="button"
              onClick={onCerrar}
              className="mb-4 self-end text-slate-300"
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
