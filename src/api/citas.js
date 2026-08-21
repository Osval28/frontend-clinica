import request from './client';

// GET /api/citas/fecha/:fecha (protegida con x-token) -> { ok, mensaje, citas }
// fecha en formato YYYY-MM-DD. Cada cita viene con paciente, odontologo y servicio
// ya populados por el backend.
export const obtenerCitasPorFecha = (fecha) => {
  return request(`/citas/fecha/${fecha}`, { withAuth: true });
};

// GET /api/citas/disponibilidad/:odontologoId/:fecha (pública)
// -> { ok, mensaje, horasOcupadas: ["09:00", "11:30", ...] }
// A propósito solo devuelve horas, nunca datos de pacientes.
export const obtenerHorasOcupadas = (odontologoId, fecha) => {
  return request(`/citas/disponibilidad/${odontologoId}/${fecha}`);
};

// GET /api/citas/odontologo/:id (protegida) -> { ok, mensaje, citas }
// Paciente/servicio populados. Se usa solo al intentar eliminar un
// odontólogo, para advertir cuántas citas quedarían huérfanas — no se
// precarga en el listado, evita una llamada innecesaria.
export const obtenerCitasOdontologo = (odontologoId) => {
  return request(`/citas/odontologo/${odontologoId}`, { withAuth: true });
};

// GET /api/citas (protegida, todas) -> { ok, mensaje, citas }
// Se usa solo al intentar eliminar un servicio, filtrando client-side por
// cita.servicio?._id === id (no hay endpoint filtrado por servicio en el
// backend).
export const obtenerCitas = () => {
  return request('/citas', { withAuth: true });
};

// POST /api/citas/solicitar (pública) -> { ok, mensaje, cita }
// El backend busca al paciente por `documento`; si ya existe, lo reutiliza
// tal cual estaba guardado (no actualiza nombre/telefono/correo con lo que
// se mande acá). `cita` vuelve ya populada con paciente, odontologo
// (con especialidad) y servicio.
export const solicitarCita = (datos) => {
  return request('/citas/solicitar', { method: 'POST', body: datos });
};
