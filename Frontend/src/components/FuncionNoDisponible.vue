<script setup>
import AppIcon from '@/components/AppIcon.vue'

// Estado honesto para las secciones cuyo backend todavía no existe
// (asistencia, horario, material de apoyo, mensajes). Se muestra en lugar de
// llamar a un endpoint inexistente o de rellenar la pantalla con datos falsos.
defineProps({
  icono: { type: String, default: 'clock' },
  titulo: { type: String, default: 'Esta función aún no está disponible' },
  descripcion: {
    type: String,
    default: 'Estamos trabajando en ella. Cuando esté lista la verás aquí con tu información real.'
  }
})
</script>

<template>
  <div class="card-box no-disponible">
    <div class="no-disponible-icono"><AppIcon :name="icono" :size="28" /></div>
    <h3>{{ titulo }}</h3>
    <p>{{ descripcion }}</p>
  </div>
</template>

<style scoped>
.no-disponible {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 56px 24px;
}
.no-disponible-icono {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: #eff6ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}
.no-disponible h3 {
  font-size: 16px;
  color: #0f172a;
  font-weight: 700;
}
.no-disponible p {
  margin-top: 8px;
  max-width: 420px;
  font-size: 13px;
  line-height: 1.5;
  color: #64748b;
}
</style>
