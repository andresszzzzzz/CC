import api from './api'

// Autenticación real contra el backend. No hay modo demo: si el backend no
// responde, la petición falla y la vista debe mostrar ese error tal cual,
// nunca inventar una sesión.
export default {
  login(credenciales) {
    return api.post('/auth/login', credenciales)
  },

  logout() {
    return api.post('/auth/logout').catch(() => {})
  },

  obtenerPerfil() {
    return api.get('/auth/me')
  },

  cambiarPassword(payload) {
    return api.post('/auth/cambiar-password', payload)
  }
}
