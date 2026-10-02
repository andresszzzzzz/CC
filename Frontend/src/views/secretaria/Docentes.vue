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
    titulo="Docentes"
    subtitulo="Alta y edición del personal docente. Desactivar a un docente le quita el acceso pero conserva su historial. Sus asignaturas se asignan en «Asignación académica»."
    :recurso="recurso"
    :columnas="columnas"
    :campos="conCampoEstado(camposPersona())"
    :filtros-fijos="{ tipoPerfil: 'docente' }"
    nombre-item="docente"
    v-bind="TEXTOS_DESACTIVAR"
  />
</template>
