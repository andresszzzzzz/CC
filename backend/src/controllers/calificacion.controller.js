const Calificacion = require('../models/Calificacion');
const AnioAcademico = require('../models/AnioAcademico');
const Institucion = require('../models/Institucion');
const Matricula = require('../models/Matricula');
const CargaAcademica = require('../models/CargaAcademica');
const { normalizarComponentes, calcularNotaComponentes } = require('../utils/componentesCalificacion');
const { ESTADOS_PERIODO } = require('../config/constants');

// Busca el subdocumento de período dentro del año académico. Devuelve null
// si ese número de período no está configurado en el cronograma.
const buscarPeriodo = (anioAcademico, numeroPeriodo) => {
  return anioAcademico.cronograma?.periodos?.find((p) => p.numero === numeroPeriodo) || null;
};

// Carga el año académico y valida que el período indicado permita la acción
// que se está intentando ('escribir' cubre crear/actualizar/eliminar la nota
// normal; 'recuperar' es más permisivo porque la recuperación justamente se
// hace cuando el período normal ya cerró).
const validarEstadoPeriodo = async (anioAcademicoId, numeroPeriodo, accion = 'escribir') => {
  const anioAcademico = await AnioAcademico.findById(anioAcademicoId);
  if (!anioAcademico) {
    return { ok: false, mensaje: 'Año académico no encontrado' };
  }

  const periodo = buscarPeriodo(anioAcademico, numeroPeriodo);
  if (!periodo) {
    return { ok: false, mensaje: `El período ${numeroPeriodo} no existe en el cronograma de este año académico` };
  }

  if (accion === 'escribir' && periodo.estado === ESTADOS_PERIODO.CERRADO) {
    return { ok: false, mensaje: `El período ${numeroPeriodo} está cerrado. No se pueden crear ni modificar calificaciones normales en él.` };
  }

  if (accion === 'recuperar' && periodo.estado !== ESTADOS_PERIODO.EN_RECUPERACION) {
    return { ok: false, mensaje: `El período ${numeroPeriodo} no está habilitado para recuperaciones (estado actual: ${periodo.estado}).` };
  }

  return { ok: true, anioAcademico, periodo };
};

// El servidor (y no el formulario) comprueba la materia asignada, el grupo,
// el año y la institución antes de permitir escribir una calificación.
const rolesGestion = ['admin', 'rector', 'coordinador', 'secretaria'];
const idIgual = (a, b) => String(a || '') === String(b || '');
const esGestion = (req) => rolesGestion.includes(req.usuario?.tipoPerfil);

const puedeEditarAsignatura = async (req, calificacion) => {
  if (!req.usuario?.institucionId || !idIgual(calificacion.institucionId, req.usuario.institucionId)) return false;
  if (esGestion(req)) return true;
  if (req.usuario.tipoPerfil !== 'docente') return false;
  return !!(await CargaAcademica.exists({
    institucionId: req.usuario.institucionId,
    docenteId: req.usuario.id,
    anioAcademicoId: calificacion.anioAcademicoId,
    grupoId: calificacion.grupoId,
    asignaturaId: calificacion.asignaturaId,
    estado: 'activo', puedeCalificar: true
  }));
};

const puedeLeerCalificacion = async (req, calificacion) => {
  if (!req.usuario?.institucionId || !idIgual(calificacion.institucionId, req.usuario.institucionId)) return false;
  if (esGestion(req)) return true;
  if (req.usuario.tipoPerfil === 'estudiante') return idIgual(calificacion.estudianteId, req.usuario.id);
  if (req.usuario.tipoPerfil === 'acudiente') {
    return !!(await Matricula.exists({ institucionId: req.usuario.institucionId,
      acudienteId: req.usuario.id, estudianteId: calificacion.estudianteId }));
  }
  if (req.usuario.tipoPerfil === 'docente') {
    return !!(await CargaAcademica.exists({ institucionId: req.usuario.institucionId,
      docenteId: req.usuario.id, anioAcademicoId: calificacion.anioAcademicoId,
      grupoId: calificacion.grupoId, asignaturaId: calificacion.asignaturaId,
      estado: 'activo' }));
  }
  return false;
};

