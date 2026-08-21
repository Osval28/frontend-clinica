import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

// Envuelve todas las rutas /admin/* (excepto login). Se usa dentro de
// ProtectedRoute, así que si no hay sesión nunca se llega a montar esto.
function AdminLayout() {
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      {/* Barra superior solo en móvil, con botón para abrir el sidebar */}
      <div className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white md:hidden">
        <span className="text-base font-bold">Panel administrativo</span>
        <button
          type="button"
          onClick={() => setSidebarAbierto(true)}
          aria-label="Abrir menú"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      <Sidebar abierto={sidebarAbierto} onCerrar={() => setSidebarAbierto(false)} />

      <main className="flex-1 p-6 sm:p-10">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
