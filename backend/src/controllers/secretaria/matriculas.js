// Matrículas y estudiantes (búsqueda, ficha, estado).
// Internamente se conservan los estados del sistema ('activa', 'retirada'...) para no romper
// reportes y promoción; aquí se traducen a lo que muestra Secretaría ('matriculado', 'retirado'...).
const Matricula = require('../../models/Matricula');
const Usuario = require('../../models/Usuario');
const AnioAcademico = require('../../models/AnioAcademico');
const Grupo = require('../../models/Grupo');
const Grado = require('../../models/Grado');
const Jornada = require('../../models/Jornada');
const Calificacion = require('../../models/Calificacion');
const { ESTADOS_ANIO } = require('../../config/constants');
const { ruta, ErrorHttp, institucionDe, validarId, aId, fechaISO, escaparRegex } = require('./helpers');

const A_FRONT = { activa: 'matriculado', retirada: 'retirado', cancelada: 'cancelada', trasladada: 'trasladado', graduado: 'graduado' };
const A_BACK = { matriculado: 'activa', retirado: 'retirada', cancelada: 'cancelada', trasladado: 'trasladada', graduado: 'graduado' };
const ESTADOS_EDITABLES = ['matriculado', 'retirado', 'cancelada'];

const POBLAR = [
  { path: 'anioAcademicoId', select: 'anio estado' },
  { path: 'grupoId', select: 'nombre grado' },
  { path: 'gradoId', select: 'nombre numero' },
  { path: 'jornadaId', select: 'nombre' }
];

const serializar = (m) => ({
  _id: String(m._id),
  institucionId: String(m.institucionId),
  estudianteId: aId(m.estudianteId),
  anioAcademicoId: aId(m.anioAcademicoId),   // siempre el id (la pantalla lo compara con el año actual)
  anio: m.anioAcademicoId && m.anioAcademicoId.anio,
  grupoId: aId(m.grupoId),
  grupoNombre: m.grupoId && m.grupoId.nombre,
  gradoId: aId(m.gradoId),
  gradoNombre: (m.gradoId && m.gradoId.nombre) || (m.grupoId && m.grupoId.grado != null ? `Grado ${m.grupoId.grado}` : ''),
  jornadaId: aId(m.jornadaId),
  jornadaNombre: m.jornadaId && m.jornadaId.nombre,
  acudienteId: aId(m.acudienteId),
  numeroMatricula: m.numeroMatricula,
  fechaMatricula: fechaISO(m.fechaMatricula),
  estado: A_FRONT[m.estado] || m.estado,
  motivo: m.motivo || ''
});

const esEstudiante = (u) => u && (u.tipoPerfil === 'estudiante' || (u.roles || []).includes('estudiante'));

const siguienteNumero = async (institucionId, anioId, anio) => {
  const n = await Matricula.countDocuments({ institucionId, anioAcademicoId: anioId });
  return `${anio}-${String(n + 1).padStart(4, '0')}`;
};

