const Excusas = require('../models/Excusas');
const Usuario = require('../models/Usuario');
const AnioAcademico = require('../models/AnioAcademico');
const { filtroTenant } = require('../utils/tenant');
const { fechasExcusaValidas } = require('../utils/validacionesCoordinador');
const { registrarAuditoria } = require('../utils/auditoriaCoordinador');

const scope = (req, filtro = {}) => ({ ...filtro, ...filtroTenant(req) });
const esGestion = req => ['admin', 'rector', 'coordinador', 'secretaria'].includes(req.usuario.tipoPerfil);
const seleccionar = (body) => {
  const permitidos = ['docenteId', 'anioAcademicoId', 'fechaInicio', 'fechaFin', 'motivo', 'soporteDocumental', 'sinSoporte', 'observaciones'];
  return Object.fromEntries(permitidos.filter(x => body[x] !== undefined).map(x => [x, body[x]]));
};
const validar = async (req, datos, previo = {}) => {
  if (!fechasExcusaValidas(datos.fechaInicio || previo.fechaInicio, datos.fechaFin || previo.fechaFin))
    return 'La fecha final no puede ser anterior a la inicial.';
  const anio = datos.anioAcademicoId || previo.anioAcademicoId;
  const docente = datos.docenteId || previo.docenteId;
  if (!anio || !docente) return 'Selecciona un año académico y un docente.';
  const [anioOk, docenteOk] = await Promise.all([
    AnioAcademico.exists(scope(req, { _id: anio })),
    Usuario.exists(scope(req, { _id: docente, tipoPerfil: 'docente' }))
  ]);
  if (!anioOk) return 'El año académico no corresponde a esta institución.';
  if (!docenteOk) return 'El docente no pertenece a esta institución.';
  if (!String(datos.motivo ?? previo.motivo ?? '').trim()) return 'Debe indicar un motivo.';
  return null;
};

const obtenerExcusas = async (req, res) => {
  try {
    const filtro = scope(req);
    if (req.usuario.tipoPerfil === 'docente') filtro.docenteId = req.usuario.id;
    const excusas = await Excusas.find(filtro)
      .populate('anioAcademicoId', 'anio')
      .populate('docenteId', 'nombres apellidos documento')
      .populate('aprobadoPor', 'nombres apellidos')
      .sort({ fechaInicio: -1 }).limit(1000);
    res.json(excusas);
  } catch (e) { res.status(500).json({ mensaje: 'Error al obtener las excusas', error: e.message }); }
};
const obtenerExcusaPorId = async (req, res) => {
  try {
    const filtro = scope(req, { _id: req.params.id });
    if (req.usuario.tipoPerfil === 'docente') filtro.docenteId = req.usuario.id;
    const e = await Excusas.findOne(filtro).populate('anioAcademicoId', 'anio').populate('docenteId', 'nombres apellidos documento').populate('aprobadoPor', 'nombres apellidos');
    return e ? res.json(e) : res.status(404).json({ mensaje: 'Excusa no encontrada' });
  } catch (e) { res.status(400).json({ mensaje: e.message }); }
};
const crearExcusa = async (req, res) => {
  try {
    if (!req.usuario.institucionId) return res.status(403).json({ mensaje: 'Se requiere una institución.' });
    const datos = seleccionar(req.body);
    if (req.usuario.tipoPerfil === 'docente') datos.docenteId = req.usuario.id;
    else if (!esGestion(req)) return res.status(403).json({ mensaje: 'Acceso denegado.' });
    const error = await validar(req, datos);
    if (error) return res.status(400).json({ mensaje: error });
    const creada = await Excusas.create({ ...datos, institucionId: req.usuario.institucionId, estado: 'pendiente' });
    await registrarAuditoria(req, 'crear_excusa', 'Excusas', creada._id, `Excusa docente creada: ${datos.motivo}`);
    res.status(201).json(creada);
  } catch (e) { res.status(400).json({ mensaje: e.message }); }
};
const actualizarExcusa = async (req, res) => {
  try {
    const actual = await Excusas.findOne(scope(req, { _id: req.params.id }));
    if (!actual) return res.status(404).json({ mensaje: 'Excusa no encontrada' });
    if (!esGestion(req) && (req.usuario.tipoPerfil !== 'docente' || String(actual.docenteId) !== String(req.usuario.id) || actual.estado !== 'pendiente')) {
      return res.status(403).json({ mensaje: 'No tienes autorización para editar esta excusa.' });
    }
    const datos = seleccionar(req.body);
    if (!esGestion(req)) delete datos.docenteId;
    const error = await validar(req, datos, actual);
    if (error) return res.status(400).json({ mensaje: error });
    Object.assign(actual, datos);
    if (req.body.estado !== undefined) {
      if (!esGestion(req) || !['pendiente', 'aprobada', 'rechazada'].includes(req.body.estado))
        return res.status(403).json({ mensaje: 'No puedes cambiar el estado de esta excusa.' });
      actual.estado = req.body.estado;
      actual.aprobadoPor = req.body.estado === 'pendiente' ? undefined : req.usuario.id;
      actual.aprobadoEn = req.body.estado === 'pendiente' ? undefined : new Date();
    }
    await actual.save();
    await registrarAuditoria(req, 'actualizar_excusa', 'Excusas', actual._id, `Excusa actualizada: ${actual.estado}`);
    res.json(actual);
  } catch (e) { res.status(400).json({ mensaje: e.message }); }
};
const eliminarExcusa = async (req, res) => {
  try {
    if (!esGestion(req)) return res.status(403).json({ mensaje: 'Acceso denegado.' });
    const e = await Excusas.findOneAndDelete(scope(req, { _id: req.params.id }));
    if (!e) return res.status(404).json({ mensaje: 'Excusa no encontrada' });
    await registrarAuditoria(req, 'eliminar_excusa', 'Excusas', e._id, 'Excusa docente eliminada');
    return res.json({ mensaje: 'Excusa eliminada correctamente' });
  } catch (e) { res.status(400).json({ mensaje: e.message }); }
};
module.exports = { obtenerExcusas, obtenerExcusaPorId, crearExcusa, actualizarExcusa, eliminarExcusa };
