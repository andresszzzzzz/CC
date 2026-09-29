<script setup>
import { computed, ref, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import { useAuthStore } from '@/stores/auth'
import estudianteService from '@/services/estudianteService'
import { formatearFecha, etiquetaPlazo, diasRestantes } from '@/utils/academico'

const auth = useAuthStore()

const cargando = ref(true)
const error = ref('')
const actividades = ref([])
const tipoSeleccionado = ref('todas')

const etiquetasTipo = {
  tarea: 'Tarea',
  examen: 'Examen',
  quiz: 'Quiz',
  proyecto: 'Proyecto',
  participacion: 'Participación',
  otro: 'Otro'
}
const iconosTipo = {
  tarea: 'clipboard',
  examen: 'clipboard-check',
  quiz: 'clipboard-list',
  proyecto: 'folder',
  participacion: 'star',
  otro: 'clipboard'
}

const etiquetaTipo = (t) => etiquetasTipo[t] || t
const iconoPorTipo = (t) => iconosTipo[t] || 'clipboard'

const idDe = (valor) => (typeof valor === 'object' && valor !== null ? valor._id : valor)
const nombreAsignatura = (asig) => (typeof asig === 'object' && asig !== null ? asig.nombre : 'Asignatura')
const nombreDocente = (docente) => {
  if (!docente || typeof docente !== 'object') return 'Docente'
  return `${docente.nombres || ''} ${docente.apellidos || ''}`.trim() || 'Docente'
}

const tiposDisponibles = computed(() => [...new Set(actividades.value.map((a) => a.tipo))])

const listaOrdenada = computed(() =>
  [...actividades.value].sort((a, b) => new Date(a.fechaLimite) - new Date(b.fechaLimite))
)

const listaFiltrada = computed(() =>
  tipoSeleccionado.value === 'todas'
    ? listaOrdenada.value
    : listaOrdenada.value.filter((t) => t.tipo === tipoSeleccionado.value)
)

const pendientes = computed(() => actividades.value.filter((t) => diasRestantes(t.fechaLimite) >= 0))
const vencidas = computed(() => actividades.value.filter((t) => diasRestantes(t.fechaLimite) < 0))

const variantePlazo = (fecha) => {
  const variante = etiquetaPlazo(fecha).variante
  return variante === 'muted' ? 'neutro' : variante
}

const cargarDatos = async () => {
  cargando.value = true
  error.value = ''
  try {
    const { data: matriculas } = await estudianteService.obtenerMatriculas(auth.usuario?._id)
    const miMatricula = matriculas.find((m) => m.estado === 'activa')
    const miGrupoId = miMatricula ? idDe(miMatricula.grupoId) : null

    // Sin matrícula activa no hay grupo: no se muestran actividades de nadie.
    if (!miGrupoId) {
      actividades.value = []
      return
    }

    const { data: actividadesGrupo } = await estudianteService.obtenerActividades({ grupoId: miGrupoId })
    actividades.value = actividadesGrupo.filter((t) => t.estado === 'activo')
  } catch (e) {
    error.value = e.response?.data?.mensaje || 'No se pudieron cargar tus tareas y actividades.'
  } finally {
    cargando.value = false
  }
}

onMounted(cargarDatos)
</script>

<template>
  <AppLayout>
    <template #header-title>
      <h2>Tareas y Actividades 📝</h2>
      <p>Todo lo que tienes por entregar, ordenado por fecha límite.</p>
    </template>

    <div v-if="cargando" class="estado-carga">Cargando tus tareas…</div>
    <div v-else-if="error" class="estado-error">{{ error }}</div>

    <template v-else>
      <div class="metrics-grid">
        <div class="metric-card">
          <div>
            <p class="metric-title">Pendientes</p>
            <h3 class="metric-val">{{ pendientes.length }}</h3>
            <p class="metric-sub">Por entregar</p>
          </div>
          <div class="metric-icon blue"><AppIcon name="clipboard" :size="18" /></div>
        </div>

        <div class="metric-card">
          <div>
            <p class="metric-title">Vencidas</p>
            <h3 class="metric-val">{{ vencidas.length }}</h3>
            <p class="metric-sub">Fecha límite pasada</p>
          </div>
          <div class="metric-icon red"><AppIcon name="clock" :size="18" /></div>
        </div>
      </div>

      <div class="tabs-row">
        <button class="tab-btn" :class="{ activo: tipoSeleccionado === 'todas' }" @click="tipoSeleccionado = 'todas'">
          Todas
        </button>
        <button
          v-for="t in tiposDisponibles"
          :key="t"
          class="tab-btn"
          :class="{ activo: tipoSeleccionado === t }"
          @click="tipoSeleccionado = t"
        >
          {{ etiquetaTipo(t) }}
        </button>
      </div>

      <div class="card-box">
        <div class="card-header-flex">
          <h3>Listado de actividades</h3>
        </div>

        <table v-if="listaFiltrada.length" class="custom-table">
          <thead>
            <tr>
              <th>Actividad</th>
              <th>Asignatura</th>
              <th>Docente</th>
              <th>Tipo</th>
              <th>Fecha límite</th>
              <th>Plazo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in listaFiltrada" :key="t._id">
              <td class="celda-fuerte">
                <span class="tarea-icono"><AppIcon :name="iconoPorTipo(t.tipo)" :size="14" /></span>
                {{ t.titulo }}
              </td>
              <td>{{ nombreAsignatura(t.asignaturaId) }}</td>
              <td>{{ nombreDocente(t.docenteId) }}</td>
              <td><span class="status-badge azul">{{ etiquetaTipo(t.tipo) }}</span></td>
              <td>{{ formatearFecha(t.fechaLimite) }}</td>
              <td>
                <span class="status-badge" :class="variantePlazo(t.fechaLimite)">
                  {{ etiquetaPlazo(t.fechaLimite).texto }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-else class="sin-datos">No hay tareas en esta categoría.</p>
      </div>
    </template>
  </AppLayout>
</template>

<style scoped>
.tarea-icono {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 6px;
  padding: 5px;
  margin-right: 8px;
  vertical-align: middle;
}
</style>
