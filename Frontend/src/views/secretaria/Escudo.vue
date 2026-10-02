<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import ImageUploader from '@/components/admin/ImageUploader.vue'
import { institucionCfgApi } from '@/services/secretariaApiExt'
import { useConfigInstitucional } from '@/composables/useConfigInstitucional'
import '@/styles/secretaria-ui.css'

const { institucion, cargar, recargar } = useConfigInstitucional()
const url = ref(''), msg = ref(''), error = ref('')
onMounted(async () => { await cargar(); url.value = institucion.value.escudoUrl || '' })
async function alSubir(u) {
  try { await institucionCfgApi.guardar({ ...institucion.value, escudoUrl: u }); await recargar(); msg.value = 'Escudo actualizado en todos los documentos.' }
  catch { error.value = 'La imagen se subió, pero no se pudo guardar como escudo institucional.' }
}
</script>

<template>
  <AppLayout>
    <template #header-title><h2>Escudo / Logo</h2><p>Una sola imagen para toda la institución.</p></template>
    <div v-if="msg" class="sec-msg sec-msg--ok">{{ msg }}</div>
    <div v-if="error" class="sec-msg sec-msg--err">{{ error }}</div>
    <section class="sec-panel" style="max-width:520px">
      <ImageUploader v-model="url" tipo="escudo" etiqueta="Escudo institucional" :altura="200" ayuda="PNG con fondo transparente recomendado. Máximo 2 MB." @subido="alSubir" />
    </section>
    <section class="sec-panel">
      <h3>Dónde se usa automáticamente</h3>
      <p class="sec-ayuda">Boletines, certificados, constancias, actas, reportes, matrículas y comunicaciones. No hay que subirlo en cada módulo: al reemplazarlo aquí cambia en todos.</p>
    </section>
  </AppLayout>
</template>
