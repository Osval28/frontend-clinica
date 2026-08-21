// Fuente única de los 7 strings de día que espera el backend
// (Odontologo.horario.dia). Debe coincidir exactamente con ese enum,
// incluida la falta de tilde en "Sabado".
export const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sabado'];

// Mismos 7 strings, orden Lunes→Domingo, para el editor de horario admin.
export const DIAS_EDITOR = [1, 2, 3, 4, 5, 6, 0].map((i) => DIAS_SEMANA[i]);
