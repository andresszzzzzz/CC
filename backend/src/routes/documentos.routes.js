const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth');
const documentos = require('../controllers/documentos.controller');

// El controlador valida los roles permitidos por dentro.
router.use(verificarToken);

router.get('/constancia/:usuarioId', documentos.constancia);
router.get('/certificado/:usuarioId', documentos.certificado);
router.get('/carnet/:usuarioId', documentos.carnet);

module.exports = router;
