import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Stethoscope } from 'lucide-react';
import { CLINICA } from '../../data/clinica';
import { login as loginRequest } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setCargando(true);

    try {
      const data = await loginRequest(correo, password);
      login(data.token, data.administrador);
      navigate('/admin/citas');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md"
      >
        <div className="mb-6 text-center">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-marca-600 text-white">
            <Stethoscope className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="mt-3 text-2xl font-semibold text-slate-800">Panel administrativo</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ingresa para ver las citas y gestionar {CLINICA.nombre}.
          </p>
        </div>

        {error && (
          <p role="alert" className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mb-4">
          <label htmlFor="correo" className="mb-1 block text-sm font-medium text-slate-700">
            Correo
          </label>
          <input
            id="correo"
            type="email"
            autoComplete="username"
            required
            value={correo}
            onChange={(event) => setCorreo(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20 focus:outline-none"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={cargando}
          className="w-full rounded-full bg-marca-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-marca-700 disabled:opacity-50"
        >
          {cargando ? 'Ingresando...' : 'Iniciar sesión'}
        </button>
      </form>

      <Link
        to="/"
        className="mt-6 flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-marca-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver al sitio
      </Link>
    </main>
  );
}

export default Login;
