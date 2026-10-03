<script setup>
import CrudView from './CrudView.vue'
import { bitacoraApi } from '@/services/secretariaApi'

const fechaHora = (v) =>
  v ? new Date(v).toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''

const columnas = [
  { key: 'createdAt', label: 'Fecha', format: fechaHora },
  { key: 'usuarioId', label: 'Usuario', format: (v) => (v && typeof v === 'object' ? [v.nombres, v.apellidos].filter(Boolean).join(' ') : '') },
  { key: 'accion', label: 'Acción' },
  { key: 'coleccion', label: 'Módulo' },
  { key: 'detalle', label: 'Detalle' }
]
</script>

<template>
  <CrudView
    titulo="Bitácora de actividad"
    subtitulo="Últimas acciones registradas en el sistema (máximo 500, solo consulta)."
    :recurso="bitacoraApi"
    :columnas="columnas"
    :campos="[]"
    solo-lectura
    nombre-item="registro"
  />
</template>
