# Contexto del frontend — ProyectoX (clínica odontológica)

Fuente: `ProyectoXContext.txt` + `ContextProyectoX.jpeg` (diagrama de flujo del sistema), cargados desde el escritorio de Osval el 2026-08-17. Actualizado 2026-08-21 tras terminar el flujo público de agendamiento y, más tarde ese mismo día, tras la sesión del CRUD admin completo (ver "Decisiones tomadas de forma autónoma" más abajo).

## Contexto general
Aplicación de gestión para clínica odontológica, destinada a venta a un cliente real. El backend ya fue construido por un compañero (Node.js + Express + MongoDB, arquitectura por capas routes → controllers → services, no hexagonal). Osval es responsable exclusivamente del frontend, y React es tecnología nueva para él. Prioridad: MVP funcional en producción, no perfección arquitectónica.

**Nombre de la clínica (working name): "Oral Rayos X"**. Referencia de diseño aprobada: https://www.odontoss.com.

## Convenciones del backend a respetar
- Autenticación JWT vía header personalizado `x-token`. Contrato uniforme `{ ok, mensaje, ...datos }`.
- Recursos: citas, odontólogos, servicios, pacientes, especialidades, auth. Existe un modelo `Clinica.js` sin rutas montadas — candidato a futuro para hacer dinámico "Sobre nosotros"/"Contáctanos".
- Rutas protegidas con `validarJWT`: pacientes, casi todas las de citas, auth de admin. **`POST/PUT/DELETE` de servicios, odontólogos y especialidades NO están protegidas** (encontrado 2026-08-21 al leer el backend completo desde GitHub) — cualquiera puede crear/editar/borrar esos recursos sin loguearse. Registrado como pendiente urgente de avisarle al compañero (ver sección de sesión nocturna). Mientras tanto el frontend manda `x-token` en esas llamadas de todas formas, para que la protección funcione sola en cuanto se agregue.
- `GET /api/servicios` y `GET /api/servicios/:id`: públicas, `{ ok, mensaje, servicios|servicio }`, sin filtrar `activo`.
- `GET /api/odontologos`: pública, `{ ok, mensaje, odontologos }`, cada uno con `especialidad` populada y `horario: [{dia, horaInicio, horaFin}]` (días con tilde salvo "Sabado").
- `POST /api/auth/login`: `{ correo, password }` → `{ ok, mensaje, administrador, token }` o 401.
- `GET /api/citas/fecha/:fecha` (protegida): **fragilidad sin resolver** — compara `Date` por igualdad exacta, podría fallar según cómo se guarde la hora. Pendiente probar con datos reales.
- `GET /api/citas/odontologo/:id` (protegida): citas de un odontólogo, con paciente/servicio populados. No confundir con el endpoint público de disponibilidad (abajo).
- `GET /api/citas` (protegida): todas las citas, sin filtro.
- **`POST /api/citas/solicitar`** (pública) — implementado en el frontend (`DatosPaciente.jsx`). Recibe `{ nombre, apellido, documento, telefono, correo, odontologo, servicio, fecha, hora, observaciones }`. El backend busca al paciente por `documento`; **si ya existe, lo reutiliza tal cual estaba guardado** — no actualiza nombre/teléfono/correo con lo que se mande en una nueva solicitud. Devuelve `{ ok, mensaje, cita }` con `cita` ya populada (paciente/odontologo con especialidad/servicio). Errores de negocio (odontólogo u horario no disponible, etc.) vienen en `mensaje` con status 400.
- **`POST /api/auth/register`** (modificado por Osval): se autobloquea si ya existe ≥1 administrador. Comando para crear el primero:
  ```
  curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" \
    -d '{"nombre":"Osval","correo":"TU_CORREO","password":"TU_PASSWORD"}'
  ```
  Osval ya intentó esto y le salió "El registro de administradores está deshabilitado" — indica que ya existe un admin en la DB compartida (probablemente creado por el compañero); intentar login con esas credenciales antes de re-registrar.
