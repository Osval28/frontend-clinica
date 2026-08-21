import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, Plus, AlertTriangle } from 'lucide-react';
import {
  obtenerEspecialidades,
  crearEspecialidad,
  actualizarEspecialidad,
  eliminarEspecialidad,
} from '../../api/especialidades';
import { obtenerOdontologos } from '../../api/odontologos';
import ModalFormulario from '../../components/admin/ModalFormulario';

const CAMPO_VACIO = { nombre: '', descripcion: '' };

// Validación en cliente: bloquea el submit antes de llamar al backend.
// Mismo patrón que DatosPaciente.jsx.
function validar(datos) {
  const errores = {};
  if (!datos.nombre.trim()) errores.nombre = 'Este campo es obligatorio.';
  if (!datos.descripcion.trim()) errores.descripcion = 'Este campo es obligatorio.';
  return errores;
}

function FormularioEspecialidad({ inicial, onGuardar, onCerrar, guardando, errorEnvio }) {
  const [form, setForm] = useState(inicial ?? CAMPO_VACIO);
  const [errores, setErrores] = useState({});

  const handleChange = (campo) => (event) => {
    setForm((prev) => ({ ...prev, [campo]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const erroresValidacion = validar(form);
    setErrores(erroresValidacion);
    if (Object.keys(erroresValidacion).length > 0) return;
    onGuardar({ nombre: form.nombre.trim(), descripcion: form.descripcion.trim() });
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
        <label htmlFor="descripcion" className="mb-1 block text-sm font-medium text-slate-700">
          Descripción
        </label>
        <textarea
          id="descripcion"
          rows={3}
          value={form.descripcion}
          onChange={handleChange('descripcion')}
          className={inputClase('descripcion')}
        />
        {errores.descripcion && (
          <p className="mt-1 text-xs text-red-600">{errores.descripcion}</p>
        )}
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
          disabled={guardando}
          className="rounded-full bg-teal-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}

function EspecialidadesAdmin() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState(null); // null | 'crear' | { editar: especialidad }
  const [aEliminar, setAEliminar] = useState(null); // especialidad | null
  const [errorEliminar, setErrorEliminar] = useState('');

  const { data, status } = useQuery({
    queryKey: ['especialidades'],
    queryFn: obtenerEspecialidades,
  });

  // Cargado también en esta pantalla (sin llamada extra dedicada) solo para
  // poder advertir si una especialidad está en uso antes de borrarla.
  const { data: dataOdontologos } = useQuery({
    queryKey: ['odontologos'],
    queryFn: obtenerOdontologos,
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['especialidades'] });

  const mutCrear = useMutation({
    mutationFn: crearEspecialidad,
    onSuccess: () => {
      invalidar();
      setModal(null);
    },
  });

  const mutActualizar = useMutation({
    mutationFn: ({ id, datos }) => actualizarEspecialidad(id, datos),
    onSuccess: () => {
      invalidar();
      setModal(null);
    },
  });

  const mutEliminar = useMutation({
    mutationFn: eliminarEspecialidad,
    onSuccess: () => {
      invalidar();
      setAEliminar(null);
      setErrorEliminar('');
    },
    onError: (err) => setErrorEliminar(err.message),
  });

  const editando = modal && modal !== 'crear' ? modal.editar : null;

  const handleGuardar = (datos) => {
    if (editando) {
      mutActualizar.mutate({ id: editando._id, datos });
    } else {
      mutCrear.mutate(datos);
    }
  };

  const odontologosConEsaEspecialidad = (especialidadId) =>
    (dataOdontologos?.odontologos ?? []).filter((o) => o.especialidad?._id === especialidadId);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Especialidades</h1>
        <button
          type="button"
          onClick={() => setModal('crear')}
          className="flex items-center gap-2 rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nueva especialidad
        </button>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        {status === 'pending' && (
          <p className="p-6 text-center text-slate-500">Cargando especialidades...</p>
        )}

        {status === 'error' && (
          <p className="p-6 text-center text-red-600">No se pudieron cargar las especialidades.</p>
        )}

        {status === 'success' &&
          (data.especialidades.length === 0 ? (
            <p className="p-6 text-center text-slate-500">No hay especialidades registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Descripción</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.especialidades.map((especialidad) => (
                    <tr key={especialidad._id}>
                      <td className="px-4 py-3 font-medium text-slate-800">{especialidad.nombre}</td>
                      <td className="px-4 py-3 text-slate-600">{especialidad.descripcion}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setModal({ editar: especialidad })}
                            className="text-slate-400 transition hover:text-teal-600"
                            aria-label={`Editar ${especialidad.nombre}`}
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setErrorEliminar('');
                              setAEliminar(especialidad);
                            }}
                            className="text-slate-400 transition hover:text-red-600"
                            aria-label={`Eliminar ${especialidad.nombre}`}
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
          titulo={editando ? 'Editar especialidad' : 'Nueva especialidad'}
          onCerrar={() => setModal(null)}
        >
          <FormularioEspecialidad
            inicial={editando ? { nombre: editando.nombre, descripcion: editando.descripcion } : undefined}
            onGuardar={handleGuardar}
            onCerrar={() => setModal(null)}
            guardando={mutCrear.isPending || mutActualizar.isPending}
            errorEnvio={mutCrear.error?.message || mutActualizar.error?.message}
          />
        </ModalFormulario>
      )}

      {aEliminar && (
        <ModalFormulario titulo="Eliminar especialidad" onCerrar={() => setAEliminar(null)}>
          <div className="space-y-4">
            {errorEliminar && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{errorEliminar}</p>
            )}

            {(() => {
              const enUso = odontologosConEsaEspecialidad(aEliminar._id).length;
              return (
                enUso > 0 && (
                  <div className="flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>
                      Hay {enUso} odontólogo(s) con esta especialidad. Eliminarla puede romper su
                      información asociada.
                    </span>
                  </div>
                )
              );
            })()}

            <p className="text-sm text-slate-600">
              ¿Eliminar la especialidad <strong>{aEliminar.nombre}</strong>? Esta acción no se puede
              deshacer.
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
                disabled={mutEliminar.isPending}
                onClick={() => mutEliminar.mutate(aEliminar._id)}
                className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {mutEliminar.isPending
                  ? 'Eliminando...'
                  : odontologosConEsaEspecialidad(aEliminar._id).length > 0
                    ? 'Eliminar de todas formas'
                    : 'Eliminar'}
              </button>
            </div>
          </div>
        </ModalFormulario>
      )}
    </div>
  );
}

export default EspecialidadesAdmin;
