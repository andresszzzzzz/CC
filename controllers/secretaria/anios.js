// Años escolares y periodos (los periodos viven dentro de AnioAcademico.cronograma.periodos).
const AnioAcademico = require('../../models/AnioAcademico');
const Grupo = require('../../models/Grupo');
const Matricula = require('../../models/Matricula');
const Calificacion = require('../../models/Calificacion');
const { ESTADOS_ANIO } = require('../../config/constants');
const { ruta, ErrorHttp, institucionDe, validarId, elegir, fechaISO, SiNo } = require('./helpers');

// ---------- Años ----------
// "Año actual" = estado 'activo' (es lo que ya usa el resto del sistema).
// "Estado" que ve Secretaría (activo/inactivo) = campo habilitado.
const serializarAnio = (a) => ({
  _id: String(a._id),
  institucionId: String(a.institucionId),
  anio: a.anio,
  fechaInicio: fechaISO(a.fechaInicio),
  fechaFin: fechaISO(a.fechaFin),
  numeroPeriodos: a.cronograma && a.cronograma.periodos && a.cronograma.periodos.length
    ? a.cronograma.periodos.length
    : (a.configuracion && a.configuracion.numeroPeriodos) || 0,
  esActual: SiNo(a.estado === ESTADOS_ANIO.ACTIVO),
  estado: a.habilitado === false ? 'inactivo' : 'activo',
  estadoCiclo: a.estado
});

// El modelo de notas (Calificacion.periodo) admite periodos del 1 al 5.
const MAX_PERIODOS = 5;
const validarNumeroPeriodos = (n) => {
  if (!Number.isInteger(n) || n < 1 || n > MAX_PERIODOS) {
    throw new ErrorHttp(400, `El sistema admite entre 1 y ${MAX_PERIODOS} periodos por año.`);
  }
};

const validarFechas = (inicio, fin) => {
  if (inicio && fin && new Date(fin) <= new Date(inicio)) {
    throw new ErrorHttp(400, 'La fecha de fin debe ser posterior a la de inicio.');
  }
};

// Deja UN solo año actual por institución.
const hacerActual = async (institucionId, anioId) => {
  await AnioAcademico.updateMany(
    { institucionId, estado: ESTADOS_ANIO.ACTIVO, _id: { $ne: anioId } },
    { $set: { estado: ESTADOS_ANIO.INACTIVO } }
  );
  await AnioAcademico.updateOne({ _id: anioId, institucionId }, { $set: { estado: ESTADOS_ANIO.ACTIVO, habilitado: true } });
};

