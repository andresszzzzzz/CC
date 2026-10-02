# Módulo Secretaría — backend

Soporta las pantallas de Secretaría del frontend (carpeta `Secretaria/` del proyecto Vue).
Todo cuelga de **`/api/secretaria/*`** (ver `src/routes/secretaria.routes.js`).

## Reglas generales
- La institución sale **siempre del token** (`req.usuario.institucionId`); el `institucionId` que mande el navegador se ignora. `dirNucleo` (sin institución) recibe 403.
- **Lectura**: cualquier usuario con sesión, salvo estudiantes, personas, matrículas y documentos (solo gestión).
- **Escritura**: `admin`, `rector`, `coordinador`, `secretaria` (grupo `GESTION` en `routes/permisos.js`).
- Nada de borrar historial: años, periodos, asignaturas, asignaciones, grados, jornadas y ciclos devuelven **409** si están en uso; las matrículas "eliminadas" quedan `cancelada`.

## Endpoints
| Recurso | Rutas |
|---|---|
| Años | `GET/POST /anios`, `GET/PUT/DELETE /anios/:id`, `PATCH /anios/:id/actual` |
| Periodos | CRUD `/periodos` (filtro `?anioAcademicoId=`), `PATCH /periodos/:id/cerrar` |
| Jornadas / Ciclos / Grados / Firmas | CRUD `/jornadas`, `/ciclos`, `/grados`, `/firmas` |
| Asignaturas | CRUD `/asignaturas` (devuelve `areaNombre`) |
| Asignación académica | CRUD `/asignaciones` (usa `CargaAcademica`; `intensidadHoraria` ↔ `horasSemanales`) |
| Matrículas | CRUD `/matriculas`, `GET /matriculas/verificar`, `GET /matriculas/historial/:estudianteId`, `PATCH /matriculas/:id/estado` |
| Estudiantes | `GET /estudiantes/buscar`, `GET /estudiantes/:id/ficha`, `PATCH /estudiantes/:id/estado` |
| Personas y roles | `GET /personas/buscar`, `GET /personas/:id`, `POST/DELETE /personas/:id/roles[/:rol]`, `POST/DELETE /personas/:id/relaciones[/:estudianteId]` |
| Institución | `GET/PUT /institucion` |
| Sistema de calificación | `GET/PUT /sistema-calificacion` |
| Imágenes | `POST /imagenes/:tipo` (campo `archivo`, devuelve `{url}`), `GET /imagenes/:tipo`, `DELETE /imagenes/:tipo/:id` |
| Documentos | `GET /documentos/datos`, `GET /documentos/datos-grupo` |

## Cambios a modelos existentes (todos opcionales, no rompen datos actuales)
- `Institucion`: `resolucion, municipio, departamento, sitioWeb, rectorNombre, rectorDocumento, lema`.
- `AnioAcademico`: `fechaInicio, fechaFin, habilitado`; periodos: `usaEnNotaFinal, porcentaje`. Nuevo estado `inactivo`.
- `Asignatura`: `porcentaje`.
- `Usuario`: `roles[]` (roles adicionales al principal).
- `Matricula`: `gradoId, jornadaId, acudienteId, motivo`; nuevo estado `cancelada`.
- Modelos nuevos: `Jornada, Ciclo, Grado, Firma, SistemaCalificacion, Imagen`.

## Decisiones que conviene revisar
1. **Año actual** = el que tiene `estado: 'activo'` (así lo siguen usando `auth` y `documentos`). `esActual` se calcula de ahí. El "Estado activo/inactivo" de la pantalla es el campo `habilitado`. Al marcar uno como actual, el anterior pasa a `inactivo` (no a `finalizado`; eso lo hace el cierre/promoción).
2. **Estados de matrícula**: se guardan los de siempre (`activa`, `retirada`…) para no romper reportes y promoción; la API los traduce a `matriculado`, `retirado`, `cancelada`.
3. **Roles múltiples**: `Usuario.roles[]` es informativo/organizativo. Los **permisos de la API siguen dependiendo de `tipoPerfil`**; agregar el rol "docente" a un acudiente no le da acceso de docente.
4. **Máximo 5 periodos por año**: límite de `Calificacion.periodo`. La pantalla permite hasta 12; el servidor responde 400 por encima de 5.
5. **`SistemaCalificacion` no se sincroniza** con `Institucion.configuracion.notaMinima/notaMaxima` que usan reportes actuales. Si quieres una sola fuente de verdad, hay que decidir qué campo manda.
6. **Grupos**: siguen usando `grado` (número) y `jornada` (texto). La pantalla de matrícula filtra grupos por `grado = grado.numero`. Jornada `unica` (Secretaría) ≠ `continua` (Grupo).
7. `GET /documentos/datos` devuelve por asignatura `{area, nombre, ih, nota, observacion, notasPorPeriodo}`; el desempeño y la nota final los calcula el cliente.

## Frontend (ya integrado en `Frontend/`)
- Vistas nuevas y reemplazadas en `src/views/secretaria/`, componentes `EstadoBadge`/`ImageUploader`, composables `useCatalogos`/`useConfigInstitucional`, `config/menuSecretaria.js`, `services/secretariaApiExt.js` y `pdfDocumentos.js`, `styles/secretaria-ui.css`, `utils/calificacion.js`.
- `src/router/routes.js`: las pantallas nuevas se sumaron a `vistasSecretaria` (mismo guard `meta.rol: 'secretaria'`).
- `src/layouts/AppLayout.vue`: el menú lateral de Secretaría ahora se arma desde `config/menuSecretaria.js`.
- `package.json`: se agregó `jspdf-autotable`. **Ejecuta `npm install`** (y si hay conflicto de versión con `jspdf`, `npm i jspdf-autotable@latest`).
- `GET /usuarios?tipoPerfil=estudiante` ahora añade `estadoEstudiante`, `grupoNombre`, `jornadaNombre` (+ `grupoId`, `jornadaId`, `acudienteId` para precargar). Son solo de lectura: **el formulario de Estudiantes no guarda grupo/jornada/acudiente**; eso se hace en «Matrículas».

## Pendiente de verificar
Se armó sin dependencias instaladas ni base de datos, así que **no se ejecutó**: solo se comprobó sintaxis, carga de rutas con stubs y que todos los `import` del Frontend existan. Probar cada pantalla tras `npm install` en backend y Frontend.
