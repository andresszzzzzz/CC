const mongoose = require('mongoose');

const cicloSchema = new mongoose.Schema({
  institucionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institucion', required: true },
  nombre: { type: String, required: true, trim: true },
  nivel: { type: String, enum: ['preescolar', 'primaria', 'secundaria', 'media'], required: true },
  gradoDesde: { type: Number, min: 0, max: 13 },
  gradoHasta: { type: Number, min: 0, max: 13 },
  orden: { type: Number, default: 0 },
  estado: { type: String, enum: ['activo', 'inactivo'], default: 'activo' }
}, { timestamps: true });

cicloSchema.index({ institucionId: 1, nombre: 1 }, { unique: true });

module.exports = mongoose.model('Ciclo', cicloSchema);
