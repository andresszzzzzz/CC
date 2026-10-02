<script setup>
import CrudView from './CrudView.vue'
import { usuariosApi } from '@/services/secretariaApi'
import { columnasPersona, camposPersona } from '@/config/camposPersona'
import { conDesactivacion, conCampoEstado, TEXTOS_DESACTIVAR } from '@/services/secretariaApiExt'
const recurso = conDesactivacion(usuariosApi)
const columnas = [
  ...columnasPersona.filter((c) => c.key !== 'estado' && c.key !== 'tipoPerfil'),
  { key: 'tipoPerfil', label: 'Tipo de usuario' }, { key: 'estado', label: 'Estado' }
]
</script>

<template>
  <CrudView
    titulo="Usuarios del Sistema"
    subtitulo="Estudiantes, docentes, acudientes, directivos y administrativos. Desactivar un usuario bloquea su ingreso sin borrar su historial."
    :recurso="recurso"
    :columnas="columnas"
    :campos="conCampoEstado(camposPersona({ incluirRol: true }))"
    nombre-item="usuario"
    v-bind="TEXTOS_DESACTIVAR"
  />
</template>
