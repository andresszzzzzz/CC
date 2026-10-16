const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Usuario = require('../models/Usuario');
const Institucion = require('../models/Institucion');
const AnioAcademico = require('../models/AnioAcademico');
const { enviarRecuperacionPassword } = require('../services/mail.service');

const generarToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario._id,
      institucionId: usuario.institucionId,
      nucleoId: usuario.nucleoId,
      tipoPerfil: usuario.tipoPerfil
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
};

const sinPassword = (usuario) => {
  const obj = usuario.toObject();
  delete obj.credenciales.passwordHash;
  return obj;
};

// Login. Recibe { usuario | email, password, institucionId? }
const login = async (req, res) => {
  try {
    const { usuario: nombreUsuario, email, password, institucionId } = req.body;

    if (!password || (!nombreUsuario && !email)) {
      return res.status(400).json({ mensaje: 'Usuario/email y contraseña son requeridos' });
    }

    const filtro = email
      ? { email: email.toLowerCase() }
      : { 'credenciales.usuario': nombreUsuario.toLowerCase() };

    if (institucionId) filtro.institucionId = institucionId;

    const usuario = await Usuario.findOne(filtro).select('+credenciales.passwordHash');

    if (!usuario || usuario.estado !== 'activo') {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    // Validación de estado de la institución asociada
    if (usuario.institucionId) {
      const institucion = await Institucion.findById(usuario.institucionId);
      if (!institucion || institucion.estado === 'inactivo') {
        return res.status(401).json({ mensaje: 'La institución se encuentra inactiva. No es posible iniciar sesión.' });
      }
    }

    const passwordValida = await usuario.compararPassword(password);
    if (!passwordValida) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    usuario.credenciales.ultimoLogin = new Date();
    await usuario.save();

    const token = generarToken(usuario);

    res.status(200).json({
      token,
      usuario: sinPassword(usuario),
      debeCambiarPassword: usuario.credenciales.debeCambiarPassword
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: error.message });
  }
};

// El logout es solo del lado del cliente (JWT es stateless)
const logout = (req, res) => {
  res.status(200).json({ mensaje: 'Sesión cerrada correctamente' });
};

// Cambio de contraseña (usuario autenticado cambia su propia contraseña)
const cambiarPassword = async (req, res) => {
  try {
    const { passwordActual, passwordNueva } = req.body;

    if (!passwordNueva || passwordNueva.length < 6) {
      return res.status(400).json({ mensaje: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    const usuario = await Usuario.findById(req.usuario.id).select('+credenciales.passwordHash');

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const passwordValida = await usuario.compararPassword(passwordActual);
    if (!passwordValida) {
      return res.status(401).json({ mensaje: 'La contraseña actual es incorrecta' });
    }

    usuario.credenciales.passwordHash = passwordNueva;
    usuario.credenciales.debeCambiarPassword = false;
    await usuario.save();

    res.status(200).json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cambiar la contraseña', error: error.message });
  }
};

// ---------------------------------------------------------------------------
// Recuperación de contraseña por correo
// ---------------------------------------------------------------------------
const MINUTOS_TOKEN = parseInt(process.env.RESET_TOKEN_MINUTES, 10) || 60;
const ESPERA_ENTRE_ENVIOS_MS = 60 * 1000; // evita spam de correos a una misma cuenta

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const urlFrontend = () => (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');

const enmascararEmail = (email = '') => {
  const [local, dominio] = email.split('@');
  if (!dominio) return '';
  return `${local.slice(0, 2)}${'*'.repeat(Math.max(local.length - 2, 1))}@${dominio}`;
};

// La cuenta puede recuperar contraseña solo si está activa y su institución también.
const cuentaHabilitada = async (usuario) => {
  if (!usuario || usuario.estado !== 'activo') return false;
  if (usuario.institucionId) {
    const institucion = await Institucion.findById(usuario.institucionId);
    if (!institucion || institucion.estado === 'inactivo') return false;
  }
  return true;
};

// Genera el token, guarda su hash y envía el correo. Devuelve false si se omitió por la espera mínima.
// `usuario` debe venir con select('+credenciales.resetTokenExpira').
const emitirEnlaceRecuperacion = async (usuario) => {
  const expiraActual = usuario.credenciales?.resetTokenExpira;
  if (expiraActual) {
    const emitidoHace = Date.now() - (expiraActual.getTime() - MINUTOS_TOKEN * 60 * 1000);
    if (emitidoHace < ESPERA_ENTRE_ENVIOS_MS) return false;
  }

  const token = crypto.randomBytes(32).toString('hex');
  await Usuario.updateOne(
    { _id: usuario._id },
    {
      $set: {
        'credenciales.resetTokenHash': hashToken(token),
        'credenciales.resetTokenExpira': new Date(Date.now() + MINUTOS_TOKEN * 60 * 1000)
      }
    }
  );

  const enlace = `${urlFrontend()}/restablecer-password?token=${token}`;
  await enviarRecuperacionPassword({ usuario, enlace, minutos: MINUTOS_TOKEN });
  return true;
};

// Pública. Recibe { email | usuario, institucionId? }.
// Siempre responde lo mismo, exista o no la cuenta, para no revelar qué correos están registrados.
const recuperarPassword = async (req, res) => {
  const { email, usuario: nombreUsuario, institucionId } = req.body || {};

  if (typeof email !== 'string' && typeof nombreUsuario !== 'string') {
    return res.status(400).json({ mensaje: 'Ingresa tu correo electrónico o tu usuario' });
  }

  const respuesta = {
    mensaje: 'Si los datos corresponden a una cuenta activa, enviamos un enlace de recuperación al correo registrado.'
  };

  try {
    const filtro = typeof email === 'string' && email.trim()
      ? { email: email.trim().toLowerCase() }
      : { 'credenciales.usuario': String(nombreUsuario).trim().toLowerCase() };
    if (typeof institucionId === 'string' && institucionId) filtro.institucionId = institucionId;

    // limit(2): si un mismo "usuario" existe en varios colegios es ambiguo y no se envía nada.
    const candidatos = await Usuario.find(filtro).select('+credenciales.resetTokenExpira').limit(2);

    if (candidatos.length === 1 && (await cuentaHabilitada(candidatos[0]))) {
      // Sin await a propósito: así el tiempo de respuesta no delata si la cuenta existe.
      emitirEnlaceRecuperacion(candidatos[0]).catch((e) =>
        console.error('[RECUPERAR-PASSWORD]', e.message)
      );
    }
  } catch (error) {
    console.error('[RECUPERAR-PASSWORD]', error.message);
  }

  res.status(200).json(respuesta);
};

// Con sesión (desde el perfil): envía el enlace al correo del usuario autenticado.
const solicitarRestablecimiento = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select('+credenciales.resetTokenExpira');

    if (!usuario || !(await cuentaHabilitada(usuario))) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    await emitirEnlaceRecuperacion(usuario);

    res.status(200).json({
      mensaje: `Enviamos un enlace para restablecer tu contraseña a ${enmascararEmail(usuario.email)}.`
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'No se pudo enviar el correo de recuperación', error: error.message });
  }
};

// Pública. Recibe { token, passwordNueva } con el token que llegó por correo.
const restablecerPassword = async (req, res) => {
  try {
    const { token, passwordNueva } = req.body || {};

    if (typeof token !== 'string' || !token) {
      return res.status(400).json({ mensaje: 'El enlace de recuperación no es válido' });
    }
    if (typeof passwordNueva !== 'string' || passwordNueva.length < 6) {
      return res.status(400).json({ mensaje: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    const usuario = await Usuario.findOne({
      'credenciales.resetTokenHash': hashToken(token),
      'credenciales.resetTokenExpira': { $gt: new Date() }
    }).select('+credenciales.passwordHash');

    if (!usuario || usuario.estado !== 'activo') {
      return res.status(400).json({ mensaje: 'El enlace de recuperación es inválido o ya venció. Solicita uno nuevo.' });
    }

    usuario.credenciales.passwordHash = passwordNueva; // el hook pre('save') la encripta
    usuario.credenciales.debeCambiarPassword = false;
    usuario.credenciales.resetTokenHash = undefined;   // el enlace sirve una sola vez
    usuario.credenciales.resetTokenExpira = undefined;
    await usuario.save();

    res.status(200).json({ mensaje: 'Contraseña restablecida correctamente. Ya puedes iniciar sesión.' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al restablecer la contraseña', error: error.message });
  }
};

// Devuelve el usuario autenticado (sin password)
const me = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).populate('institucionId', 'nombre configuracion');

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.status(200).json(sinPassword(usuario));
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el usuario actual', error: error.message });
  }
};

// Cronograma del año académico activo de la institución del usuario
const cronograma = async (req, res) => {
  try {
    if (!req.usuario.institucionId) {
      return res.status(400).json({ mensaje: 'Este usuario no tiene una institución asociada' });
    }

    const anio = await AnioAcademico.findOne({
      institucionId: req.usuario.institucionId,
      estado: { $in: ['activo', 'matricula', 'prematricula'] }
    }).sort({ anio: -1 });

    if (!anio) {
      return res.status(404).json({ mensaje: 'No hay un año académico activo para esta institución' });
    }

    res.status(200).json(anio.cronograma);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el cronograma', error: error.message });
  }
};

module.exports = {
  login,
  logout,
  cambiarPassword,
  recuperarPassword,
  solicitarRestablecimiento,
  restablecerPassword,
  me,
  cronograma
};