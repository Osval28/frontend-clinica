// Pasos del flujo público de agendamiento. Fuente única para la guía
// "Cómo agendar" del Home (Servicios.jsx) y el indicador de progreso de
// las pantallas /agendar/* (EncabezadoFlujo.jsx), para que ambos usen
// siempre los mismos nombres y la misma cantidad de pasos.
export const PASOS_AGENDAMIENTO = [
  {
    id: 'servicio',
    titulo: 'Elige el servicio',
    texto: 'Revisa en qué consiste, cuánto cuesta y cuánto dura.',
  },
  {
    id: 'horario',
    titulo: 'Fecha y hora',
    texto: 'Solo te mostramos los horarios que siguen libres.',
  },
  {
    id: 'datos',
    titulo: 'Tus datos',
    texto: 'Nombre, documento y un medio de contacto. Nada más.',
  },
];