const aniosApi = {
  listar: ruta(async (req, res) => {
    const docs = await AnioAcademico.find({ institucionId: institucionDe(req) }).sort({ anio: -1 });
    res.json(docs.map(serializarAnio));
  }),

  obtener: ruta(async (req, res) => {
    validarId(req.params.id);
    const a = await AnioAcademico.findOne({ _id: req.params.id, institucionId: institucionDe(req) });
    if (!a) throw new ErrorHttp(404, 'No se encontró el año escolar.');
    res.json(serializarAnio(a));
  }),

  crear: ruta(async (req, res) => {
    const institucionId = institucionDe(req);
    const b = req.body;
    const anio = Number(b.anio);
    if (!anio || anio < 2000 || anio > 2100) throw new ErrorHttp(400, 'Escribe un año válido (ej. 2027).');
    validarFechas(b.fechaInicio, b.fechaFin);
    const numeroPeriodos = Number(b.numeroPeriodos) || 4;
    validarNumeroPeriodos(numeroPeriodos);
    const doc = await AnioAcademico.create({
      institucionId, anio,
      fechaInicio: b.fechaInicio || undefined,
      fechaFin: b.fechaFin || undefined,
      habilitado: b.estado !== 'inactivo',
      configuracion: { numeroPeriodos }
    });
    if (b.esActual === 'SI') await hacerActual(institucionId, doc._id);
    res.status(201).json(serializarAnio(await AnioAcademico.findById(doc._id)));
  }),

  actualizar: ruta(async (req, res) => {
    const institucionId = institucionDe(req);
    validarId(req.params.id);
    const a = await AnioAcademico.findOne({ _id: req.params.id, institucionId });
    if (!a) throw new ErrorHttp(404, 'No se encontró el año escolar.');
    const b = req.body;
    const inicio = b.fechaInicio !== undefined ? b.fechaInicio : a.fechaInicio;
    const fin = b.fechaFin !== undefined ? b.fechaFin : a.fechaFin;
    validarFechas(inicio, fin);
    if (b.anio !== undefined) a.anio = Number(b.anio);
    if (b.fechaInicio !== undefined) a.fechaInicio = b.fechaInicio || undefined;
    if (b.fechaFin !== undefined) a.fechaFin = b.fechaFin || undefined;
    if (b.numeroPeriodos !== undefined) {
      validarNumeroPeriodos(Number(b.numeroPeriodos));
      a.configuracion.numeroPeriodos = Number(b.numeroPeriodos);
    }
    if (b.estado !== undefined) a.habilitado = b.estado !== 'inactivo';
    await a.save();
    if (b.esActual === 'SI') await hacerActual(institucionId, a._id);
    res.json(serializarAnio(await AnioAcademico.findById(a._id)));
  }),

  marcarActual: ruta(async (req, res) => {
    const institucionId = institucionDe(req);
    validarId(req.params.id);
    const a = await AnioAcademico.findOne({ _id: req.params.id, institucionId });
    if (!a) throw new ErrorHttp(404, 'No se encontró el año escolar.');
    if (a.estado === ESTADOS_ANIO.FINALIZADO) throw new ErrorHttp(409, 'Un año finalizado no puede volver a ser el año actual.');
    await hacerActual(institucionId, a._id);
    res.json(serializarAnio(await AnioAcademico.findById(a._id)));
  }),

  eliminar: ruta(async (req, res) => {
    const institucionId = institucionDe(req);
    validarId(req.params.id);
    const a = await AnioAcademico.findOne({ _id: req.params.id, institucionId });
    if (!a) throw new ErrorHttp(404, 'No se encontró el año escolar.');
    const [grupos, matriculas, notas] = await Promise.all([
      Grupo.countDocuments({ institucionId, anioAcademicoId: a._id }),
      Matricula.countDocuments({ institucionId, anioAcademicoId: a._id }),
      Calificacion.countDocuments({ institucionId, anioAcademicoId: a._id })
    ]);
    if (grupos + matriculas + notas > 0) {
      throw new ErrorHttp(409, 'Este año ya tiene grupos, matrículas o notas. No se elimina para conservar el historial; desactívalo.');
    }
    await a.deleteOne();
    res.json({ mensaje: 'Año eliminado.' });
  })
};

// ---------- Periodos ----------
const serializarPeriodo = (anio, p) => ({
  _id: String(p._id),
  institucionId: String(anio.institucionId),
  anioAcademicoId: String(anio._id),
  anio: anio.anio,
  nombre: p.nombre,
  orden: p.numero,
  fechaInicio: fechaISO(p.inicio),
  fechaFin: fechaISO(p.fin),
  estado: p.estado === 'cerrado' ? 'cerrado' : 'abierto',
  usaEnNotaFinal: SiNo(p.usaEnNotaFinal !== false),
  porcentaje: p.porcentaje || 0
});

const datosPeriodo = (b) => {
  const d = {};
  if (b.nombre !== undefined) d.nombre = String(b.nombre).trim();
  if (b.orden !== undefined) d.numero = Number(b.orden);
  if (b.fechaInicio !== undefined) d.inicio = b.fechaInicio || null;
  if (b.fechaFin !== undefined) d.fin = b.fechaFin || null;
  if (b.estado !== undefined) d.estado = b.estado === 'cerrado' ? 'cerrado' : 'abierto';
  if (b.usaEnNotaFinal !== undefined) d.usaEnNotaFinal = b.usaEnNotaFinal === 'SI' || b.usaEnNotaFinal === true;
  if (b.porcentaje !== undefined) d.porcentaje = Number(b.porcentaje) || 0;
  return d;
};

