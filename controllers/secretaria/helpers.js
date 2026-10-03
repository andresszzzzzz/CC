const mongoose = require('mongoose');

const esId = (v) => typeof v === 'string' || v instanceof mongoose.Types.ObjectId ? mongoose.Types.ObjectId.isValid(v) : false;
const aId = (v) => (v && v._id ? String(v._id) : v ? String(v) : v);
// Fecha -> "YYYY-MM-DD" (lo que esperan los <input type="date">)
const fechaISO = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
const escaparRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const SiNo = (b) => (b ? 'SI' : 'NO');

// Copia solo los campos permitidos (evita que el cliente escriba institucionId, _id, etc.)
const elegir = (origen = {}, campos = []) =>
  campos.reduce((acc, k) => {
    if (origen[k] !== undefined) acc[k] = origen[k];
    return acc;
  }, {});

// Error "de negocio" con código HTTP
class ErrorHttp extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
    this.mensaje = mensaje;
  }
}

const responderError = (res, e) => {
  if (e instanceof ErrorHttp) return res.status(e.status).json({ mensaje: e.mensaje });
  if (e && e.code === 11000) {
    return res.status(409).json({ mensaje: 'Ya existe un registro con esos datos (duplicado).' });
  }
  if (e && e.name === 'ValidationError') return res.status(400).json({ mensaje: 'Error de validación', error: e.message });
  if (e && e.name === 'CastError') return res.status(400).json({ mensaje: 'Identificador inválido' });
  console.error('[secretaria]', e);
  return res.status(500).json({ mensaje: 'Error interno del servidor', error: process.env.NODE_ENV === 'production' ? undefined : e.message });
};

// Envuelve un handler async para no repetir try/catch
const ruta = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (e) {
    responderError(res, e);
  }
};

// La institución SIEMPRE sale del token, nunca del navegador.
const institucionDe = (req) => {
  const id = req.usuario && req.usuario.institucionId;
  if (!id) throw new ErrorHttp(403, 'Tu usuario no tiene una institución asociada.');
  return id;
};

const validarId = (valor, nombre = 'id') => {
  if (!esId(String(valor))) throw new ErrorHttp(400, `Identificador inválido (${nombre}).`);
  return valor;
};

// Fábrica de CRUD para colecciones simples de una institución.
//   campos: lista blanca de campos editables
//   filtros: query params que se aceptan al listar
//   poblar: populate de mongoose; serializar(doc) arma el JSON final
//   enUso(doc, institucionId): devuelve cuántos registros dependen de este (si > 0 no se borra)
//   validar(datos, institucionId, doc?): lanza ErrorHttp si algo no cuadra
const crearCrud = (Modelo, opts) => {
  const {
    campos, filtros = [], poblar = null, orden = { createdAt: 1 },
    serializar = (d) => d.toJSON(), enUso = null, validar = null, nombre = 'registro'
  } = opts;

  const consulta = (q) => (poblar ? q.populate(poblar) : q);

  return {
    listar: ruta(async (req, res) => {
      const filtro = { institucionId: institucionDe(req) };
      filtros.forEach((k) => { if (req.query[k]) filtro[k] = req.query[k]; });
      const docs = await consulta(Modelo.find(filtro).sort(orden));
      res.json(docs.map(serializar));
    }),

    obtener: ruta(async (req, res) => {
      validarId(req.params.id);
      const doc = await consulta(Modelo.findOne({ _id: req.params.id, institucionId: institucionDe(req) }));
      if (!doc) throw new ErrorHttp(404, `No se encontró el ${nombre}.`);
      res.json(serializar(doc));
    }),

    crear: ruta(async (req, res) => {
      const institucionId = institucionDe(req);
      const datos = elegir(req.body, campos);
      if (validar) await validar(datos, institucionId);
      const doc = await Modelo.create({ ...datos, institucionId });
      const completo = await consulta(Modelo.findById(doc._id));
      res.status(201).json(serializar(completo));
    }),

    actualizar: ruta(async (req, res) => {
      const institucionId = institucionDe(req);
      validarId(req.params.id);
      const actual = await Modelo.findOne({ _id: req.params.id, institucionId });
      if (!actual) throw new ErrorHttp(404, `No se encontró el ${nombre}.`);
      const datos = elegir(req.body, campos);
      if (validar) await validar(datos, institucionId, actual);
      actual.set(datos);
      await actual.save();
      const completo = await consulta(Modelo.findById(actual._id));
      res.json(serializar(completo));
    }),

    eliminar: ruta(async (req, res) => {
      const institucionId = institucionDe(req);
      validarId(req.params.id);
      const doc = await Modelo.findOne({ _id: req.params.id, institucionId });
      if (!doc) throw new ErrorHttp(404, `No se encontró el ${nombre}.`);
      if (enUso) {
        const n = await enUso(doc, institucionId);
        if (n > 0) throw new ErrorHttp(409, `No se puede eliminar: está en uso (${n} registro(s) dependen de él). Márcalo como inactivo para conservar el historial.`);
      }
      await doc.deleteOne();
      res.json({ mensaje: 'Eliminado correctamente.' });
    })
  };
};

module.exports = { esId, aId, fechaISO, escaparRegex, SiNo, elegir, ErrorHttp, responderError, ruta, institucionDe, validarId, crearCrud };
