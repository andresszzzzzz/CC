<script setup>
import { computed, ref, watch } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import SelectorHijos from '@/components/SelectorHijos.vue'
import acudienteService from '@/services/acudienteService'
import { useHijos } from '@/composables/useHijos'
import { calcularPromedio, clasificarNota, notaFinal, formatearFecha } from '@/utils/academico'

const cargandoDatos = ref(false)
const errorDatos = ref('')
const periodoSeleccionado = ref(1)
const calificaciones = ref([])
const comunicados = ref([])

// Se ejecuta al cargar y cada vez que el acudiente cambia de hijo(a).
const cargarDatosHijo = async (estudianteId) => {
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
  institucion,
  estudianteSeleccionadoId,
  estudiante,
  cargandoPerfil,
  errorPerfil,
  periodos,
  seleccionarEstudiante
} = useHijos(cargarDatosHijo)

// Los comunicados son de la institución, no de un hijo en particular.
watch(
  institucion,
  async (inst) => {
    if (!inst?._id) return
    try {
      const { data } = await acudienteService.obtenerComunicados(inst._id)
      comunicados.value = data
        .filter((c) => c.estado !== 'borrador')
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 3)
    } catch {
      comunicados.value = []
    }
  },
  { immediate: true }
)

const sinHijos = computed(
  () => !cargandoPerfil.value && !errorPerfil.value && acudiente.estudiantes.length === 0
)

const promedioGeneral = computed(() => calcularPromedio(calificaciones.value))

const calificacionesDelPeriodo = computed(() =>
  calificaciones.value
    .filter((c) => c.periodo === periodoSeleccionado.value)
    .map((c) => ({
      id: c._id,
      asignatura: typeof c.asignaturaId === 'object' ? c.asignaturaId.nombre : 'Asignatura',
      nota: notaFinal(c)
    }))
    .sort((a, b) => a.asignatura.localeCompare(b.asignatura))
)

const recorte = (texto, limite = 100) => {
  if (!texto) return ''
  return texto.length > limite ? texto.slice(0, limite).trim() + '…' : texto
}
</script>

