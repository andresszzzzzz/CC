<script setup>
import CrudView from './CrudView.vue'
import { usuariosApi } from '@/services/secretariaApi'
import { columnasPersona, camposPersona } from '@/config/camposPersona'
import { conDesactivacion, conCampoEstado, TEXTOS_DESACTIVAR } from '@/services/secretariaApiExt'
const recurso = conDesactivacion(usuariosApi)
const columnas = [...columnasPersona.filter((c) => c.key !== 'estado'), { key: 'estado', label: 'Estado' }]
</script>

<template>
  <CrudView
    titulo="Acudientes"
    subtitulo="Alta y edición de acudientes. Para vincularlos con estudiantes o darles otro rol usa «Personas y roles»."
    :recurso="recurso"
    :columnas="columnas"
    :campos="conCampoEstado(camposPersona())"
    :filtros-fijos="{ tipoPerfil: 'acudiente' }"
    nombre-item="acudiente"
    v-bind="TEXTOS_DESACTIVAR"
  />
</template>
