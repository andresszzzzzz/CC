// Rutas del módulo Secretaría: se montan en /api/secretaria (ver routes/index.js).
//   Lectura: cualquier usuario autenticado de una institución (la usan boletines, docentes, etc.)
//   Escritura: admin, rector, coordinador y secretaria (GESTION)
const express = require('express');
const router = express.Router();

const { verificarToken } = require('../middlewares/auth');
const { permitirRoles } = require('../middlewares/roleAuth');
const { crearUploader } = require('../middlewares/upload');
const { GESTION } = require('./permisos');

const { jornadas, ciclos, grados, firmas } = require('../controllers/secretaria/catalogos');
const { aniosApi, periodosApi } = require('../controllers/secretaria/anios');
const { asignaturas, asignaciones } = require('../controllers/secretaria/academico');
const { matriculas, estudiantes } = require('../controllers/secretaria/matriculas');
const { personas } = require('../controllers/secretaria/personas');
const { institucionCfg, calificacionCfg, imagenes } = require('../controllers/secretaria/configuracion');
const { documentos } = require('../controllers/secretaria/documentos');

router.use(verificarToken);

const leer = [];                          // cualquier usuario con sesión
const escribir = [permitirRoles(...GESTION)];

// CRUD estándar: GET / , GET /:id , POST / , PUT /:id , DELETE /:id
const montarCrud = (base, c, extras) => {
  const r = express.Router();
  if (extras) extras(r);                  // rutas específicas ANTES de "/:id"
  r.get('/', ...leer, c.listar);
  r.get('/:id', ...leer, c.obtener);
  r.post('/', ...escribir, c.crear);
  r.put('/:id', ...escribir, c.actualizar);
  r.delete('/:id', ...escribir, c.eliminar);
  router.use(base, r);
};

montarCrud('/anios', aniosApi, (r) => r.patch('/:id/actual', ...escribir, aniosApi.marcarActual));
montarCrud('/periodos', periodosApi, (r) => r.patch('/:id/cerrar', ...escribir, periodosApi.cerrar));
montarCrud('/jornadas', jornadas);
montarCrud('/ciclos', ciclos);
montarCrud('/grados', grados);
montarCrud('/asignaturas', asignaturas);
montarCrud('/asignaciones', asignaciones);
montarCrud('/firmas', firmas);

montarCrud('/matriculas', matriculas, (r) => {
  r.get('/verificar', ...escribir, matriculas.verificar);
  r.get('/historial/:estudianteId', ...escribir, matriculas.historial);
  r.patch('/:id/estado', ...escribir, matriculas.cambiarEstado);
});

// Estudiantes y personas: solo gestión (contienen datos personales)
router.get('/estudiantes/buscar', ...escribir, estudiantes.buscar);
router.get('/estudiantes/:id/ficha', ...escribir, estudiantes.ficha);
router.patch('/estudiantes/:id/estado', ...escribir, estudiantes.cambiarEstado);

router.get('/personas/buscar', ...escribir, personas.buscar);
router.get('/personas/:id', ...escribir, personas.obtener);
router.post('/personas/:id/roles', ...escribir, personas.agregarRol);
router.delete('/personas/:id/roles/:rol', ...escribir, personas.quitarRol);
router.post('/personas/:id/relaciones', ...escribir, personas.vincular);
router.delete('/personas/:id/relaciones/:estudianteId', ...escribir, personas.desvincular);

// Configuración única por institución
router.get('/institucion', ...leer, institucionCfg.obtener);
router.put('/institucion', ...escribir, institucionCfg.guardar);
router.get('/sistema-calificacion', ...leer, calificacionCfg.obtener);
router.put('/sistema-calificacion', ...escribir, calificacionCfg.guardar);

// Imágenes: el archivo viaja en el campo "archivo" (multipart/form-data)
const uploaders = { usuarios: crearUploader('usuarios').single('archivo'), instituciones: crearUploader('instituciones').single('archivo') };
const subir = (req, res, next) => {
  const carpeta = ['estudiante', 'docente', 'acudiente'].includes(req.params.tipo) ? 'usuarios' : 'instituciones';
  uploaders[carpeta](req, res, (err) => {
    if (!err) return next();
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    res.status(status).json({ mensaje: err.code === 'LIMIT_FILE_SIZE' ? 'La imagen supera el tamaño máximo (3 MB).' : err.message });
  });
};
router.post('/imagenes/:tipo', ...escribir, subir, imagenes.subir);
router.get('/imagenes/:tipo', ...leer, imagenes.galeria);
router.delete('/imagenes/:tipo/:id', ...escribir, imagenes.eliminar);

// Datos para PDFs
router.get('/documentos/datos', ...escribir, documentos.datos);
router.get('/documentos/datos-grupo', ...escribir, documentos.datosGrupo);

module.exports = router;
