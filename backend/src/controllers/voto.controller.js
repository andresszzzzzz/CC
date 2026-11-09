const Voto = require('../models/Voto');
const EventoElectoral = require('../models/EventoElectoral');
const Matricula = require('../models/Matricula');
const { filtroTenant } = require('../utils/tenant');

// Obtener todos los votos
const obtenerVotos = async (req, res) => {
  try {
    const eventosId = await EventoElectoral.distinct('_id', filtroTenant(req));
    const votos = await Voto.find({ eventoId: { $in: eventosId } })
      .populate('eventoId')
      .populate('estudianteId');

    res.json(votos);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Obtener un voto por ID
const obtenerVotoPorId = async (req, res) => {
  try {
    const voto = await Voto.findById(req.params.id)
      .populate('eventoId')
      .populate('estudianteId');
    if (voto && !(await EventoElectoral.exists({ _id: voto.eventoId?._id, ...filtroTenant(req) }))) {
      return res.status(404).json({ mensaje: 'Voto no encontrado' });
    }

    if (!voto) {
      return res.status(404).json({ mensaje: 'Voto no encontrado' });
    }

    res.json(voto);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Registrar un voto
// Reglas que se validan aquí (no solo el índice único de Mongo):
//  - el evento debe existir y estar "en_curso"
//  - el cargo debe ser uno de los disponibles en el evento
//  - el candidato debe existir en el evento y ser candidato justo para ese cargo
//  - si el evento tiene grupos habilitados, el estudiante debe pertenecer a
//    uno de esos grupos (según su matrícula activa)
//  - un estudiante no puede votar dos veces por el mismo cargo en el mismo evento
const crearVoto = async (req, res) => {
  try {
    const { eventoId, candidatoId, cargo } = req.body;
    const estudianteId = req.usuario.id;

    if (req.usuario.tipoPerfil !== 'estudiante') return res.status(403).json({ mensaje: 'Solo un estudiante autenticado puede votar.' });
    if (!eventoId || !candidatoId || !cargo) {
      return res.status(400).json({ mensaje: 'Se requiere eventoId, candidatoId y cargo' });
    }

    const evento = await EventoElectoral.findOne({ _id: eventoId, ...filtroTenant(req) });
    if (!evento) {
      return res.status(404).json({ mensaje: 'Evento electoral no encontrado' });
    }

    if (evento.estado !== 'en_curso') {
      return res.status(400).json({ mensaje: `Este evento no está recibiendo votos (estado actual: ${evento.estado})` });
    }

    if (!evento.cargosDisponibles.includes(cargo)) {
      return res.status(400).json({ mensaje: `"${cargo}" no es un cargo disponible en este evento` });
    }

    const candidato = evento.candidatos.id(candidatoId);
    if (!candidato || candidato.cargo !== cargo) {
      return res.status(400).json({ mensaje: 'Ese candidato no existe o no aplica para el cargo indicado' });
    }

    const matricula = await Matricula.findOne({ institucionId: evento.institucionId, estudianteId, estado: 'activa' });
    if (!matricula) return res.status(403).json({ mensaje: 'Necesitas una matrícula activa en esta institución para votar.' });

    if (evento.gruposHabilitados.length > 0) {
      const grupoHabilitado = evento.gruposHabilitados.some((g) => String(g) === String(matricula.grupoId));
      if (!grupoHabilitado) {
        return res.status(403).json({ mensaje: 'El grupo de este estudiante no está habilitado para votar en este evento' });
      }
    }

    const nuevoVoto = new Voto({ eventoId, estudianteId, candidatoId, cargo });
    const votoGuardado = await nuevoVoto.save();

    res.status(201).json(votoGuardado);
  } catch (error) {
    // El índice único (eventoId+estudianteId+cargo) es el respaldo final por si
    // dos peticiones llegan al mismo tiempo; lo traducimos a un mensaje claro.
    if (error.code === 11000) {
      return res.status(409).json({ mensaje: 'Este estudiante ya votó para este cargo en este evento' });
    }
    res.status(400).json({ mensaje: error.message });
  }
};

// GET /api/votos/resultados/:eventoId
// Cuenta los votos por candidato en cada cargo, calcula el ganador y la
// abstención (comparando contra los estudiantes elegibles para votar).
const obtenerResultados = async (req, res) => {
  try {
    const evento = await EventoElectoral.findOne({ _id: req.params.eventoId, ...filtroTenant(req) });
    if (!evento) {
      return res.status(404).json({ mensaje: 'Evento electoral no encontrado' });
    }

    if (!evento.resultadosPublicos && !['admin', 'rector', 'coordinador'].includes(req.usuario.tipoPerfil)) {
      return res.status(403).json({ mensaje: 'Los resultados aún no son públicos.' });
    }

    // Estudiantes elegibles: los de los grupos habilitados, o todos los
    // matriculados activos de la institución si no hay restricción.
    const filtroElegibles = { institucionId: evento.institucionId, estado: 'activa' };
    if (evento.gruposHabilitados.length > 0) {
      filtroElegibles.grupoId = { $in: evento.gruposHabilitados };
    }
    const totalElegibles = await Matricula.countDocuments(filtroElegibles);

    const votos = await Voto.find({ eventoId: evento._id });

    const resultadosPorCargo = evento.cargosDisponibles.map((cargo) => {
      const candidatosDelCargo = evento.candidatos.filter((c) => c.cargo === cargo);
      const votosDelCargo = votos.filter((v) => v.cargo === cargo);

      const conteo = candidatosDelCargo.map((candidato) => {
        const votosCandidato = votosDelCargo.filter((v) => String(v.candidatoId) === String(candidato._id)).length;
        return {
          candidatoId: candidato._id,
          estudianteId: candidato.estudianteId,
          votos: votosCandidato
        };
      });

      const votosEmitidos = votosDelCargo.length;
      const maxVotos = conteo.reduce((max, c) => Math.max(max, c.votos), 0);
      const ganadores = maxVotos > 0 ? conteo.filter((c) => c.votos === maxVotos) : [];
      const abstencion = Math.max(totalElegibles - votosEmitidos, 0);

      return {
        cargo,
        candidatos: conteo,
        votosEmitidos,
        totalElegibles,
        abstencion,
        porcentajeAbstencion: totalElegibles > 0 ? Number(((abstencion / totalElegibles) * 100).toFixed(1)) : 0,
        ganadores,
        empate: ganadores.length > 1
      };
    });

    res.json({ eventoId: evento._id, titulo: evento.titulo, totalElegibles, resultadosPorCargo });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Actualizar un voto
const actualizarVoto = async (req, res) => {
  try {
    const actual = await Voto.findById(req.params.id);
    if (!actual || !(await EventoElectoral.exists({ _id: actual.eventoId, ...filtroTenant(req) }))) {
      return res.status(404).json({ mensaje: 'Voto no encontrado' });
    }
    // Un voto ya emitido no se puede redirigir a otro estudiante/evento/candidato.
    return res.status(409).json({ mensaje: 'Los votos registrados son inmutables. No se pueden editar.' });


  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// Eliminar un voto
const eliminarVoto = async (req, res) => {
  try {
    const voto = await Voto.findById(req.params.id);
    if (!voto || !(await EventoElectoral.exists({ _id: voto.eventoId, ...filtroTenant(req) }))) {
      return res.status(404).json({ mensaje: 'Voto no encontrado' });
    }
    return res.status(409).json({ mensaje: 'No es posible eliminar un voto emitido.' });


  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

module.exports = {
  obtenerVotos,
  obtenerVotoPorId,
  crearVoto,
  actualizarVoto,
  eliminarVoto,
  obtenerResultados,
};