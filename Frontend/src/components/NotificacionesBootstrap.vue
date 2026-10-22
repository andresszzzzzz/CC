<script setup>
import { useNotificacionesStore } from '@/stores/notificaciones'
const notif = useNotificacionesStore()
</script>

<template>
  <!-- Alertas de Bootstrap (éxito, información, advertencia, error) -->
  <div class="notif-zona" aria-live="polite">
    <div
      v-for="n in notif.items"
      :key="n.id"
      :class="['alert', 'alert-' + n.tipo, 'alert-dismissible', 'fade', 'show', 'shadow-sm']"
      role="alert"
    >
      <strong>{{ n.titulo }}</strong> {{ n.mensaje }}
      <button type="button" class="btn-close" aria-label="Cerrar" @click="notif.cerrar(n.id)"></button>
    </div>
  </div>

  <!-- Alerta de confirmación -->
  <div v-if="notif.dialogo" class="notif-fondo" @click.self="notif.responderDialogo(false)">
    <div class="alert alert-warning shadow notif-confirm" role="alert">
      <strong>{{ notif.dialogo.titulo }}</strong> {{ notif.dialogo.mensaje }}

      <input
        v-if="notif.dialogo.conTexto"
        v-model="notif.dialogo.texto"
        type="text"
        class="form-control form-control-sm mt-2"
        :placeholder="notif.dialogo.placeholder"
        autofocus
        @keyup.enter="notif.responderDialogo(true)"
      />

      <div class="mt-3">
        <button
          type="button"
          :class="['btn', 'btn-sm', 'me-2', notif.dialogo.peligro ? 'btn-danger' : 'btn-primary']"
          @click="notif.responderDialogo(true)"
        >{{ notif.dialogo.textoSi }}</button>
        <button type="button" class="btn btn-secondary btn-sm" @click="notif.responderDialogo(false)">
          {{ notif.dialogo.textoNo }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notif-zona { position: fixed; top: 16px; right: 16px; z-index: 2000; width: min(420px, calc(100vw - 32px)); }
.notif-zona .alert { margin-bottom: 10px; }
.notif-fondo { position: fixed; inset: 0; z-index: 2100; background: rgba(15, 23, 42, 0.45); display: flex; align-items: center; justify-content: center; padding: 16px; }
.notif-confirm { width: 100%; max-width: 460px; margin: 0; }
</style>
