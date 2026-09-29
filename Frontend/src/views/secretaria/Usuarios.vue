<script setup>
import CrudView from './CrudView.vue'
import { usuariosApi } from '@/services/secretariaApi'
import { columnasPersona, camposPersona } from '@/config/camposPersona'

const columnas = [...columnasPersona, { key: 'tipoPerfil', label: 'Rol' }]
</script>

<template>
  <CrudView
    titulo="Usuarios del Sistema"
    subtitulo="Administradores, rectores y coordinadores con acceso a la plataforma."
    :recurso="usuariosApi"
    :columnas="columnas"
    :campos="camposPersona({ incluirRol: true })"
    nombre-item="usuario"
  />
</template>
