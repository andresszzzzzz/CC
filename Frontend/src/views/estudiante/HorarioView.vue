<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
import FuncionNoDisponible from '@/components/FuncionNoDisponible.vue'
</script>

<template>
  <AppLayout>
    <template #header-title>
      <h2>Horario de Clases ⏰</h2>
      <p>Distribución de los bloques académicos semanales.</p>
    </template>

    <FuncionNoDisponible
      icono="clock"
      titulo="El horario de clases aún no está disponible"
      descripcion="Todavía no se cargan los horarios en el sistema. Consulta el horario con tu institución mientras tanto."
    />
  </AppLayout>
</template>
