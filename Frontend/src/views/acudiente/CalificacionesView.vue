<script setup>
import { computed, ref } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import SelectorHijos from '@/components/SelectorHijos.vue'
import acudienteService from '@/services/acudienteService'
import { useHijos } from '@/composables/useHijos'
import { calcularPromedio, clasificarNota, notaFinal } from '@/utils/academico'

const cargandoDatos = ref(false)
const errorDatos = ref('')
const periodoSeleccionado = ref(1)
const calificaciones = ref([])

const cargarCalificaciones = async (estudianteId) => {
  cargandoDatos.value = true
  errorDatos.value = ''
  try {
    const { data } = await acudienteService.obtenerCalificaciones(estudianteId)
    calificaciones.value = data
  } catch (e) {
    calificaciones.value = []
    errorDatos.value = e.response?.data?.mensaje || 'No se pudieron cargar las calificaciones.'
  } finally {
    cargandoDatos.value = false
  }
}

const {
  acudiente,
  estudianteSeleccionadoId,
  estudiante,
  cargandoPerfil,
  errorPerfil,
  periodos,
  seleccionarEstudiante
} = useHijos(cargarCalificaciones)

const sinHijos = computed(
  () => !cargandoPerfil.value && !errorPerfil.value && acudiente.estudiantes.length === 0
)

const filas = computed(() =>
  calificaciones.value
    .filter((c) => c.periodo === periodoSeleccionado.value)
    .map((c) => ({
      id: c._id,
      asignatura: typeof c.asignaturaId === 'object' ? c.asignaturaId.nombre : 'Asignatura',
      nota: notaFinal(c),
      observacion: c.observacion || ''
    }))
    .sort((a, b) => a.asignatura.localeCompare(b.asignatura))
)

const promedioPeriodo = computed(() => calcularPromedio(filas.value.map((f) => ({ nota: f.nota }))))
</script>

<template>
  <AppLayout>
    <template #header-title>
      <h2>Boletín de Calificaciones 📊</h2>
      <p>Consulta detallada de notas por periodo académico.</p>
    </template>

    <div v-if="cargandoPerfil" class="estado-carga">Cargando…</div>
    <div v-else-if="errorPerfil" class="estado-error">{{ errorPerfil }}</div>
    <div v-else-if="sinHijos" class="card-box">
      <p class="sin-datos">No tienes estudiantes vinculados a tu cuenta. Comunícate con la institución.</p>
    </div>

    <template v-else>
      <SelectorHijos
        :estudiantes="acudiente.estudiantes"
        :seleccionado-id="estudianteSeleccionadoId"
        @seleccionar="seleccionarEstudiante"
      />

      <div class="banner-periodo">
        <div>
          <h3>
            Estudiante: <span class="banner-nombre">{{ estudiante.nombre || '—' }}</span>
            <span v-if="estudiante.curso">({{ estudiante.curso }})</span>
          </h3>
          <p>Rendimiento académico del periodo seleccionado.</p>
        </div>
        <div class="pill-promedio">
          <small>Promedio Periodo {{ periodoSeleccionado }}</small>
          <strong>{{ promedioPeriodo ?? '—' }}</strong>
        </div>
      </div>

      <div class="card-box">
        <div class="card-header-flex">
          <h3>Asignaturas y Notas</h3>
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
        </div>

        <div v-if="cargandoDatos" class="estado-carga">Cargando calificaciones…</div>
        <div v-else-if="errorDatos" class="estado-error">{{ errorDatos }}</div>
        <template v-else>
          <table v-if="filas.length" class="custom-table">
            <thead>
              <tr>
                <th>Asignatura</th>
                <th>Calificación</th>
                <th>Estado</th>
                <th>Observación del docente</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="f in filas" :key="f.id">
                <td class="celda-fuerte">{{ f.asignatura }}</td>
                <td>{{ f.nota ?? '—' }}</td>
                <td>
                  <span class="status-badge" :class="clasificarNota(f.nota).variante">
                    {{ clasificarNota(f.nota).texto }}
                  </span>
                </td>
                <td class="celda-obs">{{ f.observacion || '—' }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="sin-datos">No hay calificaciones registradas para este periodo.</p>
        </template>
      </div>
    </template>
  </AppLayout>
</template>

<style scoped>
.banner-periodo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-radius: 16px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid #bfdbfe;
}
.banner-periodo h3 { font-size: 15px; color: #0f172a; }
.banner-periodo p { font-size: 12px; color: #64748b; margin-top: 4px; }
.banner-nombre { color: #1d4ed8; }

.pill-promedio {
  background: white;
  border-radius: 12px;
  padding: 10px 18px;
  text-align: center;
  border: 1px solid #bfdbfe;
}
.pill-promedio small { display: block; font-size: 11px; color: #64748b; }
.pill-promedio strong { font-size: 22px; color: #1d4ed8; }

.celda-obs { color: #64748b; font-size: 12px; max-width: 280px; }
</style>
