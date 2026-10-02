<script setup>
import CrudView from './CrudView.vue'
import { ciclosApi } from '@/services/secretariaApiExt'
const columnas = [
  { key: 'orden', label: 'Orden' }, { key: 'nombre', label: 'Ciclo' }, { key: 'nivel', label: 'Nivel' },
  { key: 'gradoDesde', label: 'Desde grado' }, { key: 'gradoHasta', label: 'Hasta grado' }, { key: 'estado', label: 'Estado' }
]
const campos = [
  { key: 'nombre', label: 'Nombre del ciclo', required: true, placeholder: 'ej. Ciclo 3 (6° a 7°)' },
  { key: 'nivel', label: 'Nivel', type: 'select', required: true, opciones: [
    { value: 'preescolar', label: 'Preescolar' }, { value: 'primaria', label: 'Básica primaria' },
    { value: 'secundaria', label: 'Básica secundaria' }, { value: 'media', label: 'Media' }] },
  { key: 'gradoDesde', label: 'Desde el grado', type: 'number', min: 0, max: 13 },
  { key: 'gradoHasta', label: 'Hasta el grado', type: 'number', min: 0, max: 13 },
  { key: 'orden', label: 'Orden', type: 'number' },
  { key: 'estado', label: 'Estado', type: 'select', opciones: [{ value: 'activo', label: 'Activo' }, { value: 'inactivo', label: 'Inactivo' }] }
]
</script>
<template>
  <CrudView titulo="Ciclos y niveles" subtitulo="Preescolar, primaria, secundaria y media. Los grados se asocian a un ciclo." :recurso="ciclosApi" :columnas="columnas" :campos="campos" nombre-item="ciclo" />
</template>