<template>
  <AppLayout>
    <template #header-title>
      <h2>¡Hola, {{ acudiente.nombre || 'Acudiente' }}! 👋</h2>
      <p>Bienvenido a tu portal de acudiente.</p>
    </template>

    <div v-if="cargandoPerfil" class="estado-carga">Cargando tu información…</div>
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

      <!-- MÉTRICAS -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div>
            <p class="metric-title">Estudiantes a cargo</p>
            <h3 class="metric-val">{{ acudiente.estudiantes.length }}</h3>
            <p class="metric-sub">Vinculados a tu cuenta</p>
          </div>
          <div class="metric-icon blue"><AppIcon name="id-card" :size="18" /></div>
        </div>

        <div class="metric-card">
          <div>
            <p class="metric-title">Promedio General</p>
            <h3 class="metric-val">{{ promedioGeneral ?? '—' }}</h3>
            <span v-if="promedioGeneral !== null" class="status-badge" :class="clasificarNota(promedioGeneral).variante">
              {{ clasificarNota(promedioGeneral).texto }}
            </span>
            <p v-else class="metric-sub">Aún no hay notas registradas</p>
          </div>
          <div class="metric-icon green"><AppIcon name="clipboard-check" :size="18" /></div>
        </div>

        <div class="metric-card">
          <div>
            <p class="metric-title">Asistencia General</p>
            <h3 class="metric-val">—</h3>
            <p class="metric-sub">Aún no disponible</p>
          </div>
          <div class="metric-icon purple"><AppIcon name="calendar-check" :size="18" /></div>
        </div>

        <div class="metric-card">
          <div>
            <p class="metric-title">Puesto en el Grupo</p>
            <h3 class="metric-val">—</h3>
            <p class="metric-sub">Aún no disponible</p>
          </div>
          <div class="metric-icon amber"><AppIcon name="star" :size="18" /></div>
        </div>
      </div>

      <div class="content-grid">
        <!-- INFORMACIÓN DEL ESTUDIANTE -->
        <div class="card-box">
          <div class="card-header-flex">
            <h3>Información del Estudiante</h3>
          </div>

          <div class="student-profile-row">
            <div class="student-avatar-lg">{{ estudiante.iniciales || '—' }}</div>
            <div>
              <h4>{{ estudiante.nombre || 'Estudiante' }}</h4>
              <template v-if="estudiante.curso">
                <p>Grado: {{ estudiante.grado }}</p>
                <p>Grupo: {{ estudiante.grupo }}</p>
                <p v-if="estudiante.jornada">Jornada: {{ estudiante.jornada }}</p>
              </template>
              <p v-else>Sin matrícula activa</p>
            </div>
          </div>

          <div class="student-details-grid">
            <div class="detail-pill">
              <div>
                <small>Fecha de nacimiento</small>
                <strong>{{ estudiante.fechaNacimiento || 'No registrada' }}</strong>
              </div>
            </div>
            <div class="detail-pill">
              <div>
                <small>Teléfono de contacto</small>
                <strong>{{ estudiante.telefono || 'No registrado' }}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- CALIFICACIONES DEL PERIODO -->
        <div class="card-box">
          <div class="card-header-flex">
            <h3>Calificaciones - Periodo {{ periodoSeleccionado }}</h3>
            <div class="tabs-row">
              <button
                v-for="p in periodos"
                :key="p"
                class="tab-btn"
                :class="{ activo: periodoSeleccionado === p }"
                @click="periodoSeleccionado = p"
              >
                P{{ p }}
              </button>
            </div>
          </div>

          <div v-if="cargandoDatos" class="estado-carga">Cargando notas…</div>
          <div v-else-if="errorDatos" class="estado-error">{{ errorDatos }}</div>
          <template v-else>
            <table v-if="calificacionesDelPeriodo.length" class="custom-table">
              <thead>
                <tr>
                  <th>Asignatura</th>
                  <th>Nota</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in calificacionesDelPeriodo" :key="item.id">
                  <td class="celda-fuerte">{{ item.asignatura }}</td>
                  <td>{{ item.nota ?? '—' }}</td>
                  <td>
                    <span class="status-badge" :class="clasificarNota(item.nota).variante">
                      {{ clasificarNota(item.nota).texto }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-else class="sin-datos">No hay calificaciones registradas para este periodo.</p>
          </template>

          <div class="card-footer-link">
            <router-link to="/acudiente/calificaciones" class="link-blue">Ver detalle de calificaciones</router-link>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <!-- ASISTENCIA -->
        <div class="card-box">
          <div class="card-header-flex">
            <h3>Asistencia del Estudiante</h3>
          </div>
          <p class="sin-datos">El registro de asistencia aún no está disponible en el sistema.</p>
        </div>

        <!-- COMUNICADOS -->
        <div class="card-box">
          <div class="card-header-flex">
            <h3>Comunicados Recientes</h3>
            <router-link to="/acudiente/comunicados" class="link-blue">Ver todos</router-link>
          </div>

          <div v-if="comunicados.length" class="item-list">
            <div v-for="c in comunicados" :key="c._id" class="item-row">
              <div class="item-icon"><AppIcon name="megaphone" :size="16" /></div>
              <div class="item-body">
                <span class="item-title">{{ c.asunto }}</span>
                <span class="item-sub">{{ recorte(c.mensaje) }}</span>
              </div>
              <span class="item-sub">{{ formatearFecha(c.fecha) }}</span>
            </div>
          </div>
          <p v-else class="sin-datos">No hay comunicados recientes.</p>
        </div>
      </div>
    </template>
  </AppLayout>
</template>

<style scoped>
.student-profile-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 16px;
}
.student-profile-row h4 { font-size: 15px; color: #0f172a; }
.student-profile-row p { font-size: 12px; color: #64748b; margin-top: 2px; }

.student-avatar-lg {
  width: 54px;
  height: 54px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1d4ed8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  flex-shrink: 0;
}

.student-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.detail-pill {
  background: #f8fafc;
  padding: 12px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  border: 1px solid #e2e8f0;
}
.detail-pill small { display: block; color: #94a3b8; font-size: 11px; }
.detail-pill strong { color: #0f172a; }

.item-list { display: flex; flex-direction: column; gap: 4px; }
.item-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;
}
.item-row:last-child { border-bottom: none; }
.item-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #eff6ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.item-body { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.item-title { font-size: 13px; font-weight: 600; color: #0f172a; }
.item-sub { font-size: 11px; color: #64748b; }
</style>
