// Envío de correos.
// - Si existe BREVO_API_KEY: usa la API HTTPS de Brevo (funciona en Render gratis,
//   porque Render bloquea los puertos SMTP 25/465/587 en el plan gratuito).
// - Si no, y existe SMTP_HOST: usa SMTP con nodemailer (útil en local o en un plan de pago).
// - Si no hay ninguno, no envía y lo avisa en el log.

const brevoConfigurado = () => Boolean(process.env.BREVO_API_KEY);
const smtpConfigurado = () => Boolean(process.env.SMTP_HOST);

// Acepta 'EasyNotes <correo@dominio.com>' o solo 'correo@dominio.com'
const parsearRemitente = () => {
  const bruto = process.env.BREVO_SENDER || process.env.MAIL_FROM || process.env.SMTP_USER || '';
  const m = bruto.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (m) return { name: m[1].trim() || 'EasyNotes', email: m[2].trim() };
  return { name: 'EasyNotes', email: bruto.trim() };
};

const enviarPorBrevo = async ({ to, subject, text, html }) => {
  const sender = parsearRemitente();
  if (!sender.email) throw new Error('Falta el remitente: define MAIL_FROM o BREVO_SENDER');

  const respuesta = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
      accept: 'application/json'
    },
    body: JSON.stringify({
      sender,
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text
    }),
    signal: AbortSignal.timeout(15000)
  });

  if (!respuesta.ok) {
    let detalle = '';
    try { detalle = (await respuesta.json()).message || ''; } catch (_) { /* sin cuerpo JSON */ }
    throw new Error(`Brevo respondió ${respuesta.status}${detalle ? ': ' + detalle : ''}`);
  }
  return { enviado: true };
};

let transporter = null;
const enviarPorSmtp = async ({ to, subject, text, html }) => {
  if (!transporter) {
    const nodemailer = require('nodemailer');
    const puerto = parseInt(process.env.SMTP_PORT, 10) || 587;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: puerto,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : puerto === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
    });
  }
  await transporter.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, to, subject, text, html });
  return { enviado: true };
};

const escaparHtml = (texto = '') =>
  String(texto).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const enviarCorreo = async (datos) => {
  if (brevoConfigurado()) return enviarPorBrevo(datos);
  if (smtpConfigurado()) return enviarPorSmtp(datos);

  console.warn(`[MAIL] Sin proveedor de correo configurado (falta BREVO_API_KEY o SMTP_HOST): no se envió a ${datos.to}.`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[MAIL][DEV] Asunto: ${datos.subject}\n${datos.text}`);
  }
  return { enviado: false };
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
