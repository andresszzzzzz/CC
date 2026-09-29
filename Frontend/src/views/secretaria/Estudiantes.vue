<script setup>
import CrudView from './CrudView.vue'
import { usuariosApi } from '@/services/secretariaApi'
import { columnasPersona, camposPersona } from '@/config/camposPersona'
</script>

<template>
  <CrudView
    titulo="Estudiantes"
    subtitulo="Alta y edición de estudiantes de la institución."
    :recurso="usuariosApi"
    :columnas="columnasPersona"
    :campos="camposPersona()"
    :filtros-fijos="{ tipoPerfil: 'estudiante' }"
    nombre-item="estudiante"
  />
</template>
