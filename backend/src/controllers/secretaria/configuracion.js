// Información institucional, sistema de calificación e imágenes (escudo, firmas, fotos).
const fs = require('fs');
const path = require('path');
const Institucion = require('../../models/Institucion');
const SistemaCalificacion = require('../../models/SistemaCalificacion');
const Imagen = require('../../models/Imagen');
const Usuario = require('../../models/Usuario');
const { CARPETA_UPLOADS, rutaPublica } = require('../../middlewares/upload');
const { ruta, ErrorHttp, institucionDe, validarId } = require('./helpers');

// ---------- Información institucional ----------
const aFront = (i) => ({
  _id: String(i._id),
  nombre: i.nombre || '', nit: i.nit || '', codigoDane: i.dane || '', resolucion: i.resolucion || '',
  direccion: i.direccion || '', telefono: i.telefono || '', correo: i.email || '', sitioWeb: i.sitioWeb || '',
  municipio: i.municipio || '', departamento: i.departamento || '',
  rectorNombre: i.rectorNombre || '', rectorDocumento: i.rectorDocumento || '', lema: i.lema || '',
  escudoUrl: (i.imagenes && i.imagenes.escudo) || '', fotoUrl: i.logo || ''
});

const institucionCfg = {
  obtener: ruta(async (req, res) => {
    const i = await Institucion.findById(institucionDe(req));
    if (!i) throw new ErrorHttp(404, 'No se encontró la institución.');
    res.json(aFront(i));
  }),

  guardar: ruta(async (req, res) => {
    const b = req.body || {};
    if (b.nombre !== undefined && !String(b.nombre).trim()) throw new ErrorHttp(400, 'El nombre del colegio es obligatorio.');
    const mapa = {
      nombre: 'nombre', nit: 'nit', codigoDane: 'dane', resolucion: 'resolucion', direccion: 'direccion',
      telefono: 'telefono', correo: 'email', sitioWeb: 'sitioWeb', municipio: 'municipio', departamento: 'departamento',
      rectorNombre: 'rectorNombre', rectorDocumento: 'rectorDocumento', lema: 'lema', escudoUrl: 'imagenes.escudo', fotoUrl: 'logo'
    };
    const set = {};
    Object.entries(mapa).forEach(([front, campo]) => { if (b[front] !== undefined) set[campo] = typeof b[front] === 'string' ? b[front].trim() : b[front]; });
    if (set.nit !== undefined && !set.nit) throw new ErrorHttp(400, 'El NIT no puede quedar vacío.');
    const i = await Institucion.findByIdAndUpdate(institucionDe(req), { $set: set }, { new: true, runValidators: true });
    if (!i) throw new ErrorHttp(404, 'No se encontró la institución.');
    res.json(aFront(i));
  })
};

// ---------- Sistema de calificación ----------
const validarConfig = (c) => {
  const errores = [];
  if (!c || typeof c !== 'object') return ['La configuración llegó vacía.'];
  const e = c.escala || {};
  if (!(Number(e.min) < Number(e.max))) errores.push('La nota mínima debe ser menor que la máxima.');
  if (!(Number(e.notaAprobatoria) >= Number(e.min) && Number(e.notaAprobatoria) <= Number(e.max))) errores.push('La nota aprobatoria debe estar dentro de la escala.');
  if (!Array.isArray(c.rangos) || !c.rangos.length) errores.push('Define al menos un rango de desempeño.');
  else {
    const rs = [...c.rangos].map((r) => ({ nombre: String(r.nombre || '').trim(), desde: Number(r.desde), hasta: Number(r.hasta) })).sort((a, b) => a.desde - b.desde);
    if (rs.some((r) => !r.nombre || r.desde > r.hasta)) errores.push('Revisa los rangos: cada uno necesita nombre y "desde" ≤ "hasta".');
    if (rs.some((r, i) => i && r.desde <= rs[i - 1].hasta)) errores.push('Hay rangos que se cruzan.');
    if (rs[0].desde > Number(e.min) || rs[rs.length - 1].hasta < Number(e.max)) errores.push('Los rangos deben cubrir toda la escala (de la nota mínima a la máxima).');
  }
  if (c.metodo === 'ponderado') {
    const t = (c.pesosActividad || []).reduce((s, x) => s + Number(x.porcentaje || 0), 0);
    if (Math.abs(t - 100) > 0.01) errores.push(`Los porcentajes por tipo de actividad suman ${t}%, deben sumar 100%.`);
  }
  if (c.notaFinal && c.notaFinal.metodo === 'ponderado_periodos') {
    const t = (c.pesosPeriodo || []).filter((p) => p.incluir).reduce((s, x) => s + Number(x.porcentaje || 0), 0);
    if (Math.abs(t - 100) > 0.01) errores.push(`Los porcentajes de los periodos suman ${t}%, deben sumar 100%.`);
  }
  return errores;
};

