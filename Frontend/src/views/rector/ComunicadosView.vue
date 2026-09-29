<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import rectorService from '@/services/rectorService'

const cargando = ref(true)
const enviando = ref(false)
const error = ref('')
const mensajeExito = ref('')
const comunicados = ref([])

const formulario = ref({ asunto: '', mensaje: '' })

function formatearFecha(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function cargarComunicados() {
  cargando.value = true
  error.value = ''
  try {
    const res = await rectorService.obtenerComunicados()
    const lista = res.data.comunicados || res.data || []
    comunicados.value = [...lista].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  } catch (e) {
    console.error('Error al cargar comunicados:', e)
    error.value = 'No se pudieron cargar los comunicados desde el backend.'
  } finally {
    cargando.value = false
  }
}

async function enviarComunicado() {
  if (!formulario.value.asunto.trim() || !formulario.value.mensaje.trim()) return
  enviando.value = true
  error.value = ''
  mensajeExito.value = ''
  try {
    await rectorService.crearComunicado({
      asunto: formulario.value.asunto,
      mensaje: formulario.value.mensaje,
      destinatarios: []
    })
    mensajeExito.value = 'Comunicado enviado a toda la institución.'
    formulario.value = { asunto: '', mensaje: '' }
    await cargarComunicados()
  } catch (e) {
    console.error('Error al enviar el comunicado:', e)
    error.value = 'No se pudo enviar el comunicado al backend.'
  } finally {
    enviando.value = false
  }
}

onMounted(() => {
  cargarComunicados()
})
</script>

<template>
  <AppLayout>
    <template #header-title>
      <h2>Comunicados Institucionales 📢</h2>
      <p>Envía comunicados a toda la comunidad educativa.</p>
    </template>

    <div class="content-grid">
      <div class="card-box">
        <div class="card-header-flex">
          <h3>Comunicados enviados</h3>
        </div>
        <p v-if="cargando" class="estado-carga">Cargando comunicados...</p>
        <div v-else-if="comunicados.length > 0" style="display:flex; flex-direction:column; gap:14px;">
          <div v-for="c in comunicados" :key="c._id" style="border-bottom:1px solid #f1f5f9; padding-bottom:12px;">
            <div style="display:flex; justify-content:space-between; gap:8px;">
              <strong style="font-size:13px; color:#0f172a;">{{ c.asunto }}</strong>
              <span style="font-size:11px; color:#94a3b8; white-space:nowrap;">{{ formatearFecha(c.fecha) }}</span>
            </div>
            <p style="font-size:12px; color:#64748b; margin-top:4px;">{{ c.mensaje }}</p>
          </div>
        </div>
        <p v-else class="sin-datos">No hay comunicados enviados todavía.</p>
      </div>

      <div class="card-box">
        <div class="card-header-flex">
          <h3>Nuevo comunicado</h3>
        </div>
        <p v-if="error" class="field-error" style="margin-bottom:10px;">{{ error }}</p>
        <p v-if="mensajeExito" style="color:#059669; font-size:12.5px; margin-bottom:10px;">{{ mensajeExito }}</p>

        <form @submit.prevent="enviarComunicado" style="display:flex; flex-direction:column; gap:14px;">
          <label class="field">
            <span>Asunto</span>
            <input v-model="formulario.asunto" type="text" required />
          </label>
          <label class="field">
            <span>Mensaje</span>
            <textarea v-model="formulario.mensaje" rows="5" required></textarea>
          </label>
          <button type="submit" class="btn-primary" :disabled="enviando">
            <AppIcon name="megaphone" :size="15" />
            {{ enviando ? 'Enviando...' : 'Enviar a toda la institución' }}
          </button>
        </form>
      </div>
    </div>
  </AppLayout>
</template>