// ---------- Matrículas ----------
const matriculas = {
  listar: ruta(async (req, res) => {
    const filtro = { institucionId: institucionDe(req) };
    ['anioAcademicoId', 'grupoId', 'estudianteId', 'gradoId', 'jornadaId'].forEach((k) => { if (req.query[k]) filtro[k] = req.query[k]; });
    if (req.query.estado) filtro.estado = A_BACK[req.query.estado] || req.query.estado;
    const docs = await Matricula.find(filtro).populate(POBLAR).sort({ createdAt: -1 }).limit(1000);
    res.json(docs.map(serializar));
  }),

  obtener: ruta(async (req, res) => {
    validarId(req.params.id);
    const m = await Matricula.findOne({ _id: req.params.id, institucionId: institucionDe(req) }).populate(POBLAR);
    if (!m) throw new ErrorHttp(404, 'No se encontró la matrícula.');
    res.json(serializar(m));
  }),

  // ¿Ya está matriculado en ese año? (una matrícula cancelada no cuenta)
  verificar: ruta(async (req, res) => {
    const institucionId = institucionDe(req);
    const { estudianteId, anioAcademicoId } = req.query;
    validarId(estudianteId, 'estudianteId');
    validarId(anioAcademicoId, 'anioAcademicoId');
    const m = await Matricula.findOne({ institucionId, estudianteId, anioAcademicoId, estado: { $ne: 'cancelada' } }).populate(POBLAR);
    res.json({ existe: !!m, matricula: m ? serializar(m) : null });
  }),

  historial: ruta(async (req, res) => {
    validarId(req.params.estudianteId, 'estudianteId');
    const docs = await Matricula.find({ institucionId: institucionDe(req), estudianteId: req.params.estudianteId })
      .populate(POBLAR).sort({ createdAt: -1 });
    res.json(docs.map(serializar));
  }),

  crear: ruta(async (req, res) => {
    const institucionId = institucionDe(req);
    const b = req.body;
    ['estudianteId', 'anioAcademicoId', 'gradoId', 'grupoId', 'jornadaId'].forEach((k) => validarId(b[k], k));

    const [estudiante, anio, grupo, grado, jornada] = await Promise.all([
      Usuario.findOne({ _id: b.estudianteId, institucionId }).select('tipoPerfil roles estado'),
      AnioAcademico.findOne({ _id: b.anioAcademicoId, institucionId }).select('anio estado habilitado'),
      Grupo.findOne({ _id: b.grupoId, institucionId }).select('anioAcademicoId grado'),
      Grado.findOne({ _id: b.gradoId, institucionId }).select('numero'),
      Jornada.findOne({ _id: b.jornadaId, institucionId }).select('_id')
    ]);
    if (!esEstudiante(estudiante)) throw new ErrorHttp(400, 'La persona elegida no es un estudiante de tu institución.');
    if (estudiante.estado === 'inactivo') throw new ErrorHttp(400, 'El estudiante está inactivo. Reactívalo antes de matricularlo.');
    if (!anio) throw new ErrorHttp(400, 'El año escolar no existe en tu institución.');
    if (anio.estado === ESTADOS_ANIO.FINALIZADO) throw new ErrorHttp(400, 'No se puede matricular en un año finalizado.');
    if (!grupo) throw new ErrorHttp(400, 'El grupo no existe en tu institución.');
    if (String(grupo.anioAcademicoId) !== String(b.anioAcademicoId)) throw new ErrorHttp(400, 'El grupo pertenece a otro año escolar.');
    if (!grado) throw new ErrorHttp(400, 'El grado no existe en tu institución.');
    if (Number(grupo.grado) !== Number(grado.numero)) throw new ErrorHttp(400, 'El grupo elegido no corresponde a ese grado.');
    if (!jornada) throw new ErrorHttp(400, 'La jornada no existe en tu institución.');

    let acudienteId = null;
    if (b.acudienteId) {
      validarId(b.acudienteId, 'acudienteId');
      const ac = await Usuario.findOne({ _id: b.acudienteId, institucionId }).select('tipoPerfil roles');
      if (!ac || (ac.tipoPerfil !== 'acudiente' && !(ac.roles || []).includes('acudiente'))) {
        throw new ErrorHttp(400, 'El acudiente elegido no existe en tu institución.');
      }
      acudienteId = ac._id;
    }

    // Regla: una sola matrícula por (estudiante, año). Una cancelada se reutiliza.
    const previa = await Matricula.findOne({ institucionId, estudianteId: estudiante._id, anioAcademicoId: anio._id });
    if (previa && previa.estado !== 'cancelada') {
      throw new ErrorHttp(409, 'Este estudiante ya tiene matrícula en ese año escolar.');
    }

    const datos = {
      institucionId, anioAcademicoId: anio._id, estudianteId: estudiante._id,
      grupoId: grupo._id, gradoId: grado._id, jornadaId: jornada._id, acudienteId,
      estado: 'activa', motivo: '', fechaMatricula: new Date(), tipoMatricula: b.tipoMatricula || 'nueva'
    };
    let m;
    if (previa) {
      previa.set(datos);
      m = await previa.save();
    } else {
      datos.numeroMatricula = await siguienteNumero(institucionId, anio._id, anio.anio);
      m = await Matricula.create(datos);
    }
    res.status(201).json(serializar(await Matricula.findById(m._id).populate(POBLAR)));
  }),

  // Solo se permiten cambios de datos "seguros"; el estado tiene su propia ruta.
  actualizar: ruta(async (req, res) => {
    const institucionId = institucionDe(req);
    validarId(req.params.id);
    const m = await Matricula.findOne({ _id: req.params.id, institucionId });
    if (!m) throw new ErrorHttp(404, 'No se encontró la matrícula.');
    const b = req.body;
    if (b.grupoId) {
      validarId(b.grupoId, 'grupoId');
      const grupo = await Grupo.findOne({ _id: b.grupoId, institucionId }).select('anioAcademicoId');
      if (!grupo || String(grupo.anioAcademicoId) !== String(m.anioAcademicoId)) throw new ErrorHttp(400, 'Ese grupo no es del mismo año escolar.');
      m.grupoId = grupo._id;
    }
    if (b.jornadaId) {
      validarId(b.jornadaId, 'jornadaId');
      if (!(await Jornada.exists({ _id: b.jornadaId, institucionId }))) throw new ErrorHttp(400, 'La jornada no existe en tu institución.');
      m.jornadaId = b.jornadaId;
    }
    if (b.observaciones !== undefined) m.observaciones = b.observaciones;
    await m.save();
    res.json(serializar(await Matricula.findById(m._id).populate(POBLAR)));
  }),

  cambiarEstado: ruta(async (req, res) => {
    const institucionId = institucionDe(req);
    validarId(req.params.id);
    const { estado, motivo } = req.body;
    if (!ESTADOS_EDITABLES.includes(estado)) throw new ErrorHttp(400, 'Estado inválido. Usa: matriculado, retirado o cancelada.');
    const m = await Matricula.findOne({ _id: req.params.id, institucionId });
    if (!m) throw new ErrorHttp(404, 'No se encontró la matrícula.');
    m.estado = A_BACK[estado];
    m.motivo = estado === 'matriculado' ? '' : String(motivo || '').slice(0, 500);
    await m.save();
    res.json(serializar(await Matricula.findById(m._id).populate(POBLAR)));
  }),

  // Las matrículas nunca se borran: "eliminar" las cancela y conserva el historial.
  eliminar: ruta(async (req, res) => {
    const institucionId = institucionDe(req);
    validarId(req.params.id);
    const m = await Matricula.findOne({ _id: req.params.id, institucionId });
    if (!m) throw new ErrorHttp(404, 'No se encontró la matrícula.');
    m.estado = 'cancelada';
    await m.save();
    res.json({ mensaje: 'La matrícula quedó cancelada (el historial se conserva).' });
  })
};

