// Router principal: se monta en server.js como app.use("/api", routes).
// Reconstruido a partir de los controladores existentes.
//
// Convención de permisos (editable en cada bloque):
//   lectura  -> quién puede consultar (null = cualquier usuario con sesión)
//   escritura -> quién puede crear / editar / eliminar
// Los grupos de roles están en ./permisos.js
const express = require('express');
const router = express.Router();

const { crearRouterCrud, handler } = require('./crud');
const { GESTION, GESTION_Y_DOCENTE } = require('./permisos');
const M = require('../models'); // modelos: crearRouterCrud los usa para aislar por colegio

// Ruta pública para comprobar que la API responde: GET /api/salud
router.get('/salud', (req, res) => {
  res.json({ estado: 'ok', hora: new Date().toISOString() });
});

// --- Routers con lógica propia -------------------------------------------
router.use('/auth', require('./auth.routes'));
router.use('/registro', require('./registro.routes'));
router.use('/nucleo', require('./nucleo.routes'));
router.use('/reportes', require('./reportes.routes'));
router.use('/documentos', require('./documentos.routes'));
router.use('/uploads', require('./upload.routes'));
router.use('/secretaria', require('./secretaria.routes'));

// --- Usuarios ---------------------------------------------------------------
const usuario = require('../controllers/usuario.controller');
router.use('/usuarios', crearRouterCrud(usuario, {
  listar: 'obtenerUsuarios',
  obtener: 'obtenerUsuarioPorId',
  crear: 'crearUsuario',
  actualizar: 'actualizarUsuario',
  eliminar: 'eliminarUsuario'
}, {
  lectura: GESTION_Y_DOCENTE,
  escritura: GESTION,
  extras: (r, guarda) => {
    r.put('/:id/password', ...guarda('actualizar'), handler(usuario, 'resetearPassword'));
    r.put('/:id/estado', ...guarda('actualizar'), handler(usuario, 'cambiarEstadoUsuario'));
  }
}));

// --- Instituciones y estructura ------------------------------------------
const institucion = require('../controllers/institucion.controller');
router.use('/instituciones', crearRouterCrud(institucion, {
  listar: 'obtenerInstituciones',
  obtener: 'obtenerInstitucionPorId',
  crear: 'crearInstitucion',
  actualizar: 'actualizarInstitucion',
  eliminar: 'eliminarInstitucion'
}, {
  lectura: null,
  permisos: {
    crear: ['dirNucleo'],
    actualizar: ['admin', 'rector', 'dirNucleo'],
    eliminar: ['dirNucleo']
  },
  extras: (r) => {
    const { permitirRoles } = require('../middlewares/roleAuth');
    r.put('/:id/configuracion', permitirRoles('admin', 'rector'), handler(institucion, 'actualizarConfiguracion'));
  }
}));

const sede = require('../controllers/sede.controller');
router.use('/sedes', crearRouterCrud(sede, {
  listar: 'obtenerSedes', obtener: 'obtenerSedePorId', crear: 'crearSede',
  actualizar: 'actualizarSede', eliminar: 'eliminarSede'
}, { modelo: M.Sede, lectura: null, escritura: GESTION }));

const area = require('../controllers/area.controller');
router.use('/areas', crearRouterCrud(area, {
  listar: 'obtenerAreas', obtener: 'obtenerAreaPorId', crear: 'crearArea',
  actualizar: 'actualizarArea', eliminar: 'eliminarArea'
}, {
  modelo: M.Area,
  lectura: null,
  escritura: GESTION,
  extras: (r, guarda) => {
    r.get('/institucion/:institucionId', ...guarda('listar'), handler(area, 'obtenerAreasPorInstitucion'));
    r.get('/estado/:estado', ...guarda('listar'), handler(area, 'obtenerAreasPorEstado'));
  }
}));

