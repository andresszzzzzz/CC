<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// "/" redirige a /login y el guard de rutas manda a cada usuario autenticado a SU inicio según su rol.
const irAlInicio = () => router.push('/')
const volver = () => (window.history.length > 1 ? router.back() : irAlInicio())
</script>

<template>
  <div class="nf-pagina">
    <div class="nf-tarjeta">
      <div class="nf-codigo">404</div>
      <h1>Página no encontrada</h1>
      <p>
        La ruta <code>{{ route.fullPath }}</code> no existe en EasyNotes.
        Puede que el enlace esté mal escrito o que esa pantalla todavía no esté disponible.
      </p>
      <div class="nf-acciones">
        <button class="nf-btn nf-btn--sec" @click="volver">Volver</button>
        <button class="nf-btn nf-btn--pri" @click="irAlInicio">Ir a mi inicio</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nf-pagina { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f1f5f9; padding: 24px; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; }
.nf-tarjeta { background: white; border-radius: 20px; padding: 40px 36px; max-width: 480px; width: 100%; text-align: center; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0; }
.nf-codigo { font-size: 56px; font-weight: 800; color: #2563eb; line-height: 1; margin-bottom: 8px; }
h1 { font-size: 20px; color: #0f172a; margin: 0 0 10px; }
p { font-size: 14px; color: #64748b; line-height: 1.6; margin: 0 0 24px; }
code { background: #f1f5f9; border-radius: 6px; padding: 2px 8px; color: #1e40af; font-size: 13px; word-break: break-all; }
.nf-acciones { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.nf-btn { border-radius: 10px; padding: 10px 20px; font-size: 14px; font-weight: 700; cursor: pointer; }
.nf-btn--sec { background: white; border: 1px solid #cbd5e1; color: #475569; }
.nf-btn--pri { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border: none; color: white; }
.nf-btn:focus-visible { outline: 2px solid #3b82f6; outline-offset: 2px; }
</style>