- **`GET /api/citas/disponibilidad/:odontologoId/:fecha`** (nueva, agregada por Osval 2026-08-17, pública): devuelve `{ ok, mensaje, horasOcupadas: ["09:00", ...] }` — **a propósito NO usa populate ni expone documentos de citas/pacientes**, solo el arreglo de horas. Se creó específicamente para reemplazar el uso indebido de `GET /api/citas/odontologo/:id` (que si se hiciera pública expondría nombre, documento, teléfono, correo y dirección de todos los pacientes del odontólogo) en la pantalla pública de agendamiento.
- Modelos completos leídos del repo (2026-08-21): `Paciente` (nombre, apellido, documento único, telefono, correo, fechaNacimiento?, direccion?, activo), `Odontologo` (nombre, apellido, especialidad ref, telefono, correo único, registroProfesional único, horario[], activo), `Servicio` (nombre, descripcion, precio, duracion, activo — **sin campo `imagen`**, a pesar de que el frontend ya lo usa con un fallback), `Especialidad` (nombre único, descripcion, activo), `Cita` (paciente ref, odontologo ref, servicio ref, fecha, hora, estado enum [Pendiente, Confirmada, Cancelada, Finalizada] default Pendiente, observaciones). `activo` existe en Paciente/Odontologo/Servicio/Especialidad pero **hoy no lo filtra ninguna pantalla, pública ni admin** — es un campo sin efecto observable todavía.
- Para desarrollar, backend Y frontend deben estar corriendo. DB en la nube, siempre disponible si el backend está bien configurado.
- Cambios de Osval al backend compartido pendientes de avisarle al compañero: bloqueo de `/register`, nuevo endpoint de disponibilidad, y (nuevo) las rutas de escritura de servicios/odontólogos/especialidades sin `validarJWT`.

## Stack técnico
Vite, React Router, Tailwind v4, TanStack Query v5, `lucide-react` (agregado 2026-08-21 para reemplazar todos los emojis usados como íconos de UI — ya en `package.json`, correr `npm install` antes de arrancar si `node_modules` no lo tiene todavía). **Linter: ESLint, ya instalado y configurado** (`eslint.config.js` con `eslint-plugin-react-hooks` y `eslint-plugin-react-refresh`, scaffold de Vite — `npm run lint` ya funciona, no hace falta configurarlo de nuevo). Frontend `localhost:5173`, backend `localhost:3000` (repo separado, no está en este directorio). Fetch nativo en `src/api/client.js` (soporta `withAuth`). Lectura de datos remotos: `useQuery`. Escritura: hasta ahora `useState` a mano (`Login.jsx`, `DatosPaciente.jsx`); para el CRUD admin se decidió usar `useMutation` + `queryClient.invalidateQueries` (ver sesión nocturna).

## Errores ya resueltos (no repetir)
`tailwindcss is not defined` (import mal hecho), `class` vs `className`, `ERR_CONNECTION_REFUSED` (backend apagado), confusión de routing SPA (rutas se escriben a mano en el navegador), sidebar admin no responsive en su primera versión (corregido con patrón hamburguesa+overlay).

## Estructura de carpetas
```
src/
  api/            → client.js, auth.js, servicios.js (+crearServicio/actualizarServicio/eliminarServicio), citas.js (+obtenerHorasOcupadas, +solicitarCita, +obtenerCitasOdontologo, +obtenerCitas), odontologos.js (+crearOdontologo/actualizarOdontologo/eliminarOdontologo), especialidades.js (CRUD completo)
  components/
    public/       → TopBar, Navbar, Hero, Bienvenida (+ICONOS_DIFERENCIALES), Servicios, Novedades, Contacto, Footer
    admin/        → Sidebar.jsx, AdminLayout.jsx, ModalFormulario.jsx (chrome compartido por los 3 CRUD, prop `ancho` opcional)
  context/        → AuthContext.jsx
  data/           → clinica.js, diasSemana.js (DIAS_SEMANA/DIAS_EDITOR — fuente única para admin y flujo público; solo datos, sin imports de UI, a propósito)
  pages/
    admin/        → Login.jsx, Citas.jsx, ServiciosAdmin.jsx / OdontologosAdmin.jsx / EspecialidadesAdmin.jsx (CRUD completo, 2026-08-21)
    public/       → Home.jsx, FlujoAgendamiento.jsx (padre con estado elevado + Outlet)
      agendar/    → ServicioDetalle.jsx, DatosPaciente.jsx, Confirmacion.jsx — los 3 implementados y verificados
  routes/         → ProtectedRoute.jsx
  App.jsx         → "/", "/agendar" (padre) con hijas servicio/:id, datos, confirmacion; "/admin/login"; "/admin" (protegida) con hijas citas, servicios, odontologos, especialidades
  main.jsx        → QueryClientProvider + BrowserRouter + AuthProvider
media/            → imágenes, importadas con rutas relativas
```

