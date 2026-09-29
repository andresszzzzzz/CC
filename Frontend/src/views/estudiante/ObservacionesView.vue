<script setup>
import { computed, ref, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import { useAuthStore } from '@/stores/auth'
import estudianteService from '@/services/estudianteService'
import { formatearFecha } from '@/utils/academico'

const auth = useAuthStore()

const cargando = ref(true)
const error = ref('')
const observaciones = ref([])
const filtro = ref('todas')

const idDe = (valor) => (typeof valor === 'object' && valor !== null ? valor._id : valor)
const nombreDocente = (docente) => {
  if (!docente || typeof docente !== 'object') return 'Docente'
  return `${docente.nombres || ''} ${docente.apellidos || ''}`.trim() || 'Docente'
}

// Valores definidos en el modelo Observador del backend.
const etiquetasTipo = { academico: 'Académica', convivencia: 'Convivencia', disciplinario: 'Disciplinaria' }
const variantesTipo = { academico: 'azul', convivencia: 'amarillo', disciplinario: 'rojo' }

const etiquetaTipo = (t) => etiquetasTipo[t] || t
const varianteTipo = (t) => variantesTipo[t] || 'neutro'

const contar = (tipo) => observaciones.value.filter((o) => o.tipo === tipo).length
const totalAcademicas = computed(() => contar('academico'))
const totalConvivencia = computed(() => contar('convivencia'))
const totalDisciplinarias = computed(() => contar('disciplinario'))

const listaFiltrada = computed(() => {
  const ordenadas = [...observaciones.value].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  return filtro.value === 'todas' ? ordenadas : ordenadas.filter((o) => o.tipo === filtro.value)
})

const cargarDatos = async () => {
  cargando.value = true
  error.value = ''
  try {
    const { data } = await estudianteService.obtenerObservaciones(auth.usuario?._id)
    observaciones.value = data.filter((o) => idDe(o.estudianteId) === auth.usuario?._id)
  } catch (e) {
    error.value = e.response?.data?.mensaje || 'No se pudieron cargar las observaciones.'
  } finally {
    cargando.value = false
  }
}

onMounted(cargarDatos)
</script>

<template>
  <AppLayout>
    <template #header-title>
      <h2>Observador Escolar 📖</h2>
      <p>Registro de seguimiento académico y convivencial.</p>
    </template>

    <div v-if="cargando" class="estado-carga">Cargando observaciones…</div>
    <div v-else-if="error" class="estado-error">{{ error }}</div>

    <template v-else>
      <div class="metrics-grid">
        <div class="metric-card">
          <div>
            <p class="metric-title">Académicas</p>
            <h3 class="metric-val">{{ totalAcademicas }}</h3>
            <p class="metric-sub">Desempeño en clase</p>
          </div>
          <div class="metric-icon blue"><AppIcon name="book-open" :size="18" /></div>
        </div>

        <div class="metric-card">
          <div>
            <p class="metric-title">Convivencia</p>
            <h3 class="metric-val">{{ totalConvivencia }}</h3>
            <p class="metric-sub">Relaciones y comportamiento</p>
          </div>
          <div class="metric-icon amber"><AppIcon name="eye" :size="18" /></div>
        </div>

        <div class="metric-card">
          <div>
            <p class="metric-title">Disciplinarias</p>
            <h3 class="metric-val">{{ totalDisciplinarias }}</h3>
            <p class="metric-sub">Requieren atención</p>
          </div>
          <div class="metric-icon red"><AppIcon name="clipboard-list" :size="18" /></div>
        </div>
      </div>

      <div class="tabs-row">
        <button class="tab-btn" :class="{ activo: filtro === 'todas' }" @click="filtro = 'todas'">Todas</button>
        <button class="tab-btn" :class="{ activo: filtro === 'academico' }" @click="filtro = 'academico'">Académicas</button>
        <button class="tab-btn" :class="{ activo: filtro === 'convivencia' }" @click="filtro = 'convivencia'">Convivencia</button>
        <button class="tab-btn" :class="{ activo: filtro === 'disciplinario' }" @click="filtro = 'disciplinario'">Disciplinarias</button>
      </div>

      <div class="card-box">
        <div class="card-header-flex">
          <h3>Registro de observaciones</h3>
        </div>

        <div v-if="listaFiltrada.length" class="obs-list">
          <div v-for="o in listaFiltrada" :key="o._id" class="obs-item">
            <div class="obs-icon"><AppIcon name="eye" :size="16" /></div>
            <div class="obs-body">
              <div class="obs-header">
                <strong>{{ nombreDocente(o.docenteId) }}</strong>
                <span class="obs-fecha">{{ formatearFecha(o.fecha) }}</span>
              </div>
              <p class="obs-texto">{{ o.descripcion }}</p>
              <p v-if="o.compromiso" class="obs-texto"><strong>Compromiso:</strong> {{ o.compromiso }}</p>
              <div class="obs-tags">
                <span class="status-badge" :class="varianteTipo(o.tipo)">{{ etiquetaTipo(o.tipo) }}</span>
              </div>
            </div>
          </div>
        </div>

        <p v-else class="sin-datos">No hay observaciones en esta categoría.</p>
      </div>
    </template>
  </AppLayout>
</template>

<style scoped>
.obs-list { display: flex; flex-direction: column; gap: 12px; }

.obs-item {
  display: flex;
  gap: 14px;
  padding: 14px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.obs-icon {
  background: #eff6ff;
  color: #2563eb;
  padding: 10px;
  border-radius: 8px;
  height: fit-content;
  display: flex;
}

.obs-body { flex: 1; }
.obs-header { display: flex; justify-content: space-between; gap: 12px; font-size: 13px; color: #0f172a; }
.obs-fecha { font-size: 11px; color: #64748b; white-space: nowrap; }
.obs-texto { font-size: 12px; color: #64748b; margin-top: 6px; line-height: 1.6; }
.obs-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
</style>
