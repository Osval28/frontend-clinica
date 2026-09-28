// Helpers de formato compartidos por el sitio público y el panel admin.
//
// Las fechas del flujo viajan como string "YYYY-MM-DD" (lo que da un
// <input type="date"> y lo que espera el backend). Para mostrarlas se
// arma el Date con "T00:00:00" (hora local), nunca con new Date("YYYY-MM-DD")
// a secas: eso se interpreta en UTC y en Colombia (UTC-5) muestra el día
// anterior.

// Fecha local de hoy en formato YYYY-MM-DD (evita el corrimiento de día
// que da toISOString() si se usa directamente sobre "new Date()" en UTC).
export const hoyISO = () => aISO(new Date());

// Date local -> "YYYY-MM-DD".
export const aISO = (fecha) => {
  const offsetMs = fecha.getTimezoneOffset() * 60 * 1000;
  return new Date(fecha.getTime() - offsetMs).toISOString().slice(0, 10);
};

// "YYYY-MM-DD" -> Date local a medianoche.
export const desdeISO = (iso) => new Date(`${iso}T00:00:00`);

// "YYYY-MM-DD" + días -> "YYYY-MM-DD".
export const sumarDias = (iso, dias) => {
  const fecha = desdeISO(iso);
  fecha.setDate(fecha.getDate() + dias);
  return aISO(fecha);
};

// "2026-09-30" -> "martes, 30 de septiembre"
export const formatearFechaLarga = (iso, { conAnio = false } = {}) =>
  desdeISO(iso).toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...(conAnio && { year: 'numeric' }),
  });

// 100000 -> "$ 100.000"
const formatoPesos = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export const formatearPrecio = (valor) =>
  typeof valor === 'number' ? formatoPesos.format(valor) : '—';

// "09:30" + 45 -> "10:15"
export const sumarMinutos = (hora, minutos) => {
  const [h, m] = hora.split(':').map(Number);
  const total = h * 60 + m + minutos;
  const hh = Math.floor(total / 60) % 24;
  return `${String(hh).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

// Minutos transcurridos desde medianoche, para comparar "HH:MM" con la hora actual.
export const minutosDelDia = (hora) => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
};