## Decisiones de estado y arquitectura frontend
- Estado global (Context): token admin + administrador, en localStorage.
- Estado de datos remotos: TanStack Query (`status`: pending/error/success).
- **Estado elevado del flujo de agendamiento**: vive en `FlujoAgendamiento.jsx` (componente padre de la ruta `/agendar`), expuesto a las rutas hijas vía `<Outlet context={{ agendamiento, actualizarAgendamiento }} />` y leído con `useOutletContext()`. Guarda `{ servicio, odontologo, fecha, hora, cita }` — `cita` se llena recién cuando `POST /citas/solicitar` responde con éxito, y es la fuente de verdad para `/agendar/confirmacion` (decisión de Osval 2026-08-21: no reconstruir el resumen desde datos locales, usar la respuesta real del backend). Recargar a mitad del flujo pierde el estado (aceptado para MVP).
- Íconos de UI: se usaba emojis como string directamente en los datos/JSX; se reemplazaron todos por `lucide-react`. Regla acordada con Osval: **los archivos de datos puros (`clinica.js`) no importan nada de UI** — el mapeo id→ícono vive en el componente que consume esos datos (ej. `ICONOS_DIFERENCIALES` en `Bienvenida.jsx`, con una entrada `default` de fallback para que un dato nuevo sin ícono mapeado no rompa ni quede vacío).
- "Historial de búsqueda" admin: descartado del MVP.

## Login admin
`useState` por campo, validación solo backend, "Redirect + ProtectedRoute". Navega a `/admin/citas` tras login exitoso (**bug corregido 2026-08-21**: antes navegaba a `/admin/dashboard`, ruta inexistente en `App.jsx`).

## Home (`/`)
Landing de una sola página estilo odontoss.com, paleta teal: TopBar, Navbar, Hero, Bienvenida, Servicios (tarjetas sin precio, `<Link>` a `/agendar/servicio/:id`), Novedades, Contacto, Footer. Contenido estático en `src/data/clinica.js` (**sigue siendo placeholder** — Osval no tiene la info real todavía, no es tarea de la sesión nocturna). Verificado con build + capturas.

## Panel administrativo (`/admin/*`)
Sidebar fijo en desktop / hamburguesa+overlay en móvil. Alcance decidido: citas + servicios + odontólogos + especialidades (todos los recursos). `/admin/citas` implementado (filtro por fecha, tabla paciente/teléfono/correo/hora/servicio/precio/estado). **Servicios/Odontólogos/Especialidades: CRUD completo (2026-08-21, sesión nocturna) — tabla + modal crear/editar con validación cliente + `useMutation`/`invalidateQueries` + eliminar con advertencia (no bloqueo) si hay recursos asociados. Verificado con Playwright contra mocks, ver especificación completa y "Decisiones tomadas de forma autónoma" más abajo. Pendiente probar contra el backend real.**

