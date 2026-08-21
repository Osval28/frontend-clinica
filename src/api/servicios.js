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
