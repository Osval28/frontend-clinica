import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, Plus, AlertTriangle } from 'lucide-react';
import {
  obtenerServicios,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
} from '../../api/servicios';
import { obtenerCitas } from '../../api/citas';
import ModalFormulario from '../../components/admin/ModalFormulario';

const CAMPO_VACIO = { nombre: '', descripcion: '', precio: '', duracion: '' };

// Validación en cliente, mismo patrón que DatosPaciente.jsx: bloquea el
// submit antes de llamar al backend.
function validar(form) {
  const errores = {};

  if (!form.nombre.trim()) errores.nombre = 'Este campo es obligatorio.';
  if (!form.descripcion.trim()) errores.descripcion = 'Este campo es obligatorio.';

  if (!form.precio.trim()) {
    errores.precio = 'Este campo es obligatorio.';
  } else if (Number.isNaN(Number(form.precio))) {
    errores.precio = 'Ingresá un número válido.';
  } else if (Number(form.precio) < 0) {
    errores.precio = 'El precio no puede ser negativo.';
  }

  if (!form.duracion.trim()) {
    errores.duracion = 'Este campo es obligatorio.';
  } else if (Number.isNaN(Number(form.duracion))) {
    errores.duracion = 'Ingresá un número válido.';
  } else if (!Number.isInteger(Number(form.duracion))) {
    errores.duracion = 'La duración debe ser un número entero de minutos.';
  } else if (Number(form.duracion) <= 0) {
    errores.duracion = 'La duración debe ser mayor a 0 minutos.';
  }

  return errores;
}

