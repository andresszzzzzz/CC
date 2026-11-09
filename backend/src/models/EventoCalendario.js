const mongoose = require('mongoose');

const eventoCalendarioSchema = new mongoose.Schema({
  institucionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institucion', required: true },
  anioAcademicoId: { type: mongoose.Schema.Types.ObjectId, ref: 'AnioAcademico' },
  titulo: { type: String, trim: true, required: true, maxlength: 140 },
  descripcion: { type: String, trim: true, maxlength: 1500, default: '' },
  fechaInicio: { type: Date, required: true },
  fechaFin: { type: Date, required: true },
  tipo: { type: String, enum: ['academica', 'reunion', 'convivencia', 'eleccion', 'otra'], default: 'academica' },
  lugar: { type: String, trim: true, maxlength: 160, default: '' },
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
}, { timestamps: true });

eventoCalendarioSchema.path('fechaFin').validate(function (v) {
  return !this.fechaInicio || (v && v >= this.fechaInicio);
}, 'La fecha de finalización debe ser posterior al inicio.');
eventoCalendarioSchema.index({ institucionId: 1, fechaInicio: 1 });

module.exports = mongoose.model('EventoCalendario', eventoCalendarioSchema);
