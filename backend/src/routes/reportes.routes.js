const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth');
const r = require('../controllers/reportes.controller');

// Cada controlador valida por dentro si el usuario puede ver ese estudiante/grupo.
router.use(verificarToken);

router.get('/boletin/:matriculaId/:periodo', r.generarBoletinPeriodo);
router.get('/constancia/:matriculaId', r.generarConstanciaEstudio);
router.get('/certificado-notas/:matriculaId', r.generarCertificadoNotas);
router.get('/constancia-notas/:matriculaId', r.generarConstanciaNotas);
router.get('/carnet/estudiante/:matriculaId', r.generarCarnetEstudiante);
router.get('/carnet/personal/:usuarioId', r.generarCarnetPersonal);
router.get('/estadisticas/:tipo', r.generarEstadisticas);
router.get('/evolucion/:grupoId', r.generarEvolucionGrupo);
router.get('/acumulativo/:grupoId', r.generarAcumulativoGrupo);
router.get('/observador/:estudianteId', r.generarObservadorEstudiante);
router.get('/libro-final/:grupoId', r.generarLibroFinalGrupo);
router.get('/promovidos/:anioId', r.generarListadoPromovidos);
router.get('/fallas/:grupoId', r.generarInformeFallas);

module.exports = router;
