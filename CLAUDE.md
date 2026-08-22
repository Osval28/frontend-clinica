# ProyectoX — Clínica odontológica "Oral Rayos X"

Aplicación de gestión para una clínica odontológica, con destino a venta a un cliente real. Backend en Node.js + Express + MongoDB (arquitectura por capas `routes → controllers → services`); frontend en React (Vite), en un repositorio separado. Prioridad del proyecto: MVP funcional en producción, no perfección arquitectónica.

Referencia de diseño para el sitio público: [odontoss.com](https://www.odontoss.com).

## Stack técnico

**Backend**: Node.js, Express, MongoDB (Mongoose), autenticación JWT.

**Frontend**: Vite, React Router, Tailwind v4, TanStack Query v5, `lucide-react` para íconos. Fetch nativo centralizado en `src/api/client.js` (soporta modo autenticado). Lectura de datos remotos con `useQuery`; escritura con `useMutation` + `queryClient.invalidateQueries`.

Entornos de desarrollo: frontend en `localhost:5173`, backend en `localhost:3000`. Para desarrollar hace falta tener ambos corriendo — la base de datos está en la nube y siempre disponible si el backend está bien configurado.

## Contrato de la API

Respuesta uniforme en todos los endpoints: `{ ok, mensaje, ...datos }`. Autenticación vía header personalizado `x-token` (no `Authorization: Bearer`).

Recursos: citas, odontólogos, servicios, pacientes, especialidades, auth. Existe además un modelo `Clinica.js` sin rutas montadas todavía — candidato para hacer dinámico el contenido de "Sobre nosotros"/"Contáctanos" del sitio público.

### Endpoints relevantes

- `GET /api/servicios` y `GET /api/servicios/:id` — públicas. No filtran por `activo`.
- `GET /api/odontologos` — pública. Cada odontólogo trae `especialidad` populada y `horario: [{ dia, horaInicio, horaFin }]`. Los nombres de día llevan tilde salvo `"Sabado"` (sin tilde) — es el string exacto que exige el modelo, cualquier integración nueva debe respetarlo tal cual.
- `POST /api/auth/login` — `{ correo, password }` → `{ ok, mensaje, administrador, token }` o 401.
- `POST /api/auth/register` — se autobloquea si ya existe al menos un administrador (devuelve "El registro de administradores está deshabilitado."). Para crear el primer admin en un entorno nuevo:
  ```
  curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" \
    -d '{"nombre":"...","correo":"...","password":"..."}'
  ```
- `GET /api/citas/fecha/:fecha` (protegida) — compara `Date` por igualdad exacta; **pendiente de validar con datos reales** que esto no falle según cómo se guarde la hora.
- `GET /api/citas/odontologo/:id` (protegida) — citas de un odontólogo, con paciente y servicio populados. No usar como fuente de disponibilidad pública: expone datos personales de pacientes.
- `GET /api/citas` (protegida) — todas las citas, sin filtro.
- `GET /api/citas/disponibilidad/:odontologoId/:fecha` (pública) — devuelve `{ ok, mensaje, horasOcupadas: ["09:00", ...] }`. A propósito no usa `populate` ni expone documentos de citas o pacientes; es la fuente de disponibilidad que consume la pantalla pública de agendamiento.
- `POST /api/citas/solicitar` (pública) — recibe `{ nombre, apellido, documento, telefono, correo, odontologo, servicio, fecha, hora, observaciones }`. Busca al paciente por `documento`; si ya existe, lo reutiliza tal cual estaba guardado (no actualiza sus datos con lo que venga en la nueva solicitud). Devuelve `{ ok, mensaje, cita }` con `cita` ya populada. Errores de negocio (odontólogo u horario no disponible, etc.) vienen en `mensaje` con status 400.

### Modelos

- `Paciente`: nombre, apellido, documento (único), telefono, correo, fechaNacimiento?, direccion?, activo.
- `Odontologo`: nombre, apellido, especialidad (ref), telefono, correo (único), registroProfesional (único), horario[], activo.
- `Servicio`: nombre, descripcion, precio, duracion, activo. **No tiene campo `imagen`** — el frontend público usa una imagen por defecto para todos los servicios.
- `Especialidad`: nombre (único), descripcion, activo.
- `Cita`: paciente (ref), odontologo (ref), servicio (ref), fecha, hora, estado (enum: Pendiente/Confirmada/Cancelada/Finalizada, default Pendiente), observaciones.

El campo `activo` existe en Paciente/Odontologo/Servicio/Especialidad pero hoy no lo filtra ninguna pantalla (ni pública ni admin) — no tiene efecto observable todavía.

## Pendientes y problemas conocidos del backend

- **Seguridad**: `POST/PUT/DELETE` de `/servicios`, `/odontologos` y `/especialidades` no están protegidas con el middleware `validarJWT` — cualquiera puede crear, editar o borrar esos recursos sin loguearse. El frontend ya manda `x-token` en esas llamadas para que la protección funcione apenas se agregue del lado del backend.
- `GET /api/citas/fecha/:fecha` compara fechas por igualdad exacta — riesgo de fallar según cómo se persista la hora. No probado todavía contra datos reales.
- No hay endpoint de citas filtrado por servicio (el panel admin filtra client-side trayendo todas las citas). Candidato a `GET /citas/servicio/:id` a futuro, mismo criterio que se usó para el endpoint de disponibilidad.
- `GET /api/servicios` no filtra por `activo` — a coordinar si en algún momento se empieza a usar ese campo.
- Evaluar si conviene agregar un campo `imagen` a `Servicio`.

## Frontend — estructura y decisiones

```
src/
  api/            → client.js, auth.js, citas.js, odontologos.js, servicios.js, especialidades.js
  components/
    public/       → TopBar, Navbar, Hero, Bienvenida, Servicios, Novedades, Contacto, Footer
    admin/        → Sidebar.jsx, AdminLayout.jsx, ModalFormulario.jsx (chrome de modal compartido por los 3 CRUD)
  context/        → AuthContext.jsx
  data/           → clinica.js (contenido estático del sitio, todavía placeholder), diasSemana.js (fuente única de los 7 nombres de día que exige el backend)
  pages/
    admin/        → Login.jsx, Citas.jsx, ServiciosAdmin.jsx, OdontologosAdmin.jsx, EspecialidadesAdmin.jsx
    public/       → Home.jsx, FlujoAgendamiento.jsx (padre del flujo de agendamiento)
      agendar/    → ServicioDetalle.jsx, DatosPaciente.jsx, Confirmacion.jsx
  routes/         → ProtectedRoute.jsx
```

**Estado**: sesión de admin (token + datos) en Context + localStorage. Datos remotos con TanStack Query. El flujo público de agendamiento eleva su estado en `FlujoAgendamiento.jsx` y lo expone a las rutas hijas vía `Outlet context` — se pierde si se recarga a mitad del flujo (aceptado para el MVP).

**Panel admin** (`/admin/*`): CRUD completo para especialidades, odontólogos y servicios, además de la vista de citas (filtro por fecha). Patrón común: tabla + modal de creación/edición, validación en cliente antes de llamar al backend, y al eliminar un recurso con datos asociados (por ejemplo un odontólogo con citas, o una especialidad en uso) se advierte la cantidad pero no se bloquea la acción.

**Editor de horario de odontólogos**: 7 filas fijas (Lunes a Domingo), cada una con checkbox + hora de inicio/fin. Solo admite una franja por día (no separa mañana/tarde). Al guardar solo se envían los días activados, con el string de día canónico.

**Íconos**: se usan componentes de `lucide-react` en vez de emojis. Los archivos de `src/data/` no importan nada de UI — el mapeo de ícono vive en el componente que consume esos datos.

## Estado actual del proyecto

- Sitio público (landing + flujo de agendamiento) completo y verificado.
- Panel admin: gestión de citas, especialidades, odontólogos y servicios completa, verificada contra mocks. Falta probarla contra el backend real.
- Contenido del sitio público (`src/data/clinica.js`) sigue siendo texto de relleno, pendiente de reemplazar por la información real de la clínica.
- Repositorio del frontend con control de versiones en GitHub.
