// ÚNICA fuente de verdad del menú de Secretaría. La usan:
//   - el panel de Inicio (tarjetas)           -> views/secretaria/Inicio.vue
//   - el menú lateral (sidebar)               -> layouts/AppLayout.vue
//   - la verificación de rutas en desarrollo  -> router/routes.js
//
// Para agregar una pantalla nueva:
//   1) crea la vista en src/views/secretaria/
//   2) regístrala en `vistasSecretaria` de src/router/routes.js (la clave es la parte de `ruta` después de /secretaria/)
//   3) añade su entrada aquí. Si falta el paso 2, en desarrollo la consola avisa con el nombre de la ruta.
//
//   icono: emoji de la tarjeta de Inicio     icon: nombre de AppIcon.vue para el sidebar
export const MENU_SECRETARIA = [
  { grupo: 'Institución', items: [
    { icono: '🏫', icon: 'home', titulo: 'Información institucional', ruta: '/secretaria/institucion', desc: 'Nombre, NIT, rector, contacto' },
    { icono: '🏢', icon: 'layers', titulo: 'Sedes', ruta: '/secretaria/sedes', desc: 'Sedes físicas del colegio' },
    { icono: '🛡️', icon: 'star', titulo: 'Escudo / Logo', ruta: '/secretaria/escudo', desc: 'Se usa en todos los documentos' },
    { icono: '✍️', icon: 'file-text', titulo: 'Firmas', ruta: '/secretaria/firmas', desc: 'Rector, coordinador, secretario' },
    { icono: '🖼️', icon: 'eye', titulo: 'Fotografías', ruta: '/secretaria/fotografias', desc: 'Colegio, estudiantes, docentes' }
  ] },
  { grupo: 'Configuración académica', items: [
    { icono: '📅', icon: 'calendar-check', titulo: 'Año escolar', ruta: '/secretaria/anio-escolar', desc: 'Crear y activar años' },
    { icono: '📆', icon: 'clock', titulo: 'Periodos académicos', ruta: '/secretaria/periodos', desc: 'Fechas, orden y cierre' },
    { icono: '🕐', icon: 'clock', titulo: 'Jornadas', ruta: '/secretaria/jornadas', desc: 'Mañana, tarde, noche, única' },
    { icono: '🎓', icon: 'graduation-cap', titulo: 'Ciclos', ruta: '/secretaria/ciclos', desc: 'Preescolar a media' },
    { icono: '🎓', icon: 'graduation-cap', titulo: 'Grados', ruta: '/secretaria/grados', desc: 'Grados por ciclo' },
    { icono: '👥', icon: 'layers', titulo: 'Grupos / cursos', ruta: '/secretaria/grupos', desc: 'Cursos de cada año' },
    { icono: '📚', icon: 'book-open', titulo: 'Áreas', ruta: '/secretaria/areas', desc: 'Agrupan asignaturas' },
    { icono: '📖', icon: 'book', titulo: 'Asignaturas', ruta: '/secretaria/asignaturas', desc: 'Dentro de cada área' },
    { icono: '🧑‍🏫', icon: 'clipboard-list', titulo: 'Asignación académica', ruta: '/secretaria/asignacion', desc: 'Asignatura, grado y docente' },
    { icono: '🎯', icon: 'clipboard-list', titulo: 'Indicadores de logro', ruta: '/secretaria/indicadores', desc: 'Por asignatura y periodo' },
    { icono: '📊', icon: 'bar-chart', titulo: 'Sistema de calificación', ruta: '/secretaria/calificacion', desc: 'Escala, rangos y cálculo' }
  ] },
  { grupo: 'Personas', items: [
    { icono: '👨‍🎓', icon: 'users', titulo: 'Estudiantes', ruta: '/secretaria/estudiantes', desc: 'Alta y edición' },
    { icono: '🔎', icon: 'id-card', titulo: 'Ficha del estudiante', ruta: '/secretaria/estudiantes/ficha', desc: 'Estado, historial, foto' },
    { icono: '🗂️', icon: 'clipboard', titulo: 'Prematrículas', ruta: '/secretaria/prematriculas', desc: 'Solicitudes de cupo' },
    { icono: '📝', icon: 'clipboard-check', titulo: 'Matrículas', ruta: '/secretaria/matriculas', desc: 'Matricular y consultar' },
    { icono: '👨‍👩‍👧', icon: 'user-plus', titulo: 'Acudientes', ruta: '/secretaria/acudientes', desc: 'Alta y edición' },
    { icono: '👨‍🏫', icon: 'users', titulo: 'Docentes', ruta: '/secretaria/docentes', desc: 'Personal docente' },
    { icono: '🔗', icon: 'users', titulo: 'Personas y roles', ruta: '/secretaria/personas-roles', desc: 'Varios roles, una persona' },
    { icono: '🔐', icon: 'id-card', titulo: 'Usuarios', ruta: '/secretaria/usuarios', desc: 'Acceso y estado' }
  ] },
  { grupo: 'Comunicación y novedades', items: [
    { icono: '📢', icon: 'megaphone', titulo: 'Comunicados', ruta: '/secretaria/comunicados', desc: 'Avisos a la comunidad' },
    { icono: '🩺', icon: 'mail', titulo: 'Excusas de docentes', ruta: '/secretaria/excusas', desc: 'Ausencias y aprobación' }
  ] },
  { grupo: 'Contabilidad', items: [
    { icono: '💳', icon: 'credit-card', titulo: 'Conceptos de cobro', ruta: '/secretaria/conceptos-contables', desc: 'Matrícula, pensión, derechos' }
  ] },
  { grupo: 'Documentos y control', items: [
    { icono: '📄', icon: 'file-text', titulo: 'Boletines y documentos', ruta: '/secretaria/documentos', desc: 'PDF de boletines, certificados…' },
    { icono: '🗃️', icon: 'archive', titulo: 'Bitácora', ruta: '/secretaria/bitacora', desc: 'Registro de actividad' }
  ] }
]
