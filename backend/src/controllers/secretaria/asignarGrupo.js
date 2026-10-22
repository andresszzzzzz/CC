// Registrar grupo y jornada de un estudiante desde el formulario de "Estudiantes".
// El grupo y la jornada NO viven en el usuario: viven en su matrícula del año escolar del grupo.
// Por eso, al guardar el estudiante se crea (o se actualiza) esa matrícula.
//
//   1) prepararAsignacion(...)  -> valida ANTES de guardar al estudiante (si algo está mal, no se guarda nada)
//   2) aplicarAsignacion(...)   -> crea/actualiza la matrícula una vez el estudiante ya existe
const Matricula = require('../../models/Matricula');
const AnioAcademico = require('../../models/AnioAcademico');
const Grupo = require('../../models/Grupo');
const Grado = require('../../models/Grado');
const Jornada = require('../../models/Jornada');
const Usuario = require('../../models/Usuario');
const { ESTADOS_ANIO } = require('../../config/constants');
const { ErrorHttp, validarId } = require('./helpers');

const vacio = (v) => v === undefined || v === null || v === '';
const CAMPOS_ASIGNACION = ['grupoId', 'jornadaId', 'acudienteId', 'estadoEstudiante', 'grupoNombre', 'jornadaNombre'];

// Quita del cuerpo los campos que no pertenecen al usuario y los devuelve aparte.
const separarAsignacion = (datos) => {
  const asignacion = { grupoId: datos.grupoId, jornadaId: datos.jornadaId, acudienteId: datos.acudienteId };
  CAMPOS_ASIGNACION.forEach((k) => delete datos[k]);
  return asignacion;
};

// Jornada del grupo ("manana", "tarde"...) -> tipo de Jornada del catálogo
const TIPO_JORNADA = { manana: 'manana', tarde: 'tarde', noche: 'noche', continua: 'unica', unica: 'unica' };

const prepararAsignacion = async (institucionId, { grupoId, jornadaId, acudienteId }, estudianteId = null) => {
  if (vacio(grupoId) && vacio(jornadaId)) return null;

  let grupo = null;
  let anio = null;
  let previa = null;

  if (!vacio(grupoId)) {
    validarId(grupoId, 'grupo');
    grupo = await Grupo.findOne({ _id: grupoId, institucionId }).select('anioAcademicoId grado jornada');
    if (!grupo) throw new ErrorHttp(400, 'El grupo elegido no existe en tu institución.');
    anio = await AnioAcademico.findOne({ _id: grupo.anioAcademicoId, institucionId }).select('anio estado');
    if (!anio) throw new ErrorHttp(400, 'El año escolar del grupo no existe.');
    if (anio.estado === ESTADOS_ANIO.FINALIZADO) throw new ErrorHttp(400, 'El grupo pertenece a un año finalizado; elige un grupo del año actual.');
  } else if (estudianteId) {
    // Solo eligió jornada: se aplica a su matrícula del año actual
    const actual = await AnioAcademico.findOne({ institucionId, estado: ESTADOS_ANIO.ACTIVO }).select('_id anio');
    if (actual) {
      previa = await Matricula.findOne({ institucionId, estudianteId, anioAcademicoId: actual._id, estado: { $ne: 'cancelada' } });
    }
    // Al editar sin grupo y sin matrícula actual no hay dónde guardar la jornada: se ignora (no bloquea la edición)
    if (!previa) return null;
  } else {
    throw new ErrorHttp(400, 'Para registrar la jornada elige también el grupo: la jornada se guarda en la matrícula del estudiante.');
  }

  let jornada = null;
  if (!vacio(jornadaId)) {
    validarId(jornadaId, 'jornada');
    jornada = await Jornada.findOne({ _id: jornadaId, institucionId }).select('_id');
    if (!jornada) throw new ErrorHttp(400, 'La jornada elegida no existe en tu institución.');
  } else if (grupo) {
    // No eligió jornada: se intenta deducirla del grupo; si no se puede, la matrícula queda sin jornada
    const tipo = TIPO_JORNADA[grupo.jornada];
    jornada = (tipo && await Jornada.findOne({ institucionId, tipo, estado: 'activo' }).select('_id')) || null;
  }

  let acudiente = null;
  if (!vacio(acudienteId)) {
    validarId(acudienteId, 'acudiente');
    acudiente = await Usuario.findOne({ _id: acudienteId, institucionId }).select('_id');
    if (!acudiente) throw new ErrorHttp(400, 'El acudiente elegido no existe en tu institución.');
  }

  const grado = grupo ? await Grado.findOne({ institucionId, numero: grupo.grado }).select('_id') : null;
  return { institucionId, grupo, anio, jornada, acudiente, grado, previa };
};

const aplicarAsignacion = async (plan, estudianteId) => {
  if (!plan) return null;
  const { institucionId, grupo, anio, jornada, acudiente, grado } = plan;
  let m = plan.previa;

  if (!m && grupo) {
    m = await Matricula.findOne({ institucionId, estudianteId, anioAcademicoId: anio._id });
  }

  if (m) {
    if (grupo) {
      m.grupoId = grupo._id;
      if (grado) m.gradoId = grado._id;
      if (m.estado === 'cancelada') { m.estado = 'activa'; m.motivo = ''; m.fechaMatricula = new Date(); }
    }
    if (jornada) m.jornadaId = jornada._id;
    if (acudiente) m.acudienteId = acudiente._id;
    return m.save();
  }

  const n = await Matricula.countDocuments({ institucionId, anioAcademicoId: anio._id });
  return Matricula.create({
    institucionId, anioAcademicoId: anio._id, estudianteId,
    grupoId: grupo._id, gradoId: grado ? grado._id : undefined,
    jornadaId: jornada ? jornada._id : undefined, acudienteId: acudiente ? acudiente._id : undefined,
    estado: 'activa', tipoMatricula: 'nueva', fechaMatricula: new Date(),
    numeroMatricula: `${anio.anio}-${String(n + 1).padStart(4, '0')}`
  });
};

module.exports = { separarAsignacion, prepararAsignacion, aplicarAsignacion, ErrorHttp };
