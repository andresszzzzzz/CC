<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import { useAuthStore } from '@/stores/auth'
import estudianteService from '@/services/estudianteService'
import { promediarPorAsignatura, clasificarNota } from '@/utils/academico'

const auth = useAuthStore()

const cargando = ref(true)
const error = ref('')
const asignaturas = ref([])

const idDe = (valor) => (typeof valor === 'object' && valor !== null ? valor._id : valor)

const nombreDocente = (docente) => {
  if (!docente) return 'Sin docente asignado'
  return `${docente.nombres || ''} ${docente.apellidos || ''}`.trim() || 'Sin docente asignado'
}

const cargarDatos = async () => {
  cargando.value = true
  error.value = ''
  try {
    const { data } = await estudianteService.obtenerCalificaciones(auth.usuario?._id)
    const misCalificaciones = data.filter((c) => idDe(c.estudianteId) === auth.usuario?._id)
    asignaturas.value = promediarPorAsignatura(misCalificaciones).sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    )
  } catch (e) {
    error.value = e.response?.data?.mensaje || 'No se pudieron cargar tus asignaturas.'
  } finally {
    cargando.value = false
  }
}

onMounted(cargarDatos)
</script>

<template>
  <AppLayout>
    <template #header-title>
      <h2>Mis Asignaturas 📚</h2>
      <p>Las materias que cursas este año y su promedio actual.</p>
    </template>

    <div v-if="cargando" class="estado-carga">Cargando tus asignaturas…</div>
    <div v-else-if="error" class="estado-error">{{ error }}</div>

    <template v-else>
      <div v-if="asignaturas.length" class="asignaturas-grid">
        <div v-for="a in asignaturas" :key="a.asignaturaId" class="card-box asignatura-card">
          <div class="metric-icon blue"><AppIcon name="book" :size="18" /></div>
          <div class="asignatura-body">
            <h3>{{ a.nombre }}</h3>
            <p class="metric-sub">{{ nombreDocente(a.docente) }}</p>
          </div>
          <div class="asignatura-nota">
            <span class="metric-val">{{ a.promedio ?? '—' }}</span>
            <span class="status-badge" :class="clasificarNota(a.promedio).variante">
              {{ clasificarNota(a.promedio).texto }}
            </span>
          </div>
        </div>
      </div>

      <div v-else class="card-box">
        <p class="sin-datos">Todavía no tienes asignaturas con calificaciones registradas.</p>
      </div>
    </template>
  </AppLayout>
</template>

<style scoped>
.asignaturas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  width: 100%;
}

.asignatura-card { display: flex; align-items: center; gap: 16px; }
.asignatura-body { flex: 1; }
.asignatura-body h3 { font-size: 14px; }
.asignatura-nota { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
.asignatura-nota .metric-val { margin: 0; font-size: 22px; }
</style>
