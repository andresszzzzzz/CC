<script setup>
import { computed, ref } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import SelectorHijos from '@/components/SelectorHijos.vue'
import acudienteService from '@/services/acudienteService'
import { useHijos } from '@/composables/useHijos'
import { formatearFecha } from '@/utils/academico'

const cargandoDatos = ref(false)
const errorDatos = ref('')
const observaciones = ref([])

const cargarObservaciones = async (estudianteId) => {
  cargandoDatos.value = true
  errorDatos.value = ''
  try {
    const { data } = await acudienteService.obtenerObservaciones(estudianteId)
    observaciones.value = [...data].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  } catch (e) {
    observaciones.value = []
    errorDatos.value = e.response?.data?.mensaje || 'No se pudieron cargar las anotaciones.'
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
  seleccionarEstudiante
} = useHijos(cargarObservaciones)

const sinHijos = computed(
  () => !cargandoPerfil.value && !errorPerfil.value && acudiente.estudiantes.length === 0
)

// Valores definidos en el modelo Observador del backend.
const etiquetasTipo = { academico: 'Académica', convivencia: 'Convivencia', disciplinario: 'Disciplinaria' }
const variantesTipo = { academico: 'azul', convivencia: 'amarillo', disciplinario: 'rojo' }
const etiquetasEstado = { abierto: 'Abierto', seguimiento: 'En seguimiento', cerrado: 'Cerrado' }
const variantesEstado = { abierto: 'amarillo', seguimiento: 'azul', cerrado: 'verde' }

const etiquetaTipo = (t) => etiquetasTipo[t] || t
const varianteTipo = (t) => variantesTipo[t] || 'neutro'
const etiquetaEstado = (e) => etiquetasEstado[e] || e
const varianteEstado = (e) => variantesEstado[e] || 'neutro'

const nombrePersona = (p) => {
  if (!p || typeof p !== 'object') return '—'
  return `${p.nombres || ''} ${p.apellidos || ''}`.trim() || '—'
}
</script>

<template>
  <AppLayout>
    <template #header-title>
      <h2>Observador Escolar 📖</h2>
      <p>Registro de seguimiento académico y convivencial.</p>
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

      <div class="card-box">
        <div class="card-header-flex">
          <div>
            <h3>
              Seguimiento de: <span class="nombre-hijo">{{ estudiante.nombre || '—' }}</span>
              <span v-if="estudiante.curso">({{ estudiante.curso }})</span>
            </h3>
            <p class="subtitulo">Anotaciones oficiales emitidas por la institución educativa.</p>
          </div>
        </div>

        <div v-if="cargandoDatos" class="estado-carga">Cargando anotaciones…</div>
        <div v-else-if="errorDatos" class="estado-error">{{ errorDatos }}</div>
        <template v-else>
          <div v-if="observaciones.length" class="observaciones-list">
            <div v-for="o in observaciones" :key="o._id" class="observacion-card">
              <div class="observacion-header">
                <span class="status-badge" :class="varianteTipo(o.tipo)">{{ etiquetaTipo(o.tipo) }}</span>
                <span class="observacion-fecha">{{ formatearFecha(o.fecha) }}</span>
              </div>

              <p class="observacion-body">{{ o.descripcion }}</p>

              <p v-if="o.compromiso" class="observacion-compromiso">
                <strong>Compromiso:</strong> {{ o.compromiso }}
              </p>

              <ul v-if="o.seguimiento && o.seguimiento.length" class="observacion-seguimiento">
                <li v-for="(s, i) in o.seguimiento" :key="i">
                  <span class="seg-fecha">{{ formatearFecha(s.fecha) }}</span> {{ s.observacion }}
                </li>
              </ul>

              <div class="observacion-footer">
                <span><strong>Docente:</strong> {{ nombrePersona(o.docenteId) }}</span>
                <span class="status-badge" :class="varianteEstado(o.estado)">{{ etiquetaEstado(o.estado) }}</span>
              </div>
            </div>
          </div>
          <p v-else class="sin-datos">No hay anotaciones registradas en el observador escolar.</p>
        </template>
      </div>
    </template>
  </AppLayout>
</template>

<style scoped>
.nombre-hijo { color: #1d4ed8; }
.subtitulo { font-size: 12px; color: #64748b; margin-top: 4px; }

.observaciones-list { display: flex; flex-direction: column; gap: 14px; }
.observacion-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 18px;
  background: #f8fafc;
}
.observacion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.observacion-fecha { font-size: 12px; color: #64748b; }
.observacion-body { font-size: 13px; color: #334155; line-height: 1.5; }
.observacion-compromiso { font-size: 12px; color: #334155; margin-top: 10px; }

.observacion-seguimiento {
  list-style: none;
  margin-top: 10px;
  padding-left: 12px;
  border-left: 2px solid #bfdbfe;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #475569;
}
.seg-fecha { color: #94a3b8; margin-right: 6px; }

.observacion-footer {
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
