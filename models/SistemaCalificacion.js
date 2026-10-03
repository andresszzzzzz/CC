const mongoose = require('mongoose');

// Un único documento por institución. "config" guarda tal cual el objeto que arma
// la pantalla de Secretaría (escala, rangos, pesos, recuperación...).
const sistemaCalificacionSchema = new mongoose.Schema({
  institucionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institucion', required: true, unique: true },
  config: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('SistemaCalificacion', sistemaCalificacionSchema);