## Flujo de agendamiento público — `/agendar/*` — COMPLETO (2026-08-21)
- **`FlujoAgendamiento.jsx`** (ruta padre `/agendar`): solo contiene el estado elevado y el `<Outlet />`, sin UI propia.
- **`/agendar/servicio/:id` (`ServicioDetalle.jsx`)**: muestra imagen/nombre/descripción/precio/duración del servicio (`GET /api/servicios/:id`). Selector de fecha + horas disponibles: odontólogo se asigna automáticamente (el primer `activo` de `GET /api/odontologos` — clínica tiene uno solo por ahora); al elegir fecha se calcula el día de la semana en español y se busca en `odontologo.horario`; si hay horario ese día, se piden horas ocupadas (`GET /api/citas/disponibilidad/:odontologoId/:fecha`) y se generan franjas cada 30 min (`generarSlots`, paso fijo — el backend detecta choques por igualdad exacta de `hora`, no por solapamiento). Al continuar, escribe `{servicio, odontologo, fecha, hora}` en el estado elevado y navega a `/agendar/datos`.
- **`/agendar/datos` (`DatosPaciente.jsx`)**: formulario con `nombre, apellido, documento, telefono, correo, observaciones` (opcional). **Validación cliente + backend** (decisión de Osval, distinta de la del login admin que es solo-backend): bloquea el submit si faltan campos requeridos o el correo tiene formato inválido, y muestra el error del backend tal cual si algo se escapa (ej. el horario se ocupó entre que se eligió y se envió). Al tener éxito llama `solicitarCita`, guarda la `cita` devuelta en el estado elevado y navega a `/agendar/confirmacion`. Guard: sin `agendamiento.servicio`, redirige al Home.
- **`/agendar/confirmacion` (`Confirmacion.jsx`)**: guard endurecido — exige `agendamiento.cita` (no solo un servicio elegido); sin eso, redirige al Home. Muestra servicio, odontólogo, fecha (formateada en español), hora y estado, todo desde la `cita` que devolvió el backend.
- Verificado con `vite build` + Playwright (mocks de servicio/odontólogo/horas ocupadas/solicitar): validación de campos vacíos, formato de correo inválido, payload correcto enviado al backend, navegación a confirmación, y el guard de `/agendar/confirmacion` redirigiendo al Home si se entra directo sin cita. (Los scripts de Playwright usados eran archivos sueltos, no quedaron en este repo — recrear el patrón siguiendo la descripción de arriba si hace falta volver a probar esta parte.)

## Especificación para sesión nocturna sin supervisión — CRUD admin (2026-08-21)

Contexto: Osval le va a dejar esto trabajando a Claude Code toda la noche sin él presente, para revisar y ajustar mañana. Todo lo de esta sección ya fue decidido por Osval hoy — **no volver a preguntarlo**. Si algo no está cubierto acá, ver "Modo de autonomía" al final de esta sección.

**Objetivo de la noche**: los 3 CRUD del panel admin (Especialidades, Odontólogos, Servicios) funcionando de punta a punta contra mocks, más un par de fixes menores.

**Antes de empezar**: correr `npm install` (para que `lucide-react` quede en `node_modules`) y `git status` para confirmar que este archivo y el código de hoy ya están en el working tree. Comitear con `git commit` después de terminar cada pantalla (ver "control de versiones" abajo) para que la revisión de mañana sea con diffs, no archivos completos.

**Orden de construcción sugerido** (por dependencias): Especialidades (sin dependencias) → Odontólogos (necesita el selector de especialidad ya construido) → Servicios (independiente, puede ir al final).

