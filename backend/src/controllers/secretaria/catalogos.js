// Jornadas, ciclos, grados y firmas: colecciones simples de la institución.
const Jornada = require('../../models/Jornada');
const Ciclo = require('../../models/Ciclo');
const Grado = require('../../models/Grado');
const Firma = require('../../models/Firma');
const Matricula = require('../../models/Matricula');
const { crearCrud, ErrorHttp, aId } = require('./helpers');

const jornadas = crearCrud(Jornada, {
  nombre: 'jornada',
  campos: ['tipo', 'nombre', 'horaInicio', 'horaFin', 'estado'],
  filtros: ['estado'],
  orden: { horaInicio: 1, nombre: 1 },
  enUso: (doc, institucionId) => Matricula.countDocuments({ institucionId, jornadaId: doc._id })
});

const ciclos = crearCrud(Ciclo, {
  nombre: 'ciclo',
  campos: ['nombre', 'nivel', 'gradoDesde', 'gradoHasta', 'orden', 'estado'],
  filtros: ['estado', 'nivel'],
  orden: { orden: 1, gradoDesde: 1 },
  validar: (d) => {
    if (d.gradoDesde != null && d.gradoHasta != null && Number(d.gradoHasta) < Number(d.gradoDesde)) {
      throw new ErrorHttp(400, 'El grado final no puede ser menor que el inicial.');
    }
  },
  enUso: (doc, institucionId) => Grado.countDocuments({ institucionId, cicloId: doc._id })
});

const serializarGrado = (g) => {
  const o = g.toJSON();
  o.cicloNombre = g.cicloId && g.cicloId.nombre ? g.cicloId.nombre : '';
  o.cicloId = aId(g.cicloId);
  return o;
};

const grados = crearCrud(Grado, {
  nombre: 'grado',
  campos: ['nombre', 'numero', 'cicloId', 'estado'],
  filtros: ['estado', 'cicloId'],
  poblar: { path: 'cicloId', select: 'nombre' },
  orden: { numero: 1 },
  serializar: serializarGrado,
  validar: async (d, institucionId) => {
    if (d.cicloId) {
      const ciclo = await Ciclo.findOne({ _id: d.cicloId, institucionId }).select('_id');
      if (!ciclo) throw new ErrorHttp(400, 'El ciclo elegido no existe en tu institución.');
    }
  },
  enUso: (doc, institucionId) => Matricula.countDocuments({ institucionId, gradoId: doc._id })
});

const firmas = crearCrud(Firma, {
  nombre: 'firma',
  campos: ['tipo', 'nombre', 'cargo', 'imagenUrl', 'activa', 'orden', 'usarEn', 'estado'],
  filtros: ['estado', 'tipo'],
  orden: { orden: 1 }
});

module.exports = { jornadas, ciclos, grados, firmas };
