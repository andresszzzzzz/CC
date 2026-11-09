const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const raiz = path.join(__dirname, '..', 'src');
const reglas = require('../src/utils/validacionesCoordinador');
const contexto = (archivo, dependencias) => {
  const modulo = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(raiz, 'controllers', archivo), 'utf8'), {
    require(nombre) {
      if (nombre === '../utils/auditoriaCoordinador') return { registrarAuditoria: async () => {} };
      if (!(nombre in dependencias)) throw new Error('Dependencia no preparada para la prueba: ' + nombre);
      return dependencias[nombre];
    },
    module: modulo, exports: modulo.exports, console, Date, String, Number, Object, Array, Set, Promise
  }, { filename: archivo });
  return modulo.exports;
};
const respuesta = () => ({
  code: 200, body: null,
  status(n) { this.code=n; return this },
  json(body) { this.body=body; return this }
});
const usuario = (tipoPerfil='coordinador') => ({ usuario: { tipoPerfil, id: 'coord-1', institucionId:'colegio-1' }, body: {}, params:{} });
const tenant = (req) => ({ institucionId: req.usuario.institucionId });

test('excusas: fechas válidas y rango inválido rechazado', () => {
  assert.equal(reglas.fechasExcusaValidas('2026-11-01','2026-11-10'),true);
  assert.equal(reglas.fechasExcusaValidas('2026-11-11','2026-11-10'),false);
  assert.equal(reglas.fechasExcusaValidas('fecha_incorrecta','2026-11-10'),false);
});
test('elecciones: se rechazan cargos duplicados y candidaturas repetidas', () => {
  assert.equal(reglas.cargosValidos(['Personería','Personería']),false);
  assert.equal(reglas.cargosValidos(['Personería','Contraloría']),true);
  assert.equal(reglas.candidatosValidos([{estudianteId:'A',cargo:'Personería'},{estudianteId:'A',cargo:'Personería'}],['Personería']),false);
  assert.equal(reglas.candidatosValidos([{estudianteId:'A',cargo:'Personería'}],['Contraloría']),false);
});
test('excusas: registro asigna institución y estado pendiente en el servidor', async () => {
  let creado;
  const controlador = contexto('excusas.controller.js', {
    '../models/Excusas': { create: async (datos) => (creado = datos) },
    '../models/Usuario': { exists: async () => true },
    '../models/AnioAcademico': { exists: async () => true },
    '../utils/tenant': { filtroTenant: tenant },
    '../utils/validacionesCoordinador': reglas
  });
  const req = usuario(); req.body = { docenteId:'doc-1', anioAcademicoId:'anio-1', fechaInicio:'2026-11-01', fechaFin:'2026-11-02', motivo:'Permiso', institucionId:'colegio-ajeno', estado:'aprobada', aprobadoPor:'intruso' };
  const res = respuesta(); await controlador.crearExcusa(req,res);
  assert.equal(res.code,201);
  assert.equal(creado.institucionId,'colegio-1');
  assert.equal(creado.estado,'pendiente');
  assert.equal(creado.aprobadoPor,undefined);
});
test('excusas: fecha incorrecta no crea registros', async () => {
  let intentos = 0;
  const controlador = contexto('excusas.controller.js', {
    '../models/Excusas': { create: async () => { intentos++; } },
    '../models/Usuario': { exists: async () => true },
    '../models/AnioAcademico': { exists: async () => true },
    '../utils/tenant': { filtroTenant: tenant },
    '../utils/validacionesCoordinador': reglas
  });
  const req = usuario(); req.body={ docenteId:'doc-1', anioAcademicoId:'anio-1', fechaInicio:'2026-11-10', fechaFin:'2026-11-01', motivo:'Permiso' };
  const res=respuesta(); await controlador.crearExcusa(req,res);
  assert.equal(res.code,400); assert.equal(intentos,0);
});
test('excusas: elimina únicamente usando el filtro de la institución', async () => {
  let filtro;
  const controlador = contexto('excusas.controller.js', {
    '../models/Excusas': { findOneAndDelete: async (q) => { filtro=q; return { _id: 'excusa-1' }; } },
    '../models/Usuario': {}, '../models/AnioAcademico': {},
    '../utils/tenant': { filtroTenant: tenant }, '../utils/validacionesCoordinador': reglas
  });
  const req=usuario(); req.params.id='excusa-1';const res=respuesta();
  await controlador.eliminarExcusa(req,res);
  assert.equal(res.code,200); assert.equal(filtro.institucionId,'colegio-1'); assert.equal(filtro._id,'excusa-1');
});
test('cronograma: creación no acepta institución suplantada', async () => {
  let creado;
  const controlador = contexto('eventocalendario.controller.js', {
    '../models/EventoCalendario': { create: async (datos) => (creado=datos) },
    '../models/AnioAcademico': { exists: async () => true },
    '../utils/tenant': { filtroTenant: tenant }
  });
  const req=usuario();req.body={titulo:'Reunión',fechaInicio:'2026-11-10T10:00:00Z',fechaFin:'2026-11-10T11:00:00Z',institucionId:'otro-colegio',tipo:'reunion'};
  const res=respuesta(); await controlador.crearEvento(req,res);
  assert.equal(res.code,201); assert.equal(creado.institucionId,'colegio-1');
  assert.equal(creado.creadoPor,'coord-1');
});
test('cronograma: se rechazan rangos de tiempo inconsistentes', async () => {
  let intentos=0;
  const controlador = contexto('eventocalendario.controller.js', {
    '../models/EventoCalendario': { create: async () => { intentos++ } },
    '../models/AnioAcademico': { exists: async () => true },
    '../utils/tenant': { filtroTenant: tenant }
  });
  const req=usuario();req.body={titulo:'Reunión',fechaInicio:'2026-11-10T12:00:00Z',fechaFin:'2026-11-10T11:00:00Z'};
  const res=respuesta(); await controlador.crearEvento(req,res);
  assert.equal(res.code,400); assert.equal(intentos,0);
});
test('votaciones: un estudiante no puede crear votos para otra persona', async () => {
  let guardado;
  class VotoFake { constructor(datos) { guardado=datos } async save() { return guardado } }
  const controlador = contexto('voto.controller.js', {
    '../models/Voto': VotoFake,
    '../models/EventoElectoral': { findOne: async () => ({ _id:'evento-1', estado:'en_curso', institucionId:'colegio-1', cargosDisponibles:['Personería'], candidatos:{ id:() => ({cargo:'Personería'}) }, gruposHabilitados:[] }) },
    '../models/Matricula': { findOne: async () => ({ estudianteId:'estudiante-real', grupoId:'grupo-1' }) },
    '../utils/tenant': { filtroTenant: tenant }
  });
  const req=usuario('estudiante'); req.usuario.id='estudiante-real'; req.body={eventoId:'evento-1',estudianteId:'estudiante-suplantado',candidatoId:'candidato-1',cargo:'Personería'};
  const res=respuesta(); await controlador.crearVoto(req,res);
  assert.equal(res.code,201); assert.equal(guardado.estudianteId,'estudiante-real');
});
test('elecciones: tras recibir votos no permite alterar candidatos o grupos', async () => {
  const existente = { _id:'evento-1', titulo:'Personero', fechaInicio:'2026-11-10', fechaFin:'2026-11-11', cargosDisponibles:['Personería'], candidatos:[], gruposHabilitados:[] };
  let guardado = 0; existente.save = async () => { guardado++; };
  const controlador = contexto('eventoelectoral.controller.js', {
    '../models/EventoElectoral': { findOne: async () => existente },
    '../models/Matricula': { distinct: async () => [] },
    '../models/Grupo': { countDocuments: async () => 0 },
    '../models/Voto': { countDocuments: async () => 1 },
    '../utils/tenant': { filtroTenant: tenant },
    '../utils/validacionesCoordinador': reglas
  });
  const req=usuario(); req.params.id='evento-1'; req.body={ gruposHabilitados:['grupo-1'] };
  const res=respuesta(); await controlador.actualizarEventoElectoral(req,res);
  assert.equal(res.code,409); assert.equal(guardado,0);
});
test('resultados: estudiantes no pueden ver resultados privados', async () => {
  const controlador = contexto('voto.controller.js', {
    '../models/Voto': { find: async () => [] },
    '../models/EventoElectoral': { findOne: async () => ({ _id:'evento-1', resultadosPublicos:false }) },
    '../models/Matricula': { countDocuments: async () => 0 },
    '../utils/tenant': { filtroTenant: tenant }
  });
  const req=usuario('estudiante'); req.params.eventoId='evento-1';
  const res=respuesta(); await controlador.obtenerResultados(req,res);
  assert.equal(res.code,403);
});
test('resultados: coordinador ve el escrutinio real y abstención', async () => {
  const controlador = contexto('voto.controller.js', {
    '../models/Voto': { find: async () => [{cargo:'Personería',candidatoId:'candidato-1'}] },
    '../models/EventoElectoral': { findOne: async () => ({ _id:'evento-1',titulo:'Personero', resultadosPublicos:false,
      cargosDisponibles:['Personería'], candidatos:[{_id:'candidato-1',cargo:'Personería', estudianteId:'estudiante-1'}], gruposHabilitados: [] }) },
    '../models/Matricula': { countDocuments: async () => 4 },
    '../utils/tenant': { filtroTenant: tenant }
  });
  const req=usuario(); req.params.eventoId='evento-1';
  const res=respuesta(); await controlador.obtenerResultados(req,res);
  assert.equal(res.code,200); assert.equal(res.body.resultadosPorCargo[0].votosEmitidos,1); assert.equal(res.body.resultadosPorCargo[0].abstencion,3);
});
