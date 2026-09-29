<script setup>
import { computed, ref, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import acudienteService from '@/services/acudienteService'
import { useAuthStore } from '@/stores/auth'
import { formatearFecha } from '@/utils/academico'

const auth = useAuthStore()

const cargando = ref(true)
const error = ref('')
const comunicados = ref([])
const filtroPrioridad = ref('todos')

const idDe = (valor) => (valor && typeof valor === 'object' ? valor._id : valor)

const filtros = [
  { clave: 'todos', etiqueta: 'Todos' },
  { clave: 'normal', etiqueta: 'Normal' },
  { clave: 'urgente', etiqueta: 'Urgente' }
]

const nombreRemitente = (r) => {
  if (!r || typeof r !== 'object') return '—'
  return `${r.nombres || ''} ${r.apellidos || ''}`.trim() || '—'
}

// Solo se marca "Leído" cuando el backend tiene registrada la lectura de este
// usuario. Si no, no se muestra nada: no se inventa un estado.
const loLei = (c) => (c.leido || []).some((l) => idDe(l.usuarioId) === auth.usuario?._id)

const listaFiltrada = computed(() =>
  filtroPrioridad.value === 'todos'
    ? comunicados.value
    : comunicados.value.filter((c) => c.prioridad === filtroPrioridad.value)
)

const cargarDatos = async () => {
  cargando.value = true
  error.value = ''
  try {
    const institucionId = idDe(auth.usuario?.institucionId)
    const { data } = await acudienteService.obtenerComunicados(institucionId)
    comunicados.value = data
      .filter((c) => c.estado !== 'borrador')
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  } catch (e) {
    error.value = e.response?.data?.mensaje || 'No se pudieron cargar los comunicados.'
  } finally {
    cargando.value = false
  }
}

onMounted(cargarDatos)
</script>

<template>
  <AppLayout>
    <template #header-title>
      <h2>Comunicados y Circulares 📢</h2>
      <p>Avisos oficiales y mensajes emitidos por {{ auth.colegio || 'tu institución' }}.</p>
    </template>

    <div class="card-box">
      <div class="card-header-flex">
        <div>
          <h3>Bandeja de Anuncios Institucionales</h3>
          <p class="subtitulo">Revisa los comunicados enviados por directivos y docentes.</p>
        </div>

        <div class="tabs-row">
          <button
            v-for="f in filtros"
            :key="f.clave"
            class="tab-btn"
            :class="{ activo: filtroPrioridad === f.clave }"
            @click="filtroPrioridad = f.clave"
          >
            {{ f.etiqueta }}
          </button>
        </div>
      </div>

      <div v-if="cargando" class="estado-carga">Cargando comunicados…</div>
      <div v-else-if="error" class="estado-error">{{ error }}</div>
      <template v-else>
        <div v-if="listaFiltrada.length" class="comunicados-list">
          <div v-for="c in listaFiltrada" :key="c._id" class="comunicado-card">
            <div class="comunicado-header">
              <div class="comunicado-titulo">
                <span class="status-badge" :class="c.prioridad === 'urgente' ? 'rojo' : 'azul'">
                  {{ c.prioridad === 'urgente' ? 'Urgente' : 'Normal' }}
                </span>
                <strong>{{ c.asunto }}</strong>
              </div>
              <span class="comunicado-fecha">{{ formatearFecha(c.fecha) }}</span>
            </div>

            <p class="comunicado-body">{{ c.mensaje }}</p>

            <div class="comunicado-footer">
              <span><strong>Remitente:</strong> {{ nombreRemitente(c.remitenteId) }}</span>
              <span v-if="loLei(c)" class="status-badge verde">Leído</span>
            </div>
          </div>
        </div>
        <p v-else class="sin-datos">No hay comunicados disponibles en esta categoría.</p>
      </template>
    </div>
  </AppLayout>
</template>

<style scoped>
.subtitulo { font-size: 12px; color: #64748b; margin-top: 4px; }

.comunicados-list { display: flex; flex-direction: column; gap: 14px; }
.comunicado-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 18px;
  background: #f8fafc;
}
.comunicado-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}
.comunicado-titulo { display: flex; align-items: center; gap: 10px; }
.comunicado-titulo strong { font-size: 14px; color: #0f172a; }
.comunicado-fecha { font-size: 12px; color: #64748b; white-space: nowrap; }
.comunicado-body { font-size: 13px; color: #334155; line-height: 1.5; white-space: pre-line; }
.comunicado-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #e2e8f0;
  font-size: 12px;
  color: #64748b;
}
</style>