const validarAlcance = async (req, datos) => {
  if (!await puedeEditarAsignatura(req, datos)) return 'Solo puedes calificar tus materias y grupos asignados.';
  const [grupo, anio, matricula] = await Promise.all([
    require('../models/Grupo').findOne({ _id: datos.grupoId, institucionId: req.usuario.institucionId }),
    AnioAcademico.findOne({ _id: datos.anioAcademicoId, institucionId: req.usuario.institucionId }),
    Matricula.exists({ institucionId: req.usuario.institucionId, anioAcademicoId: datos.anioAcademicoId,
      grupoId: datos.grupoId, estudianteId: datos.estudianteId, estado: 'activa' })
  ]);
  if (!grupo || !anio || !idIgual(grupo.anioAcademicoId, anio._id)) return 'El grupo y el año académico no corresponden.';
  if (!matricula) return 'El estudiante no tiene una matrícula activa en ese grupo y año.';
  return null;
};

const prepararEvaluacion = (datos, anterior = null) => {
  if (datos.componentes === undefined) {
    if (datos.nota !== undefined && datos.nota !== null && (!Number.isFinite(Number(datos.nota)) || Number(datos.nota) < 0 || Number(datos.nota) > 5)) {
      throw new Error('La nota debe estar entre 0 y 5.');
    }
    return { ...(datos.nota !== undefined ? { nota: datos.nota } : {}) };
  }
  const base = anterior?.componentes?.toObject?.() || anterior?.componentes || {};
  const componentes = normalizarComponentes({ ...base, ...datos.componentes });
  const notaCompleta = calcularNotaComponentes(componentes);
  // Si se está migrando una nota antigua, se conserva su definitiva anterior
  // mientras se completan los cinco componentes; nunca se pierde al guardar
  // un borrador de evaluación.
  return { componentes, nota: notaCompleta ?? anterior?.nota ?? null };
};

