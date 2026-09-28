import { Link, Navigate, useOutletContext } from 'react-router-dom';
import { Check, CalendarPlus, MessageCircle, Phone } from 'lucide-react';
import EncabezadoFlujo from '../../../components/public/EncabezadoFlujo';
import { PASOS_AGENDAMIENTO } from '../../../data/agendamiento';
import { CLINICA, INDICACIONES_CITA } from '../../../data/clinica';
import { formatearFechaLarga, sumarMinutos } from '../../../utils/formato';

// Enlace "Agregar a Google Calendar". Horas locales sin "Z" + ctz, para que
// Google no las reinterprete en UTC.
function enlaceGoogleCalendar({ titulo, fecha, hora, duracion, detalles }) {
  const compacto = (h) => `${fecha.replaceAll('-', '')}T${h.replace(':', '')}00`;
  const parametros = new URLSearchParams({
    action: 'TEMPLATE',
    text: titulo,
    dates: `${compacto(hora)}/${compacto(sumarMinutos(hora, duracion))}`,
    ctz: 'America/Bogota',
    details: detalles,
    location: CLINICA.direccion,
  });
  return `https://calendar.google.com/calendar/render?${parametros}`;
}

// Resumen de cita agendada con éxito.
//
// Guard endurecido respecto al placeholder: ya no basta con tener un
// servicio elegido, hace falta que `agendamiento.cita` exista — es decir,
// que POST /citas/solicitar haya respondido con éxito (ver DatosPaciente.jsx
// y el estado elevado en FlujoAgendamiento.jsx). Sin eso no hay nada que
// confirmar, así que se redirige al Home.
function Confirmacion() {
  const { agendamiento } = useOutletContext();
  const { cita } = agendamiento;

  if (!cita) {
    return <Navigate to="/" replace />;
  }

  // La fecha se muestra desde el "YYYY-MM-DD" que eligió el paciente, no
  // desde cita.fecha: el backend la devuelve como Date en UTC y en Colombia
  // (UTC-5) formatearla directo mostraría el día anterior.
  const fechaISO = agendamiento.fecha ?? String(cita.fecha).slice(0, 10);
  const fecha = formatearFechaLarga(fechaISO, { conAnio: true });
  const odontologo = `${cita.odontologo.nombre} ${cita.odontologo.apellido}`;

  const calendario = enlaceGoogleCalendar({
    titulo: `${cita.servicio.nombre} · ${CLINICA.nombre}`,
    fecha: fechaISO,
    hora: cita.hora,
    duracion: cita.servicio.duracion ?? 30,
    detalles: `Cita con ${odontologo}. Teléfono de la clínica: ${CLINICA.telefono}`,
  });

  const mensajeWhatsapp = encodeURIComponent(
    `Hola, tengo una cita de ${cita.servicio.nombre} el ${fecha} a las ${cita.hora} a nombre de ${cita.paciente.nombre} ${cita.paciente.apellido}.`
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <EncabezadoFlujo pasoActual={PASOS_AGENDAMIENTO.length} />

      <main className="mx-auto max-w-xl px-4 py-8 sm:py-10">
        <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="text-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-marca-100 text-marca-600">
              <Check className="h-7 w-7" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-2xl font-semibold text-slate-800">
              ¡Listo, {cita.paciente.nombre}! Tu cita quedó agendada
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Guarda estos datos o agrégalos a tu calendario para no olvidarla.
            </p>
          </div>

          <dl className="mt-6 space-y-3 rounded-xl bg-slate-50 p-5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Servicio</dt>
              <dd className="text-right font-medium text-slate-800">{cita.servicio.nombre}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Odontólogo</dt>
              <dd className="text-right font-medium text-slate-800">{odontologo}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Fecha</dt>
              <dd className="text-right font-medium text-slate-800 first-letter:uppercase">{fecha}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Hora</dt>
              <dd className="text-right font-medium tabular-nums text-slate-800">{cita.hora}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Dirección</dt>
              <dd className="text-right font-medium text-slate-800">{CLINICA.direccion}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Estado</dt>
              <dd className="text-right font-medium text-slate-800">{cita.estado}</dd>
            </div>
          </dl>

          <a
            href={calendario}
            target="_blank"
            rel="noreferrer"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-marca-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-marca-700"
          >
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
            Agregar a Google Calendar
          </a>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="font-semibold text-slate-800">Para el día de tu cita</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {INDICACIONES_CITA.map((indicacion) => (
              <li key={indicacion} className="flex gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-marca-600" aria-hidden="true" />
                {indicacion}
              </li>
            ))}
          </ul>

          <h2 className="mt-7 font-semibold text-slate-800">¿Necesitas cambiarla o cancelarla?</h2>
          <p className="mt-1 text-sm text-slate-600">
            Escríbenos o llámanos con tu nombre y la fecha de la cita.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <a
              href={`https://wa.me/${CLINICA.whatsapp}?text=${mensajeWhatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-marca-400 hover:text-marca-700"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp
            </a>
            <a
              href={CLINICA.telefonoLink}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-marca-400 hover:text-marca-700"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {CLINICA.telefono}
            </a>
          </div>
        </section>

        <Link
          to="/"
          className="mt-6 block text-center text-sm font-semibold text-marca-700 underline-offset-2 hover:underline"
        >
          Volver al inicio
        </Link>
      </main>
    </div>
  );
}

export default Confirmacion;
