// Aislamiento por colegio (multi-tenant) para los listados.
//
// La institución sale SIEMPRE del token (req.usuario.institucionId), nunca del
// navegador. Quien no pertenece a un colegio (p. ej. dirNucleo) no tiene
// institucionId y recibe filtro vacío: esos roles tienen sus propias rutas
// (/api/nucleo/*) y ya están restringidos por rol.
//
// Uso:  Modelo.find(filtroTenant(req))   o   Modelo.find({ ...filtroTenant(req), estado: 'activo' })
const filtroTenant = (req) =>
  req.usuario && req.usuario.institucionId ? { institucionId: req.usuario.institucionId } : {};

module.exports = { filtroTenant };
