<script setup>
import CrudView from './CrudView.vue'
import { sedesApi } from '@/services/secretariaApi'

const columnas = [
  { key: 'nombre', label: 'Sede' },
  { key: 'abreviatura', label: 'Abrev.' },
  { key: 'direccion', label: 'Dirección' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'estado', label: 'Estado' }
]
const campos = [
  { key: 'nombre', label: 'Nombre de la sede', required: true, placeholder: 'ej. Sede principal' },
  { key: 'abreviatura', label: 'Abreviatura' },
  { key: 'direccion', label: 'Dirección' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'estado', label: 'Estado', type: 'select', opciones: [{ value: 'activo', label: 'Activa' }, { value: 'inactivo', label: 'Inactiva' }] }
]
</script>

<template>
  <CrudView
    titulo="Sedes"
    subtitulo="Sedes físicas de la institución. Los grupos se asocian a una sede."
    :recurso="sedesApi"
    :columnas="columnas"
    :campos="campos"
    nombre-item="sede"
  />
</template>
