<script setup>
import { computed } from 'vue'
const props = defineProps({ estado: { type: String, default: '' } })
const COLORES = {
  registrado: ['#e0f2fe', '#0369a1', 'Registrado'], 'no matriculado': ['#fef3c7', '#b45309', 'No matriculado'],
  matriculado: ['#dcfce7', '#166534', 'Matriculado'], retirado: ['#fee2e2', '#b91c1c', 'Retirado'],
  inactivo: ['#e2e8f0', '#475569', 'Inactivo'], activo: ['#dcfce7', '#166534', 'Activo'],
  abierto: ['#dcfce7', '#166534', 'Abierto'], cerrado: ['#e2e8f0', '#475569', 'Cerrado']
}
const c = computed(() => COLORES[(props.estado || '').toLowerCase()] || ['#f1f5f9', '#475569', props.estado || '—'])
</script>
<template>
  <span class="badge" :style="{ background: c[0], color: c[1] }">{{ c[2] }}</span>
</template>
<style scoped>
.badge { display:inline-block; padding:3px 10px; border-radius:999px; font-size:12px; font-weight:700; }
</style>
