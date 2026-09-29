// Datos de ejemplo con la MISMA forma que devuelve el backend real
// (mismos nombres de campos: nombres/apellidos, asignaturaId poblado,
// docenteId poblado, fechaLimite, etc.) para que cuando se conecte la API
// de verdad, las vistas no tengan que cambiar nada.

const hoy = new Date();
const dias = (n) => {
  const d = new Date(hoy);
  d.setDate(d.getDate() + n);
  return d.toISOString();
};

export const institucionMock = {
  _id: 'inst-001',
  nombre: 'Colegio San José',
  configuracion: { numeroPeriodos: 4, notaMinima: 3.0, notaMaxima: 5.0 }
};

export const grupoMock = { _id: 'grupo-601', nombre: '601', grado: 6, jornada: 'manana' };

export const asignaturasMock = [
  { _id: 'asig-mat', nombre: 'Matemáticas' },
  { _id: 'asig-len', nombre: 'Lengua Castellana' },
  { _id: 'asig-cnat', nombre: 'Ciencias Naturales' },
  { _id: 'asig-csoc', nombre: 'Ciencias Sociales' },
  { _id: 'asig-ing', nombre: 'Inglés' },
  { _id: 'asig-edf', nombre: 'Educación Física' },
  { _id: 'asig-art', nombre: 'Artes' },
  { _id: 'asig-tec', nombre: 'Tecnología' }
];

export const docentesMock = [
  { _id: 'doc-1', nombres: 'María', apellidos: 'López', tipoPerfil: 'docente' },
  { _id: 'doc-2', nombres: 'Pedro', apellidos: 'Gómez', tipoPerfil: 'docente' },
  { _id: 'doc-3', nombres: 'Ana', apellidos: 'Torres', tipoPerfil: 'docente' },
  { _id: 'doc-4', nombres: 'Carlos', apellidos: 'Ruiz', tipoPerfil: 'docente' },
  { _id: 'doc-5', nombres: 'Laura', apellidos: 'Méndez', tipoPerfil: 'docente' },
  { _id: 'doc-6', nombres: 'Diego', apellidos: 'Ramírez', tipoPerfil: 'docente' },
  { _id: 'doc-7', nombres: 'Sofía', apellidos: 'Vargas', tipoPerfil: 'docente' },
  { _id: 'doc-8', nombres: 'Jorge', apellidos: 'Molina', tipoPerfil: 'docente' }
];

export const estudianteMock = {
  _id: 'est-juan-perez',
  institucionId: institucionMock,
  nombres: 'Juan',
  apellidos: 'Pérez',
  email: 'juan.perez@colegiosanjose.edu.co',
  tipoPerfil: 'estudiante',
  credenciales: { usuario: 'juan.perez' }
};

export const acudienteMock = {
  _id: 'acu-maria-perez',
  institucionId: institucionMock,
  nombres: 'María',
  apellidos: 'Pérez',
  email: 'maria.perez@colegiosanjose.edu.co',
  tipoPerfil: 'acudiente',
  estudiantes: [{ estudianteId: estudianteMock._id, parentesco: 'Madre', nombre: 'Juan Pérez' }],
  credenciales: { usuario: 'maria.perez' }
};

// Compañeros de grupo, solo para que "puesto en el grupo" tenga sentido
const companerosMock = [
  { _id: 'est-laura-g', nombres: 'Laura', apellidos: 'Gómez', tipoPerfil: 'estudiante' },
  { _id: 'est-andres-t', nombres: 'Andrés', apellidos: 'Torres', tipoPerfil: 'estudiante' },
  { _id: 'est-sofia-r', nombres: 'Sofía', apellidos: 'Ramírez', tipoPerfil: 'estudiante' }
];

export const matriculasMock = [
  { _id: 'mat-1', estudianteId: estudianteMock._id, grupoId: grupoMock._id, anioAcademicoId: 'anio-2026', estado: 'activa' },
  ...companerosMock.map((c, i) => ({
    _id: `mat-comp-${i}`,
    estudianteId: c._id,
    grupoId: grupoMock._id,
    anioAcademicoId: 'anio-2026',
    estado: 'activa'
  }))
];

