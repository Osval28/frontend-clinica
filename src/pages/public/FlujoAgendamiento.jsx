import { useState } from 'react';
import { Outlet } from 'react-router-dom';

// Estado elevado de todo el flujo de agendamiento (servicio, odontólogo,
// fecha, hora, datos del paciente). Vive aquí porque las rutas hijas
// (/agendar/servicio/:id -> /agendar/datos -> /agendar/confirmacion)
// lo necesitan sin repetirlo en la URL. Se comparte hacia abajo con
// <Outlet context={...} /> y cada hija lo lee con useOutletContext().
//
// Decisión ya aceptada para el MVP: si se recarga la página a mitad del
// flujo, este estado se pierde (no hay persistencia en localStorage ni URL).
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
    cita: null,
  });

  const actualizarAgendamiento = (cambios) => {
    setAgendamiento((prev) => ({ ...prev, ...cambios }));
  };

  return <Outlet context={{ agendamiento, actualizarAgendamiento }} />;
}

export default FlujoAgendamiento;
