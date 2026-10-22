<script setup>
// App principal que actúa como contenedor del router
import NotificacionesBootstrap from '@/components/NotificacionesBootstrap.vue'
</script>

<template>
  <router-view />
  <!-- Alertas de Bootstrap para toda la aplicación -->
  <NotificacionesBootstrap />
</template>