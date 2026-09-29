<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
import FuncionNoDisponible from '@/components/FuncionNoDisponible.vue'
</script>

<template>
  <AppLayout>
    <template #header-title>
      <h2>Mi Asistencia 📅</h2>
      <p>Revisa tu puntualidad y asistencia diaria a clases.</p>
    </template>

    <FuncionNoDisponible
      icono="calendar-check"
      titulo="El registro de asistencia aún no está disponible"
      descripcion="Todavía no se registra la asistencia en el sistema. Cuando esté habilitada verás aquí tus presentes, tardanzas y ausencias reales."
    />
  </AppLayout>
</template>
