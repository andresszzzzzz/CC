<script setup>
import { computed, onMounted, watch } from 'vue'
import CrudView from './CrudView.vue'
import { gradosApi } from '@/services/secretariaApiExt'
import { useCatalogos } from '@/composables/useCatalogos'
const { cargar, opc, institucionId } = useCatalogos()
onMounted(() => cargar('ciclos'))
watch(institucionId, () => cargar('ciclos'))
const columnas = [
  { key: 'numero', label: 'N.º' }, { key: 'nombre', label: 'Grado' }, { key: 'cicloNombre', label: 'Ciclo' }, { key: 'estado', label: 'Estado' }
]
const campos = computed(() => [
  { key: 'nombre', label: 'Nombre del grado', required: true, placeholder: 'ej. Sexto' },
  { key: 'numero', label: 'Número (0 = transición … 11 = once)', type: 'number', min: 0, max: 13, required: true },
  { key: 'cicloId', label: 'Ciclo', type: 'select', required: true, opciones: opc('ciclos', 'nombre') },
  { key: 'estado', label: 'Estado', type: 'select', opciones: [{ value: 'activo', label: 'Activo' }, { value: 'inactivo', label: 'Inactivo' }] }
])
</script>
<template>
  <CrudView titulo="Grados" subtitulo="Crea los grados y asócialos a un ciclo. Los grupos o cursos (ej. 6A) se configuran en «Grupos / cursos»." :recurso="gradosApi" :columnas="columnas" :campos="campos" nombre-item="grado" />
</template>
