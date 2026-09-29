<script setup>
import CrudView from './CrudView.vue'
import { usuariosApi } from '@/services/secretariaApi'
import { columnasPersona, camposPersona } from '@/config/camposPersona'
</script>

<template>
  <CrudView
    titulo="Acudientes"
    subtitulo="Alta y edición de acudientes. Para vincularlos con un estudiante, usa la pestaña de Estudiantes."
    :recurso="usuariosApi"
    :columnas="columnasPersona"
    :campos="camposPersona()"
    :filtros-fijos="{ tipoPerfil: 'acudiente' }"
    nombre-item="acudiente"
  />
</template>
