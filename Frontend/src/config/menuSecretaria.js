// Un solo lugar define el menú de Secretaría (lo usa el panel de Inicio; pégalo también en tu sidebar si quieres).
export const MENU_SECRETARIA = [
  { grupo: 'Institución', items: [
    { icono: '🏫', titulo: 'Información institucional', ruta: '/secretaria/institucion', desc: 'Nombre, NIT, rector, contacto' },
    { icono: '🛡️', titulo: 'Escudo / Logo', ruta: '/secretaria/escudo', desc: 'Se usa en todos los documentos' },
    { icono: '✍️', titulo: 'Firmas', ruta: '/secretaria/firmas', desc: 'Rector, coordinador, secretario' },
    { icono: '🖼️', titulo: 'Fotografías', ruta: '/secretaria/fotografias', desc: 'Colegio, estudiantes, docentes' }
  ] },
  { grupo: 'Configuración académica', items: [
    { icono: '📅', titulo: 'Año escolar', ruta: '/secretaria/anio-escolar', desc: 'Crear y activar años' },
    { icono: '📆', titulo: 'Periodos académicos', ruta: '/secretaria/periodos', desc: 'Fechas, orden y cierre' },
    { icono: '🕐', titulo: 'Jornadas', ruta: '/secretaria/jornadas', desc: 'Mañana, tarde, noche, única' },
    { icono: '🎓', titulo: 'Ciclos', ruta: '/secretaria/ciclos', desc: 'Preescolar a media' },
    { icono: '🎓', titulo: 'Grados', ruta: '/secretaria/grados', desc: 'Grados por ciclo' },
    { icono: '👥', titulo: 'Grupos / cursos', ruta: '/secretaria/grupos', desc: 'Cursos de cada año' },
    { icono: '📚', titulo: 'Áreas', ruta: '/secretaria/areas', desc: 'Agrupan asignaturas' },
    { icono: '📖', titulo: 'Asignaturas', ruta: '/secretaria/asignaturas', desc: 'Dentro de cada área' },
    { icono: '🧑‍🏫', titulo: 'Asignación académica', ruta: '/secretaria/asignacion', desc: 'Asignatura, grado y docente' },
    { icono: '📊', titulo: 'Sistema de calificación', ruta: '/secretaria/calificacion', desc: 'Escala, rangos y cálculo' }
  ] },
  { grupo: 'Personas', items: [
    { icono: '👨‍🎓', titulo: 'Estudiantes', ruta: '/secretaria/estudiantes', desc: 'Alta y edición' },
    { icono: '🔎', titulo: 'Ficha del estudiante', ruta: '/secretaria/estudiantes/ficha', desc: 'Estado, historial, foto' },
    { icono: '📝', titulo: 'Matrículas', ruta: '/secretaria/matriculas', desc: 'Matricular y consultar' },
    { icono: '👨‍👩‍👧', titulo: 'Acudientes', ruta: '/secretaria/acudientes', desc: 'Alta y edición' },
    { icono: '👨‍🏫', titulo: 'Docentes', ruta: '/secretaria/docentes', desc: 'Personal docente' },
    { icono: '🔗', titulo: 'Personas y roles', ruta: '/secretaria/personas-roles', desc: 'Varios roles, una persona' },
    { icono: '🔐', titulo: 'Usuarios', ruta: '/secretaria/usuarios', desc: 'Acceso y estado' }
  ] },
  { grupo: 'Documentos', items: [
    { icono: '📄', titulo: 'Boletines y documentos', ruta: '/secretaria/documentos', desc: 'PDF de boletines, certificados…' }
  ] }
]
