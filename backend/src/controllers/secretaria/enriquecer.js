// Agrega a cada estudiante del listado de /usuarios los datos que muestra Secretaría:
// estadoEstudiante (registrado | no matriculado | matriculado | retirado | inactivo),
// grupoNombre, jornadaNombre y, para precargar el formulario, grupoId / jornadaId / acudienteId.
const Matricula = require('../../models/Matricula');
const CargaAcademica = require('../../models/CargaAcademica');
const AnioAcademico = require('../../models/AnioAcademico');
const { ESTADOS_ANIO } = require('../../config/constants');

const enriquecerEstudiantes = async (usuarios) => {
  const lista = usuarios.map((u) => (u.toJSON ? u.toJSON() : u));
  const ids = lista.filter((u) => u.tipoPerfil === 'estudiante').map((u) => u._id);
  if (!ids.length) return lista;

  const instIds = [...new Set(lista.map((u) => String((u.institucionId && u.institucionId._id) || u.institucionId)))];
  const anios = await AnioAcademico.find({ institucionId: { $in: instIds }, estado: ESTADOS_ANIO.ACTIVO }).select('_id institucionId');
  const anioActual = new Set(anios.map((a) => String(a._id)));

  const matriculas = await Matricula.find({ estudianteId: { $in: ids }, estado: { $ne: 'cancelada' } })
    .populate({ path: 'grupoId', select: 'nombre docenteDirectorId', populate: { path: 'docenteDirectorId', select: 'nombres apellidos' } })
    .populate('jornadaId', 'nombre').populate('anioAcademicoId', 'anio').sort({ createdAt: -1 })
    .select('estudianteId anioAcademicoId grupoId jornadaId acudienteId estado');

  // Docentes que dictan en cada grupo (para mostrar «quién le da clase» a cada estudiante)
  const grupoIds = [...new Set(matriculas.filter((m) => m.grupoId).map((m) => String(m.grupoId._id)))];
  const cargas = grupoIds.length
    ? await CargaAcademica.find({ grupoId: { $in: grupoIds }, estado: 'activo' }).populate('docenteId', 'nombres apellidos').select('grupoId anioAcademicoId docenteId')
    : [];
  const docentesPorGrupo = new Map();
  cargas.forEach((c) => {
    if (!c.docenteId) return;
    const k = String(c.grupoId);
    if (!docentesPorGrupo.has(k)) docentesPorGrupo.set(k, new Map());
    docentesPorGrupo.get(k).set(String(c.docenteId._id), `${c.docenteId.nombres} ${c.docenteId.apellidos}`.trim());
  });

  const porEst = new Map();
  matriculas.forEach((m) => {
    const k = String(m.estudianteId);
    if (!porEst.has(k)) porEst.set(k, []);
    porEst.get(k).push(m);
  });

  const idDe = (v) => String((v && v._id) || v);

  return lista.map((u) => {
    if (u.tipoPerfil !== 'estudiante') return u;
    const ms = porEst.get(String(u._id)) || [];
    const actual = ms.find((m) => anioActual.has(idDe(m.anioAcademicoId)));
    const ref = actual || ms[0];
    let estadoEstudiante = 'registrado';
    if (u.estado === 'inactivo') estadoEstudiante = 'inactivo';
    else if (actual && actual.estado === 'activa') estadoEstudiante = 'matriculado';
    else if (actual && actual.estado === 'retirada') estadoEstudiante = 'retirado';
    else if (ms.length) estadoEstudiante = 'no matriculado';
    // Grupo y jornada que se MUESTRAN: los del año actual; si no tiene matrícula este año,
    // los de su matrícula más reciente (con el año al lado) para que la columna no quede vacía.
    const vista = actual || ms.find((m) => m.grupoId || m.jornadaId);
    const grupoVista = vista && vista.grupoId ? vista.grupoId : null;
    const docentes = grupoVista && docentesPorGrupo.get(String(grupoVista._id));
    const director = grupoVista && grupoVista.docenteDirectorId;
    return {
      ...u,
      estadoEstudiante,
      grupoNombre: grupoVista ? grupoVista.nombre : '',
      jornadaNombre: vista && vista.jornadaId ? vista.jornadaId.nombre : '',
      matriculaAnio: vista && vista.anioAcademicoId ? vista.anioAcademicoId.anio : undefined,
      matriculaEsActual: vista ? vista === actual : undefined,
      directorNombre: director ? `${director.nombres} ${director.apellidos}`.trim() : '',
      docentesGrupo: docentes ? [...docentes.values()].join(', ') : '',
      // Para precargar el formulario solo se usa la matrícula del año actual (un grupo de un año cerrado no se puede reasignar)
      grupoId: actual && actual.grupoId ? String(actual.grupoId._id) : undefined,
      jornadaId: ref && ref.jornadaId ? String(ref.jornadaId._id) : undefined,
      acudienteId: ref && ref.acudienteId ? String(ref.acudienteId) : undefined
    };
  });
};

module.exports = { enriquecerEstudiantes };
