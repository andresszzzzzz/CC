<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import rectorService from '@/services/rectorService'

const cargando = ref(true)
const error = ref('')
const estadisticasPorGrupo = ref([])
const estadisticasPorAsignatura = ref([])

function idDe(v) {
  return typeof v === 'object' && v !== null ? v._id : v
}

async function cargarEstadisticas() {
  cargando.value = true
  error.value = ''
  try {
    const [resCalificaciones, resGrupos] = await Promise.all([
      rectorService.obtenerCalificaciones(),
      rectorService.obtenerGrupos()
    ])

    const calificaciones = resCalificaciones.data.calificaciones || resCalificaciones.data || []
    const grupos = resGrupos.data.grupos || resGrupos.data || []

    // Promedio por grupo
    const mapaGrupos = new Map()
    calificaciones.forEach((c) => {
      const id = idDe(c.grupoId)
      if (!id || typeof c.nota !== 'number') return
      if (!mapaGrupos.has(id)) {
        const grupoInfo = grupos.find((g) => g._id === id) || c.grupoId
        mapaGrupos.set(id, { nombre: grupoInfo?.nombre || 'Grupo', notas: [] })
      }
      mapaGrupos.get(id).notas.push(c.nota)
    })
    estadisticasPorGrupo.value = Array.from(mapaGrupos.values())
      .map((g) => ({ nombre: g.nombre, promedio: (g.notas.reduce((a, b) => a + b, 0) / g.notas.length).toFixed(1), total: g.notas.length }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre))

    // Promedio por asignatura
    const mapaAsignaturas = new Map()
    calificaciones.forEach((c) => {
      const id = idDe(c.asignaturaId)
      if (!id || typeof c.nota !== 'number') return
      if (!mapaAsignaturas.has(id)) {
        mapaAsignaturas.set(id, { nombre: c.asignaturaId?.nombre || 'Asignatura', notas: [] })
      }
      mapaAsignaturas.get(id).notas.push(c.nota)
    })
    estadisticasPorAsignatura.value = Array.from(mapaAsignaturas.values())
      .map((a) => ({ nombre: a.nombre, promedio: (a.notas.reduce((x, y) => x + y, 0) / a.notas.length).toFixed(1), total: a.notas.length }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  } catch (e) {
    console.error('Error al cargar estadísticas:', e)
    error.value = 'No se pudieron cargar las estadísticas desde el backend.'
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarEstadisticas()
})
</script>

<template>
  <AppLayout>
    <template #header-title>
      <h2>Estadísticas Generales 📊</h2>
      <p>Promedios institucionales calculados a partir de las calificaciones registradas.</p>
    </template>

    <p v-if="cargando" class="estado-carga">Calculando estadísticas...</p>
    <p v-else-if="error" class="estado-error">{{ error }}</p>

    <div class="content-grid" v-else>
      <div class="card-box">
        <div class="card-header-flex">
          <h3>Promedio por Grupo</h3>
        </div>
        <table class="custom-table" v-if="estadisticasPorGrupo.length > 0">
          <thead>
            <tr><th>Grupo</th><th>Promedio</th><th>Notas</th></tr>
          </thead>
          <tbody>
            <tr v-for="(g, i) in estadisticasPorGrupo" :key="i">
              <td class="celda-fuerte">{{ g.nombre }}</td>
              <td>{{ g.promedio }}</td>
              <td>{{ g.total }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="sin-datos">No hay calificaciones registradas todavía.</p>
      </div>

      <div class="card-box">
        <div class="card-header-flex">
          <h3>Promedio por Asignatura</h3>
        </div>
        <table class="custom-table" v-if="estadisticasPorAsignatura.length > 0">
          <thead>
            <tr><th>Asignatura</th><th>Promedio</th><th>Notas</th></tr>
          </thead>
          <tbody>
            <tr v-for="(a, i) in estadisticasPorAsignatura" :key="i">
              <td class="celda-fuerte">{{ a.nombre }}</td>
              <td>{{ a.promedio }}</td>
              <td>{{ a.total }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="sin-datos">No hay calificaciones registradas todavía.</p>
      </div>
    </div>
  </AppLayout>
</template>