### Patrón de UI común a los 3 CRUD
- Tabla con el mismo lenguaje visual que `Citas.jsx` (misma cabecera `bg-slate-50 text-xs uppercase`, mismo `divide-y divide-slate-100`) para el listado.
- Botón "Nuevo <recurso>" junto al título, arriba a la derecha.
- Crear/editar: **modal** flotante sobre la lista (decidido — no ruta aparte). Overlay oscuro (`bg-black/40`, mismo lenguaje que el overlay del sidebar admin en móvil) + tarjeta blanca centrada. Sugerido: un componente de modal compartido (ej. `ModalFormulario.jsx`) reutilizado por los 3 CRUD para no triplicar el chrome (overlay, cierre con click afuera/Escape) — decisión de implementación, no requiere validar con Osval.
- Validación de formularios: mismo patrón que `DatosPaciente.jsx` — cliente bloquea el submit con campos requeridos/formato antes de llamar al backend; error de backend (si lo hay, ej. duplicados en campos únicos) se muestra en un banner rojo arriba del formulario.
- Escritura (crear/editar/eliminar): usar `useMutation` de TanStack Query + `queryClient.invalidateQueries` para refrescar la tabla después de cada operación (más idiomático que repetir `useState` a mano en 3 pantallas — decisión de implementación).
- **Todas** las llamadas de escritura (POST/PUT/DELETE) de estos 3 recursos deben mandar `x-token` (`withAuth: true` en `client.js`) aunque el backend hoy no lo exija (ver "Seguridad" abajo).
- Campo `activo` (existe en los 3 modelos): **no se expone en los formularios de esta noche** — no tiene ningún efecto visible hoy en ninguna pantalla, así que construirle UI sería trabajo sin efecto observable. Si mañana Osval decide usarlo, se agrega después.

### Especialidades (`/admin/especialidades`, `EspecialidadesAdmin.jsx`)
- Campos: `nombre` (texto, requerido — el backend lo exige único, mostrar el error del backend tal cual si falla por duplicado), `descripcion` (texto, requerido).
- API nueva: `src/api/especialidades.js` con `obtenerEspecialidades`, `crearEspecialidad`, `actualizarEspecialidad`, `eliminarEspecialidad` contra `/especialidades` (escritura con `withAuth: true`).
- Eliminar: las citas no referencian especialidad directamente, así que no aplica un chequeo de citas. Si algún odontólogo tiene esa especialidad, se rompería su populate al borrarla — advertir usando los datos ya cargados de `GET /odontologos` (sin llamada extra) si hay al menos un odontólogo con esa especialidad, mismo criterio de "advertir y permitir seguir" que en los otros dos recursos.

### Odontólogos (`/admin/odontologos`, `OdontologosAdmin.jsx`)
- Campos: `nombre`, `apellido`, `especialidad` (select poblado con `GET /especialidades`; si viene vacío porque todavía no hay ninguna especialidad, mostrar "Creá primero una especialidad" en vez de un select vacío), `telefono`, `correo` (formato de correo + único en backend), `registroProfesional` (texto, requerido, único en backend), `horario`.
- **Editor de horario** (decidido: 7 filas fijas, no lista dinámica): Lunes a Domingo siempre visibles, cada fila con un checkbox "Atiende este día" + `horaInicio`/`horaFin` habilitados solo si el checkbox está activo. Al enviar, se arma el array `horario` solo con los días activados. Validar `horaInicio < horaFin` en cada fila activa. Limitación conocida y aceptada: una sola franja por día (no permite partir mañana/tarde).
- API: extender `src/api/odontologos.js` con `crearOdontologo`, `actualizarOdontologo`, `eliminarOdontologo` (`withAuth: true`).
- Eliminar: chequear citas asociadas con `GET /citas/odontologo/:id` (protegida, ya existe en el backend — agregar el wrapper `obtenerCitasOdontologo` en `src/api/citas.js`). Si hay citas, **advertir con la cantidad y permitir seguir** (decidido — no bloquear): "Este odontólogo tiene N citas registradas. ¿Eliminarlo de todas formas?".

### Servicios (`/admin/servicios`, `ServiciosAdmin.jsx`)
- Campos: `nombre`, `descripcion`, `precio` (numérico, requerido, ≥0), `duracion` (numérico, requerido, minutos). **Sin campo `imagen`** (decidido: se deja fuera por ahora — el backend no lo soporta y no se toca esta noche; el sitio público sigue usando la imagen por defecto).
- API: extender `src/api/servicios.js` con `crearServicio`, `actualizarServicio`, `eliminarServicio` (`withAuth: true`).
- Eliminar: no existe un endpoint filtrado por servicio en el backend. Usar `GET /citas` (protegida, todas — agregar wrapper `obtenerCitas` en `src/api/citas.js`) y filtrar client-side por `cita.servicio._id === id`. Aceptable para el volumen de una sola clínica en MVP; queda anotado como candidato a un endpoint dedicado (`GET /citas/servicio/:id`) más adelante, mismo criterio que se usó para crear el endpoint de disponibilidad. Igual que en Odontólogos: **advertir con la cantidad y permitir seguir**, no bloquear.

