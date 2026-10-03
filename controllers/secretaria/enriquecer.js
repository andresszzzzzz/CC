// Agrega a cada estudiante del listado de /usuarios los datos que muestra Secretaría:
// estadoEstudiante (registrado | no matriculado | matriculado | retirado | inactivo),
// grupoNombre, jornadaNombre y, para precargar el formulario, grupoId / jornadaId / acudienteId.
const Matricula = require('../../models/Matricula');
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
    .populate('grupoId', 'nombre').populate('jornadaId', 'nombre').sort({ createdAt: -1 })
    .select('estudianteId anioAcademicoId grupoId jornadaId acudienteId estado');

  const porEst = new Map();
  matriculas.forEach((m) => {
    const k = String(m.estudianteId);
    if (!porEst.has(k)) porEst.set(k, []);
    porEst.get(k).push(m);
  });

  return lista.map((u) => {
    if (u.tipoPerfil !== 'estudiante') return u;
    const ms = porEst.get(String(u._id)) || [];
    const actual = ms.find((m) => anioActual.has(String(m.anioAcademicoId)));
    const ref = actual || ms[0];
    let estadoEstudiante = 'registrado';
    if (u.estado === 'inactivo') estadoEstudiante = 'inactivo';
    else if (actual && actual.estado === 'activa') estadoEstudiante = 'matriculado';
    else if (actual && actual.estado === 'retirada') estadoEstudiante = 'retirado';
    else if (ms.length) estadoEstudiante = 'no matriculado';
    return {
      ...u,
      estadoEstudiante,
      grupoNombre: actual && actual.grupoId ? actual.grupoId.nombre : '',
      jornadaNombre: actual && actual.jornadaId ? actual.jornadaId.nombre : '',
      grupoId: actual && actual.grupoId ? String(actual.grupoId._id) : undefined,
      jornadaId: ref && ref.jornadaId ? String(ref.jornadaId._id) : undefined,
      acudienteId: ref && ref.acudienteId ? String(ref.acudienteId) : undefined
    };
  });
};

module.exports = { enriquecerEstudiantes };
