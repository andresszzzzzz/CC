<script setup>
import { useRoute } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'

const route = useRoute()
</script>

<template>
  <AppLayout>
    <template #header-title>
      <h2>{{ route.meta.titulo || 'Pantalla de Rector' }}</h2>
      <p>{{ route.meta.subtitulo || 'Módulo de dirección institucional.' }}</p>
    </template>

    <div class="card-box en-construccion">
      <div class="en-construccion-icono">
        <AppIcon :name="route.meta.icono || 'settings'" :size="30" />
      </div>
      <h3>{{ route.meta.titulo }}</h3>
      <p>{{ route.meta.descripcion || 'Esta pantalla se construirá en un próximo paso, conectada al backend real.' }}</p>
    </div>
  </AppLayout>
</template>

<style scoped>
.en-construccion {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 60px 24px;
  border: 1.5px dashed #cbd5e1;
  box-shadow: none;
  background: #f8fafc;
}
.en-construccion-icono {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #eff6ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}
.en-construccion h3 { font-size: 16px; color: #0f172a; font-weight: 700; margin-bottom: 8px; }
.en-construccion p { font-size: 13px; color: #64748b; max-width: 420px; }
</style>
