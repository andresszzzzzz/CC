<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
import FuncionNoDisponible from '@/components/FuncionNoDisponible.vue'
</script>

<template>
  <AppLayout>
    <template #header-title>
      <h2>Mensajes ✉️</h2>
      <p>Comunicación directa con tus docentes y coordinación.</p>
    </template>

    <FuncionNoDisponible
      icono="mail"
      titulo="La mensajería aún no está disponible"
      descripcion="Todavía no es posible enviar ni recibir mensajes desde el sistema. Por ahora, los avisos oficiales están en Comunicados."
    />
  </AppLayout>
</template>
