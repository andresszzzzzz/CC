import { defineStore } from 'pinia'

// Notificaciones del sistema con alertas de Bootstrap (nada de alert() / confirm() / prompt() del navegador).
//   notif.exito('La nota se creó correctamente.')            -> alert-success
//   notif.info('Aún no tienes notas creadas.')               -> alert-info
//   notif.advertencia('Debes completar los campos…')         -> alert-warning
//   notif.error('No se pudo guardar la nota.')               -> alert-danger
//   await notif.confirmar('Esta acción eliminará…')          -> true | false
//   await notif.pedirTexto('Motivo (opcional):')             -> string | null (null = canceló)
const TITULOS = { success: '¡Éxito!', info: 'Información:', warning: '¡Atención!', danger: '¡Error!' }
let contador = 0

export const useNotificacionesStore = defineStore('notificaciones', {
  state: () => ({ items: [], dialogo: null }),

  actions: {
    mostrar(tipo, mensaje, titulo, duracion = 6000) {
      const id = ++contador
      this.items.push({ id, tipo, mensaje, titulo: titulo || TITULOS[tipo] })
      if (duracion) setTimeout(() => this.cerrar(id), duracion)
      return id
    },
    exito(mensaje, titulo) { return this.mostrar('success', mensaje, titulo) },
    info(mensaje, titulo) { return this.mostrar('info', mensaje, titulo) },
    advertencia(mensaje, titulo) { return this.mostrar('warning', mensaje, titulo, 8000) },
    error(mensaje, titulo) { return this.mostrar('danger', mensaje, titulo, 9000) },
    cerrar(id) { this.items = this.items.filter((n) => n.id !== id) },

    // Alerta de confirmación (¿Estás seguro? + botones Sí / Cancelar)
    confirmar(mensaje, { titulo = '¿Estás seguro?', textoSi = 'Sí, continuar', textoNo = 'Cancelar', peligro = true } = {}) {
      return new Promise((resolve) => {
        this.dialogo = { mensaje, titulo, textoSi, textoNo, peligro, conTexto: false, texto: '', resolver: resolve }
      })
    },
    // Igual que confirmar, pero con una caja de texto (reemplaza a prompt())
    pedirTexto(mensaje, { titulo = '', placeholder = '', textoSi = 'Aceptar', textoNo = 'Cancelar' } = {}) {
      return new Promise((resolve) => {
        this.dialogo = { mensaje, titulo, placeholder, textoSi, textoNo, peligro: false, conTexto: true, texto: '', resolver: resolve }
      })
    },
    responderDialogo(acepta) {
      const d = this.dialogo
      if (!d) return
      this.dialogo = null
      d.resolver(d.conTexto ? (acepta ? d.texto.trim() : null) : acepta)
    }
  }
})
