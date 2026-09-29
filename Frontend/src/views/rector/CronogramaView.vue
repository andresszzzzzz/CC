<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import rectorService from '@/services/rectorService'

const cargando = ref(true)
const error = ref('')
const aniosAcademicos = ref([])

async function cargarCronograma() {
  cargando.value = true
  error.value = ''
  try {
    const res = await rectorService.obtenerAniosAcademicos()
    aniosAcademicos.value = res.data.aniosAcademicos || res.data || []
  } catch (e) {
    console.error('Error al cargar el cronograma:', e)
    error.value = 'No se pudo cargar el cronograma desde el backend.'
  } finally {
    cargando.value = false
  }
}

function etiquetaEstado(estado) {
  return { abierto: 'Abierto', cerrado: 'Cerrado', en_recuperacion: 'En recuperación' }[estado] || estado
}
function claseEstado(estado) {
  if (estado === 'abierto') return 'verde'
  if (estado === 'en_recuperacion') return 'amarillo'
  return 'neutro'
}

onMounted(() => {
  cargarCronograma()
})
</script>

<template>
  <AppLayout>
    <template #header-title>
      <h2>Cronograma Académico 🗓️</h2>
      <p>Consulta de los períodos académicos vigentes (solo lectura).</p>
    </template>

    <p v-if="cargando" class="estado-carga">Cargando cronograma del backend...</p>
    <p v-else-if="error" class="estado-error">{{ error }}</p>

    <div class="card-box" v-else-if="aniosAcademicos.length > 0" v-for="anio in aniosAcademicos" :key="anio._id" style="margin-bottom: 16px;">
      <div class="card-header-flex">
        <h3>Año académico {{ anio.anio }}</h3>
        <span class="status-badge" :class="anio.estado === 'activo' ? 'verde' : 'neutro'">{{ anio.estado }}</span>
      </div>
      <table class="custom-table" v-if="anio.cronograma?.periodos?.length > 0">
        <thead>
          <tr><th>Período</th><th>Estado</th><th>Fecha inicio</th><th>Fecha fin</th></tr>
        </thead>
        <tbody>
          <tr v-for="p in anio.cronograma.periodos" :key="p.numero">
            <td class="celda-fuerte">{{ p.nombre || `Período ${p.numero}` }}</td>
            <td><span class="status-badge" :class="claseEstado(p.estado)">{{ etiquetaEstado(p.estado) }}</span></td>
            <td>{{ p.fechaInicio || '—' }}</td>
            <td>{{ p.fechaFin || '—' }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="sin-datos">Este año no tiene períodos configurados todavía.</p>
    </div>

    <div class="card-box" v-else>
      <p class="sin-datos">No hay años académicos registrados todavía en el backend.</p>
    </div>
  </AppLayout>
</template>
