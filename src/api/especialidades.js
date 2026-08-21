import request from './client';

// GET /api/especialidades -> { ok, mensaje, especialidades }
export const obtenerEspecialidades = () => {
  return request('/especialidades');
};

// POST /api/especialidades (no protegida en el backend hoy, pero mandamos
// x-token igual para que la protección funcione sola en cuanto se agregue)
// -> { ok, mensaje, especialidad }
export const crearEspecialidad = (datos) => {
  return request('/especialidades', { method: 'POST', body: datos, withAuth: true });
};

// PUT /api/especialidades/:id -> { ok, mensaje, especialidad }
export const actualizarEspecialidad = (id, datos) => {
  return request(`/especialidades/${id}`, { method: 'PUT', body: datos, withAuth: true });
};

// DELETE /api/especialidades/:id -> { ok, mensaje }
export const eliminarEspecialidad = (id) => {
  return request(`/especialidades/${id}`, { method: 'DELETE', withAuth: true });
};
