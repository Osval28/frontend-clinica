import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

// Estado elevado de todo el flujo de agendamiento (servicio, odontólogo,
// fecha, hora, datos del paciente). Vive aquí porque las rutas hijas
// (/agendar/servicio/:id -> /agendar/datos -> /agendar/confirmacion)
// lo necesitan sin repetirlo en la URL. Se comparte hacia abajo con
// <Outlet context={...} /> y cada hija lo lee con useOutletContext().
//
// Decisión ya aceptada para el MVP: si se recarga la página a mitad del
// flujo, este estado se pierde (no hay persistencia en localStorage ni URL).
//
// `datosPaciente` guarda lo que se va escribiendo en /agendar/datos, para
// que volver a cambiar la fecha/hora no obligue a escribir todo de nuevo.
//
// `cita` se llena recién cuando POST /citas/solicitar responde con éxito
// (ver DatosPaciente.jsx), con el documento completo que devuelve el
// backend (paciente/odontologo/servicio ya populados). Es la fuente de
// verdad para /agendar/confirmacion: si no hay `cita`, no hay nada
// confirmado y esa ruta no debe mostrar nada.
function FlujoAgendamiento() {
  const [agendamiento, setAgendamiento] = useState({
    servicio: null,
    odontologo: null,
    fecha: null,
    hora: null,
    datosPaciente: null,
    cita: null,
  });

  // Acepta un objeto o una función (prev) => cambios, para actualizaciones
  // que dependen del estado anterior (p. ej. autocompletado del navegador
  // llenando varios campos del formulario casi a la vez).
  const actualizarAgendamiento = (cambios) => {
    setAgendamiento((prev) => ({
      ...prev,
      ...(typeof cambios === 'function' ? cambios(prev) : cambios),
    }));
  };

  // BrowserRouter no resetea el scroll al cambiar de ruta: sin esto, cada
  // paso abriría a la altura donde el paciente hizo click en el anterior.
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return <Outlet context={{ agendamiento, actualizarAgendamiento }} />;
}

export default FlujoAgendamiento;
