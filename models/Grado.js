const mongoose = require('mongoose');

const gradoSchema = new mongoose.Schema({
  institucionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institucion', required: true },
  nombre: { type: String, required: true, trim: true },
  numero: { type: Number, required: true, min: 0, max: 13 }, // 0 = transición ... 11 = once
  cicloId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ciclo', required: true },
  estado: { type: String, enum: ['activo', 'inactivo'], default: 'activo' }
}, { timestamps: true });

gradoSchema.index({ institucionId: 1, numero: 1 }, { unique: true });

module.exports = mongoose.model('Grado', gradoSchema);
