import request from './client';

// GET /api/servicios -> { ok, mensaje, servicios }
// Nota: el backend todavía no filtra activo:true (pendiente, se resolverá ahí, no acá).
export const obtenerServicios = () => {
  return request('/servicios');
};

// GET /api/servicios/:id -> { ok, mensaje, servicio }
export const obtenerServicio = (id) => {
  return request(`/servicios/${id}`);
};

// POST /api/servicios (no protegida en el backend hoy, pero mandamos
// x-token igual para que la protección funcione sola en cuanto se agregue)
// -> { ok, mensaje, servicio }
export const crearServicio = (datos) => {
  return request('/servicios', { method: 'POST', body: datos, withAuth: true });
};

// PUT /api/servicios/:id -> { ok, mensaje, servicio }
export const actualizarServicio = (id, datos) => {
  return request(`/servicios/${id}`, { method: 'PUT', body: datos, withAuth: true });
};

// DELETE /api/servicios/:id -> { ok, mensaje }
export const eliminarServicio = (id) => {
  return request(`/servicios/${id}`, { method: 'DELETE', withAuth: true });
};