const asignatura = require('../controllers/asignatura.controller');
router.use('/asignaturas', crearRouterCrud(asignatura, {
  listar: 'obtenerAsignaturas', obtener: 'obtenerAsignaturaPorId', crear: 'crearAsignatura',
  actualizar: 'actualizarAsignatura', eliminar: 'eliminarAsignatura'
}, {
  modelo: M.Asignatura,
  lectura: null,
  escritura: GESTION,
  extras: (r, guarda) => {
    r.get('/institucion/:institucionId', ...guarda('listar'), handler(asignatura, 'obtenerAsignaturasPorInstitucion'));
    r.get('/area/:areaId', ...guarda('listar'), handler(asignatura, 'obtenerAsignaturasPorArea'));
  }
}));

const grupo = require('../controllers/grupo.controller');
router.use('/grupos', crearRouterCrud(grupo, {
  listar: 'obtenerGrupos', obtener: 'obtenerGrupoPorId', crear: 'crearGrupo',
  actualizar: 'actualizarGrupo', eliminar: 'eliminarGrupo'
}, { modelo: M.Grupo, lectura: null, escritura: GESTION }));

const indicador = require('../controllers/indicador.controller');
router.use('/indicadores', crearRouterCrud(indicador, {
  listar: 'obtenerIndicadores', obtener: 'obtenerIndicadorPorId', crear: 'crearIndicador',
  actualizar: 'actualizarIndicador', eliminar: 'eliminarIndicador'
}, { modelo: M.Indicador, lectura: null, escritura: GESTION }));

const catalogo = require('../controllers/catalogo.controller');
router.use('/catalogos', crearRouterCrud(catalogo, {
  listar: 'obtenerCatalogos', obtener: 'obtenerCatalogoPorId', crear: 'crearCatalogo',
  actualizar: 'actualizarCatalogo', eliminar: 'eliminarCatalogo'
}, { modelo: M.Catalogo, lectura: null, escritura: GESTION }));

const cargaAcademica = require('../controllers/cargaacademica.controller');
router.use('/cargas-academicas', crearRouterCrud(cargaAcademica, {
  listar: 'obtenerCargasAcademicas', obtener: 'obtenerCargaAcademicaPorId', crear: 'crearCargaAcademica',
  actualizar: 'actualizarCargaAcademica', eliminar: 'eliminarCargaAcademica'
}, { modelo: M.CargaAcademica, lectura: null, escritura: GESTION }));

// --- Años académicos, períodos y promoción -------------------------------
const anio = require('../controllers/anioacademico.controller');
router.use('/anios-academicos', crearRouterCrud(anio, {
  listar: 'obtenerAnios', obtener: 'obtenerAnioPorId', crear: 'crearAnio',
  actualizar: 'actualizarAnio', eliminar: 'eliminarAnio'
}, {
  modelo: M.AnioAcademico,
  lectura: null,
  escritura: GESTION,
  extras: (r, guarda) => {
    const { permitirRoles } = require('../middlewares/roleAuth');
    r.get('/institucion/:institucionId', ...guarda('listar'), handler(anio, 'obtenerAniosPorInstitucion'));
    r.get('/estado/:estado', ...guarda('listar'), handler(anio, 'obtenerAniosPorEstado'));

    // Períodos del cronograma
    r.post('/:id/periodos', ...guarda('crear'), handler(anio, 'agregarPeriodo'));
    r.put('/:id/periodos/:periodoId', ...guarda('actualizar'), handler(anio, 'actualizarPeriodo'));
    r.delete('/:id/periodos/:periodoId', ...guarda('eliminar'), handler(anio, 'eliminarPeriodo'));

    // Promoción / cierre de año
    r.get('/:id/promocion/previsualizar', ...guarda('actualizar'), handler(anio, 'previsualizarCierre'));
    r.post('/:id/promocion/cierre', permitirRoles('admin', 'rector'), handler(anio, 'cerrarAnio'));
    r.get('/:id/promocion/listado', ...guarda('actualizar'), handler(anio, 'listadoPromocion'));
  }
}));

// --- Matrículas y prematrículas ------------------------------------------
const matricula = require('../controllers/matricula.controller');
router.use('/matriculas', crearRouterCrud(matricula, {
  listar: 'obtenerMatriculas', obtener: 'obtenerMatriculaPorId', crear: 'crearMatricula',
  actualizar: 'actualizarMatricula', eliminar: 'eliminarMatricula'
}, { modelo: M.Matricula, lectura: null, escritura: GESTION }));

