const Bitacora = require('../models/Bitacora');

// Auditoría de acciones administrativas. Nunca bloquea una operación que ya se completó.
const registrarAuditoria = async (req, accion, coleccion, registroId, detalle) => {
  if (!req.usuario?.institucionId) return;
  try {
    await Bitacora.create({
      institucionId: req.usuario.institucionId,
      usuarioId: req.usuario.id,
      accion,
      coleccion,
      registroId,
      detalle,
      metodo: req.method,
      ruta: req.originalUrl,
      direccionIp: req.ip
    });
  } catch (error) {
    console.error('No se pudo registrar la auditoría:', error.message);
  }
};
module.exports = { registrarAuditoria };
