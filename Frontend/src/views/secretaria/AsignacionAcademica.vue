<script setup>
import { computed, onMounted, watch } from 'vue'
import CrudView from './CrudView.vue'
import { asignacionesApi } from '@/services/secretariaApiExt'
import { useCatalogos } from '@/composables/useCatalogos'
const { cargar, opc, institucionId, nombrePersona } = useCatalogos()
const load = () => cargar('anios', 'grupos', 'asignaturas', 'docentes')
onMounted(load)
watch(institucionId, load)
const columnas = [
  { key: 'anio', label: 'Año' }, { key: 'grupoNombre', label: 'Grupo' }, { key: 'asignaturaNombre', label: 'Asignatura' },
  { key: 'docenteNombre', label: 'Docente' }, { key: 'intensidadHoraria', label: 'I.H.' }, { key: 'estado', label: 'Estado' }
]
const campos = computed(() => [
  { key: 'anioAcademicoId', label: 'Año escolar', type: 'select', required: true, opciones: opc('anios', (a) => String(a.anio)) },
  { key: 'grupoId', label: 'Grupo / curso (define el grado)', type: 'select', required: true, opciones: opc('grupos', (g) => `${g.nombre} — grado ${g.grado}`) },
  { key: 'asignaturaId', label: 'Asignatura', type: 'select', required: true, opciones: opc('asignaturas', 'nombre') },
  { key: 'docenteId', label: 'Docente responsable', type: 'select', required: true, opciones: opc('docentes', nombrePersona) },
  { key: 'intensidadHoraria', label: 'Intensidad horaria semanal', type: 'number', min: 0 },
  { key: 'estado', label: 'Estado', type: 'select', opciones: [{ value: 'activo', label: 'Activa' }, { value: 'inactivo', label: 'Inactiva' }] }
])
</script>
<template>
  <CrudView titulo="Asignación académica" subtitulo="Define qué asignaturas se dictan en cada grupo y qué docente las tiene a cargo. Los docentes verán aquí sus cursos para calificar." :recurso="asignacionesApi" :columnas="columnas" :campos="campos" nombre-item="asignación" />
</template>
