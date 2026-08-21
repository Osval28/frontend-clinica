import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, Plus, AlertTriangle } from 'lucide-react';
import {
  obtenerOdontologos,
  crearOdontologo,
  actualizarOdontologo,
  eliminarOdontologo,
} from '../../api/odontologos';
import { obtenerEspecialidades } from '../../api/especialidades';
import { obtenerCitasOdontologo } from '../../api/citas';
import ModalFormulario from '../../components/admin/ModalFormulario';
import { DIAS_EDITOR } from '../../data/diasSemana';

const CAMPO_VACIO = {
  nombre: '',
  apellido: '',
  especialidad: '',
  telefono: '',
  correo: '',
  registroProfesional: '',
};

const CAMPOS_REQUERIDOS = ['nombre', 'apellido', 'telefono', 'correo', 'registroProfesional'];

const filaVacia = (dia) => ({ dia, activo: false, horaInicio: '', horaFin: '' });

// Normaliza acentos/mayúsculas para no perder silenciosamente un día si la
// DB tiene el string con una tilde distinta a la canónica (ej. "Sábado").
const normalizar = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

function construirFilasIniciales(horarioGuardado = []) {
  return DIAS_EDITOR.map((dia) => {
    const existente = horarioGuardado.find((h) => normalizar(h.dia) === normalizar(dia));
    return existente
      ? { dia, activo: true, horaInicio: existente.horaInicio, horaFin: existente.horaFin }
      : filaVacia(dia);
  });
}

// Validación en cliente, mismo patrón que DatosPaciente.jsx: bloquea el
// submit antes de llamar al backend.
function validar(form, filasHorario) {
  const errores = {};

  CAMPOS_REQUERIDOS.forEach((campo) => {
    if (!form[campo].trim()) errores[campo] = 'Este campo es obligatorio.';
  });

  if (!form.especialidad) {
    errores.especialidad = 'Seleccioná una especialidad.';
  }

  if (form.correo.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())) {
    errores.correo = 'Ingresa un correo con un formato válido.';
  }

  const filasActivas = filasHorario.filter((f) => f.activo);
  const erroresFilas = new Set();
  filasHorario.forEach((fila, index) => {
    if (fila.activo && (!fila.horaInicio || !fila.horaFin || fila.horaInicio >= fila.horaFin)) {
      erroresFilas.add(index);
    }
  });

  if (filasActivas.length === 0) {
    errores.horario = 'Seleccioná al menos un día de atención.';
  } else if (erroresFilas.size > 0) {
    errores.horario = 'Revisá los horarios marcados: la hora de inicio debe ser menor a la de fin.';
  }

  return { errores, erroresFilas };
}

