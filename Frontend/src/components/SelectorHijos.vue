<script setup>
// Solo se muestra cuando el acudiente tiene más de un hijo(a) vinculado.
defineProps({
  estudiantes: { type: Array, default: () => [] },
  seleccionadoId: { type: String, default: null }
})
defineEmits(['seleccionar'])

const idDe = (valor) => (valor && typeof valor === 'object' ? valor._id : valor)
</script>

<template>
  <div v-if="estudiantes.length > 1" class="card-box selector-hijos">
    <span class="selector-etiqueta">Seleccionar hijo(a):</span>
    <div class="tabs-row">
      <button
        v-for="rel in estudiantes"
        :key="idDe(rel.estudianteId)"
        class="tab-btn"
        :class="{ activo: seleccionadoId === idDe(rel.estudianteId) }"
        @click="$emit('seleccionar', idDe(rel.estudianteId))"
      >
        {{ rel.nombre || 'Estudiante' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.selector-hijos {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 24px;
}
.selector-etiqueta {
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
}
</style>