// ---------- Estudiantes ----------
const FILTRO_ESTUDIANTE = { $or: [{ tipoPerfil: 'estudiante' }, { roles: 'estudiante' }] };
const sinCredenciales = (u) => {
  const o = u.toObject ? u.toObject() : { ...u };
  delete o.credenciales;
  return o;
};

const estudiantes = {
  buscar: ruta(async (req, res) => {
    const institucionId = institucionDe(req);
    const q = String(req.query.q || '').trim();
    if (q.length < 2) return res.json([]);
    const rx = new RegExp(escaparRegex(q), 'i');
    const lista = await Usuario.find({
      institucionId, ...FILTRO_ESTUDIANTE,
      $and: [{ $or: [{ nombres: rx }, { apellidos: rx }, { documento: rx }, { email: rx }] }]
    }).select('nombres apellidos documento tipoDocumento email foto estado').sort({ apellidos: 1, nombres: 1 }).limit(20);

    // Sugerencia para re-matricular: jornada y acudiente de su última matrícula
    const ultimas = await Matricula.find({ institucionId, estudianteId: { $in: lista.map((u) => u._id) } })
      .sort({ createdAt: -1 }).select('estudianteId jornadaId acudienteId');
    const porEst = new Map();
    ultimas.forEach((m) => { if (!porEst.has(String(m.estudianteId))) porEst.set(String(m.estudianteId), m); });

    res.json(lista.map((u) => {
      const m = porEst.get(String(u._id));
      return { ...u.toObject(), jornadaId: m ? aId(m.jornadaId) : undefined, acudienteId: m ? aId(m.acudienteId) : undefined };
    }));
  }),

  ficha: ruta(async (req, res) => {
    const institucionId = institucionDe(req);
    validarId(req.params.id);
    const est = await Usuario.findOne({ _id: req.params.id, institucionId, ...FILTRO_ESTUDIANTE })
      .populate('acudientes.acudienteId', 'nombres apellidos telefono email');
    if (!est) throw new ErrorHttp(404, 'No se encontró el estudiante.');

    const docs = await Matricula.find({ institucionId, estudianteId: est._id }).populate(POBLAR).sort({ createdAt: -1 });
    const lista = docs.map(serializar);
    const matriculaActual = lista.find((m, i) => docs[i].anioAcademicoId && docs[i].anioAcademicoId.estado === ESTADOS_ANIO.ACTIVO && m.estado !== 'cancelada') || null;

    // Promedio por año a partir de las notas registradas
    const prom = await Calificacion.aggregate([
      { $match: { institucionId: est.institucionId, estudianteId: est._id, nota: { $type: 'number' } } },
      { $group: { _id: '$anioAcademicoId', promedio: { $avg: '$nota' } } }
    ]);
    const promPorAnio = new Map(prom.map((p) => [String(p._id), p.promedio]));
    const historialAcademico = lista.map((m) => ({
      anioAcademicoId: m.anioAcademicoId, anio: m.anio, grado: m.gradoNombre, grupo: m.grupoNombre, estadoMatricula: m.estado,
      promedio: promPorAnio.has(m.anioAcademicoId) ? Math.round(promPorAnio.get(m.anioAcademicoId) * 100) / 100 : null
    }));

    res.json({
      estudiante: sinCredenciales(est),
      acudientes: (est.acudientes || []).filter((a) => a.acudienteId).map((a) => ({
        _id: String(a.acudienteId._id), nombres: a.acudienteId.nombres, apellidos: a.acudienteId.apellidos,
        telefono: a.acudienteId.telefono, email: a.acudienteId.email, parentesco: a.parentesco
      })),
      matriculaActual, matriculas: lista, historialAcademico
    });
  }),

  cambiarEstado: ruta(async (req, res) => {
    const institucionId = institucionDe(req);
    validarId(req.params.id);
    const { estado } = req.body;
    if (!['activo', 'inactivo'].includes(estado)) throw new ErrorHttp(400, 'Estado inválido. Usa activo o inactivo.');
    const est = await Usuario.findOneAndUpdate(
      { _id: req.params.id, institucionId, ...FILTRO_ESTUDIANTE }, { $set: { estado } }, { new: true }
    );
    if (!est) throw new ErrorHttp(404, 'No se encontró el estudiante.');
    res.json({ _id: String(est._id), estado: est.estado });
  })
};

module.exports = { matriculas, estudiantes, FILTRO_ESTUDIANTE };