function FormularioServicio({ inicial, onGuardar, onCerrar, guardando, errorEnvio }) {
  const [form, setForm] = useState(
    inicial
      ? {
          nombre: inicial.nombre,
          descripcion: inicial.descripcion,
          precio: String(inicial.precio),
          duracion: String(inicial.duracion),
        }
      : CAMPO_VACIO
  );
  const [errores, setErrores] = useState({});

  const handleChange = (campo) => (event) => {
    setForm((prev) => ({ ...prev, [campo]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const erroresValidacion = validar(form);
    setErrores(erroresValidacion);
    if (Object.keys(erroresValidacion).length > 0) return;

    onGuardar({
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      precio: Number(form.precio),
      duracion: Number(form.duracion),
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="precio" className="mb-1 block text-sm font-medium text-slate-700">
            Precio
          </label>
          <input
            id="precio"
            type="number"
            step="0.01"
            min="0"
            value={form.precio}
            onChange={handleChange('precio')}
            className={inputClase('precio')}
          />
          {errores.precio && <p className="mt-1 text-xs text-red-600">{errores.precio}</p>}
        </div>

        <div>
          <label htmlFor="duracion" className="mb-1 block text-sm font-medium text-slate-700">
            Duración (minutos)
          </label>
          <input
            id="duracion"
            type="number"
            step="1"
            min="1"
            value={form.duracion}
            onChange={handleChange('duracion')}
            className={inputClase('duracion')}
          />
          {errores.duracion && <p className="mt-1 text-xs text-red-600">{errores.duracion}</p>}
        </div>
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

function ServiciosAdmin() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState(null); // null | 'crear' | { editar: servicio }
  const [aEliminar, setAEliminar] = useState(null);
  const [errorEliminar, setErrorEliminar] = useState('');

  const { data, status } = useQuery({
    queryKey: ['servicios'],
    queryFn: obtenerServicios,
  });

  // Solo se dispara al abrir el modal de eliminar (enabled), no se precarga
  // con el listado. No hay endpoint filtrado por servicio en el backend, así
  // que se trae todas las citas y se filtra client-side.
  const citasQuery = useQuery({
    queryKey: ['citas'],
    queryFn: obtenerCitas,
    enabled: Boolean(aEliminar),
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['servicios'] });

  const mutCrear = useMutation({
    mutationFn: crearServicio,
    onSuccess: () => {
      invalidar();
      setModal(null);
    },
  });

  const mutActualizar = useMutation({
    mutationFn: ({ id, datos }) => actualizarServicio(id, datos),
    onSuccess: () => {
      invalidar();
      setModal(null);
    },
  });

  const mutEliminar = useMutation({
    mutationFn: eliminarServicio,
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
  // vez que se abre el modal (crear o editar).
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

  const abrirEliminar = (servicio) => {
    setErrorEliminar('');
    setAEliminar(servicio);
  };

  const citasDelServicio = (citasQuery.data?.citas ?? []).filter(
    (cita) => cita.servicio?._id === aEliminar?._id
  );
  const cantidadCitas = citasDelServicio.length;
  const chequeoCitasFallo = citasQuery.status === 'error';
  const textoBotonEliminar = citasQuery.status === 'pending'
    ? 'Verificando...'
    : mutEliminar.isPending
      ? 'Eliminando...'
      : cantidadCitas > 0
        ? 'Eliminar de todas formas'
        : 'Eliminar';

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Servicios</h1>
        <button
          type="button"
          onClick={() => abrirModal('crear')}
          className="flex items-center gap-2 rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nuevo servicio
        </button>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        {status === 'pending' && (
          <p className="p-6 text-center text-slate-500">Cargando servicios...</p>
        )}

        {status === 'error' && (
          <p className="p-6 text-center text-red-600">No se pudieron cargar los servicios.</p>
        )}

        {status === 'success' &&
          (data.servicios.length === 0 ? (
            <p className="p-6 text-center text-slate-500">No hay servicios registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Descripción</th>
                    <th className="px-4 py-3">Precio</th>
                    <th className="px-4 py-3">Duración</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.servicios.map((servicio) => (
                    <tr key={servicio._id}>
                      <td className="px-4 py-3 font-medium text-slate-800">{servicio.nombre}</td>
                      <td className="px-4 py-3 text-slate-600">{servicio.descripcion}</td>
                      <td className="px-4 py-3 text-slate-600">${servicio.precio}</td>
                      <td className="px-4 py-3 text-slate-600">{servicio.duracion} min</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => abrirModal({ editar: servicio })}
                            className="text-slate-400 transition hover:text-teal-600"
                            aria-label={`Editar ${servicio.nombre}`}
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => abrirEliminar(servicio)}
                            className="text-slate-400 transition hover:text-red-600"
                            aria-label={`Eliminar ${servicio.nombre}`}
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
          titulo={editando ? 'Editar servicio' : 'Nuevo servicio'}
          onCerrar={() => setModal(null)}
        >
          <FormularioServicio
            inicial={editando ?? undefined}
            onGuardar={handleGuardar}
            onCerrar={() => setModal(null)}
            guardando={mutCrear.isPending || mutActualizar.isPending}
            errorEnvio={mutCrear.error?.message || mutActualizar.error?.message}
          />
        </ModalFormulario>
      )}

      {aEliminar && (
        <ModalFormulario titulo="Eliminar servicio" onCerrar={() => setAEliminar(null)}>
          <div className="space-y-4">
            {errorEliminar && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{errorEliminar}</p>
            )}

            {citasQuery.status === 'pending' && (
              <p className="text-sm text-slate-500">Verificando citas asociadas...</p>
            )}

            {chequeoCitasFallo && (
              <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-500">
                No se pudo verificar si tiene citas asociadas.
              </p>
            )}

            {citasQuery.status === 'success' && cantidadCitas > 0 && (
              <div className="flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  Este servicio tiene {cantidadCitas} cita(s) registrada(s). ¿Eliminarlo de todas
                  formas?
                </span>
              </div>
            )}

            <p className="text-sm text-slate-600">
              ¿Eliminar <strong>{aEliminar.nombre}</strong>? Esta acción no se puede deshacer.
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
                disabled={mutEliminar.isPending || citasQuery.status === 'pending'}
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

export default ServiciosAdmin;
