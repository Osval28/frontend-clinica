import { useState } from 'react';
import { Link, Navigate, useNavigate, useOutletContext } from 'react-router-dom';
import { CalendarDays, Clock, Lock } from 'lucide-react';
import { solicitarCita } from '../../../api/citas';
import EncabezadoFlujo from '../../../components/public/EncabezadoFlujo';
import { formatearFechaLarga, formatearPrecio } from '../../../utils/formato';

const CAMPOS_REQUERIDOS = ['nombre', 'apellido', 'documento', 'telefono', 'correo'];

const CAMPO_VACIO = {
  nombre: '',
  apellido: '',
  documento: '',
  telefono: '',
  correo: '',
  observaciones: '',
};

// Validación en cliente: bloquea el submit antes de llamar al backend.
// El backend igual valida (esquema de Mongoose), así que sus errores se
// muestran tal cual en `errorEnvio` si algo se escapa de acá (ej. el
// horario se ocupó entre que se eligió y se envió).
function validar(datos) {
  const errores = {};

  CAMPOS_REQUERIDOS.forEach((campo) => {
    if (!datos[campo].trim()) {
      errores[campo] = 'Este campo es obligatorio.';
    }
  });

  if (datos.correo.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo.trim())) {
    errores.correo = 'Ingresa un correo con un formato válido.';
  }

  return errores;
}

