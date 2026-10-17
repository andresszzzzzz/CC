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

  actualizarPerfil(payload) {
    return api.put('/auth/me', payload)
  },

  cambiarPassword(payload) {
    return api.post('/auth/cambiar-password', payload)
  },

  // Envía al correo del usuario con sesión un enlace para crear una nueva contraseña
  solicitarRestablecimiento() {
    return api.post('/auth/solicitar-restablecimiento')
  }
}