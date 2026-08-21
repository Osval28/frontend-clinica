import request from './client';

// GET /api/odontologos -> { ok, mensaje, odontologos }
// Cada odontólogo trae su especialidad populada y su `horario` (array de
// { dia, horaInicio, horaFin }), que es lo que usamos para calcular
// disponibilidad en la pantalla de detalle del servicio.
export const obtenerOdontologos = () => {
  return request('/odontologos');
};
