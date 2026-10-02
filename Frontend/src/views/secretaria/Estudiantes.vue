<script setup>
import { computed, onMounted, watch } from 'vue'
import CrudView from './CrudView.vue'
import { usuariosApi } from '@/services/secretariaApi'
import { columnasPersona, camposPersona } from '@/config/camposPersona'
import { conDesactivacion, conCampoEstado, TEXTOS_DESACTIVAR } from '@/services/secretariaApiExt'
import { useCatalogos } from '@/composables/useCatalogos'

const { cargar, opc, institucionId, nombrePersona } = useCatalogos()
const load = () => cargar('grupos', 'jornadas', 'acudientes')
onMounted(load)
watch(institucionId, load)

const recurso = conDesactivacion(usuariosApi)
const columnas = [
  ...columnasPersona.filter((c) => c.key !== 'estado'),
  { key: 'estadoEstudiante', label: 'Situación' }, { key: 'grupoNombre', label: 'Grupo' },
  { key: 'jornadaNombre', label: 'Jornada' }, { key: 'estado', label: 'Acceso' }
]
const campos = computed(() => [
  ...conCampoEstado(camposPersona()),
  { key: 'grupoId', label: 'Grupo / curso (define el grado)', type: 'select', opciones: opc('grupos', (g) => `${g.nombre} — grado ${g.grado}`) },
  { key: 'jornadaId', label: 'Jornada', type: 'select', opciones: opc('jornadas', 'nombre') },
  { key: 'acudienteId', label: 'Acudiente principal', type: 'select', opciones: opc('acudientes', nombrePersona) }
])
</script>

<template>
  <CrudView
    titulo="Estudiantes"
    subtitulo="Alta y edición. Situación: Registrado, No matriculado, Matriculado, Retirado o Inactivo. Foto e historial en «Ficha del estudiante»; para matricular usa «Matrículas»."
    :recurso="recurso"
    :columnas="columnas"
    :campos="campos"
    :filtros-fijos="{ tipoPerfil: 'estudiante' }"
    nombre-item="estudiante"
    v-bind="TEXTOS_DESACTIVAR"
  />
</template>
