const mongoose = require('mongoose');

// Galería de imágenes institucionales (fotos del colegio, eventos, etc.)
const imagenSchema = new mongoose.Schema({
  institucionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institucion', required: true },
  tipo: { type: String, required: true, trim: true },
  url: { type: String, required: true },
  nombre: { type: String, trim: true },
  subidaPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
}, { timestamps: true });

imagenSchema.index({ institucionId: 1, tipo: 1 });

module.exports = mongoose.model('Imagen', imagenSchema);