function FormularioOdontologo({
  inicial,
  especialidades,
  especialidadesStatus,
  onGuardar,
  onCerrar,
  guardando,
  errorEnvio,
}) {
  const [form, setForm] = useState(
    inicial
      ? {
          nombre: inicial.nombre,
          apellido: inicial.apellido,
          especialidad: inicial.especialidad?._id ?? '',
          telefono: inicial.telefono,
          correo: inicial.correo,
          registroProfesional: inicial.registroProfesional,
        }
      : CAMPO_VACIO
  );
  const [filasHorario, setFilasHorario] = useState(() =>
    construirFilasIniciales(inicial?.horario ?? [])
  );
  const [errores, setErrores] = useState({});
  const [erroresFilas, setErroresFilas] = useState(new Set());

  const sinEspecialidadesDisponibles =
    especialidadesStatus === 'success' && especialidades.length === 0;

  const handleChange = (campo) => (event) => {
    setForm((prev) => ({ ...prev, [campo]: event.target.value }));
  };

  const handleFilaChange = (index, cambios) => {
    setFilasHorario((prev) => prev.map((f, i) => (i === index ? { ...f, ...cambios } : f)));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const { errores: erroresValidacion, erroresFilas: filasInvalidas } = validar(
      form,
      filasHorario
    );
    setErrores(erroresValidacion);
    setErroresFilas(filasInvalidas);
    if (Object.keys(erroresValidacion).length > 0) return;

    const horario = filasHorario
      .filter((f) => f.activo)
      .map(({ dia, horaInicio, horaFin }) => ({ dia, horaInicio, horaFin }));

    onGuardar({
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      especialidad: form.especialidad,
      telefono: form.telefono.trim(),
      correo: form.correo.trim(),
      registroProfesional: form.registroProfesional.trim(),
      horario,
    });
  };

  const inputClase = (campo) =>
    `w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
      errores[campo] ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-teal-500'
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {errorEnvio && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{errorEnvio}</p>
      )}

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
          {errores.nombre && <p className="mt-1 text-xs text-red-600">{errores.nombre}</p>}
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
          {errores.apellido && <p className="mt-1 text-xs text-red-600">{errores.apellido}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="especialidad" className="mb-1 block text-sm font-medium text-slate-700">
          Especialidad
        </label>

        {especialidadesStatus === 'pending' && (
          <select disabled className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-400">
            <option>Cargando especialidades...</option>
          </select>
        )}

        {especialidadesStatus === 'error' && (
          <p className="text-sm text-red-600">No se pudieron cargar las especialidades.</p>
        )}

        {sinEspecialidadesDisponibles && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
            Creá primero una especialidad.
          </p>
        )}

        {especialidadesStatus === 'success' && especialidades.length > 0 && (
          <select
            id="especialidad"
            value={form.especialidad}
            onChange={handleChange('especialidad')}
            className={inputClase('especialidad')}
          >
            <option value="">Seleccioná una especialidad</option>
            {especialidades.map((especialidad) => (
              <option key={especialidad._id} value={especialidad._id}>
                {especialidad.nombre}
              </option>
            ))}
          </select>
        )}

        {errores.especialidad && (
          <p className="mt-1 text-xs text-red-600">{errores.especialidad}</p>
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
          {errores.telefono && <p className="mt-1 text-xs text-red-600">{errores.telefono}</p>}
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
          {errores.correo && <p className="mt-1 text-xs text-red-600">{errores.correo}</p>}
        </div>
      </div>

      <div>
        <label
          htmlFor="registroProfesional"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Registro profesional
        </label>
        <input
          id="registroProfesional"
          type="text"
          value={form.registroProfesional}
          onChange={handleChange('registroProfesional')}
          className={inputClase('registroProfesional')}
        />
        {errores.registroProfesional && (
          <p className="mt-1 text-xs text-red-600">{errores.registroProfesional}</p>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Horario de atención</p>
        <div className="space-y-1 rounded-md border border-slate-200 p-3">
          {filasHorario.map((fila, index) => (
            <div
              key={fila.dia}
              className="flex flex-wrap items-center gap-3 border-b border-slate-100 py-2 last:border-0"
            >
              <label className="flex w-32 shrink-0 items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={fila.activo}
                  onChange={(event) => handleFilaChange(index, { activo: event.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                {fila.dia}
              </label>

              <input
                type="time"
                value={fila.horaInicio}
                disabled={!fila.activo}
                onChange={(event) =>
                  handleFilaChange(index, { horaInicio: event.target.value })
                }
                className={`rounded-md border px-2 py-1 text-sm disabled:bg-slate-50 disabled:text-slate-400 ${
                  erroresFilas.has(index) ? 'border-red-400' : 'border-slate-300'
                }`}
              />
              <span className="text-slate-400">a</span>
              <input
                type="time"
                value={fila.horaFin}
                disabled={!fila.activo}
                onChange={(event) => handleFilaChange(index, { horaFin: event.target.value })}
                className={`rounded-md border px-2 py-1 text-sm disabled:bg-slate-50 disabled:text-slate-400 ${
                  erroresFilas.has(index) ? 'border-red-400' : 'border-slate-300'
                }`}
              />
            </div>
          ))}
        </div>
        {errores.horario && <p className="mt-1 text-xs text-red-600">{errores.horario}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCerrar}
          className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={guardando || sinEspecialidadesDisponibles}
          className="rounded-full bg-teal-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}

function OdontologosAdmin() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState(null); // null | 'crear' | { editar: odontologo }
  const [aEliminar, setAEliminar] = useState(null);
  const [errorEliminar, setErrorEliminar] = useState('');

  const { data, status } = useQuery({
    queryKey: ['odontologos'],
    queryFn: obtenerOdontologos,
  });

  const especialidadesQuery = useQuery({
    queryKey: ['especialidades'],
    queryFn: obtenerEspecialidades,
  });

  // Solo se dispara al abrir el modal de eliminar (enabled), no se precarga
  // con el listado — evita una llamada innecesaria en cada visita a la
  // pantalla.
  const citasOdontologoQuery = useQuery({
    queryKey: ['citasOdontologo', aEliminar?._id],
    queryFn: () => obtenerCitasOdontologo(aEliminar._id),
    enabled: Boolean(aEliminar),
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['odontologos'] });

  const mutCrear = useMutation({
    mutationFn: crearOdontologo,
    onSuccess: () => {
      invalidar();
      setModal(null);
    },
  });

  const mutActualizar = useMutation({
    mutationFn: ({ id, datos }) => actualizarOdontologo(id, datos),
    onSuccess: () => {
      invalidar();
      setModal(null);
    },
  });

  const mutEliminar = useMutation({
    mutationFn: eliminarOdontologo,
    onSuccess: () => {
      invalidar();
      setAEliminar(null);
      setErrorEliminar('');
    },
    onError: (err) => setErrorEliminar(err.message),
  });

  const editando = modal && modal !== 'crear' ? modal.editar : null;

  // useMutation no limpia `error` solo porque el modal se cerró — sin este
  // reset, el banner de un intento fallido anterior queda pegado la próxima
  // vez que se abre el modal (crear o editar), aunque no tenga nada que ver.
  const abrirModal = (valor) => {
    mutCrear.reset();
    mutActualizar.reset();
    setModal(valor);
  };

  const handleGuardar = (datos) => {
    if (editando) {
      mutActualizar.mutate({ id: editando._id, datos });
    } else {
      mutCrear.mutate(datos);
    }
  };

  const abrirEliminar = (odontologo) => {
    setErrorEliminar('');
    setAEliminar(odontologo);
  };

  const cantidadCitas = citasOdontologoQuery.data?.citas?.length ?? 0;
  const chequeoCitasFallo = citasOdontologoQuery.status === 'error';
  const textoBotonEliminar = citasOdontologoQuery.status === 'pending'
    ? 'Verificando...'
    : mutEliminar.isPending
      ? 'Eliminando...'
      : cantidadCitas > 0
        ? 'Eliminar de todas formas'
        : 'Eliminar';

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Odontólogos</h1>
        <button
          type="button"
          onClick={() => abrirModal('crear')}
          className="flex items-center gap-2 rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nuevo odontólogo
        </button>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        {status === 'pending' && (
          <p className="p-6 text-center text-slate-500">Cargando odontólogos...</p>
        )}

        {status === 'error' && (
          <p className="p-6 text-center text-red-600">No se pudieron cargar los odontólogos.</p>
        )}

        {status === 'success' &&
          (data.odontologos.length === 0 ? (
            <p className="p-6 text-center text-slate-500">No hay odontólogos registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Especialidad</th>
                    <th className="px-4 py-3">Teléfono</th>
                    <th className="px-4 py-3">Correo</th>
                    <th className="px-4 py-3">Registro</th>
                    <th className="px-4 py-3">Horario</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.odontologos.map((odontologo) => (
                    <tr key={odontologo._id}>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {odontologo.nombre} {odontologo.apellido}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {odontologo.especialidad?.nombre ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{odontologo.telefono}</td>
                      <td className="px-4 py-3 text-slate-600">{odontologo.correo}</td>
                      <td className="px-4 py-3 text-slate-600">{odontologo.registroProfesional}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {odontologo.horario.length === 0
                          ? 'Sin horario'
                          : odontologo.horario.map((h) => h.dia.slice(0, 3)).join(', ')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => abrirModal({ editar: odontologo })}
                            className="text-slate-400 transition hover:text-teal-600"
                            aria-label={`Editar ${odontologo.nombre}`}
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => abrirEliminar(odontologo)}
                            className="text-slate-400 transition hover:text-red-600"
                            aria-label={`Eliminar ${odontologo.nombre}`}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </div>

      {modal && (
        <ModalFormulario
          titulo={editando ? 'Editar odontólogo' : 'Nuevo odontólogo'}
          onCerrar={() => setModal(null)}
          ancho="max-w-2xl"
        >
          <FormularioOdontologo
            inicial={editando ?? undefined}
            especialidades={especialidadesQuery.data?.especialidades ?? []}
            especialidadesStatus={especialidadesQuery.status}
            onGuardar={handleGuardar}
            onCerrar={() => setModal(null)}
            guardando={mutCrear.isPending || mutActualizar.isPending}
            errorEnvio={mutCrear.error?.message || mutActualizar.error?.message}
          />
        </ModalFormulario>
      )}

      {aEliminar && (
        <ModalFormulario titulo="Eliminar odontólogo" onCerrar={() => setAEliminar(null)}>
          <div className="space-y-4">
            {errorEliminar && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{errorEliminar}</p>
            )}

            {citasOdontologoQuery.status === 'pending' && (
              <p className="text-sm text-slate-500">Verificando citas asociadas...</p>
            )}

            {chequeoCitasFallo && (
              <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-500">
                No se pudo verificar si tiene citas asociadas.
              </p>
            )}

            {citasOdontologoQuery.status === 'success' && cantidadCitas > 0 && (
              <div className="flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  Este odontólogo tiene {cantidadCitas} cita(s) registrada(s). ¿Eliminarlo de
                  todas formas?
                </span>
              </div>
            )}

            <p className="text-sm text-slate-600">
              ¿Eliminar a <strong>{aEliminar.nombre} {aEliminar.apellido}</strong>? Esta acción no
              se puede deshacer.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAEliminar(null)}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={mutEliminar.isPending || citasOdontologoQuery.status === 'pending'}
                onClick={() => mutEliminar.mutate(aEliminar._id)}
                className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {textoBotonEliminar}
              </button>
            </div>
          </div>
        </ModalFormulario>
      )}
    </div>
  );
}

export default OdontologosAdmin;
