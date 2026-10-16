const nodemailer = require('nodemailer');

let transporter = null;

const smtpConfigurado = () => Boolean(process.env.SMTP_HOST);

const obtenerTransporter = () => {
  if (transporter) return transporter;

  const puerto = parseInt(process.env.SMTP_PORT, 10) || 587;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: puerto,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : puerto === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined
  });
  return transporter;
};

const escaparHtml = (texto = '') =>
  String(texto).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const enviarCorreo = async ({ to, subject, text, html }) => {
  if (!smtpConfigurado()) {
    console.warn(`[MAIL] SMTP no configurado: no se envió el correo a ${to}.`);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[MAIL][DEV] Asunto: ${subject}\n${text}`);
    }
    return { enviado: false };
  }

  await obtenerTransporter().sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html
  });
  return { enviado: true };
};

const enviarRecuperacionPassword = async ({ usuario, enlace, minutos }) => {
  const nombre = usuario.nombres || 'usuario';
  const text =
    `Hola ${nombre},\n\n` +
    `Recibimos una solicitud para restablecer tu contraseña de EasyNotes.\n` +
    `Abre este enlace para crear una nueva (vence en ${minutos} minutos):\n\n${enlace}\n\n` +
    `Si no fuiste tú, ignora este mensaje: tu contraseña actual seguirá funcionando.`;

  const html =
    `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#222">` +
    `<h2>Restablecer contraseña</h2>` +
    `<p>Hola ${escaparHtml(nombre)},</p>` +
    `<p>Recibimos una solicitud para restablecer tu contraseña de <b>EasyNotes</b>.</p>` +
    `<p><a href="${escaparHtml(enlace)}" style="display:inline-block;padding:10px 18px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none">Crear nueva contraseña</a></p>` +
    `<p style="font-size:13px;color:#555">El enlace vence en ${minutos} minutos. Si no fuiste tú, ignora este mensaje: tu contraseña actual seguirá funcionando.</p>` +
    `</div>`;

  return enviarCorreo({ to: usuario.email, subject: 'Restablece tu contraseña - EasyNotes', text, html });
};

module.exports = { enviarCorreo, enviarRecuperacionPassword };