### Seguridad — pendiente urgente (decidido: registrar y avisar)
`POST/PUT/DELETE` de `/servicios`, `/odontologos` y `/especialidades` no tienen `validarJWT`. Tratamiento igual que los cambios anteriores de Osval al backend compartido: queda registrado acá como pendiente urgente de avisarle al compañero, **no se toca el backend compartido esta noche**. El frontend ya manda el token en esas llamadas para que la protección funcione sola en cuanto se agregue.

### Fixes menores incluidos en el alcance de esta noche
- Corregir el bug de `Login.jsx` → navegar a `/admin/citas` (o `/admin`, que redirige igual) en vez de `/admin/dashboard`.
- Borrar `src/pages/admin/Dashboard.jsx` (obsoleto, ninguna ruta lo usa).

### Control de versiones (decidido 2026-08-21: sí, con git, con remoto en GitHub)
**Primer paso literal de esta sesión, antes de tocar cualquier código**: correr `git status` y `git remote -v`. Osval iba a dejar el repo ya inicializado (`git init`, primer commit, `origin` apuntando a su GitHub) él mismo desde su propia terminal antes de arrancar esta sesión — si eso ya está hecho, seguir con normalidad. Si por algo no llegó a hacerlo o algo quedó a medias (ej. quedó un `.git/index.lock` viejo de un intento anterior), arreglarlo antes de seguir: borrar el lock (o si el repo está en mal estado, borrar toda la carpeta `.git` y correr `git init` de nuevo), configurar `git config user.name`/`user.email` si hace falta, y hacer un primer commit ("chore: estado inicial antes del CRUD admin") con el código ya aplicado.

**Comitear después de terminar cada pantalla** (ej. "feat: CRUD especialidades", "feat: CRUD odontólogos", "feat: CRUD servicios", "fix: redirect de login", "chore: borrar Dashboard.jsx obsoleto"). Si `git remote -v` muestra un `origin` configurado, hacer `git push` después de cada commit — si el push falla (ej. pide credenciales que no están cacheadas y nadie va a estar para autorizar un login interactivo a mitad de la noche), no insistir ni bloquearse: seguir trabajando con los commits locales nomás, y anotarlo en "Decisiones tomadas de forma autónoma" para que Osval haga el push él mismo mañana. Si no hay `origin` configurado, los commits locales alcanzan igual para la revisión de mañana.

### Verificación (decidido: sin backend real esta noche)
Nadie va a dejar `localhost:3000` corriendo toda la noche, así que ninguna llamada real va a funcionar. Toda verificación es `vite build` (siempre, tras cada pantalla) + Playwright con `page.route(...)` mockeando las respuestas del backend — mismo patrón descrito arriba para `ServicioDetalle → DatosPaciente → Confirmacion`. Mockear los 3 CRUD completos (listar, crear, editar, eliminar con y sin citas asociadas) y confirmar con capturas que la UI se comporta como se espera. No hay forma de probar contra datos reales hasta que Osval revise mañana con el backend prendido.

### Modo de autonomía para lo no cubierto acá (decidido: decidir y documentar)
Ante cualquier decisión de diseño o implementación que este documento no cubra, tomar la opción más conservadora y más consistente con los patrones ya construidos (estilo visual teal/`rounded-2xl`, patrón de tabla de `Citas.jsx`, patrón de validación de `DatosPaciente.jsx`, mismo trato de "avisar y no tocar" para huecos del backend compartido), seguir avanzando, y anotar la decisión y su razón en la sección "Decisiones tomadas de forma autónoma" más abajo (crearla si hace falta). No detenerse a esperar respuesta — no hay nadie para responder durante la noche.

