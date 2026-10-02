<script setup>
import { computed, onMounted, watch } from 'vue'
import CrudView from './CrudView.vue'
import { asignaturasApi } from '@/services/secretariaApiExt'
import { useCatalogos } from '@/composables/useCatalogos'
const { cargar, opc, institucionId } = useCatalogos()
onMounted(() => cargar('areas'))
watch(institucionId, () => cargar('areas'))
const columnas = [
  { key: 'nombre', label: 'Asignatura' }, { key: 'areaNombre', label: 'Área' }, { key: 'intensidadHoraria', label: 'I.H. semanal' },
  { key: 'porcentaje', label: '% dentro del área' }, { key: 'estado', label: 'Estado' }
]
const campos = computed(() => [
  { key: 'areaId', label: 'Área', type: 'select', required: true, opciones: opc('areas', 'nombre') },
  { key: 'nombre', label: 'Nombre de la asignatura', required: true, placeholder: 'ej. Geografía' },
  { key: 'abreviatura', label: 'Abreviatura' },
  { key: 'intensidadHoraria', label: 'Intensidad horaria semanal', type: 'number', min: 0 },
  { key: 'porcentaje', label: 'Peso dentro del área (%)', type: 'number', min: 0, max: 100 },
  { key: 'orden', label: 'Orden en el boletín', type: 'number' },
  { key: 'estado', label: 'Estado', type: 'select', opciones: [{ value: 'activo', label: 'Activa' }, { value: 'inactivo', label: 'Inactiva' }] }
])
</script>
<template>
  <CrudView titulo="Asignaturas" subtitulo="Cada asignatura pertenece a un área (ej. Área Ciencias Sociales: Historia, Geografía, Democracia…). Luego se asignan a grados y docentes en «Asignación académica»." :recurso="asignaturasApi" :columnas="columnas" :campos="campos" nombre-item="asignatura" />
</template>
