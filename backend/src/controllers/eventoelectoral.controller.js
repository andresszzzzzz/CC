const EventoElectoral = require('../models/EventoElectoral');
const Matricula = require('../models/Matricula');
const Grupo = require('../models/Grupo');
const Voto = require('../models/Voto');
const { filtroTenant } = require('../utils/tenant');
const { cargosValidos, candidatosValidos, fechasExcusaValidas } = require('../utils/validacionesCoordinador');
const { registrarAuditoria } = require('../utils/auditoriaCoordinador');

const filtro = (req, extras = {}) => ({ ...extras, ...filtroTenant(req) });
const campos = ['titulo', 'descripcion', 'fechaInicio', 'fechaFin', 'estado', 'cargosDisponibles', 'gruposHabilitados', 'candidatos', 'resultadosPublicos'];
const datosPermitidos = (body) => Object.fromEntries(campos.filter(k => body[k] !== undefined).map(k => [k, body[k]]));
const errorDatos = async (req, datos, actual = {}) => {
  const fin = datos.fechaFin ?? actual.fechaFin;
  const inicio = datos.fechaInicio ?? actual.fechaInicio;
  if (!fechasExcusaValidas(inicio, fin)) return 'Fechas de evento inválidas: el fin debe ser posterior al inicio.';
  const cargos = datos.cargosDisponibles ?? actual.cargosDisponibles;
  if (!cargosValidos(cargos)) return 'El evento requiere al menos un cargo válido y sin duplicados.';
  const candidatos = datos.candidatos ?? actual.candidatos ?? [];
  const candidatosSimples = candidatos.map(c => ({ estudianteId: typeof c.estudianteId === 'object' ? (c.estudianteId._id || c.estudianteId) : c.estudianteId, cargo: c.cargo }));
  if (!candidatosValidos(candidatosSimples, cargos)) return 'Los candidatos deben ser únicos por cargo y pertenecer a cargos disponibles.';
  if (datos.estado && !['programado', 'en_curso', 'finalizado'].includes(datos.estado)) return 'Estado electoral inválido.';
  const institucionId = req.usuario.institucionId;
  if (!institucionId) return 'No hay una institución asociada a la sesión.';
  const grupos = datos.gruposHabilitados ?? actual.gruposHabilitados ?? [];
  if (!Array.isArray(grupos)) return 'La lista de grupos debe ser un arreglo.';
  if (grupos.length) {
    const validos = await Grupo.countDocuments({ _id: { $in: grupos }, institucionId });
    if (validos !== new Set(grupos.map(String)).size) return 'Uno o varios grupos no pertenecen a la institución.';
  }
  if (candidatosSimples.length) {
    const ids = Array.from(new Set(candidatosSimples.map(c => String(c.estudianteId))));
    const inscritos = await Matricula.distinct('estudianteId', { institucionId, estudianteId: { $in: ids }, estado: 'activa' });
    if (inscritos.length !== ids.length) return 'Uno o más candidatos no tienen matrícula activa en esta institución.';
  }
  return null;
};
const poblar = (consulta) => consulta.populate('candidatos.estudianteId', 'nombres apellidos documento').populate('institucionId', 'nombre');

const obtenerEventosElectorales = async (req, res) => {
  try { res.json(await poblar(EventoElectoral.find(filtro(req)).sort({ fechaInicio: -1 }))); }
  catch (e) { res.status(500).json({ mensaje: e.message }); }
};
const obtenerEventoElectoralPorId = async (req, res) => {
  try {
    const e = await poblar(EventoElectoral.findOne(filtro(req, { _id: req.params.id })));
    return e ? res.json(e) : res.status(404).json({ mensaje: 'Evento electoral no encontrado' });
  } catch (e) { res.status(400).json({ mensaje: e.message }); }
};
const crearEventoElectoral = async (req, res) => {
  try {
    const datos = datosPermitidos(req.body);
    const error = await errorDatos(req, datos);
    if (error) return res.status(400).json({ mensaje: error });
    const creado = await EventoElectoral.create({ ...datos, institucionId: req.usuario.institucionId });
    await registrarAuditoria(req, 'crear_eleccion', 'EventoElectoral', creado._id, `Evento electoral creado: ${creado.titulo}`);
    res.status(201).json(creado);
  } catch (e) { res.status(400).json({ mensaje: e.message }); }
};
const actualizarEventoElectoral = async (req, res) => {
  try {
    const e = await EventoElectoral.findOne(filtro(req, { _id: req.params.id }));
    if (!e) return res.status(404).json({ mensaje: 'Evento electoral no encontrado' });
    const datos = datosPermitidos(req.body);
    const votos = await Voto.countDocuments({ eventoId: e._id });
    if (votos > 0 && (datos.candidatos !== undefined || datos.cargosDisponibles !== undefined || datos.gruposHabilitados !== undefined)) {
      return res.status(409).json({ mensaje: 'No es posible cambiar candidatos, cargos o grupos después de registrar votos.' });
    }
    const error = await errorDatos(req, datos, e);
    if (error) return res.status(400).json({ mensaje: error });
    Object.assign(e, datos);
    await e.save();
    await registrarAuditoria(req, 'actualizar_eleccion', 'EventoElectoral', e._id, `Evento electoral actualizado: ${e.titulo}`);
    res.json(e);
  } catch (e) { res.status(400).json({ mensaje: e.message }); }
};
const eliminarEventoElectoral = async (req, res) => {
  try {
    const e = await EventoElectoral.findOne(filtro(req, { _id: req.params.id }));
    if (!e) return res.status(404).json({ mensaje: 'Evento electoral no encontrado' });
    if (await Voto.exists({ eventoId: e._id })) return res.status(409).json({ mensaje: 'No se puede eliminar un evento que ya tiene votos.' });
    await e.deleteOne();
    await registrarAuditoria(req, 'eliminar_eleccion', 'EventoElectoral', e._id, `Evento electoral eliminado: ${e.titulo}`);
    res.json({ mensaje: 'Evento electoral eliminado correctamente' });
  } catch (e) { res.status(400).json({ mensaje: e.message }); }
};
module.exports = { obtenerEventosElectorales, obtenerEventoElectoralPorId, crearEventoElectoral, actualizarEventoElectoral, eliminarEventoElectoral };
