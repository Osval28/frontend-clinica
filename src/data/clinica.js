// Contenido estático de la clínica.
// TODO: reemplazar con la información real antes de salir a producción.
//
// Este archivo es solo contenido/datos: no debe importar nada de UI (íconos,
// componentes, etc.). La resolución de qué ícono corresponde a cada `id` es
// responsabilidad de quien consume estos datos (ver ICONOS_DIFERENCIALES en
// Bienvenida.jsx).

export const CLINICA = {
  nombre: 'Oral Rayos X',
  eslogan: 'Radiología y odontología especializada',
  telefono: '(601) 555-0000',
  telefonoLink: 'tel:+576015550000',
  whatsapp: '573001234567',
  correo: 'contacto@oralrayosx.com',
  direccion: 'Calle 123 #45-67, Bogotá',
  horario: 'Lun a Vie: 8:00am - 6:00pm · Sáb: 8:00am - 1:00pm',
};

export const NAV_LINKS = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#bienvenida', label: 'Sobre nosotros' },
  { href: '#servicios', label: 'Servicios' },
  { href: '#novedades', label: 'Novedades' },
  { href: '#contacto', label: 'Contáctanos' },
];

export const DIFERENCIALES = [
  {
    id: 'tecnologia',
    titulo: 'Tecnología moderna',
    texto:
      'Equipos de radiología digital de última generación para diagnósticos precisos y con menor exposición.',
  },
  {
    id: 'equipo',
    titulo: 'Equipo profesional',
    texto:
      'Odontólogos con amplia experiencia, comprometidos con un trato humano y cercano en cada consulta.',
  },
  {
    id: 'agenda',
    titulo: 'Agenda en línea',
    texto:
      'Solicita tu cita desde la web en pocos minutos, sin llamadas ni esperas innecesarias.',
  },
];

export const NOVEDADES = [
  {
    id: 1,
    fecha: 'Agosto 2026',
    titulo: 'Ampliamos nuestro horario los sábados',
    texto:
      'Ahora atendemos los sábados de 8:00am a 1:00pm para que puedas agendar tu cita sin interferir con tu semana laboral.',
  },
  {
    id: 2,
    fecha: 'Julio 2026',
    titulo: 'Jornada de valoración sin costo',
    texto:
      'Durante este mes, los pacientes nuevos reciben una valoración odontológica inicial completamente gratuita.',
  },
];

// Indicaciones que ve el paciente al terminar de agendar (Confirmacion.jsx).
// TODO: confirmar con la clínica — son sugerencias genéricas, no políticas reales.
export const INDICACIONES_CITA = [
  'Llega 10 minutos antes de tu hora.',
  'Trae tu documento de identidad.',
  'Si tienes radiografías o exámenes previos, tráelos contigo.',
];