// Notas del estudiante principal (coinciden con el diseño de referencia)
const notasJuan = [4.5, 4.2, 4.1, 4.0, 4.3, 4.6, 4.0, 3.9];

function calificacionesDe(estudianteId, notas) {
  return asignaturasMock.map((asig, i) => ({
    _id: `cal-${estudianteId}-${asig._id}`,
    estudianteId,
    asignaturaId: asig,
    grupoId: grupoMock,
    docenteId: docentesMock[i],
    periodo: 1,
    nota: notas[i],
    estado: 'activo'
  }));
}

export const calificacionesMock = [
  ...calificacionesDe(estudianteMock._id, notasJuan),
  ...calificacionesDe(companerosMock[0]._id, [4.0, 3.8, 4.4, 3.6, 4.1, 4.2, 3.9, 3.7]),
  ...calificacionesDe(companerosMock[1]._id, [3.5, 3.9, 3.6, 4.0, 3.8, 4.0, 3.5, 3.6]),
  ...calificacionesDe(companerosMock[2]._id, [4.7, 4.5, 4.6, 4.4, 4.5, 4.8, 4.3, 4.2])
];

export const actividadesMock = [
  {
    _id: 'act-1',
    titulo: 'Taller de Matemáticas',
    tipo: 'tarea',
    asignaturaId: asignaturasMock[0],
    docenteId: docentesMock[0],
    grupoId: grupoMock._id,
    periodo: 1,
    estado: 'activo',
    fechaLimite: dias(2)
  },
  {
    _id: 'act-2',
    titulo: 'Ensayo: La Argumentación',
    tipo: 'tarea',
    asignaturaId: asignaturasMock[1],
    docenteId: docentesMock[1],
    grupoId: grupoMock._id,
    periodo: 1,
    estado: 'activo',
    fechaLimite: dias(4)
  },
  {
    _id: 'act-3',
    titulo: 'Experimento: El Agua',
    tipo: 'proyecto',
    asignaturaId: asignaturasMock[2],
    docenteId: docentesMock[2],
    grupoId: grupoMock._id,
    periodo: 1,
    estado: 'activo',
    fechaLimite: dias(7)
  },
  {
    _id: 'act-4',
    titulo: 'Mapa Conceptual',
    tipo: 'tarea',
    asignaturaId: asignaturasMock[3],
    docenteId: docentesMock[3],
    grupoId: grupoMock._id,
    periodo: 1,
    estado: 'activo',
    fechaLimite: dias(9)
  },
  {
    _id: 'act-5',
    titulo: 'Quiz de Vocabulario',
    tipo: 'quiz',
    asignaturaId: asignaturasMock[4],
    docenteId: docentesMock[4],
    grupoId: grupoMock._id,
    periodo: 1,
    estado: 'activo',
    fechaLimite: dias(1)
  },
  {
    _id: 'act-6',
    titulo: 'Taller de Resistencia y Flexibilidad',
    tipo: 'taller',
    asignaturaId: asignaturasMock[5],
    docenteId: docentesMock[5],
    grupoId: grupoMock._id,
    periodo: 1,
    estado: 'activo',
    fechaLimite: dias(14)
  },
  {
    _id: 'act-7',
    titulo: 'Autorretrato en acuarela',
    tipo: 'tarea',
    asignaturaId: asignaturasMock[6],
    docenteId: docentesMock[6],
    grupoId: grupoMock._id,
    periodo: 1,
    estado: 'activo',
    fechaLimite: dias(-2)
  }
];

export const comunicadosMock = [
  {
    _id: 'com-1',
    asunto: 'Suspensión de clases - 20 de mayo',
    mensaje: 'Informamos a toda la comunidad educativa que el día lunes 20 de mayo no habrá clases por mantenimiento de las instalaciones.',
    fecha: dias(-3),
    destinatarios: [],
    estado: 'enviado'
  },
  {
    _id: 'com-2',
    asunto: 'Convivencia escolar',
    mensaje: 'Recordamos a todos los estudiantes la importancia de mantener una sana convivencia dentro y fuera del aula.',
    fecha: dias(-5),
    destinatarios: [],
    estado: 'enviado'
  },
  {
    _id: 'com-3',
    asunto: 'Entrega de informes académicos',
    mensaje: 'La entrega de informes del período se realizará el día 31 de mayo. Los acudientes deben acercarse a recogerlos.',
    fecha: dias(-7),
    destinatarios: [],
    estado: 'enviado'
  }
];

