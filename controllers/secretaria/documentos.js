// Datos CRUDOS para armar boletines, certificados, constancias y actas en el cliente.
// El desempeño y la nota final los calcula el cliente con la configuración vigente.
const AnioAcademico = require('../../models/AnioAcademico');
const Matricula = require('../../models/Matricula');
const CargaAcademica = require('../../models/CargaAcademica');
const Calificacion = require('../../models/Calificacion');
const Grupo = require('../../models/Grupo');
const Jornada = require('../../models/Jornada');
const { ESTADOS_ANIO } = require('../../config/constants');
const { ruta, ErrorHttp, institucionDe, validarId } = require('./helpers');

const redondear = (n) => Math.round(n * 100) / 100;

// Resuelve año (y periodo) a partir de periodoId; si no hay, usa el año actual.
const resolverContexto = async (institucionId, periodoId, anioAcademicoId) => {
  let anio = null;
  let periodo = null;
  if (periodoId) {
    validarId(periodoId, 'periodoId');
    anio = await AnioAcademico.findOne({ institucionId, 'cronograma.periodos._id': periodoId });
    if (!anio) throw new ErrorHttp(404, 'No se encontró el periodo.');
    periodo = anio.cronograma.periodos.id(periodoId);
  } else if (anioAcademicoId) {
    validarId(anioAcademicoId, 'anioAcademicoId');
    anio = await AnioAcademico.findOne({ _id: anioAcademicoId, institucionId });
  } else {
    anio = await AnioAcademico.findOne({ institucionId, estado: ESTADOS_ANIO.ACTIVO });
  }
  if (!anio) throw new ErrorHttp(404, 'No hay un año escolar actual. Márcalo en "Año escolar".');
  return { anio, periodo };
};

// Arma un documento por matrícula usando cargas y notas ya consultadas (evita N consultas).
const armar = ({ matricula, grupo, jornadaNombre, anio, periodo, cargas, notasEst }) => {
  const est = matricula.estudianteId;
  const porAsig = new Map();
  notasEst.forEach((c) => {
    const k = String(c.asignaturaId);
    if (!porAsig.has(k)) porAsig.set(k, []);
    porAsig.get(k).push(c);
  });

  const asignaturas = cargas
    .map((carga) => {
      const asig = carga.asignaturaId;
      const regs = porAsig.get(String(asig._id)) || [];
      const efectiva = (c) => (typeof c.nota === 'number' ? c.nota : null);
      const notasPorPeriodo = regs.filter((c) => efectiva(c) != null).map((c) => ({ orden: c.periodo, nota: c.nota })).sort((a, b) => a.orden - b.orden);
      let nota = null;
      let observacion = '';
      if (periodo) {
        const reg = regs.find((c) => c.periodo === periodo.numero);
        nota = reg && efectiva(reg) != null ? reg.nota : null;
        observacion = (reg && reg.observacion) || '';
      } else if (notasPorPeriodo.length) {
        nota = redondear(notasPorPeriodo.reduce((s, x) => s + x.nota, 0) / notasPorPeriodo.length);
      }
      return {
        area: asig.areaId ? asig.areaId.nombre : 'General',
        areaOrden: asig.areaId ? asig.areaId.orden : 999,
        orden: asig.orden || 0,
        nombre: asig.nombre,
        ih: carga.horasSemanales || asig.intensidadHoraria || null,
        nota, observacion, notasPorPeriodo
      };
    })
    .sort((a, b) => a.areaOrden - b.areaOrden || a.orden - b.orden || a.nombre.localeCompare(b.nombre))
    .map(({ areaOrden, orden, ...resto }) => resto);

  return {
    estudiante: {
      _id: String(est._id),
      nombre: `${est.nombres} ${est.apellidos}`.trim(),
      documento: est.documento || '',
      tipoDocumento: est.tipoDocumento || '',
      grado: grupo.grado,
      grupo: grupo.nombre,
      jornada: jornadaNombre || grupo.jornada || '',
      fotoUrl: est.foto || ''
    },
    anio: anio.anio,
    periodo: periodo ? periodo.nombre : undefined,
    asignaturas,
    observaciones: ''
  };
};

const POBLAR_CARGA = { path: 'asignaturaId', select: 'nombre orden intensidadHoraria areaId', populate: { path: 'areaId', select: 'nombre orden' } };

