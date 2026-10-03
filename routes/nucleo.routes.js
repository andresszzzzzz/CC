const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth');
const { permitirRoles } = require('../middlewares/roleAuth');
const nucleo = require('../controllers/nucleo.controller');

// Todo /api/nucleo/* es exclusivo de la Dirección de Núcleo
router.use(verificarToken, permitirRoles('dirNucleo'));

// Gestión de colegios del núcleo
router.get('/instituciones', nucleo.listarInstituciones);
router.post('/instituciones', nucleo.crearInstitucion);
router.post('/instituciones/:id/admin', nucleo.crearAdminInstitucion);

// Cuentas de secretaría de los colegios del núcleo
router.get('/secretarias', nucleo.listarSecretarias);
router.post('/secretarias', nucleo.crearSecretaria);

// Solicitudes de auto-registro
router.get('/solicitudes', nucleo.listarSolicitudes);
router.put('/solicitudes/:id/aprobar', nucleo.aprobarSolicitud);
router.put('/solicitudes/:id/rechazar', nucleo.rechazarSolicitud);

// Estadísticas y reportes
router.get('/estadisticas', nucleo.estadisticas);
router.get('/estadisticas/:instId', nucleo.estadisticasPorInstitucion);
router.get('/comparativo', nucleo.comparativo);
router.get('/reportes/:tipo', nucleo.reportes);

router.put('/instituciones/:id', nucleo.actualizarInstitucion);
router.put('/secretarias/:id', nucleo.actualizarSecretaria);

module.exports = router;
