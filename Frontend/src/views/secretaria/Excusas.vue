<script setup>
import { computed, onMounted, watch } from 'vue'
import CrudView from './CrudView.vue'
import { excusasApi } from '@/services/secretariaApi'
import { useCatalogos } from '@/composables/useCatalogos'
import { useAuthStore } from '@/stores/auth'
import { formatearFecha } from '@/utils/academico'

const auth = useAuthStore()
const { cargar, opc, nombrePersona, institucionId } = useCatalogos()
const cargarApoyo = () => cargar('anios', 'docentes')
onMounted(cargarApoyo)
watch(institucionId, cargarApoyo)

const columnas = [
  { key: 'docenteId.nombreCompleto', label: 'Docente' },
  { key: 'anioAcademicoId.anio', label: 'Año' },
  { key: 'fechaInicio', label: 'Desde', format: (v) => formatearFecha(v) },
  { key: 'fechaFin', label: 'Hasta', format: (v) => formatearFecha(v) },
  { key: 'diasAusente', label: 'Días' },
  { key: 'motivo', label: 'Motivo' },
  { key: 'estado', label: 'Estado' }
]
const campos = computed(() => [
  { key: 'docenteId', label: 'Docente', type: 'select', required: true, opciones: opc('docentes', nombrePersona) },
  { key: 'anioAcademicoId', label: 'Año escolar', type: 'select', required: true, opciones: opc('anios', (a) => a.anio) },
  { key: 'fechaInicio', label: 'Desde', type: 'date', required: true },
  { key: 'fechaFin', label: 'Hasta', type: 'date', required: true },
  { key: 'motivo', label: 'Motivo', required: true },
  { key: 'estado', label: 'Estado', type: 'select',
    opciones: [{ value: 'pendiente', label: 'Pendiente' }, { value: 'aprobada', label: 'Aprobada' }, { value: 'rechazada', label: 'Rechazada' }] },
  { key: 'observaciones', label: 'Observaciones' }
])

// Al aprobar o rechazar se deja constancia de quién lo hizo y cuándo.
function antesDeEnviar(payload, actual) {
  const decidida = payload.estado === 'aprobada' || payload.estado === 'rechazada'
  if (decidida && payload.estado !== actual?.estado) {
    payload.aprobadoPor = auth.usuario?._id
    payload.aprobadoEn = new Date().toISOString()
  }
  return payload
}
</script>

<template>
  <CrudView
    titulo="Excusas de docentes"
    subtitulo="Ausencias del personal docente y su aprobación."
    :recurso="excusasApi"
    :columnas="columnas"
    :campos="campos"
    :antes-de-enviar="antesDeEnviar"
    nombre-item="excusa"
  />
</template>