const calificacionCfg = {
  obtener: ruta(async (req, res) => {
    const doc = await SistemaCalificacion.findOne({ institucionId: institucionDe(req) });
    res.json(doc ? doc.config : {}); // {} => el cliente usa los valores recomendados
  }),

  guardar: ruta(async (req, res) => {
    const errores = validarConfig(req.body);
    if (errores.length) return res.status(400).json({ mensaje: errores.join(' '), errores });
    const doc = await SistemaCalificacion.findOneAndUpdate(
      { institucionId: institucionDe(req) }, { $set: { config: req.body } }, { new: true, upsert: true, runValidators: true }
    );
    res.json(doc.config);
  })
};

// ---------- Imágenes ----------
// tipo -> carpeta de uploads
const TIPOS = {
  escudo: 'instituciones', colegio: 'instituciones', firma: 'instituciones', institucional: 'instituciones',
  estudiante: 'usuarios', docente: 'usuarios', acudiente: 'usuarios'
};
const TIPOS_PERSONA = ['estudiante', 'docente', 'acudiente'];

const validarTipo = (tipo) => {
  if (!TIPOS[tipo]) throw new ErrorHttp(400, `Tipo de imagen inválido. Usa: ${Object.keys(TIPOS).join(', ')}.`);
};

const imagenes = {
  subir: ruta(async (req, res) => {
    const institucionId = institucionDe(req);
    const { tipo } = req.params;
    validarTipo(tipo);
    if (!req.file) throw new ErrorHttp(400, 'No se recibió ningún archivo (campo "archivo").');
    const url = rutaPublica(TIPOS[tipo], req.file.filename);

    if (TIPOS_PERSONA.includes(tipo)) {
      const { personaId } = req.body || {};
      if (personaId) {
        validarId(personaId, 'personaId');
        const u = await Usuario.findOneAndUpdate({ _id: personaId, institucionId }, { $set: { foto: url } });
        if (!u) throw new ErrorHttp(404, 'La persona no existe en tu institución.');
      }
      return res.status(201).json({ url });
    }
    if (tipo === 'institucional') {
      const img = await Imagen.create({ institucionId, tipo, url, nombre: req.file.originalname, subidaPor: req.usuario.id });
      return res.status(201).json({ _id: String(img._id), url, nombre: img.nombre });
    }
    // escudo / colegio / firma: la pantalla guarda después la URL en el campo que corresponda
    res.status(201).json({ url });
  }),

  galeria: ruta(async (req, res) => {
    validarTipo(req.params.tipo);
    const docs = await Imagen.find({ institucionId: institucionDe(req), tipo: req.params.tipo }).sort({ createdAt: -1 });
    res.json(docs.map((d) => ({ _id: String(d._id), url: d.url, nombre: d.nombre })));
  }),

  eliminar: ruta(async (req, res) => {
    validarTipo(req.params.tipo);
    validarId(req.params.id);
    const img = await Imagen.findOneAndDelete({ _id: req.params.id, institucionId: institucionDe(req), tipo: req.params.tipo });
    if (!img) throw new ErrorHttp(404, 'No se encontró la imagen.');
    // Borra el archivo físico solo si está dentro de la carpeta de uploads
    const archivo = path.resolve(CARPETA_UPLOADS, '..', img.url.replace(/^\//, ''));
    if (archivo.startsWith(path.resolve(CARPETA_UPLOADS) + path.sep)) fs.unlink(archivo, () => {});
    res.json({ mensaje: 'Imagen eliminada.' });
  })
};

module.exports = { institucionCfg, calificacionCfg, imagenes };
