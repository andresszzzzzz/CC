<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
import FuncionNoDisponible from '@/components/FuncionNoDisponible.vue'
</script>

<template>
  <AppLayout>
    <template #header-title>
      <h2>Control de Asistencia 📅</h2>
      <p>Supervisa la puntualidad y asistencia diaria a clases.</p>
    </template>

    <FuncionNoDisponible
      icono="calendar-check"
      titulo="El registro de asistencia aún no está disponible"
      descripcion="Todavía no se registra la asistencia en el sistema. Cuando esté habilitada verás aquí la asistencia real de tu hijo(a)."
    />
  </AppLayout>
</template>
