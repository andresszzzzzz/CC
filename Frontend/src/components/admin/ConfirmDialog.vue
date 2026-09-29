<script setup>
defineProps({
  abierto: { type: Boolean, default: false },
  titulo: { type: String, default: 'Confirmar' },
  mensaje: { type: String, default: '' },
  procesando: { type: Boolean, default: false }
})
defineEmits(['cerrar', 'confirmar'])
</script>

<template>
  <div v-if="abierto" class="conf-fondo" @click.self="$emit('cerrar')">
    <div class="conf-caja">
      <h3>{{ titulo }}</h3>
      <p>{{ mensaje }}</p>
      <div class="conf-acciones">
        <button type="button" class="btn-sec" @click="$emit('cerrar')">Cancelar</button>
        <button type="button" class="btn-peligro" :disabled="procesando" @click="$emit('confirmar')">
          {{ procesando ? 'Eliminando…' : 'Eliminar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.conf-fondo { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); display: flex; align-items: center; justify-content: center; z-index: 110; padding: 16px; }
.conf-caja { background: white; border-radius: 16px; padding: 24px; width: 100%; max-width: 400px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15); }
.conf-caja h3 { font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
.conf-caja p { font-size: 13px; color: #64748b; line-height: 1.6; }
.conf-acciones { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.btn-sec { background: white; border: 1px solid #cbd5e1; color: #475569; border-radius: 10px; padding: 10px 18px; font-size: 13px; font-weight: 600; cursor: pointer; }
.btn-peligro { background: #dc2626; color: white; border: none; border-radius: 10px; padding: 10px 18px; font-size: 13px; font-weight: 700; cursor: pointer; }
.btn-peligro:disabled { opacity: 0.7; cursor: default; }
</style>
