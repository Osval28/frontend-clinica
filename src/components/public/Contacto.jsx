import { MapPinned, PhoneCall, Mail, CalendarClock } from 'lucide-react';
import { CLINICA } from '../../data/clinica';
import { IconoWhatsApp } from './BotonWhatsApp';

const DATOS = [
  { icono: MapPinned, titulo: 'Dirección', valor: CLINICA.direccion },
  { icono: PhoneCall, titulo: 'Teléfono', valor: CLINICA.telefono, href: CLINICA.telefonoLink },
  { icono: Mail, titulo: 'Correo', valor: CLINICA.correo, href: `mailto:${CLINICA.correo}` },
  { icono: CalendarClock, titulo: 'Horario', valor: CLINICA.horario },
];

function Contacto() {
  return (
    <section id="contacto" className="bg-marca-800 px-4 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-marca-300">
            Estamos para ayudarte
          </span>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Contáctanos</h2>
          <p className="mt-4 text-marca-100">
            Escríbenos o llámanos y con gusto resolvemos tus dudas antes de tu visita.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {DATOS.map((dato) => (
            <div
              key={dato.titulo}
              className="group rounded-2xl bg-marca-700/60 p-7 text-center transition hover:bg-marca-700"
            >
              {/* Ícono grande en un disco blanco: se identifica cada dato de un vistazo. */}
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-marca-600 shadow-md shadow-marca-950/20 transition group-hover:scale-105">
                <dato.icono className="h-8 w-8" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-marca-200">
                {dato.titulo}
              </h3>
              {dato.href ? (
                <a href={dato.href} className="mt-1 block text-sm hover:underline">
                  {dato.valor}
                </a>
              ) : (
                <p className="mt-1 text-sm">{dato.valor}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href={`https://wa.me/${CLINICA.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-semibold text-marca-800 transition hover:bg-marca-50"
          >
            <IconoWhatsApp className="h-5 w-5 text-[#25D366]" />
            Escríbenos por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

export default Contacto;
