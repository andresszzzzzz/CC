import axios from 'axios'

// Servicio propio del módulo Rector, autocontenido a propósito (mismo
// backend y misma convención que el resto de la app: baseURL configurable
// y token enviado como "Authorization: Bearer <token>").
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default {
  // --- Personas (solo lectura desde la vista Rector) ---
  obtenerUsuarios() {
    return api.get('/usuarios')
  },

  // --- Estructura académica ---
  obtenerGrupos() {
    return api.get('/grupos')
  },
  obtenerAsignaturas() {
    return api.get('/asignaturas')
  },

  // --- Calificaciones y asistencia (para estadísticas institucionales) ---
  obtenerCalificaciones() {
    return api.get('/calificaciones')
  },
  obtenerAsistencia() {
    return api.get('/asistencia')
  },

  // --- Cronograma / año académico ---
  obtenerAniosAcademicos() {
    return api.get('/anios-academicos')
  },

  // --- Comunicados institucionales ---
  obtenerComunicados() {
    return api.get('/comunicados')
  },
  crearComunicado(payload) {
    return api.post('/comunicados', payload)
  },

  // --- Bitácora del sistema ---
  obtenerBitacora() {
    return api.get('/bitacora')
  }
}