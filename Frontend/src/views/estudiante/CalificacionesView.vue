<script setup>
import { computed, ref, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import { useAuthStore } from '@/stores/auth'
import estudianteService from '@/services/estudianteService'
import { calcularPromedio, clasificarNota, notaFinal } from '@/utils/academico'

const auth = useAuthStore()

const cargando = ref(true)
const error = ref('')
const misCalificaciones = ref([])
const periodoSeleccionado = ref(1)

// El número de períodos lo trae la institución (por defecto 4)
const totalPeriodos = computed(() => auth.usuario?.institucionId?.configuracion?.numeroPeriodos || 4)
const periodos = computed(() => Array.from({ length: totalPeriodos.value }, (_, i) => i + 1))

const idDe = (valor) => (typeof valor === 'object' && valor !== null ? valor._id : valor)

const nombreDocente = (docente) => {
  if (!docente) return '—'
  return `${docente.nombres || ''} ${docente.apellidos || ''}`.trim() || '—'
}

const calificacionesDelPeriodo = computed(() =>
  misCalificaciones.value
    .filter((c) => c.periodo === periodoSeleccionado.value)
    .map((c) => ({
      asignaturaId: idDe(c.asignaturaId),
      nombre: typeof c.asignaturaId === 'object' ? c.asignaturaId.nombre : 'Asignatura',
      docente: typeof c.docenteId === 'object' ? c.docenteId : null,
      nota: notaFinal(c)
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
)

const promedioPeriodo = computed(() =>
  calcularPromedio(calificacionesDelPeriodo.value.map((c) => ({ nota: c.nota })))
)
const promedioAcumulado = computed(() => calcularPromedio(misCalificaciones.value))

const cargarDatos = async () => {
  cargando.value = true
  error.value = ''
  try {
    const { data } = await estudianteService.obtenerCalificaciones(auth.usuario?._id)
    misCalificaciones.value = data.filter((c) => idDe(c.estudianteId) === auth.usuario?._id)
  } catch (e) {
    error.value = e.response?.data?.mensaje || 'No se pudieron cargar tus calificaciones.'
  } finally {
    cargando.value = false
  }
}

onMounted(cargarDatos)
</script>

<template>
  <AppLayout>
    <template #header-title>
      <h2>Mis Calificaciones 📊</h2>
      <p>Consulta detallada de notas por periodo académico.</p>
    </template>

    <div v-if="cargando" class="estado-carga">Cargando tus calificaciones…</div>
    <div v-else-if="error" class="estado-error">{{ error }}</div>

    <template v-else>
      <!-- SELECTOR DE PERIODO -->
      <div class="tabs-row">
        <button
          v-for="p in periodos"
          :key="p"
          class="tab-btn"
          :class="{ activo: periodoSeleccionado === p }"
          @click="periodoSeleccionado = p"
        >
          Periodo {{ p }}
        </button>
      </div>

      <!-- RESUMEN -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div>
            <p class="metric-title">Promedio Periodo {{ periodoSeleccionado }}</p>
            <h3 class="metric-val">{{ promedioPeriodo ?? '0.0' }}</h3>
            <span v-if="promedioPeriodo !== null" class="status-badge" :class="clasificarNota(promedioPeriodo).variante">
              {{ clasificarNota(promedioPeriodo).texto }}
            </span>
            <p v-else class="metric-sub">Sin notas en este periodo</p>
          </div>
          <div class="metric-icon blue"><AppIcon name="clipboard-check" :size="18" /></div>
        </div>

        <div class="metric-card">
          <div>
            <p class="metric-title">Promedio Acumulado</p>
            <h3 class="metric-val">{{ promedioAcumulado ?? '0.0' }}</h3>
            <p class="metric-sub">Todos los periodos registrados</p>
          </div>
          <div class="metric-icon amber"><AppIcon name="book-open" :size="18" /></div>
        </div>
      </div>

      <!-- TABLA DE ASIGNATURAS -->
      <div class="card-box">
        <div class="card-header-flex">
          <h3>Asignaturas — Periodo {{ periodoSeleccionado }}</h3>
        </div>

        <table v-if="calificacionesDelPeriodo.length" class="custom-table">
          <thead>
            <tr>
              <th>Asignatura</th>
              <th>Docente</th>
              <th>Nota</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in calificacionesDelPeriodo" :key="c.asignaturaId">
              <td class="celda-fuerte">{{ c.nombre }}</td>
              <td>{{ nombreDocente(c.docente) }}</td>
              <td>{{ c.nota ?? '—' }}</td>
              <td>
                <span class="status-badge" :class="clasificarNota(c.nota).variante">
                  {{ clasificarNota(c.nota).texto }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-else class="sin-datos">Todavía no hay calificaciones registradas para este periodo.</p>
      </div>
    </template>
  </AppLayout>
</template>
