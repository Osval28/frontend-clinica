import { CLINICA } from '../../data/clinica';
import heroImg from '../../../media/repairing-tooth-EEBYC32-1024x683.jpg';

function Hero() {
  return (
    <section id="inicio" className="relative">
      <img
        src={heroImg}
        alt="Atención odontológica profesional"
        className="h-[420px] w-full object-cover sm:h-[520px]"
      />

      {/* Capa oscura para que el texto sea legible sobre la foto */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/60 to-slate-900/20" />

      <div className="absolute inset-0 flex items-center">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="max-w-xl text-white">
            <span className="mb-4 inline-block rounded-full bg-marca-600/90 px-4 py-1 text-xs font-semibold uppercase tracking-wide">
              {CLINICA.eslogan}
            </span>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Cuidamos tu sonrisa con tecnología y calidez humana
            </h1>
            <p className="mt-4 text-base text-slate-200 sm:text-lg">
              En {CLINICA.nombre} combinamos diagnóstico radiológico de precisión con
              atención odontológica integral para toda la familia.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#servicios"
                className="rounded-full bg-marca-600 px-7 py-3 text-center text-sm font-semibold transition hover:bg-marca-700"
              >
                Agendar mi cita
              </a>
              <a
                href="#bienvenida"
                className="rounded-full border border-white/70 px-7 py-3 text-center text-sm font-semibold transition hover:bg-white/10"
              >
                Conocer la clínica
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
