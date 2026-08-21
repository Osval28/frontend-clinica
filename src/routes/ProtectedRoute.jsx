import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Envuelve cualquier ruta admin. Si no hay token en el contexto, redirige a /admin/login
// en vez de renderizar la ruta protegida.
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
