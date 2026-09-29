<script setup>
import CrudView from './CrudView.vue'
import { usuariosApi } from '@/services/secretariaApi'
import { columnasPersona, camposPersona } from '@/config/camposPersona'
</script>

<template>
  <CrudView
    titulo="Docentes"
    subtitulo="Alta y edición del personal docente."
    :recurso="usuariosApi"
    :columnas="columnasPersona"
    :campos="camposPersona()"
    :filtros-fijos="{ tipoPerfil: 'docente' }"
    nombre-item="docente"
  />
</template>