// Formulario de datos del paciente + envío final de la cita.
//
// Guard: si alguien llega aquí sin haber pasado por /agendar/servicio/:id
// (sin servicio elegido en el estado elevado), se redirige al Home — mismo
// criterio que en ServicioDetalle/Confirmacion.
function DatosPaciente() {
  const { agendamiento, actualizarAgendamiento } = useOutletContext();
  const navigate = useNavigate();

  // El formulario vive en el estado elevado del flujo (no en un useState
  // local) para que ir a "Cambiar" la fecha y volver no borre lo escrito.
  const form = agendamiento.datosPaciente ?? CAMPO_VACIO;
  const [errores, setErrores] = useState({});
  const [errorEnvio, setErrorEnvio] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (!agendamiento.servicio) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (campo) => (event) => {
    const { value } = event.target;
    actualizarAgendamiento((prev) => ({
      datosPaciente: { ...(prev.datosPaciente ?? CAMPO_VACIO), [campo]: value },
    }));
    if (errores[campo]) {
      setErrores((prev) => ({ ...prev, [campo]: undefined }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const erroresValidacion = validar(form);
    setErrores(erroresValidacion);
    if (Object.keys(erroresValidacion).length > 0) {
      // Lleva el foco al primer campo con error para que no pase inadvertido.
      document.getElementById(Object.keys(erroresValidacion)[0])?.focus();
      return;
    }

    setErrorEnvio('');
    setEnviando(true);

    try {
      const { cita } = await solicitarCita({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        documento: form.documento.trim(),
        telefono: form.telefono.trim(),
        correo: form.correo.trim(),
        observaciones: form.observaciones.trim(),
        odontologo: agendamiento.odontologo._id,
        servicio: agendamiento.servicio._id,
        fecha: agendamiento.fecha,
        hora: agendamiento.hora,
      });

      actualizarAgendamiento({ cita });
      navigate('/agendar/confirmacion');
    } catch (err) {
      setErrorEnvio(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const inputClase = (campo) =>
    `w-full rounded-md border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-marca-500/20 ${
      errores[campo]
        ? 'border-red-400 focus:border-red-500'
        : 'border-slate-300 focus:border-marca-500'
    }`;

  const { servicio, fecha, hora } = agendamiento;

  return (
    <div className="min-h-screen bg-slate-50">
      <EncabezadoFlujo
        pasoActual={2}
        volver={{ to: `/agendar/servicio/${servicio._id}`, label: 'Cambiar horario' }}
      />

      <main className="mx-auto max-w-xl px-4 py-8 sm:py-10">
        <section
          aria-label="Resumen de tu cita"
          className="flex flex-col gap-3 rounded-2xl border border-marca-100 bg-marca-50/60 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-semibold text-slate-800">{servicio.nombre}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-marca-600" aria-hidden="true" />
                <span className="first-letter:uppercase">{formatearFechaLarga(fecha)}</span>
              </span>
              <span className="flex items-center gap-1.5 tabular-nums">
                <Clock className="h-4 w-4 text-marca-600" aria-hidden="true" />
                {hora} · {servicio.duracion} min
              </span>
            </p>
          </div>
          <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
            <span className="text-sm font-semibold text-slate-800">
              {formatearPrecio(servicio.precio)}
            </span>
            <Link
              to={`/agendar/servicio/${servicio._id}`}
              className="text-sm font-semibold text-marca-700 underline-offset-2 hover:underline"
            >
              Cambiar
            </Link>
          </div>
        </section>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-xl font-semibold text-slate-800">Tus datos</h1>
          <p className="mt-2 text-sm text-slate-500">
            Los usamos para identificarte y contactarte si hay algún cambio en tu cita.
          </p>

          {errorEnvio && (
            <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {errorEnvio}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="nombre" className="mb-1 block text-sm font-medium text-slate-700">
                  Nombre
                </label>
                <input
                  id="nombre"
                  type="text"
                  autoComplete="given-name"
                  value={form.nombre}
                  onChange={handleChange('nombre')}
                  className={inputClase('nombre')}
                />
                {errores.nombre && (
                  <p className="mt-1 text-xs text-red-600">{errores.nombre}</p>
                )}
              </div>

              <div>
                <label htmlFor="apellido" className="mb-1 block text-sm font-medium text-slate-700">
                  Apellido
                </label>
                <input
                  id="apellido"
                  type="text"
                  autoComplete="family-name"
                  value={form.apellido}
                  onChange={handleChange('apellido')}
                  className={inputClase('apellido')}
                />
                {errores.apellido && (
                  <p className="mt-1 text-xs text-red-600">{errores.apellido}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="documento" className="mb-1 block text-sm font-medium text-slate-700">
                Documento de identidad
              </label>
              <input
                id="documento"
                type="text"
                aria-describedby="documento-ayuda"
                value={form.documento}
                onChange={handleChange('documento')}
                className={inputClase('documento')}
              />
              {errores.documento ? (
                <p className="mt-1 text-xs text-red-600">{errores.documento}</p>
              ) : (
                <p id="documento-ayuda" className="mt-1 text-xs text-slate-500">
                  Si ya te atendiste con nosotros, usaremos los datos que tenemos registrados.
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="telefono" className="mb-1 block text-sm font-medium text-slate-700">
                  Teléfono
                </label>
                <input
                  id="telefono"
                  type="tel"
                  autoComplete="tel"
                  value={form.telefono}
                  onChange={handleChange('telefono')}
                  className={inputClase('telefono')}
                />
                {errores.telefono && (
                  <p className="mt-1 text-xs text-red-600">{errores.telefono}</p>
                )}
              </div>

              <div>
                <label htmlFor="correo" className="mb-1 block text-sm font-medium text-slate-700">
                  Correo
                </label>
                <input
                  id="correo"
                  type="email"
                  autoComplete="email"
                  value={form.correo}
                  onChange={handleChange('correo')}
                  className={inputClase('correo')}
                />
                {errores.correo && (
                  <p className="mt-1 text-xs text-red-600">{errores.correo}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="observaciones"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Observaciones (opcional)
              </label>
              <textarea
                id="observaciones"
                rows={3}
                placeholder="Por ejemplo: tengo sensibilidad en una muela, vengo por control..."
                value={form.observaciones}
                onChange={handleChange('observaciones')}
                className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-marca-500 focus:outline-none focus:ring-2 focus:ring-marca-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="w-full rounded-full bg-marca-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-marca-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enviando ? 'Agendando...' : 'Confirmar cita'}
            </button>

            <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              No necesitas crear una cuenta ni pagar en línea.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}

export default DatosPaciente;
