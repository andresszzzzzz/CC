import api from './api'

// Todo lo que sigue llama directo al backend real (que a su vez consulta el
// cluster de Atlas). No hay ningún dato inventado ni modo demo aquí: si una
// petición falla, la vista que la usa debe mostrar ese error o un estado
// vacío honesto, nunca un valor de relleno.
export default {
  // --- Perfil ---
  obtenerMiPerfil() {
    return api.get('/auth/me')
  },

  // --- Matrícula y datos académicos ---
  obtenerMatriculas(estudianteId) {
    return api.get('/matriculas', { params: { estudianteId } })
  },

  obtenerCalificaciones(estudianteId, periodo = null) {
    const params = { estudianteId }
    if (periodo) params.periodo = periodo
    return api.get('/calificaciones', { params })
  },

  obtenerActividades(params) {
    // params esperado: { grupoId } o { asignaturaId }, según lo que tenga la vista
    return api.get('/actividades', { params })
  },

  obtenerObservaciones(estudianteId) {
    return api.get('/observador', { params: { estudianteId } })
  },

  obtenerComunicados(institucionId) {
    return api.get('/comunicados', { params: { institucionId } })
  },

  // --- Reportes en PDF (streaming, no JSON) ---
  urlBoletin(matriculaId, periodo) {
    return `${api.defaults.baseURL}/reportes/boletin/${matriculaId}/${periodo}`
  },

  urlCarnet(matriculaId) {
    return `${api.defaults.baseURL}/reportes/carnet/estudiante/${matriculaId}`
  }

  // Nota: asistencia, horario, material de apoyo y mensajería NO existen
  // todavía como módulos en el backend (no hay modelo/ruta para eso). No se
  // agregan métodos falsos aquí a propósito — las vistas que dependían de
  // esto deben mostrar un estado de "función no disponible aún" en vez de
  // llamar a un endpoint que no existe o inventar datos localmente.
}
