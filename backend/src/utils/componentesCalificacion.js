// Cada componente tiene el mismo peso (20%). No se publica una definitiva
// hasta registrar los cinco; un campo sin diligenciar NO equivale a cero.
const CAMPOS = ['actitudinal', 'procedimental', 'cognitivo', 'autoevaluacion', 'bimestral'];

function normalizarComponentes(entrada) {
  if (!entrada || typeof entrada !== 'object' || Array.isArray(entrada)) {
    throw new Error('Envía un objeto de componentes de evaluación.');
  }
  const salida = {};
  for (const campo of CAMPOS) {
    const valor = entrada[campo];
    if (valor === undefined || valor === null || valor === '') {
      salida[campo] = null;
    } else {
      const n = Number(valor);
      if (!Number.isFinite(n) || n < 0 || n > 5) {
        throw new Error(`La nota ${campo} debe estar entre 0 y 5.`);
      }
      salida[campo] = n;
    }
  }
  return salida;
}

function calcularNotaComponentes(componentes) {
  if (!componentes || CAMPOS.some((campo) => typeof componentes[campo] !== 'number')) return null;
  return Math.round(CAMPOS.reduce((suma, campo) => suma + componentes[campo], 0) / CAMPOS.length * 100) / 100;
}

module.exports = { CAMPOS, normalizarComponentes, calcularNotaComponentes };