// Asistencia del estudiante principal: 8 asignaturas x 5 fechas = 40 registros,
// con 2 ausencias y 2 tardanzas repartidas (da 95% de asistencia general,
// igual al diseño de referencia)
const fechasAsistencia = [dias(-12), dias(-9), dias(-7), dias(-4), dias(-2)];

function estadoAsistencia(asigIndex, fechaIndex) {
  if (asigIndex === 0 && fechaIndex === 0) return 'ausente'; // Matemáticas, hace 12 días
  if (asigIndex === 3 && fechaIndex === 2) return 'ausente'; // Ciencias Sociales, hace 7 días
  if (asigIndex === 4 && fechaIndex === 1) return 'tardanza'; // Inglés, hace 9 días
  if (asigIndex === 6 && fechaIndex === 3) return 'tardanza'; // Artes, hace 4 días
  return 'presente';
}

export const asistenciaMock = fechasAsistencia.flatMap((fecha, fechaIndex) =>
  asignaturasMock.map((asig, asigIndex) => ({
    _id: `asis-${fechaIndex}-${asigIndex}`,
    estudianteId: estudianteMock._id,
    asignaturaId: asig,
    docenteId: docentesMock[asigIndex],
    fecha,
    estado: estadoAsistencia(asigIndex, fechaIndex)
  }))
);

// Observador del estudiante principal
export const observacionesMock = [
  {
    _id: 'obs-1',
    estudianteId: estudianteMock._id,
    docenteId: docentesMock[0],
    asignaturaId: asignaturasMock[0],
    tipo: 'positiva',
    categoria: 'academica',
    descripcion: 'Excelente participación resolviendo ejercicios de fracciones en clase.',
    fecha: dias(-6)
  },
  {
    _id: 'obs-2',
    estudianteId: estudianteMock._id,
    docenteId: docentesMock[5],
    asignaturaId: null,
    tipo: 'negativa',
    categoria: 'convivencial',
    descripcion: 'Llegó tarde a la clase de Educación Física sin justificación.',
    fecha: dias(-9)
  },
  {
    _id: 'obs-3',
    estudianteId: estudianteMock._id,
    docenteId: docentesMock[1],
    asignaturaId: asignaturasMock[1],
    tipo: 'positiva',
    categoria: 'convivencial',
    descripcion: 'Ayudó a un compañero a ponerse al día con la tarea de Lengua Castellana.',
    fecha: dias(-11)
  },
  {
    _id: 'obs-4',
    estudianteId: estudianteMock._id,
    docenteId: docentesMock[2],
    asignaturaId: asignaturasMock[2],
    tipo: 'neutra',
    categoria: 'academica',
    descripcion: 'Se recomienda reforzar el tema de ecosistemas para el siguiente quiz.',
    fecha: dias(-14)
  }
];

// Credenciales válidas para el login simulado (usuario -> objeto de usuario)
export const usuariosPorCredencial = {
  'juan.perez': { password: 'Estudiante123', usuario: estudianteMock },
  'maria.perez': { password: 'Acudiente123', usuario: acudienteMock }
};

// Horario semanal del grupo 601 — un registro por bloque de clase
function bloque(dia, horaInicio, horaFin, asigIdx, docIdx) {
  return {
    _id: `hor-${dia}-${horaInicio}`,
    grupoId: grupoMock._id,
    dia,
    horaInicio,
    horaFin,
    asignaturaId: asignaturasMock[asigIdx],
    docenteId: docentesMock[docIdx ?? asigIdx]
  };
}

