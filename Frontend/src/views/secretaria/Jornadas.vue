<script setup>
import CrudView from './CrudView.vue'
import { jornadasApi } from '@/services/secretariaApiExt'
const columnas = [
  { key: 'nombre', label: 'Jornada' }, { key: 'tipo', label: 'Tipo' }, { key: 'horaInicio', label: 'Entrada' },
  { key: 'horaFin', label: 'Salida' }, { key: 'estado', label: 'Estado' }
]
const campos = [
  { key: 'tipo', label: 'Tipo de jornada', type: 'select', required: true, opciones: [
    { value: 'manana', label: 'Mañana' }, { value: 'tarde', label: 'Tarde' }, { value: 'noche', label: 'Nocturna' }, { value: 'unica', label: 'Única' }] },
  { key: 'nombre', label: 'Nombre', required: true, placeholder: 'ej. Jornada de la mañana' },
  { key: 'horaInicio', label: 'Hora de entrada', type: 'time' },
  { key: 'horaFin', label: 'Hora de salida', type: 'time' },
  { key: 'estado', label: 'Estado', type: 'select', opciones: [{ value: 'activo', label: 'Activa' }, { value: 'inactivo', label: 'Inactiva' }] }
]
</script>
<template>
  <CrudView titulo="Jornadas" subtitulo="Mañana, tarde, nocturna o única. Los grupos y las matrículas eligen una de estas jornadas; si desactivas una, deja de ofrecerse." :recurso="jornadasApi" :columnas="columnas" :campos="campos" nombre-item="jornada" />
</template>
