<script setup>
import { computed, onMounted, watch } from 'vue'
import CrudView from './CrudView.vue'
import { indicadoresApi } from '@/services/secretariaApi'
import { useCatalogos } from '@/composables/useCatalogos'

const { cargar, opc, institucionId } = useCatalogos()
const cargarApoyo = () => cargar('anios', 'asignaturas')
onMounted(cargarApoyo)
watch(institucionId, cargarApoyo)

// Los registros llegan con anioAcademicoId y asignaturaId poblados; las claves con punto leen dentro.
const columnas = [
  { key: 'anioAcademicoId.anio', label: 'Año' },
  { key: 'asignaturaId.nombre', label: 'Asignatura' },
  { key: 'periodo', label: 'Periodo' },
  { key: 'codigo', label: 'Código' },
  { key: 'descripcion', label: 'Indicador de logro' },
  { key: 'estado', label: 'Estado' }
]
const campos = computed(() => [
  { key: 'anioAcademicoId', label: 'Año escolar', type: 'select', required: true, opciones: opc('anios', (a) => a.anio) },
  { key: 'asignaturaId', label: 'Asignatura', type: 'select', required: true,
    opciones: opc('asignaturas', (a) => (a.areaNombre ? `${a.nombre} (${a.areaNombre})` : a.nombre)) },
  // El modelo de notas admite periodos del 1 al 5.
  { key: 'periodo', label: 'Periodo', type: 'select', required: true,
    opciones: [1, 2, 3, 4, 5].map((n) => ({ value: n, label: `Periodo ${n}` })) },
  { key: 'codigo', label: 'Código', placeholder: 'ej. IL-01' },
  { key: 'descripcion', label: 'Descripción del indicador', required: true },
  { key: 'peso', label: 'Peso', type: 'number', min: 0 },
  { key: 'orden', label: 'Orden', type: 'number', min: 0 },
  { key: 'estado', label: 'Estado', type: 'select', opciones: [{ value: 'activo', label: 'Activo' }, { value: 'inactivo', label: 'Inactivo' }] }
])
</script>

<template>
  <CrudView
    titulo="Indicadores de logro"
    subtitulo="Indicadores por asignatura y periodo; aparecen en los boletines."
    :recurso="indicadoresApi"
    :columnas="columnas"
    :campos="campos"
    nombre-item="indicador"
  />
</template>
