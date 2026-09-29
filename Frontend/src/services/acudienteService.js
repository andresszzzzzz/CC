import api from './api'

// El acudiente ve la información de sus hijos (campo "estudiantes" en su
// propio usuario). Todo lo demás se pide exactamente igual que para un
// estudiante, pero pasando el estudianteId del hijo seleccionado.
export default {
  obtenerMiPerfil() {
    return api.get('/auth/me')
  },

  obtenerMatriculas(estudianteId) {
    return api.get('/matriculas', { params: { estudianteId } })
  },

  obtenerCalificaciones(estudianteId, periodo = null) {
    const params = { estudianteId }
    if (periodo) params.periodo = periodo
    return api.get('/calificaciones', { params })
  },

  obtenerObservaciones(estudianteId) {
    return api.get('/observador', { params: { estudianteId } })
  },

  obtenerComunicados(institucionId) {
    return api.get('/comunicados', { params: { institucionId } })
  },

  urlBoletin(matriculaId, periodo) {
    return `${api.defaults.baseURL}/reportes/boletin/${matriculaId}/${periodo}`
  }

  // Igual que en estudianteService: asistencia y horario no existen todavía
  // como módulos en el backend, así que no se simulan aquí.
}
