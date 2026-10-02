// Persona única: un solo registro de Usuario con roles y relaciones acudiente -> estudiante.
const Usuario = require('../../models/Usuario');
const { ruta, ErrorHttp, institucionDe, validarId, aId, escaparRegex } = require('./helpers');
const { FILTRO_ESTUDIANTE } = require('./matriculas');

const ROLES_EXTRA = ['estudiante', 'docente', 'acudiente', 'directivo', 'administrativo'];
// Rol "principal" (tipoPerfil, el que da permisos en la API) -> etiqueta de Secretaría
const PRINCIPAL = {
  estudiante: 'estudiante', docente: 'docente', acudiente: 'acudiente',
  rector: 'directivo', coordinador: 'directivo', admin: 'administrativo', secretaria: 'administrativo'
};

const rolPrincipal = (u) => PRINCIPAL[u.tipoPerfil] || null;
const rolesDe = (u) => [...new Set([rolPrincipal(u), ...(u.roles || [])].filter(Boolean))];
const seguro = (u) => {
  const o = u.toObject ? u.toObject() : { ...u };
  delete o.credenciales;
  return o;
};

const cargarPersona = async (req, id) => {
  validarId(id);
  const p = await Usuario.findOne({ _id: id, institucionId: institucionDe(req) });
  if (!p) throw new ErrorHttp(404, 'No se encontró la persona.');
  return p;
};

const personas = {
  buscar: ruta(async (req, res) => {
    const institucionId = institucionDe(req);
    const q = String(req.query.q || '').trim();
    if (q.length < 2) return res.json([]);
    const rx = new RegExp(escaparRegex(q), 'i');
    const lista = await Usuario.find({
      institucionId, $or: [{ nombres: rx }, { apellidos: rx }, { documento: rx }, { email: rx }]
    }).select('nombres apellidos documento tipoDocumento email foto estado tipoPerfil roles').sort({ apellidos: 1 }).limit(20);
    res.json(lista.map((u) => ({ ...seguro(u), roles: rolesDe(u) })));
  }),

  obtener: ruta(async (req, res) => {
    const p = await cargarPersona(req, req.params.id);
    await p.populate('estudiantes.estudianteId', 'nombres apellidos documento foto estado');
    res.json({
      persona: seguro(p),
      roles: rolesDe(p),
      relaciones: (p.estudiantes || []).filter((r) => r.estudianteId).map((r) => ({
        estudiante: {
          _id: String(r.estudianteId._id), nombres: r.estudianteId.nombres, apellidos: r.estudianteId.apellidos,
          documento: r.estudianteId.documento, estado: r.estudianteId.estado
        },
        parentesco: r.parentesco
      }))
    });
  }),

  agregarRol: ruta(async (req, res) => {
    const p = await cargarPersona(req, req.params.id);
    const { rol } = req.body;
    if (!ROLES_EXTRA.includes(rol)) throw new ErrorHttp(400, 'Rol inválido.');
    if (rolesDe(p).includes(rol)) throw new ErrorHttp(409, 'La persona ya tiene ese rol.');
    p.roles = [...(p.roles || []), rol];
    await p.save();
    res.json({ roles: rolesDe(p) });
  }),

  quitarRol: ruta(async (req, res) => {
    const p = await cargarPersona(req, req.params.id);
    const { rol } = req.params;
    if (rolPrincipal(p) === rol) {
      throw new ErrorHttp(400, 'Ese es su rol principal (define sus permisos de acceso). Cámbialo desde Usuarios.');
    }
    if (!(p.roles || []).includes(rol)) throw new ErrorHttp(404, 'La persona no tiene ese rol.');
    p.roles = p.roles.filter((r) => r !== rol);
    await p.save();
    res.json({ roles: rolesDe(p) });
  }),

  // Vincula acudiente <-> estudiante en AMBOS lados, sin duplicar.
  vincular: ruta(async (req, res) => {
    const institucionId = institucionDe(req);
    const persona = await cargarPersona(req, req.params.id);
    const { estudianteId } = req.body;
    const parentesco = String(req.body.parentesco || '').trim().slice(0, 60);
    validarId(estudianteId, 'estudianteId');
    if (String(estudianteId) === String(persona._id)) throw new ErrorHttp(400, 'Una persona no puede ser acudiente de sí misma.');
    const est = await Usuario.findOne({ _id: estudianteId, institucionId, ...FILTRO_ESTUDIANTE }).select('_id');
    if (!est) throw new ErrorHttp(404, 'El estudiante no existe en tu institución.');

    // Si aún no es acudiente, se le agrega ese rol (sigue siendo una sola persona)
    if (!rolesDe(persona).includes('acudiente')) persona.roles = [...(persona.roles || []), 'acudiente'];
    persona.estudiantes = (persona.estudiantes || []).filter((r) => String(r.estudianteId) !== String(est._id));
    persona.estudiantes.push({ estudianteId: est._id, parentesco });
    await persona.save();

    await Usuario.updateOne({ _id: est._id }, { $pull: { acudientes: { acudienteId: persona._id } } });
    await Usuario.updateOne({ _id: est._id }, { $push: { acudientes: { acudienteId: persona._id, parentesco } } });
    res.status(201).json({ mensaje: 'Estudiante vinculado.' });
  }),

  desvincular: ruta(async (req, res) => {
    const persona = await cargarPersona(req, req.params.id);
    validarId(req.params.estudianteId, 'estudianteId');
    await Usuario.updateOne({ _id: persona._id }, { $pull: { estudiantes: { estudianteId: req.params.estudianteId } } });
    await Usuario.updateOne(
      { _id: req.params.estudianteId, institucionId: persona.institucionId },
      { $pull: { acudientes: { acudienteId: persona._id } } }
    );
    res.json({ mensaje: 'Vínculo retirado.' });
  })
};

module.exports = { personas, rolesDe };
