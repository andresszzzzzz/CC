<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
import FuncionNoDisponible from '@/components/FuncionNoDisponible.vue'
</script>

<template>
  <AppLayout>
    <template #header-title>
      <h2>Material de Apoyo 📁</h2>
      <p>Guías, documentos y enlaces compartidos por tus docentes.</p>
    </template>

    <FuncionNoDisponible
      icono="folder"
      titulo="El material de apoyo aún no está disponible"
      descripcion="Los docentes todavía no pueden publicar guías ni enlaces desde el sistema. Cuando puedan, los verás aquí."
    />
  </AppLayout>
</template>
