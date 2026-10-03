const mongoose = require('mongoose');

const DOCUMENTOS = ['boletin', 'certificado', 'constancia', 'acta', 'otros'];

const firmaSchema = new mongoose.Schema({
  institucionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institucion', required: true },
  tipo: { type: String, enum: ['rector', 'coordinador', 'secretario', 'otra'], default: 'otra' },
  nombre: { type: String, required: true, trim: true },
  cargo: { type: String, trim: true, default: '' },
  imagenUrl: { type: String, default: '' },
  activa: { type: Boolean, default: true },
  orden: { type: Number, default: 0 },
  usarEn: { type: [{ type: String, enum: DOCUMENTOS }], default: DOCUMENTOS },
  estado: { type: String, enum: ['activo', 'inactivo'], default: 'activo' }
}, { timestamps: true });

firmaSchema.index({ institucionId: 1, orden: 1 });

module.exports = mongoose.model('Firma', firmaSchema);