### Decisiones tomadas de forma autónoma (noche del 2026-08-21)
- **Estado roto de git al empezar**: quedaba un `.git/index.lock` viejo (de un intento anterior cortado a medias) bloqueando cualquier commit, y el `origin` estaba configurado con la URL literal `TU_URL_AQUI` en vez del repo real. Verifiqué que no hubiera ningún proceso de git corriendo, borré el lock, corregí el `origin` a `https://github.com/Osval28/frontend-clinica.git`, hice el commit inicial y pusheé — funcionó sin pedir login interactivo en ningún momento de la noche, así que **todos los commits de esta sesión ya están en GitHub**, no hace falta que Osval haga push él mismo.
- **`src/data/diasSemana.js` (nuevo)**: los 7 strings de día que exige el backend (`Odontologo.horario.dia`, incluida la falta de tilde en "Sabado") vivían hardcodeados solo en `ServicioDetalle.jsx`. Los extraje a un archivo de datos puro compartido (`DIAS_SEMANA` indexado como `Date.getDay()`, `DIAS_EDITOR` reordenado Lunes→Domingo) para que el editor de horario del admin y la pantalla pública de agendamiento no puedan divergir en el string exacto de cada día. `ServicioDetalle.jsx` ahora importa desde ahí (diff de 2 líneas); re-verifiqué su flujo completo con Playwright después del cambio, sigue intacto.
- **Editor de horario de Odontólogos — matching por normalización de acentos**: al precargar el horario de un odontólogo para editar, comparo los 7 días de la plantilla contra `horario[].dia` normalizando acentos/mayúsculas (`normalize('NFD')` + lowercase) en vez de `===` estricto, para no perder silenciosamente un día si la DB tiene una tilde distinta a la canónica (ej. "Sábado" en vez de "Sabado"). Al guardar, siempre se reescribe el string canónico. Verificado con un caso de prueba que mezcla ambos.
- **Odontólogos — al menos 1 día de horario activo para poder guardar**: la spec no lo pedía explícitamente, pero un odontólogo con horario vacío nunca podría recibir una cita (`ServicioDetalle.jsx` nunca encontraría `horarioDelDia`), así que el formulario bloquea el submit si no hay ningún día activado.
- **Servicios — `duracion` debe ser entero y mayor a 0** (la spec decía "requerido, ≥0"): un servicio de 0 minutos nunca genera slots en `generarSlots` de `ServicioDetalle.jsx`, así que 0 se trata como inválido en el formulario aunque el backend podría aceptarlo.
- **`ModalFormulario.jsx` — prop `ancho` opcional** (default `'max-w-lg'`, sin cambiar el comportamiento existente): el editor de horario de Odontólogos necesita más espacio, así que ese modal en particular usa `ancho="max-w-2xl"`; Especialidades y Servicios siguen con el ancho default.
- **Chequeos de citas asociadas al eliminar (Odontólogos y Servicios) son perezosos, no precargados**: se disparan recién al abrir el modal de confirmación (`useQuery({ enabled: Boolean(aEliminar) })`), no junto con el listado — evita una llamada de red innecesaria en cada visita a la pantalla. Si el chequeo falla (ej. token vencido), se muestra una nota neutra pero **el botón de eliminar sigue habilitado** — consistente con "eliminar nunca bloquea, solo advierte".
- **Bug encontrado y corregido: el banner de error de `useMutation` quedaba pegado entre aperturas del modal.** `useMutation` no limpia su `error` solo porque el modal se cerró, así que un intento fallido (ej. correo duplicado) seguía mostrando el mismo banner rojo la próxima vez que se abría el modal para crear o editar, aunque no tuviera nada que ver. Se agregó `mutCrear.reset()` / `mutActualizar.reset()` al abrir el modal en los 3 CRUD. Encontrado durante la verificación con Playwright de Odontólogos (una captura mostraba el error de un test anterior en la pantalla de edición); como `EspecialidadesAdmin.jsx` ya estaba comiteado y pusheado con el mismo bug, se corrigió con un commit nuevo (`fix: resetear error de mutacion al reabrir el modal de especialidades`) en vez de amend, para no reescribir historial ya en GitHub.

