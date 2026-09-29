// Grupos de roles reutilizables en las rutas.
// Si quieres cambiar quién puede hacer qué, este es el primer sitio a tocar.
  const GESTION = ['admin', 'rector', 'coordinador', 'secretaria'];
const GESTION_Y_DOCENTE = [...GESTION, 'docente'];

module.exports = { GESTION, GESTION_Y_DOCENTE };
