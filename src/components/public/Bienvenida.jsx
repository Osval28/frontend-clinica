import { ScanLine, Users, CalendarCheck, Sparkles } from 'lucide-react';
import { CLINICA, DIFERENCIALES } from '../../data/clinica';
import equipoImg from '../../../media/funciones-de-auxiliar-de-odontologia.jpg';

// Mapeo id -> ícono para las tarjetas de "Diferenciales". Vive acá (y no en
// clinica.js) porque es una decisión de presentación, no de contenido.
// Si se agrega un diferencial nuevo y se olvida su entrada acá, cae en
// ICONOS_DIFERENCIALES.default en vez de romper o quedar sin ícono.
const ICONOS_DIFERENCIALES = {
  tecnologia: ScanLine,
  equipo: Users,
  agenda: CalendarCheck,
  default: Sparkles,
};

function Bienvenida() {
  return (
    <section id="bienvenida" className="bg-white px-4 py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wide text-teal-600">
            Sobre nosotros
          </span>
          <h2 className="mt-2 text-3xl font-bold text-slate-800 sm:text-4xl">
            Bienvenido a {CLINICA.nombre}
          </h2>
          <p className="mt-5 text-slate-600">
            Somos una clínica odontológica comprometida con la salud bucal de nuestros
            pacientes. Desde el diagnóstico radiológico hasta el tratamiento final, cada
            paso está pensado para que te sientas acompañado y bien informado.
          </p>
          <p className="mt-4 text-slate-600">
            Nuestro equipo trabaja con equipos modernos y protocolos claros, porque creemos
            que una buena experiencia empieza por la confianza.
          </p>

          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-100 pt-6">
            <div>
              <dt className="text-2xl font-bold text-teal-600">+10</dt>
              <dd className="text-xs text-slate-500">años de experiencia</dd>
            </div>
            <div>
              <dt className="text-2xl font-bold text-teal-600">+2.000</dt>
              <dd className="text-xs text-slate-500">pacientes atendidos</dd>
            </div>
            <div>
              <dt className="text-2xl font-bold text-teal-600">100%</dt>
              <dd className="text-xs text-slate-500">atención personalizada</dd>
            </div>
          </dl>
        </div>

        <img
          src={equipoImg}
          alt="Equipo profesional de la clínica"
          className="h-80 w-full rounded-2xl object-cover shadow-lg lg:h-[420px]"
        />
      </div>

      <div className="mx-auto mt-20 grid max-w-6xl gap-6 md:grid-cols-3">
        {DIFERENCIALES.map((item) => {
          const Icono = ICONOS_DIFERENCIALES[item.id] ?? ICONOS_DIFERENCIALES.default;
          return (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-7 transition hover:border-teal-200 hover:shadow-md"
            >
              <Icono className="h-8 w-8 text-teal-600" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold text-slate-800">{item.titulo}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.texto}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default Bienvenida;
