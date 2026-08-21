import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/public/Home';
import FlujoAgendamiento from './pages/public/FlujoAgendamiento';
import ServicioDetalle from './pages/public/agendar/ServicioDetalle';
import DatosPaciente from './pages/public/agendar/DatosPaciente';
import Confirmacion from './pages/public/agendar/Confirmacion';
import Login from './pages/admin/Login';
import Citas from './pages/admin/Citas';
import ServiciosAdmin from './pages/admin/ServiciosAdmin';
import OdontologosAdmin from './pages/admin/OdontologosAdmin';
import EspecialidadesAdmin from './pages/admin/EspecialidadesAdmin';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/agendar" element={<FlujoAgendamiento />}>
        <Route path="servicio/:id" element={<ServicioDetalle />} />
        <Route path="datos" element={<DatosPaciente />} />
        <Route path="confirmacion" element={<Confirmacion />} />
      </Route>

      <Route path="/admin/login" element={<Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="citas" replace />} />
        <Route path="citas" element={<Citas />} />
        <Route path="servicios" element={<ServiciosAdmin />} />
        <Route path="odontologos" element={<OdontologosAdmin />} />
        <Route path="especialidades" element={<EspecialidadesAdmin />} />
      </Route>
    </Routes>
  );
}

export default App;
