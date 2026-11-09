// Reglas puras; no requieren conexión a MongoDB y son testeables con node --test.
const fechasExcusaValidas = (inicio, fin) => {
  if (!inicio || !fin) return false;
  const d1 = new Date(inicio), d2 = new Date(fin);
  return Number.isFinite(d1.getTime()) && Number.isFinite(d2.getTime()) && d2 >= d1;
};
const cargosValidos = (lista) => Array.isArray(lista) && lista.length > 0 &&
  lista.every(s => typeof s === 'string' && s.trim().length > 0 && s.length <= 100) &&
  new Set(lista.map(s => s.toLowerCase().trim())).size === lista.length;
const candidatosValidos = (candidatos, cargos) => {
  if (!Array.isArray(candidatos)) return false;
  const claves = candidatos.map(c => `${String(c.estudianteId)}|${String(c.cargo)}`);
  return candidatos.every(c => c.estudianteId && cargos.includes(c.cargo)) && new Set(claves).size === claves.length;
};
module.exports = { fechasExcusaValidas, cargosValidos, candidatosValidos };
