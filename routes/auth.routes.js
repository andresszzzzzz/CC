const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth');
const auth = require('../controllers/auth.controller');

// Públicas (el límite de intentos de /login está en server.js)
router.post('/login', auth.login);
router.post('/recuperar-password', auth.recuperarPassword);

// Requieren sesión
router.post('/logout', verificarToken, auth.logout);
router.get('/me', verificarToken, auth.me);
router.get('/cronograma', verificarToken, auth.cronograma);
router.post('/cambiar-password', verificarToken, auth.cambiarPassword);

module.exports = router;
