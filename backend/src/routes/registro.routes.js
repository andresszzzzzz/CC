const express = require('express');
const router = express.Router();
const registro = require('../controllers/registro.controller');

// Auto-registro público de colegios (no requiere token)
router.get('/nucleos', registro.listarNucleos);
router.post('/solicitud', registro.crearSolicitud);
router.get('/solicitud/:id', registro.consultarSolicitud);

module.exports = router;
