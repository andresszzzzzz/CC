// Asignaturas y asignación académica (CargaAcademica: docente + asignatura + grupo + año).
const Asignatura = require('../../models/Asignatura');
const Area = require('../../models/Area');
const CargaAcademica = require('../../models/CargaAcademica');
const Calificacion = require('../../models/Calificacion');
const Grupo = require('../../models/Grupo');
const Usuario = require('../../models/Usuario');
const AnioAcademico = require('../../models/AnioAcademico');
const { crearCrud, ruta, ErrorHttp, institucionDe, validarId, elegir, aId } = require('./helpers');

// ---------- Asignaturas ----------
const serializarAsignatura = (a) => {
  const o = a.toJSON();
  o.areaNombre = a.areaId && a.areaId.nombre ? a.areaId.nombre : '';
  o.areaId = aId(a.areaId);
  return o;
};

const asignaturas = crearCrud(Asignatura, {
  nombre: 'asignatura',
  campos: ['areaId', 'nombre', 'abreviatura', 'intensidadHoraria', 'porcentaje', 'orden', 'estado'],
  filtros: ['estado', 'areaId'],
  poblar: { path: 'areaId', select: 'nombre' },
  orden: { orden: 1, nombre: 1 },
  serializar: serializarAsignatura,
  validar: async (d, institucionId) => {
    if (d.areaId) {
      const area = await Area.findOne({ _id: d.areaId, institucionId }).select('_id');
      if (!area) throw new ErrorHttp(400, 'El área elegida no existe en tu institución.');
    }
  },
  enUso: async (doc, institucionId) => {
    const [cargas, notas] = await Promise.all([
      CargaAcademica.countDocuments({ institucionId, asignaturaId: doc._id }),
      Calificacion.countDocuments({ institucionId, asignaturaId: doc._id })
    ]);
    return cargas + notas;
  }
});

// ---------- Asignaciones ----------
const POBLAR_CARGA = [
  { path: 'anioAcademicoId', select: 'anio' },
  { path: 'grupoId', select: 'nombre grado' },
  { path: 'asignaturaId', select: 'nombre' },
  { path: 'docenteId', select: 'nombres apellidos' }
];

const serializarCarga = (c) => ({
  _id: String(c._id),
  institucionId: String(c.institucionId),
  anioAcademicoId: aId(c.anioAcademicoId),
  anio: c.anioAcademicoId && c.anioAcademicoId.anio,
  grupoId: aId(c.grupoId),
  grupoNombre: c.grupoId && c.grupoId.nombre,
  grado: c.grupoId && c.grupoId.grado,
  asignaturaId: aId(c.asignaturaId),
  asignaturaNombre: c.asignaturaId && c.asignaturaId.nombre,
  docenteId: aId(c.docenteId),
  docenteNombre: c.docenteId ? `${c.docenteId.nombres} ${c.docenteId.apellidos}`.trim() : '',
  intensidadHoraria: c.horasSemanales,
  estado: c.estado
});

// Verifica que año, grupo, asignatura y docente pertenezcan a la institución y sean coherentes.
const validarCarga = async (d, institucionId) => {
  const [anio, grupo, asignatura, docente] = await Promise.all([
    AnioAcademico.findOne({ _id: d.anioAcademicoId, institucionId }).select('_id'),
    Grupo.findOne({ _id: d.grupoId, institucionId }).select('anioAcademicoId'),
    Asignatura.findOne({ _id: d.asignaturaId, institucionId }).select('_id'),
    Usuario.findOne({ _id: d.docenteId, institucionId }).select('tipoPerfil roles estado')
  ]);
  if (!anio) throw new ErrorHttp(400, 'El año escolar no existe en tu institución.');
  if (!grupo) throw new ErrorHttp(400, 'El grupo no existe en tu institución.');
  if (String(grupo.anioAcademicoId) !== String(d.anioAcademicoId)) {
    throw new ErrorHttp(400, 'El grupo elegido pertenece a otro año escolar.');
  }
  if (!asignatura) throw new ErrorHttp(400, 'La asignatura no existe en tu institución.');
  if (!docente || (docente.tipoPerfil !== 'docente' && !(docente.roles || []).includes('docente'))) {
    throw new ErrorHttp(400, 'La persona elegida no es docente de tu institución.');
  }
  if (docente.estado === 'inactivo') throw new ErrorHttp(400, 'El docente está inactivo.');
};

const datosCarga = (b) => {
  const d = elegir(b, ['anioAcademicoId', 'grupoId', 'asignaturaId', 'docenteId', 'estado']);
  if (b.intensidadHoraria !== undefined) d.horasSemanales = Number(b.intensidadHoraria) || 0;
  return d;
};

const asignaciones = {
  listar: ruta(async (req, res) => {
    const filtro = { institucionId: institucionDe(req) };
    ['anioAcademicoId', 'grupoId', 'asignaturaId', 'docenteId', 'estado'].forEach((k) => { if (req.query[k]) filtro[k] = req.query[k]; });
    const docs = await CargaAcademica.find(filtro).populate(POBLAR_CARGA).sort({ createdAt: -1 });
    res.json(docs.map(serializarCarga));
  }),

  obtener: ruta(async (req, res) => {
    validarId(req.params.id);
    const c = await CargaAcademica.findOne({ _id: req.params.id, institucionId: institucionDe(req) }).populate(POBLAR_CARGA);
    if (!c) throw new ErrorHttp(404, 'No se encontró la asignación.');
    res.json(serializarCarga(c));
  }),

  crear: ruta(async (req, res) => {
    const institucionId = institucionDe(req);
    const d = datosCarga(req.body);
    await validarCarga(d, institucionId);
    const c = await CargaAcademica.create({ ...d, institucionId });
    res.status(201).json(serializarCarga(await CargaAcademica.findById(c._id).populate(POBLAR_CARGA)));
  }),

  actualizar: ruta(async (req, res) => {
    const institucionId = institucionDe(req);
    validarId(req.params.id);
    const c = await CargaAcademica.findOne({ _id: req.params.id, institucionId });
    if (!c) throw new ErrorHttp(404, 'No se encontró la asignación.');
    const d = datosCarga(req.body);
    await validarCarga({ ...c.toObject(), ...d }, institucionId);
    c.set(d);
    await c.save();
    res.json(serializarCarga(await CargaAcademica.findById(c._id).populate(POBLAR_CARGA)));
  }),

  eliminar: ruta(async (req, res) => {
    const institucionId = institucionDe(req);
    validarId(req.params.id);
    const c = await CargaAcademica.findOne({ _id: req.params.id, institucionId });
    if (!c) throw new ErrorHttp(404, 'No se encontró la asignación.');
    const notas = await Calificacion.countDocuments({
      institucionId, anioAcademicoId: c.anioAcademicoId, grupoId: c.grupoId, asignaturaId: c.asignaturaId
    });
    if (notas > 0) throw new ErrorHttp(409, 'Esta asignación ya tiene notas. Márcala como inactiva para conservar el historial.');
    await c.deleteOne();
    res.json({ mensaje: 'Asignación eliminada.' });
  })
};

module.exports = { asignaturas, asignaciones };
