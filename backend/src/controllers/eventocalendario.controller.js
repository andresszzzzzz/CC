const EventoCalendario = require('../models/EventoCalendario');
const AnioAcademico = require('../models/AnioAcademico');
const { filtroTenant } = require('../utils/tenant');
const { registrarAuditoria } = require('../utils/auditoriaCoordinador');

const campos = ['titulo', 'descripcion', 'fechaInicio', 'fechaFin', 'tipo', 'lugar', 'anioAcademicoId'];
const extraerCampos = (body) => Object.fromEntries(campos.filter((campo) => body[campo] !== undefined).map((campo) => [campo, body[campo]]));

const validar = async (req, datos, previo = {}) => {
  const inicio = new Date(datos.fechaInicio ?? previo.fechaInicio);
  const fin = new Date(datos.fechaFin ?? previo.fechaFin);
  if (!Number.isFinite(inicio.getTime()) || !Number.isFinite(fin.getTime()) || fin < inicio) {
    return 'La fecha final debe ser igual o posterior al inicio y ambas fechas deben ser válidas.';
  }
  const anioId = datos.anioAcademicoId ?? previo.anioAcademicoId;
  if (anioId) {
    const existe = await AnioAcademico.exists({ _id: anioId, ...filtroTenant(req) });
    if (!existe) return 'El año académico no pertenece a esta institución.';
  }
  return null;
};

const obtenerEventos = async (req, res) => {
  try {
    res.json(await EventoCalendario.find(filtroTenant(req)).sort({ fechaInicio: 1 }).limit(1000));
  } catch (e) { res.status(500).json({ mensaje: e.message }); }
};
const obtenerEvento = async (req, res) => {
  try {
    const evento = await EventoCalendario.findOne({ _id: req.params.id, ...filtroTenant(req) });
    return evento ? res.json(evento) : res.status(404).json({ mensaje: 'Actividad no encontrada' });
  } catch (e) { res.status(400).json({ mensaje: e.message }); }
};
const crearEvento = async (req, res) => {
  try {
    const datos = extraerCampos(req.body);
    const error = await validar(req, datos);
    if (error) return res.status(400).json({ mensaje: error });
    const creado = await EventoCalendario.create({
      ...datos, institucionId: req.usuario.institucionId, creadoPor: req.usuario.id
    });
    await registrarAuditoria(req, 'crear_actividad', 'EventoCalendario', creado._id, `Nueva actividad: ${creado.titulo}`);
    res.status(201).json(creado);
  } catch (e) { res.status(400).json({ mensaje: e.message }); }
};
const actualizarEvento = async (req, res) => {
  try {
    const actual = await EventoCalendario.findOne({ _id: req.params.id, ...filtroTenant(req) });
    if (!actual) return res.status(404).json({ mensaje: 'Actividad no encontrada' });
    const datos = extraerCampos(req.body);
    const error = await validar(req, datos, actual);
    if (error) return res.status(400).json({ mensaje: error });
    Object.assign(actual, datos);
    await actual.save();
    await registrarAuditoria(req, 'actualizar_actividad', 'EventoCalendario', actual._id, `Actividad actualizada: ${actual.titulo}`);
    res.json(actual);
  } catch (e) { res.status(400).json({ mensaje: e.message }); }
};
const eliminarEvento = async (req, res) => {
  try {
    const eliminado = await EventoCalendario.findOneAndDelete({ _id: req.params.id, ...filtroTenant(req) });
    if (!eliminado) return res.status(404).json({ mensaje: 'Actividad no encontrada' });
    await registrarAuditoria(req, 'eliminar_actividad', 'EventoCalendario', eliminado._id, `Actividad eliminada: ${eliminado.titulo}`);
    return res.json({ mensaje: 'Actividad eliminada' });
  } catch (e) { res.status(400).json({ mensaje: e.message }); }
};
module.exports = { obtenerEventos, obtenerEvento, crearEvento, actualizarEvento, eliminarEvento };
