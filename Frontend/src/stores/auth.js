import { defineStore } from 'pinia'
import authService from '@/services/authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    usuario: JSON.parse(localStorage.getItem('usuario') || 'null')
  }),

  getters: {
    estaAutenticado: (state) => !!state.token,
    rol: (state) => state.usuario?.tipoPerfil || null,
    nombreCompleto: (state) =>
      state.usuario ? `${state.usuario.nombres} ${state.usuario.apellidos}` : '',
    iniciales: (state) => {
      if (!state.usuario) return ''
      const n = state.usuario.nombres?.[0] || ''
      const a = state.usuario.apellidos?.[0] || ''
      return (n + a).toUpperCase()
    },
    // Sin institución todavía (recién logueado, antes de refrescar el perfil
    // con populate): mostrar vacío, nunca un nombre de colegio inventado.
    colegio: (state) => state.usuario?.institucionId?.nombre || ''
  },

  actions: {
    async iniciarSesion(credenciales) {
      const { data } = await authService.login(credenciales)
      this.token = data.token
      this.usuario = data.usuario
      localStorage.setItem('token', data.token)
      localStorage.setItem('usuario', JSON.stringify(data.usuario))

      // El login devuelve institucionId sin popular (solo el ObjectId). Se
      // refresca con /auth/me para tener nombre y configuración del colegio.
      // Si falla, la sesión sigue válida: solo quedará sin nombre de colegio.
      try {
        await this.refrescarPerfil()
      } catch {
        /* sesión válida igualmente */
      }
      return data
    },

    // Trae el perfil actualizado (con institución poblada) y lo guarda.
    async refrescarPerfil() {
      const { data } = await authService.obtenerPerfil()
      const usuario = data.usuario || data
      this.usuario = usuario
      localStorage.setItem('usuario', JSON.stringify(usuario))
      return usuario
    },

    // Para sesiones que ya estaban guardadas antes de este cambio: si la
    // institución sigue sin popular, se refresca una vez.
    async asegurarPerfil() {
      const inst = this.usuario?.institucionId
      if (this.token && inst && typeof inst !== 'object') {
        try {
          await this.refrescarPerfil()
        } catch {
          /* el interceptor de api.js ya maneja el 401 */
        }
      }
    },

    cerrarSesion() {
      authService.logout().catch(() => {})
      this.token = null
      this.usuario = null
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
    }
  }
})
