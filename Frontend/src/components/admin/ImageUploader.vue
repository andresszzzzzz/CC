<script setup>
import { ref, watch } from 'vue'
import { imagenesApi } from '@/services/secretariaApiExt'
import '@/styles/secretaria-ui.css'

const props = defineProps({
  modelValue: { type: String, default: '' },   // URL actual
  tipo: { type: String, required: true },       // escudo | colegio | firma | estudiante | docente | acudiente | institucional
  extra: { type: Object, default: () => ({}) }, // ej. { personaId }
  etiqueta: { type: String, default: 'Imagen' },
  ayuda: { type: String, default: 'PNG o JPG, máximo 2 MB.' },
  contener: { type: Boolean, default: true },    // true = logo/firma (sin recortar)
  altura: { type: Number, default: 140 }
})
const emit = defineEmits(['update:modelValue', 'subido'])
const vista = ref(props.modelValue)
const cargando = ref(false)
const error = ref('')
const input = ref(null)
watch(() => props.modelValue, (v) => (vista.value = v))

async function elegir(e) {
  const f = e.target.files?.[0]
  e.target.value = ''
  if (!f) return
  if (!f.type.startsWith('image/')) return (error.value = 'El archivo debe ser una imagen (PNG o JPG).')
  if (f.size > 2 * 1024 * 1024) return (error.value = 'La imagen supera los 2 MB.')
  error.value = ''
  const local = URL.createObjectURL(f)
  vista.value = local
  cargando.value = true
  try {
    const { data } = await imagenesApi.subir(props.tipo, f, props.extra)
    const url = data?.url || data?.imagenUrl || local
    vista.value = url
    emit('update:modelValue', url)
    emit('subido', url, data)
  } catch (err) {
    vista.value = props.modelValue
    error.value = err.response?.data?.mensaje || 'No se pudo subir la imagen. Intenta de nuevo.'
  } finally { cargando.value = false }
}
</script>

<template>
  <div class="iu">
    <p class="iu-etq">{{ etiqueta }}</p>
    <div class="iu-caja" :style="{ height: altura + 'px' }" @click="input.click()">
      <img v-if="vista" :src="vista" :alt="etiqueta" :style="{ objectFit: contener ? 'contain' : 'cover' }" />
      <span v-else>Sin imagen</span>
      <div v-if="cargando" class="iu-carga">Subiendo…</div>
    </div>
    <div class="sec-fila" style="margin-top:8px">
      <button type="button" class="sec-btn sec-btn--sec" :disabled="cargando" @click="input.click()">{{ vista ? 'Reemplazar' : 'Subir imagen' }}</button>
    </div>
    <p class="iu-ayuda">{{ ayuda }}</p>
    <p v-if="error" class="iu-error">{{ error }}</p>
    <input ref="input" type="file" accept="image/png,image/jpeg,image/webp" hidden @change="elegir" />
  </div>
</template>

<style scoped>
.iu-etq { font-size:12.5px; font-weight:600; color:#334155; margin-bottom:6px; }
.iu-caja { position:relative; border:2px dashed #cbd5e1; border-radius:14px; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:13px; cursor:pointer; overflow:hidden; background:#f8fafc; }
.iu-caja:hover { border-color:#3b82f6; }
.iu-caja img { width:100%; height:100%; }
.iu-carga { position:absolute; inset:0; background:rgba(255,255,255,.75); display:flex; align-items:center; justify-content:center; font-weight:600; color:#1d4ed8; }
.iu-ayuda { font-size:11.5px; color:#94a3b8; margin-top:6px; } .iu-error { font-size:12px; color:#b91c1c; margin-top:4px; }
</style>