// GET /api/calificaciones: cada actor solo puede ver las notas que le competen.
const obtenerCalificaciones = async (req, res) => {
  try {
    const { estudianteId, asignaturaId, grupoId, anioAcademicoId, periodo } = req.query;
    if (!req.usuario?.institucionId) return res.status(403).json({ mensaje: 'No hay institución asociada.' });
    const filtro = { institucionId: req.usuario.institucionId };
    if (estudianteId) filtro.estudianteId = estudianteId;
    if (asignaturaId) filtro.asignaturaId = asignaturaId;
    if (grupoId) filtro.grupoId = grupoId;
    if (anioAcademicoId) filtro.anioAcademicoId = anioAcademicoId;
    if (periodo) filtro.periodo = Number(periodo);
    if (req.usuario.tipoPerfil === 'estudiante') filtro.estudianteId = req.usuario.id;
    if (req.usuario.tipoPerfil === 'docente') {
      const cargas = await CargaAcademica.find({ institucionId: req.usuario.institucionId,
        docenteId: req.usuario.id, estado: 'activo' }).select('anioAcademicoId grupoId asignaturaId').lean();
      // Se filtra por la pareja completa: el docente no puede leer una materia
      // en un grupo diferente solo porque enseña esa materia en otro grupo.
      if (!cargas.length) return res.json([]);
      filtro.$or = cargas.map((c) => ({ anioAcademicoId: c.anioAcademicoId,
        grupoId: c.grupoId, asignaturaId: c.asignaturaId }));
    } else if (req.usuario.tipoPerfil === 'acudiente') {
      const matriculas = await Matricula.find({ institucionId: req.usuario.institucionId,
        acudienteId: req.usuario.id }).select('estudianteId').lean();
      const ids = matriculas.map((m) => m.estudianteId);
      filtro.estudianteId = estudianteId ? { $in: ids.filter((id) => idIgual(id, estudianteId)) } : { $in: ids };
    } else if (!esGestion(req) && req.usuario.tipoPerfil !== 'estudiante') {
      return res.status(403).json({ mensaje: 'No tienes permisos para consultar calificaciones.' });
    }
    const calificaciones = await Calificacion.find(filtro)
      .populate('anioAcademicoId', 'anio')
      .populate('estudianteId', 'nombres apellidos')
      .populate('asignaturaId', 'nombre')
      .populate('grupoId', 'nombre')
      .populate('docenteId', 'nombres apellidos');
    res.json(calificaciones);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

const obtenerCalificacionPorId = async (req, res) => {
  try {
    const calificacion = await Calificacion.findById(req.params.id);
    if (!calificacion) return res.status(404).json({ mensaje: 'Calificación no encontrada' });
    if (!await puedeLeerCalificacion(req, calificacion)) return res.status(403).json({ mensaje: 'Sin permiso para consultar esta nota.' });
    await calificacion.populate('estudianteId asignaturaId grupoId docenteId');
    res.json(calificacion);
  } catch (error) { res.status(500).json({ mensaje: error.message }); }
};

const crearCalificacion = async (req, res) => {
  try {
    const { anioAcademicoId, grupoId, asignaturaId, estudianteId } = req.body;
    const periodo = Number(req.body.periodo);
    if (!Number.isInteger(periodo) || periodo < 1 || periodo > 4) {
      return res.status(400).json({ mensaje: 'El período debe ser uno de los cuatro períodos académicos.' });
    }
    const datos = { anioAcademicoId, grupoId, asignaturaId, estudianteId,
      institucionId: req.usuario.institucionId, periodo };
    const problema = await validarAlcance(req, datos);
    if (problema) return res.status(403).json({ mensaje: problema });
    const validacion = await validarEstadoPeriodo(anioAcademicoId, periodo, 'escribir');
    if (!validacion.ok) return res.status(400).json({ mensaje: validacion.mensaje });
    if (req.usuario.tipoPerfil === 'docente' && req.body.componentes === undefined) {
      return res.status(400).json({ mensaje: 'Debes registrar los componentes de evaluación.' });
    }
    const evaluacion = prepararEvaluacion(req.body);
    const nueva = new Calificacion({ ...datos, ...evaluacion, docenteId: req.usuario.id,
      observacion: req.body.observacion || '' });
    const guardada = await nueva.save();
    res.status(201).json(guardada);
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 400).json({ mensaje: error.code === 11000 ? 'Ya existe una nota para este estudiante, asignatura y período.' : error.message });
  }
};

const actualizarCalificacion = async (req, res) => {
  try {
    const existente = await Calificacion.findById(req.params.id);
    if (!existente) return res.status(404).json({ mensaje: 'Calificación no encontrada' });
    if (!await puedeEditarAsignatura(req, existente)) return res.status(403).json({ mensaje: 'No tienes esa asignatura y grupo asignados.' });
    const validacion = await validarEstadoPeriodo(existente.anioAcademicoId, existente.periodo, 'escribir');
    if (!validacion.ok) return res.status(400).json({ mensaje: validacion.mensaje });
    if (req.usuario.tipoPerfil === 'docente' && req.body.componentes === undefined) {
      return res.status(400).json({ mensaje: 'Solo puedes editar los componentes de evaluación.' });
    }
    const evaluacion = prepararEvaluacion(req.body, existente);
    Object.assign(existente, evaluacion);
    if (req.body.observacion !== undefined) existente.observacion = req.body.observacion;
    existente.docenteId = req.usuario.id;
    existente.fechaCalificacion = new Date();
    await existente.save();
    res.json(existente);
  } catch (error) { res.status(400).json({ mensaje: error.message }); }
};

const eliminarCalificacion = async (req, res) => {
  try {
    const existente = await Calificacion.findById(req.params.id);
    if (!existente) return res.status(404).json({ mensaje: 'Calificación no encontrada' });
    if (!await puedeEditarAsignatura(req, existente)) return res.status(403).json({ mensaje: 'Sin permiso para eliminar esta nota.' });
    const validacion = await validarEstadoPeriodo(existente.anioAcademicoId, existente.periodo, 'escribir');
    if (!validacion.ok) return res.status(400).json({ mensaje: validacion.mensaje });
    await existente.deleteOne();
    res.json({ mensaje: 'Calificación eliminada correctamente' });
  } catch (error) { res.status(500).json({ mensaje: error.message }); }
};

// PUT /api/calificaciones/:id/recuperacion
// Registra la nota de recuperación de un período. Solo aplica si:
//  - la nota normal quedó por debajo de la nota mínima de aprobación, y
//  - el período está actualmente en estado "en_recuperacion" en el cronograma.
// La nota final que cuenta se calcula según la configuración de la institución
// (aproximaPromedio): si está activada, se promedia nota+recuperación; si no,
// la recuperación reemplaza directamente a la nota, sin superar la nota mínima
// (recuperar no debe dar mejor nota que haber aprobado normalmente).
const registrarRecuperacion = async (req, res) => {
  try {
    const { recuperacion } = req.body;
    if (recuperacion === undefined || recuperacion === null) {
      return res.status(400).json({ mensaje: 'Debes enviar la nota de recuperación en el campo "recuperacion"' });
    }

    const calificacion = await Calificacion.findById(req.params.id);
    if (!calificacion) {
      return res.status(404).json({ mensaje: 'Calificación no encontrada' });
    }

    if (!await puedeEditarAsignatura(req, calificacion)) return res.status(403).json({ mensaje: 'Sin permiso para recuperar esta nota.' });

    const validacion = await validarEstadoPeriodo(calificacion.anioAcademicoId, calificacion.periodo, 'recuperar');
    if (!validacion.ok) {
      return res.status(400).json({ mensaje: validacion.mensaje });
    }

    const notaMinima = validacion.anioAcademico.configuracion?.notaMinima ?? 3.0;

    if (calificacion.nota === undefined || calificacion.nota === null || calificacion.nota >= notaMinima) {
      return res.status(400).json({
        mensaje: `Esta calificación no está por debajo de la nota mínima (${notaMinima}), no aplica para recuperación.`
      });
    }

    calificacion.recuperacion = recuperacion;

    const aproximaPromedio = validacion.anioAcademico.configuracion?.aproximaPromedio ?? true;
    const notaFinal = aproximaPromedio
      ? (calificacion.nota + recuperacion) / 2
      : recuperacion;

    // Recuperar nunca debe dar una nota mejor que haber aprobado directo.
    calificacion.nota = Math.min(notaFinal, notaMinima);
    calificacion.estado = 'recuperado';

    await calificacion.save();

    res.json({ mensaje: 'Recuperación registrada correctamente', calificacion });
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// PUT /api/calificaciones/:id/habilitacion
// Registra la nota de un examen de habilitación (recuperación de todo el año
// para una asignatura). Usa la configuración de la institución:
//  - notaHabilitaciones: nota máxima que se puede obtener al habilitar
//  - porcentajeHabilitaciones: peso del examen de habilitación sobre la nota final
const registrarHabilitacion = async (req, res) => {
  try {
    const { habilitacion } = req.body;
    if (habilitacion === undefined || habilitacion === null) {
      return res.status(400).json({ mensaje: 'Debes enviar la nota del examen en el campo "habilitacion"' });
    }

    const calificacion = await Calificacion.findById(req.params.id);
    if (!calificacion) {
      return res.status(404).json({ mensaje: 'Calificación no encontrada' });
    }

    if (!await puedeEditarAsignatura(req, calificacion)) return res.status(403).json({ mensaje: 'Sin permiso para habilitar esta nota.' });

    const anioAcademico = await AnioAcademico.findById(calificacion.anioAcademicoId);
    if (!anioAcademico) {
      return res.status(404).json({ mensaje: 'Año académico no encontrado' });
    }

    const notaMinima = anioAcademico.configuracion?.notaMinima ?? 3.0;

    if (calificacion.nota === undefined || calificacion.nota === null || calificacion.nota >= notaMinima) {
      return res.status(400).json({
        mensaje: `Esta calificación no está por debajo de la nota mínima (${notaMinima}), no aplica para habilitación.`
      });
    }

    const institucion = await Institucion.findById(calificacion.institucionId).select('configuracion');
    const notaHabilitaciones = institucion?.configuracion?.notaHabilitaciones ?? notaMinima;
    const porcentajeHabilitaciones = (institucion?.configuracion?.porcentajeHabilitaciones ?? 60) / 100;

    calificacion.habilitacion = habilitacion;

    const notaPonderada = calificacion.nota * (1 - porcentajeHabilitaciones) + habilitacion * porcentajeHabilitaciones;

    // La nota final de una habilitación nunca puede superar el tope que
    // define la institución (aunque el examen haya sido perfecto).
    calificacion.nota = Math.min(notaPonderada, notaHabilitaciones);
    calificacion.estado = 'habilitado';

    await calificacion.save();

    res.json({ mensaje: 'Habilitación registrada correctamente', calificacion });
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

module.exports = {
  obtenerCalificaciones,
  obtenerCalificacionPorId,
  crearCalificacion,
  actualizarCalificacion,
  eliminarCalificacion,
  registrarRecuperacion,
  registrarHabilitacion,
};