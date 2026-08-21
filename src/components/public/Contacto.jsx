import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { CLINICA } from '../../data/clinica';

const DATOS = [
  { icono: MapPin, titulo: 'Dirección', valor: CLINICA.direccion },
  { icono: Phone, titulo: 'Teléfono', valor: CLINICA.telefono, href: CLINICA.telefonoLink },
  { icono: Mail, titulo: 'Correo', valor: CLINICA.correo, href: `mailto:${CLINICA.correo}` },
  { icono: Clock, titulo: 'Horario', valor: CLINICA.horario },
];

function Contacto() {
  return (
    <section id="contacto" className="bg-teal-800 px-4 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-teal-300">
            Estamos para ayudarte
          </span>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Contáctanos</h2>
          <p className="mt-4 text-teal-100">
            Escríbenos o llámanos y con gusto resolvemos tus dudas antes de tu visita.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {DATOS.map((dato) => (
            <div
              key={dato.titulo}
              className="rounded-2xl bg-teal-700/60 p-6 text-center transition hover:bg-teal-700"
            >
              <dato.icono className="mx-auto h-6 w-6" aria-hidden="true" />
              <h3 className="mt-3 text-sm font-semibold uppercase tracking-wide text-teal-200">
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
            className="inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-teal-800 transition hover:bg-teal-50"
          >
            Escríbenos por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

export default Contacto;
