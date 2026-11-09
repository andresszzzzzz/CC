const test = require('node:test');
const assert = require('node:assert/strict');
const { CAMPOS, normalizarComponentes, calcularNotaComponentes } = require('../src/utils/componentesCalificacion');

test('cinco componentes iguales de 20% calculan la definitiva', () => {
  const componentes = normalizarComponentes({ actitudinal: 4, procedimental: 5, cognitivo: 3.5,
    autoevaluacion: 4, bimestral: 4.5 });
  assert.equal(CAMPOS.length, 5);
  assert.equal(calcularNotaComponentes(componentes), 4.2);
});

test('una evaluación incompleta todavía no genera definitiva', () => {
  const componentes = normalizarComponentes({ actitudinal: 4.5 });
  assert.equal(calcularNotaComponentes(componentes), null);
  assert.equal(componentes.bimestral, null);
});

test('rechaza notas fuera de escala o sin número', () => {
  for (const invalida of [-1, 5.1, 'texto', Infinity]) {
    assert.throws(() => normalizarComponentes({ cognitivo: invalida }));
  }
  assert.equal(calcularNotaComponentes(normalizarComponentes(Object.fromEntries(CAMPOS.map(k => [k, 0])))), 0);
});
