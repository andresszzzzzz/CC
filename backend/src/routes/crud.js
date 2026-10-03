const express = require('express');
const mongoose = require('mongoose');
const { verificarToken } = require('../middlewares/auth');
const { permitirRoles } = require('../middlewares/roleAuth');

// Busca un handler en el controlador y falla al arrancar (con un mensaje claro)
// si el nombre no existe, en vez de romper más tarde con un error confuso.
const handler = (controlador, nombre) => {
  if (typeof controlador[nombre] !== 'function') {
    throw new Error(`[routes] El controlador no exporta la función "${nombre}"`);
  }
  return controlador[nombre];
};

// Crea un router CRUD estándar:
//   GET    /        -> nombres.listar
//   GET    /:id     -> nombres.obtener
//   POST   /        -> nombres.crear
//   PUT    /:id     -> nombres.actualizar
//   DELETE /:id     -> nombres.eliminar
// Las acciones que no se declaren en "nombres" simplemente no se registran.
//
// opciones.lectura / opciones.escritura: arreglo de roles permitidos.
//   null = cualquier usuario autenticado.
// opciones.permisos: sobreescribe roles de una acción concreta
//   (listar, obtener, crear, actualizar, eliminar).
// opciones.extras(router, guarda): registra rutas específicas (se montan
//   ANTES de "/:id" para que Express no las confunda con un id).
// opciones.modelo: modelo de Mongoose con campo institucionId. Si se indica,
//   toda ruta con ":id" (GET/PUT/DELETE y extras) responde 404 cuando el
//   registro pertenece a OTRO colegio. Sin esto, findById() permitiría leer o
//   modificar datos ajenos conociendo el id.
const crearRouterCrud = (controlador, nombres, opciones = {}) => {
  const { lectura = null, escritura = null, permisos = {}, extras, modelo = null } = opciones;
  const router = express.Router();

  router.use(verificarToken);

  // Multi-tenant: quien pertenece a un colegio (secretaria, admin, rector...)
  // solo ve y escribe datos de SU colegio, sin importar qué institucionId
  // mande el navegador. dirNucleo no tiene institucionId, así que no se toca.
  router.use((req, res, next) => {
    const propia = req.usuario?.institucionId;
    if (propia) {
      req.query.institucionId = String(propia);
      if (req.body && typeof req.body === 'object' && !Array.isArray(req.body) && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
        req.body.institucionId = String(propia);
      }
    }
    next();
  });

  // Rutas del tipo /institucion/:institucionId — un usuario de colegio solo
  // puede consultar la suya (el filtro de query de arriba no cubre params).
  router.param('institucionId', (req, res, next, valor) => {
    const propia = req.usuario?.institucionId;
    if (propia && String(valor) !== String(propia)) {
      return res.status(403).json({ mensaje: 'No puedes consultar datos de otra institución.' });
    }
    next();
  });

  // Rutas con :id — el registro debe pertenecer al colegio del usuario.
  if (modelo) {
    router.param('id', async (req, res, next, id) => {
      const propia = req.usuario?.institucionId;
      if (!propia) return next(); // dirNucleo u otros sin colegio: sin cambios
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ mensaje: 'Identificador inválido.' });
      }
      try {
        const existe = await modelo.exists({ _id: id, institucionId: propia });
        if (!existe) return res.status(404).json({ mensaje: 'Registro no encontrado.' });
        next();
      } catch (error) {
        next(error);
      }
    });
  }

  const guarda = (accion) => {
    const esLectura = accion === 'listar' || accion === 'obtener';
    const roles = accion in permisos ? permisos[accion] : (esLectura ? lectura : escritura);
    return roles ? [permitirRoles(...roles)] : [];
  };

  if (extras) extras(router, guarda);

  if (nombres.listar) router.get('/', ...guarda('listar'), handler(controlador, nombres.listar));
  if (nombres.obtener) router.get('/:id', ...guarda('obtener'), handler(controlador, nombres.obtener));
  if (nombres.crear) router.post('/', ...guarda('crear'), handler(controlador, nombres.crear));
  if (nombres.actualizar) router.put('/:id', ...guarda('actualizar'), handler(controlador, nombres.actualizar));
  if (nombres.eliminar) router.delete('/:id', ...guarda('eliminar'), handler(controlador, nombres.eliminar));

  return router;
};

module.exports = { crearRouterCrud, handler };