const cargarGrupo = async ({ institucionId, anio, periodo, grupo, estudianteId }) => {
  const filtroMat = { institucionId, anioAcademicoId: anio._id, grupoId: grupo._id, estado: 'activa' };
  if (estudianteId) filtroMat.estudianteId = estudianteId;
  const [matriculas, cargas] = await Promise.all([
    Matricula.find(filtroMat).populate('estudianteId', 'nombres apellidos documento tipoDocumento foto').populate('jornadaId', 'nombre'),
    CargaAcademica.find({ institucionId, anioAcademicoId: anio._id, grupoId: grupo._id, estado: 'activo' }).populate(POBLAR_CARGA)
  ]);
  const cargasValidas = cargas.filter((c) => c.asignaturaId);
  const ids = matriculas.map((m) => m.estudianteId._id);
  const filtroNotas = { institucionId, anioAcademicoId: anio._id, estudianteId: { $in: ids } };
  const notas = ids.length ? await Calificacion.find(filtroNotas).select('estudianteId asignaturaId periodo nota observacion') : [];
  const porEst = new Map();
  notas.forEach((n) => {
    const k = String(n.estudianteId);
    if (!porEst.has(k)) porEst.set(k, []);
    porEst.get(k).push(n);
  });
  return matriculas
    .map((m) => armar({
      matricula: m, grupo, jornadaNombre: m.jornadaId && m.jornadaId.nombre, anio, periodo,
      cargas: cargasValidas, notasEst: porEst.get(String(m.estudianteId._id)) || []
    }))
    .sort((a, b) => a.estudiante.nombre.localeCompare(b.estudiante.nombre));
};

const documentos = {
  // GET /documentos/datos?tipo=&estudianteId=&periodoId=
  datos: ruta(async (req, res) => {
    const institucionId = institucionDe(req);
    const { estudianteId, periodoId, anioAcademicoId } = req.query;
    validarId(estudianteId, 'estudianteId');
    const { anio, periodo } = await resolverContexto(institucionId, periodoId, anioAcademicoId);

    const matricula = await Matricula.findOne({
      institucionId, estudianteId, anioAcademicoId: anio._id, estado: { $in: ['activa', 'graduado', 'retirada', 'trasladada'] }
    }).sort({ createdAt: -1 });
    if (!matricula) throw new ErrorHttp(404, `El estudiante no tiene matrícula en el año ${anio.anio}.`);
    const grupo = await Grupo.findOne({ _id: matricula.grupoId, institucionId });
    if (!grupo) throw new ErrorHttp(404, 'No se encontró el grupo del estudiante.');

    // Reutiliza el armado por grupo, filtrando al estudiante pedido (incluye matrículas no activas)
    const [m, cargas] = await Promise.all([
      Matricula.findById(matricula._id).populate('estudianteId', 'nombres apellidos documento tipoDocumento foto').populate('jornadaId', 'nombre'),
      CargaAcademica.find({ institucionId, anioAcademicoId: anio._id, grupoId: grupo._id, estado: 'activo' }).populate(POBLAR_CARGA)
    ]);
    const notas = await Calificacion.find({ institucionId, anioAcademicoId: anio._id, estudianteId }).select('asignaturaId periodo nota observacion');
    res.json(armar({
      matricula: m, grupo, jornadaNombre: m.jornadaId && m.jornadaId.nombre, anio, periodo,
      cargas: cargas.filter((c) => c.asignaturaId), notasEst: notas
    }));
  }),

  // GET /documentos/datos-grupo?tipo=&grupoId=&periodoId=
  datosGrupo: ruta(async (req, res) => {
    const institucionId = institucionDe(req);
    const { grupoId, periodoId } = req.query;
    validarId(grupoId, 'grupoId');
    const grupo = await Grupo.findOne({ _id: grupoId, institucionId });
    if (!grupo) throw new ErrorHttp(404, 'No se encontró el grupo.');
    const { anio, periodo } = await resolverContexto(institucionId, periodoId, grupo.anioAcademicoId);
    if (String(grupo.anioAcademicoId) !== String(anio._id)) throw new ErrorHttp(400, 'El periodo elegido es de otro año escolar distinto al del grupo.');
    const lista = await cargarGrupo({ institucionId, anio, periodo, grupo });
    if (!lista.length) throw new ErrorHttp(404, 'El grupo no tiene estudiantes matriculados.');
    res.json(lista);
  })
};

module.exports = { documentos };
