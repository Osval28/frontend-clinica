import request from './client';

// GET /api/odontologos -> { ok, mensaje, odontologos }
// Cada odontólogo trae su especialidad populada y su `horario` (array de
// { dia, horaInicio, horaFin }), que es lo que usamos para calcular
// disponibilidad en la pantalla de detalle del servicio.
export const obtenerOdontologos = () => {
  return request('/odontologos');
};

// POST /api/odontologos (no protegida en el backend hoy, pero mandamos
// x-token igual para que la protección funcione sola en cuanto se agregue)
// -> { ok, mensaje, odontologo }
export const crearOdontologo = (datos) => {
  return request('/odontologos', { method: 'POST', body: datos, withAuth: true });
};

// PUT /api/odontologos/:id -> { ok, mensaje, odontologo }
export const actualizarOdontologo = (id, datos) => {
  return request(`/odontologos/${id}`, { method: 'PUT', body: datos, withAuth: true });
};

// DELETE /api/odontologos/:id -> { ok, mensaje }
export const eliminarOdontologo = (id) => {
  return request(`/odontologos/${id}`, { method: 'DELETE', withAuth: true });
};
