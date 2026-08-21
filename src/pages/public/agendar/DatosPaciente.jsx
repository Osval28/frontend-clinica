import { useState } from 'react';
import { Navigate, useNavigate, useOutletContext } from 'react-router-dom';
import { solicitarCita } from '../../../api/citas';

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

  const [form, setForm] = useState(CAMPO_VACIO);
  const [errores, setErrores] = useState({});
  const [errorEnvio, setErrorEnvio] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (!agendamiento.servicio) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (campo) => (event) => {
    setForm((prev) => ({ ...prev, [campo]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const erroresValidacion = validar(form);
    setErrores(erroresValidacion);
    if (Object.keys(erroresValidacion).length > 0) {
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
    `w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
      errores[campo]
        ? 'border-red-400 focus:border-red-500'
        : 'border-slate-300 focus:border-teal-500'
    }`;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-800">Tus datos</h1>
          <p className="mt-2 text-sm text-slate-500">
            {agendamiento.servicio.nombre} — {agendamiento.fecha} a las {agendamiento.hora}
          </p>

          {errorEnvio && (
            <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
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
                value={form.documento}
                onChange={handleChange('documento')}
                className={inputClase('documento')}
              />
              {errores.documento && (
                <p className="mt-1 text-xs text-red-600">{errores.documento}</p>
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
                value={form.observaciones}
                onChange={handleChange('observaciones')}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="w-full rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enviando ? 'Agendando...' : 'Confirmar cita'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default DatosPaciente;
