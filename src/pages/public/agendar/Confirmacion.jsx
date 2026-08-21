import { Link, Navigate, useOutletContext } from 'react-router-dom';
import { Check } from 'lucide-react';

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

  const fecha = new Date(cita.fecha).toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <div className="text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-600">
            <Check className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-xl font-semibold text-slate-800">Cita agendada</h1>
          <p className="mt-2 text-sm text-slate-500">
            Te esperamos, {cita.paciente.nombre}. Guardamos estos datos:
          </p>
        </div>

        <dl className="mt-6 space-y-3 border-t border-slate-100 pt-6 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Servicio</dt>
            <dd className="text-right font-medium text-slate-800">{cita.servicio.nombre}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Odontólogo</dt>
            <dd className="text-right font-medium text-slate-800">
              {cita.odontologo.nombre} {cita.odontologo.apellido}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Fecha</dt>
            <dd className="text-right font-medium capitalize text-slate-800">{fecha}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Hora</dt>
            <dd className="text-right font-medium text-slate-800">{cita.hora}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Estado</dt>
            <dd className="text-right font-medium text-slate-800">{cita.estado}</dd>
          </div>
        </dl>

        <Link
          to="/"
          className="mt-8 block w-full rounded-full bg-teal-600 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}

export default Confirmacion;
