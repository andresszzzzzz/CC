const mongoose = require('mongoose');

const jornadaSchema = new mongoose.Schema({
  institucionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institucion', required: true },
  tipo: { type: String, enum: ['manana', 'tarde', 'noche', 'unica'], required: true },
  nombre: { type: String, required: true, trim: true },
  horaInicio: { type: String, trim: true, default: '' }, // "HH:mm"
  horaFin: { type: String, trim: true, default: '' },
  estado: { type: String, enum: ['activo', 'inactivo'], default: 'activo' }
}, { timestamps: true });

jornadaSchema.index({ institucionId: 1, nombre: 1 }, { unique: true });

module.exports = mongoose.model('Jornada', jornadaSchema);
