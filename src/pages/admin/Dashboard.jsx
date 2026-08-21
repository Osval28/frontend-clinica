import { useAuth } from '../../context/AuthContext';

// Placeholder para poder probar el flujo de login + ProtectedRoute de punta a punta.
// El dashboard real (tabla de citas filtrable por fecha) se construye en la siguiente iteración.
function Dashboard() {
  const { administrador, logout } = useAuth();

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-800">
            Bienvenido, {administrador?.nombre}
          </h1>
          <button
            type="button"
            onClick={logout}
            className="rounded-md bg-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-300"
          >
            Cerrar sesión
          </button>
        </div>
        <p className="text-slate-500">
          Placeholder — el dashboard real (tabla de citas filtrable) se construye en la
          siguiente iteración.
        </p>
      </div>
    </main>
  );
}

export default Dashboard;
