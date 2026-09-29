<script setup>
import { computed, onMounted, watch } from 'vue'
import CrudView from './CrudView.vue'
import { gruposApi } from '@/services/secretariaApi'
import { useContextoInstitucional } from '@/composables/useContextoInstitucional'
import { useListasApoyo } from '@/composables/useListasApoyo'

const { institucionId, anios, cargarAnios } = useContextoInstitucional()
const { sedes, docentes, cargarSedes, cargarDocentes, opcSedes, opcDocentes } = useListasApoyo()

async function cargarApoyo() {
  if (!institucionId.value) return
  await Promise.all([cargarAnios(), cargarSedes(institucionId.value), cargarDocentes(institucionId.value)])
}
onMounted(cargarApoyo)
watch(institucionId, cargarApoyo)

const opcAnios = () => anios.value.map((a) => ({ value: a._id, label: String(a.anio) }))

const columnas = [
  { key: 'nombre', label: 'Grupo' },
  { key: 'grado', label: 'Grado' },
  { key: 'jornada', label: 'Jornada' },
  { key: 'capacidad', label: 'Capacidad' },
  { key: 'estado', label: 'Estado' }
]

const campos = computed(() => [
  { key: 'anioAcademicoId', label: 'Año Académico', type: 'select', required: true, opciones: opcAnios },
  { key: 'sedeId', label: 'Sede', type: 'select', opciones: opcSedes },
  { key: 'nombre', label: 'Nombre del Grupo', required: true, placeholder: 'ej. 5A' },
  { key: 'grado', label: 'Grado', type: 'number', min: 0, max: 11, required: true },
  { key: 'jornada', label: 'Jornada', type: 'select',
    opciones: [
      { value: 'manana', label: 'Mañana' }, { value: 'tarde', label: 'Tarde' },
      { value: 'noche', label: 'Noche' }, { value: 'continua', label: 'Continua' }
    ] },
  { key: 'ciclo', label: 'Ciclo', type: 'select',
    opciones: [{ value: 'normal', label: 'Normal' }, { value: 'semestre1', label: 'Semestre 1' }, { value: 'semestre2', label: 'Semestre 2' }] },
  { key: 'nivelCodigo', label: 'Código de Nivel' },
  { key: 'especialidad', label: 'Especialidad', type: 'select',
    opciones: [
      { value: '', label: 'Ninguna' }, { value: 'tecnica', label: 'Técnica' }, { value: 'comercial', label: 'Comercial' },
      { value: 'industrial', label: 'Industrial' }, { value: 'pedagogica', label: 'Pedagógica' }, { value: 'otra', label: 'Otra' }
    ] },
  { key: 'docenteDirectorId', label: 'Docente Director de Grupo', type: 'select', opciones: opcDocentes },
  { key: 'capacidad', label: 'Capacidad máxima', type: 'number' },
  { key: 'escuelaNueva', label: 'Escuela Nueva', type: 'select', opciones: [{ value: 'NO', label: 'No' }, { value: 'SI', label: 'Sí' }] },
  { key: 'estado', label: 'Estado', type: 'select',
    opciones: [{ value: 'activo', label: 'Activo' }, { value: 'inactivo', label: 'Inactivo' }, { value: 'cerrado', label: 'Cerrado' }] }
])
</script>

<template>
  <CrudView
    titulo="Grupos"
    subtitulo="Grupos / cursos de cada año académico."
    :recurso="gruposApi"
    :columnas="columnas"
    :campos="campos"
    nombre-item="grupo"
  />
</template>