export const horarioMock = [
  // 07:00 - 08:00
  bloque('lunes', '07:00', '08:00', 0),
  bloque('martes', '07:00', '08:00', 1),
  bloque('miercoles', '07:00', '08:00', 2),
  bloque('jueves', '07:00', '08:00', 0),
  bloque('viernes', '07:00', '08:00', 4),
  // 08:00 - 09:00
  bloque('lunes', '08:00', '09:00', 0),
  bloque('martes', '08:00', '09:00', 1),
  bloque('miercoles', '08:00', '09:00', 2),
  bloque('jueves', '08:00', '09:00', 0),
  bloque('viernes', '08:00', '09:00', 4),
  // 09:00 - 10:00
  bloque('lunes', '09:00', '10:00', 4),
  bloque('martes', '09:00', '10:00', 0),
  bloque('miercoles', '09:00', '10:00', 3),
  bloque('jueves', '09:00', '10:00', 2),
  bloque('viernes', '09:00', '10:00', 7),
  // 10:15 - 11:15
  bloque('lunes', '10:15', '11:15', 3),
  bloque('martes', '10:15', '11:15', 6),
  bloque('miercoles', '10:15', '11:15', 4),
  bloque('jueves', '10:15', '11:15', 1),
  bloque('viernes', '10:15', '11:15', 5),
  // 11:15 - 12:15
  bloque('lunes', '11:15', '12:15', 3),
  bloque('martes', '11:15', '12:15', 6),
  bloque('miercoles', '11:15', '12:15', 4),
  bloque('jueves', '11:15', '12:15', 1),
  bloque('viernes', '11:15', '12:15', 5)
];

// Material de apoyo compartido por los docentes
export const materialApoyoMock = [
  {
    _id: 'mat-1',
    titulo: 'Guía de ecuaciones lineales',
    tipo: 'pdf',
    asignaturaId: asignaturasMock[0],
    docenteId: docentesMock[0],
    fecha: dias(-4)
  },
  {
    _id: 'mat-2',
    titulo: 'Lista de lecturas - Período 1',
    tipo: 'doc',
    asignaturaId: asignaturasMock[1],
    docenteId: docentesMock[1],
    fecha: dias(-6)
  },
  {
    _id: 'mat-3',
    titulo: 'Video: Ciclo del agua',
    tipo: 'link',
    asignaturaId: asignaturasMock[2],
    docenteId: docentesMock[2],
    fecha: dias(-2)
  },
  {
    _id: 'mat-4',
    titulo: 'Mapa de Colombia para colorear',
    tipo: 'pdf',
    asignaturaId: asignaturasMock[3],
    docenteId: docentesMock[3],
    fecha: dias(-9)
  },
  {
    _id: 'mat-5',
    titulo: 'Vocabulario Unidad 3',
    tipo: 'doc',
    asignaturaId: asignaturasMock[4],
    docenteId: docentesMock[4],
    fecha: dias(-1)
  },
  {
    _id: 'mat-6',
    titulo: 'Rutina de calentamiento',
    tipo: 'link',
    asignaturaId: asignaturasMock[5],
    docenteId: docentesMock[5],
    fecha: dias(-12)
  }
];

// Conversaciones de mensajería con docentes (solo demo, no persiste al recargar)
export const conversacionesMock = [
  {
    _id: 'conv-1',
    contacto: docentesMock[0],
    mensajes: [
      { _id: 'msg-1', de: 'ellos', texto: 'Hola Juan, recuerda entregar el taller de matemáticas este viernes.', hora: dias(-2) },
      { _id: 'msg-2', de: 'yo', texto: 'Listo profe, ya casi lo termino.', hora: dias(-2) },
      { _id: 'msg-3', de: 'ellos', texto: 'Perfecto, cualquier duda me escribes.', hora: dias(-1) }
    ]
  },
  {
    _id: 'conv-2',
    contacto: docentesMock[4],
    mensajes: [
      { _id: 'msg-4', de: 'ellos', texto: 'Juan, muy buen trabajo en el quiz de vocabulario.', hora: dias(-1) }
    ]
  },
  {
    _id: 'conv-3',
    contacto: { _id: 'coord-1', nombres: 'Coordinación', apellidos: 'Académica', tipoPerfil: 'coordinador' },
    mensajes: [
      { _id: 'msg-5', de: 'ellos', texto: 'Recuerda traer el uniforme de educación física completo.', hora: dias(-5) }
    ]
  }
];