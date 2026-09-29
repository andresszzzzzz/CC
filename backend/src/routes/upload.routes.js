const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth');
const { permitirRoles } = require('../middlewares/roleAuth');
const { crearUploader } = require('../middlewares/upload');
const upload = require('../controllers/upload.controller');

const subidaUsuarios = crearUploader('usuarios');
const subidaInstituciones = crearUploader('instituciones');

router.use(verificarToken);

// El archivo se envía como multipart/form-data en el campo "imagen"
router.post('/usuarios/:id/foto', subidaUsuarios.single('imagen'), upload.subirFotoUsuario);
router.post(
  '/instituciones/:id/:tipo',
  permitirRoles('admin', 'rector'),
  subidaInstituciones.single('imagen'),
  upload.subirImagenInstitucion
);

module.exports = router;