const prematricula = require('../controllers/prematricula.controller');
router.use('/prematriculas', crearRouterCrud(prematricula, {
  listar: 'obtenerPrematriculas', obtener: 'obtenerPrematriculaPorId', crear: 'crearPrematricula',
  actualizar: 'actualizarPrematricula', eliminar: 'eliminarPrematricula'
}, { modelo: M.Prematricula, lectura: GESTION, escritura: GESTION }));

// --- Calificaciones y actividades -----------------------------------------
const calificacion = require('../controllers/calificacion.controller');
router.use('/calificaciones', crearRouterCrud(calificacion, {
  listar: 'obtenerCalificaciones', obtener: 'obtenerCalificacionPorId', crear: 'crearCalificacion',
  actualizar: 'actualizarCalificacion', eliminar: 'eliminarCalificacion'
}, {
  modelo: M.Calificacion,
  lectura: null,
  escritura: GESTION_Y_DOCENTE,
  extras: (r, guarda) => {
    r.put('/:id/recuperacion', ...guarda('actualizar'), handler(calificacion, 'registrarRecuperacion'));
    r.put('/:id/habilitacion', ...guarda('actualizar'), handler(calificacion, 'registrarHabilitacion'));
  }
}));

const actividad = require('../controllers/actividad.controller');
router.use('/actividades', crearRouterCrud(actividad, {
  listar: 'obtenerActividades', obtener: 'obtenerActividadPorId', crear: 'crearActividad',
  actualizar: 'actualizarActividad', eliminar: 'eliminarActividad'
}, {
  modelo: M.Actividad,
  lectura: null,
  escritura: GESTION_Y_DOCENTE,
  extras: (r, guarda) => {
    r.get('/grupo/:grupoId', ...guarda('listar'), handler(actividad, 'obtenerActividadesPorGrupo'));
    r.get('/asignatura/:asignaturaId', ...guarda('listar'), handler(actividad, 'obtenerActividadesPorAsignatura'));
    r.get('/docente/:docenteId', ...guarda('listar'), handler(actividad, 'obtenerActividadesPorDocente'));
    r.get('/periodo/:periodo', ...guarda('listar'), handler(actividad, 'obtenerActividadesPorPeriodo'));
  }
}));

// --- Convivencia y comunicación ------------------------------------------
const observador = require('../controllers/observador.controller');
router.use('/observador', crearRouterCrud(observador, {
  listar: 'obtenerObservaciones', obtener: 'obtenerObservacionPorId', crear: 'crearObservacion',
  actualizar: 'actualizarObservacion', eliminar: 'eliminarObservacion'
}, { modelo: M.Observador, lectura: null, escritura: GESTION_Y_DOCENTE }));

const comunicados = require('../controllers/comunicados.controller');
router.use('/comunicados', crearRouterCrud(comunicados, {
  listar: 'obtenerComunicados', obtener: 'obtenerComunicadoPorId', crear: 'crearComunicado',
  actualizar: 'actualizarComunicado', eliminar: 'eliminarComunicado'
}, { modelo: M.Comunicados, lectura: null, escritura: GESTION }));

const excusas = require('../controllers/excusas.controller');
router.use('/excusas', crearRouterCrud(excusas, {
  listar: 'obtenerExcusas', obtener: 'obtenerExcusaPorId', crear: 'crearExcusa',
  actualizar: 'actualizarExcusa', eliminar: 'eliminarExcusa'
}, {
  modelo: M.Excusas,
  lectura: null,
  permisos: { crear: null, actualizar: GESTION_Y_DOCENTE, eliminar: GESTION }
}));

// --- Contabilidad ----------------------------------------------------------
const conceptos = require('../controllers/conceptoscontables.controller');
router.use('/conceptos-contables', crearRouterCrud(conceptos, {
  listar: 'obtenerConceptos', obtener: 'obtenerConceptoPorId', crear: 'crearConcepto',
  actualizar: 'actualizarConcepto', eliminar: 'eliminarConcepto'
}, { modelo: M.ConceptosContables, lectura: GESTION, escritura: GESTION }));

