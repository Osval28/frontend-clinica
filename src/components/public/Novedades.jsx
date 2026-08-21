import { NOVEDADES } from '../../data/clinica';
import novedadImg from '../../../media/ortodoncia-clinica-dental-murcia.webp';

function Novedades() {
  return (
    <section id="novedades" className="bg-white px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-teal-600">
            Mantente al día
          </span>
          <h2 className="mt-2 text-3xl font-bold text-slate-800 sm:text-4xl">Novedades</h2>
          <p className="mt-4 text-slate-600">
            Noticias, jornadas y cambios en la atención de la clínica.
          </p>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-2">
          <img
            src={novedadImg}
            alt="Tratamiento de ortodoncia"
            className="h-72 w-full rounded-2xl object-cover shadow-lg lg:h-[380px]"
          />

          <div className="space-y-5">
            {NOVEDADES.map((novedad) => (
              <article
                key={novedad.id}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-6 transition hover:border-teal-200"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-teal-600">
                  {novedad.fecha}
                </span>
                <h3 className="mt-1 text-lg font-semibold text-slate-800">
                  {novedad.titulo}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{novedad.texto}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Novedades;
