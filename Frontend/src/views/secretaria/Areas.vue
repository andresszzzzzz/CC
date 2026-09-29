<script setup>
import { computed } from 'vue'
import CrudView from './CrudView.vue'
import { areasApi } from '@/services/secretariaApi'

const columnas = [
  { key: 'nombre', label: 'Área' },
  { key: 'abreviatura', label: 'Abrev.' },
  { key: 'porcentaje', label: '% Peso' },
  { key: 'orden', label: 'Orden' },
  { key: 'estado', label: 'Estado' }
]

const campos = [
  { key: 'nombre', label: 'Nombre del Área', required: true },
  { key: 'abreviatura', label: 'Abreviatura' },
  { key: 'porcentaje', label: 'Porcentaje de peso (%)', type: 'number', min: 0, max: 100 },
  { key: 'orden', label: 'Orden de visualización', type: 'number' },
  { key: 'tag', label: 'Etiqueta / Tag' },
  { key: 'estado', label: 'Estado', type: 'select',
    opciones: [{ value: 'activo', label: 'Activo' }, { value: 'inactivo', label: 'Inactivo' }] }
]
</script>

<template>
  <CrudView
    titulo="Áreas Académicas"
    subtitulo="Áreas en las que se agrupan las asignaturas."
    :recurso="areasApi"
    :columnas="columnas"
    :campos="campos"
    nombre-item="área"
  />
</template>
