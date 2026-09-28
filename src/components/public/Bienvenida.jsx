import { useEffect, useRef, useState } from 'react';
import { ScanLine, Users, CalendarCheck, Sparkles } from 'lucide-react';
import { CLINICA, DIFERENCIALES } from '../../data/clinica';
import equipoImg from '../../../media/funciones-de-auxiliar-de-odontologia.jpg';
import FondoDientes from './FondoDientes';

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

// Cifras de la presentación. "valor" es lo que se anima; prefijo/sufijo se
// muestran tal cual.
const CIFRAS = [
  { id: 'anios', prefijo: '+', valor: 10, sufijo: '', texto: 'años de experiencia' },
  { id: 'pacientes', prefijo: '+', valor: 2000, sufijo: '', texto: 'pacientes atendidos' },
  { id: 'atencion', prefijo: '', valor: 100, sufijo: '%', texto: 'atención personalizada' },
];

const DURACION_CONTEO = 1200; // ms

// Cuenta de 0 al valor la primera vez que la cifra entra en pantalla. El valor
// final es el estado por defecto: si el observer no corre o el usuario pidió
// menos movimiento, la cifra se ve completa desde el inicio.
function CifraAnimada({ valor }) {
  const ref = useRef(null);
  const [actual, setActual] = useState(valor);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let frame;
    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        observer.disconnect();
        // El inicio se toma del primer frame: el timestamp de rAF puede ser
        // anterior a performance.now() y dar un progreso negativo.
        let inicio = null;
        const paso = (ahora) => {
          inicio ??= ahora;
          const t = Math.min(Math.max((ahora - inicio) / DURACION_CONTEO, 0), 1);
          const suavizado = 1 - Math.pow(1 - t, 4); // desacelera al final
          setActual(Math.round(valor * suavizado));
          if (t < 1) frame = requestAnimationFrame(paso);
        };
        frame = requestAnimationFrame(paso);
      },
      { threshold: 0.6 }
    );
    observer.observe(nodo);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [valor]);

  return <span ref={ref}>{actual.toLocaleString('es-CO')}</span>;
}

function Bienvenida() {
  return (
    <section id="bienvenida" className="relative isolate overflow-hidden px-4 py-20">
      <FondoDientes />
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wide text-marca-600">
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

          <dl className="mt-10 grid grid-cols-3 gap-3 border-t border-marca-200/70 pt-8 sm:gap-6">
            {CIFRAS.map((cifra) => (
              <div key={cifra.id} className="flex flex-col-reverse gap-2">
                <dt className="text-xs font-medium leading-snug text-slate-600 sm:text-sm">
                  {cifra.texto}
                </dt>
                <dd
                  className={`text-[1.75rem] font-extrabold leading-none tracking-tight tabular-nums text-marca-600 sm:text-5xl`}
                >
                  {cifra.prefijo}
                  <CifraAnimada valor={cifra.valor} />
                  {cifra.sufijo}
                </dd>
              </div>
            ))}
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
              className="rounded-2xl border border-slate-100 bg-white/90 p-7 shadow-sm transition hover:border-marca-200 hover:shadow-md"
            >
              <Icono className="h-8 w-8 text-marca-600" aria-hidden="true" />
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