### Qué debe quedar listo para la revisión de mañana
- Los 3 CRUD funcionando de punta a punta contra mocks (verificado con Playwright + capturas).
- `vite build` limpio.
- `npm run lint` corriendo (ya configurado, solo hay que dejarlo sin errores nuevos introducidos esta noche).
- Los 2 fixes menores aplicados.
- Un commit de git por pantalla/fix terminado.
- La sección "Decisiones tomadas de forma autónoma" (crearla si hace falta) con cada decisión no cubierta acá que se haya tenido que tomar sola, para que Osval la revise en minutos en vez de releer todo el código.

## Pendiente de resolver (abierto)
- Probar los 3 CRUD nuevos (Especialidades/Odontólogos/Servicios) y `/admin/citas` con el backend real prendido — toda la verificación de esta noche fue contra mocks, ver "Decisiones tomadas de forma autónoma" arriba.
- Probar `/admin/citas` y el endpoint de disponibilidad con datos reales (ver fragilidad de fechas arriba) — requiere backend real, no es tarea nocturna.
- Avisarle al compañero de los cambios pendientes en su backend: bloqueo de `/register`, endpoint de disponibilidad nuevo, y las rutas de escritura de servicios/odontólogos/especialidades sin `validarJWT`.
- Confirmar si el admin que ya existe en la DB es del compañero o de un intento anterior de Osval, e iniciar sesión con él.
- Reemplazar contenido placeholder de `src/data/clinica.js` con info real (Osval no la tiene todavía).
- Coordinación con el compañero: filtro `activo` en `GET /api/servicios` (relacionado con que `activo` no se expone todavía en ningún formulario admin).
- Decidir si en algún momento se agrega el campo `imagen` a `Servicio` en el backend.

## Metodología de trabajo acordada
- **Modo de trabajo actualizado 2026-08-21**: Osval prioriza sacar el proyecto rápido y aprovechar la suscripción — a partir de ahora Claude implementa directamente (no espera a que Osval escriba el código) y reserva las preguntas para decisiones de diseño de alto nivel, presentándolas **con trade-offs y una recomendación cuando la haya** (cambio respecto al modo anterior de "sin trade-offs ni recomendación"). Se mantiene el resto: Osval elige y justifica antes de que Claude implemente.
- Debugging: Claude pide evidencia + hipótesis de Osval antes de explicar; pistas progresivas, nunca la respuesta directa. Aplicado con éxito repetidas veces.
- Cambios al backend del compañero: Claude señala la necesidad de coordinar; si Osval decide avanzar, Claude implementa y deja registrado el pendiente de avisar. Nunca se toca el backend compartido sin que Osval lo decida explícitamente.
- Antes de tocar un endpoint por conveniencia de UI, Claude evalúa qué más queda expuesto (principio aplicado al descartar hacer pública `GET /api/citas/odontologo/:id` y crear un endpoint mínimo en su lugar).
- Claude verifica su propio trabajo: `vite build` siempre, capturas/interacciones con Playwright cuando el resultado visual o el flujo de datos importa — ya atrapó un bug de responsividad y confirmó el paso de estado entre rutas antes de que Osval lo viera.
- Datos puros vs UI: los archivos de `src/data/` no importan nada de presentación (íconos, componentes); esa resolución vive en el componente que consume los datos.
- Sesiones sin supervisión (ej. nocturnas): decidir con el criterio más conservador y consistente con lo ya construido, documentar la decisión y seguir — nunca detenerse a esperar una respuesta que no va a llegar. Comitear en git por pantalla/fix terminado para que la revisión al día siguiente sea por diffs.
- Fallback: sesión intensiva estilo "estrategia 3" si el ritmo se siente muy rápido o hay pérdida de comprensión.