const buscarPeriodo = async (institucionId, periodoId) => {
  validarId(periodoId, 'periodo');
  const anio = await AnioAcademico.findOne({ institucionId, 'cronograma.periodos._id': periodoId });
  if (!anio) throw new ErrorHttp(404, 'No se encontró el periodo.');
  return { anio, periodo: anio.cronograma.periodos.id(periodoId) };
};

const periodosApi = {
  listar: ruta(async (req, res) => {
    const filtro = { institucionId: institucionDe(req) };
    if (req.query.anioAcademicoId) filtro._id = req.query.anioAcademicoId;
    const anios = await AnioAcademico.find(filtro).sort({ anio: -1 });
    const lista = [];
    anios.forEach((a) => (a.cronograma.periodos || []).forEach((p) => lista.push(serializarPeriodo(a, p))));
    lista.sort((x, y) => y.anio - x.anio || x.orden - y.orden);
    res.json(lista);
  }),

  obtener: ruta(async (req, res) => {
    const { anio, periodo } = await buscarPeriodo(institucionDe(req), req.params.id);
    res.json(serializarPeriodo(anio, periodo));
  }),

  crear: ruta(async (req, res) => {
    const institucionId = institucionDe(req);
    const b = req.body;
    validarId(b.anioAcademicoId, 'anioAcademicoId');
    const anio = await AnioAcademico.findOne({ _id: b.anioAcademicoId, institucionId });
    if (!anio) throw new ErrorHttp(404, 'El año escolar no existe en tu institución.');
    validarFechas(b.fechaInicio, b.fechaFin);
    const d = datosPeriodo(b);
    if (!d.nombre || !d.numero) throw new ErrorHttp(400, 'El periodo necesita nombre y orden.');
    validarNumeroPeriodos(d.numero);
    if (anio.cronograma.periodos.some((p) => p.numero === d.numero)) {
      throw new ErrorHttp(409, `Ya existe el periodo ${d.numero} en ese año.`);
    }
    anio.cronograma.periodos.push(d);
    await anio.save();
    const creado = anio.cronograma.periodos.find((p) => p.numero === d.numero);
    res.status(201).json(serializarPeriodo(anio, creado));
  }),

  actualizar: ruta(async (req, res) => {
    const { anio, periodo } = await buscarPeriodo(institucionDe(req), req.params.id);
    const d = datosPeriodo(req.body);
    validarFechas(d.inicio !== undefined ? d.inicio : periodo.inicio, d.fin !== undefined ? d.fin : periodo.fin);
    if (d.numero !== undefined) validarNumeroPeriodos(d.numero);
    if (d.numero !== undefined && d.numero !== periodo.numero && anio.cronograma.periodos.some((p) => p.numero === d.numero)) {
      throw new ErrorHttp(409, `Ya existe el periodo ${d.numero} en ese año.`);
    }
    if (d.numero !== undefined && d.numero !== periodo.numero) {
      const notas = await Calificacion.countDocuments({ institucionId: anio.institucionId, anioAcademicoId: anio._id, periodo: periodo.numero });
      if (notas > 0) throw new ErrorHttp(409, 'Este periodo ya tiene notas; cambiar su orden las dejaría en el periodo equivocado.');
    }
    periodo.set(d);
    await anio.save();
    res.json(serializarPeriodo(anio, periodo));
  }),

  cerrar: ruta(async (req, res) => {
    const { anio, periodo } = await buscarPeriodo(institucionDe(req), req.params.id);
    periodo.estado = 'cerrado';
    await anio.save();
    res.json(serializarPeriodo(anio, periodo));
  }),

  eliminar: ruta(async (req, res) => {
    const institucionId = institucionDe(req);
    const { anio, periodo } = await buscarPeriodo(institucionId, req.params.id);
    const notas = await Calificacion.countDocuments({ institucionId, anioAcademicoId: anio._id, periodo: periodo.numero });
    if (notas > 0) throw new ErrorHttp(409, 'Este periodo ya tiene notas registradas. No se elimina para conservar el historial; ciérralo.');
    periodo.deleteOne();
    await anio.save();
    res.json({ mensaje: 'Periodo eliminado.' });
  })
};

module.exports = { aniosApi, periodosApi, serializarAnio };