const pagos = require('../controllers/pagos.controller');
router.use('/pagos', crearRouterCrud(pagos, {
  listar: 'obtenerPagos', obtener: 'obtenerPagoPorId', crear: 'crearPago',
  actualizar: 'actualizarPago', eliminar: 'eliminarPago'
}, {
  modelo: M.Pagos,
  lectura: GESTION,
  escritura: GESTION,
  extras: (r, guarda) => {
    r.post('/generar-masivo', ...guarda('crear'), handler(pagos, 'generarPagosMasivos'));
    r.get('/reportes/cartera', ...guarda('listar'), handler(pagos, 'obtenerCartera'));
    r.get('/reportes/mora', ...guarda('listar'), handler(pagos, 'obtenerMora'));
  }
}));

// --- Elecciones escolares -----------------------------------------------
const elecciones = require('../controllers/elecciones.controller');
router.use('/elecciones', crearRouterCrud(elecciones, {
  listar: 'obtenerElecciones', obtener: 'obtenerEleccionPorId', crear: 'crearEleccion',
  actualizar: 'actualizarEleccion', eliminar: 'eliminarEleccion'
}, { modelo: M.Elecciones, lectura: null, escritura: GESTION }));

const eventoElectoral = require('../controllers/eventoelectoral.controller');
router.use('/eventos-electorales', crearRouterCrud(eventoElectoral, {
  listar: 'obtenerEventosElectorales', obtener: 'obtenerEventoElectoralPorId', crear: 'crearEventoElectoral',
  actualizar: 'actualizarEventoElectoral', eliminar: 'eliminarEventoElectoral'
}, { modelo: M.EventoElectoral, lectura: null, escritura: GESTION }));

const voto = require('../controllers/voto.controller');
router.use('/votos', crearRouterCrud(voto, {
  listar: 'obtenerVotos', obtener: 'obtenerVotoPorId', crear: 'crearVoto',
  actualizar: 'actualizarVoto', eliminar: 'eliminarVoto'
}, {
  lectura: GESTION,
  permisos: { crear: ['estudiante'], actualizar: ['admin', 'rector'], eliminar: ['admin', 'rector'] },
  extras: (r, guarda) => {
    r.get('/resultados/:eventoId', ...guarda('listar'), handler(voto, 'obtenerResultados'));
  }
}));

// --- Auditoría y administración del núcleo ----------------------------------
const bitacora = require('../controllers/bitacora.controller');
router.use('/bitacora', crearRouterCrud(bitacora, {
  listar: 'obtenerRegistros', obtener: 'obtenerRegistroPorId', crear: 'crearRegistro',
  eliminar: 'eliminarRegistro'
}, {
  modelo: M.Bitacora,
  lectura: GESTION,
  permisos: { crear: GESTION_Y_DOCENTE, eliminar: ['admin', 'rector'] },
  extras: (r, guarda) => {
    r.get('/institucion/:institucionId', ...guarda('listar'), handler(bitacora, 'obtenerRegistrosPorInstitucion'));
    r.get('/usuario/:usuarioId', ...guarda('listar'), handler(bitacora, 'obtenerRegistrosPorUsuario'));
    r.get('/accion/:accion', ...guarda('listar'), handler(bitacora, 'obtenerRegistrosPorAccion'));
  }
}));

const direccionNucleo = require('../controllers/direccionnucleo.controller');
router.use('/direcciones-nucleo', crearRouterCrud(direccionNucleo, {
  listar: 'obtenerDirecciones', obtener: 'obtenerDireccionPorId', crear: 'crearDireccion',
  actualizar: 'actualizarDireccion', eliminar: 'eliminarDireccion'
}, { lectura: ['dirNucleo'], escritura: ['dirNucleo'] }));

const solicitudRegistro = require('../controllers/solicitudregistro.controller');
router.use('/solicitudes-registro', crearRouterCrud(solicitudRegistro, {
  listar: 'obtenerSolicitudes', obtener: 'obtenerSolicitudPorId', crear: 'crearSolicitud',
  actualizar: 'actualizarSolicitud', eliminar: 'eliminarSolicitud'
}, { lectura: ['dirNucleo'], escritura: ['dirNucleo'] }));

module.exports = router;
