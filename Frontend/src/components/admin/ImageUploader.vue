<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { imagenesApi } from '@/services/secretariaApiExt'
import '@/styles/secretaria-ui.css'

const props = defineProps({
  modelValue: { type: String, default: '' },   // URL actual (la que guarda la base de datos)
  tipo: { type: String, required: true },       // escudo | colegio | firma | estudiante | docente | acudiente | institucional
  extra: { type: Object, default: () => ({}) }, // ej. { personaId }
  etiqueta: { type: String, default: 'Imagen' },
  ayuda: { type: String, default: 'PNG, JPG o WEBP, máximo 2 MB.' },
  contener: { type: Boolean, default: true },    // true = logo/firma (sin recortar)
  altura: { type: Number, default: 140 },
  maxMB: { type: Number, default: 2 }
})
const emit = defineEmits(['update:modelValue', 'subido', 'error'])

const TIPOS = ['image/png', 'image/jpeg', 'image/webp']
const vista = ref(props.modelValue)
const cargando = ref(false)
const error = ref('')
const imagenRota = ref(false)   // la URL guardada no se pudo abrir (borrada, sin permiso o vencida)
const input = ref(null)
let urlLocal = null             // vista previa temporal
let ultima = ''                 // firma del último archivo subido, para no subir el mismo dos veces

watch(() => props.modelValue, (v) => { vista.value = v; imagenRota.value = false })

function soltarLocal() { if (urlLocal) { URL.revokeObjectURL(urlLocal); urlLocal = null } }
onBeforeUnmount(soltarLocal)

// Comprueba los primeros bytes: evita que un .exe o .svg renombrado a .jpg pase como imagen
async function esImagenReal(f) {
  const b = new Uint8Array(await f.slice(0, 12).arrayBuffer())
  const png = b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47
  const jpg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff
  const webp = b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  return png || jpg || webp
}
function fallo(msg) { error.value = msg; emit('error', msg) }

function mensajeDeError(err) {
  const st = err.response?.status
  if (err.response?.data?.mensaje) return err.response.data.mensaje
  if (!err.response) return 'No hay conexión con el servidor. Revisa tu internet e intenta de nuevo.'
  if (st === 413) return `La imagen es demasiado grande para el servidor (máximo ${props.maxMB} MB).`
  if (st === 401) return 'Tu sesión venció. Vuelve a iniciar sesión.'
  if (st === 403) return 'No tienes permiso para subir esta imagen.'
  return 'No se pudo subir la imagen. Intenta de nuevo.'
}

async function elegir(e) {
  const f = e.target.files?.[0]
  e.target.value = ''
  if (!f || cargando.value) return
  error.value = ''
  if (!TIPOS.includes(f.type)) return fallo('Formato no permitido. Usa PNG, JPG o WEBP.')
  if (f.size > props.maxMB * 1024 * 1024) {
    return fallo(`La imagen pesa ${(f.size / 1024 / 1024).toFixed(1)} MB y el máximo es ${props.maxMB} MB.`)
  }
  if (!(await esImagenReal(f))) return fallo('El archivo no es una imagen válida.')
  const firma = `${f.name}|${f.size}|${f.lastModified}`
  if (firma === ultima) return fallo('Esa misma imagen ya está cargada.')

  soltarLocal()
  urlLocal = URL.createObjectURL(f)
  const anterior = props.modelValue
  vista.value = urlLocal
  imagenRota.value = false
  cargando.value = true
  try {
    const { data } = await imagenesApi.subir(props.tipo, f, props.extra)
    const url = data?.url || data?.imagenUrl
    // Nunca se guarda la vista previa local (blob:) como si fuera la imagen real
    if (!url) throw Object.assign(new Error('sin url'), { response: { data: { mensaje: 'El servidor no devolvió la dirección de la imagen. No se guardó.' } } })
    ultima = firma
    soltarLocal()
    vista.value = url
    emit('update:modelValue', url)
    emit('subido', url, data)
  } catch (err) {
    soltarLocal()
    vista.value = anterior
    fallo(mensajeDeError(err))
  } finally { cargando.value = false }
}
</script>

<template>
  <div class="iu">
    <p class="iu-etq">{{ etiqueta }}</p>
    <div class="iu-caja" :style="{ height: altura + 'px' }" @click="!cargando && input.click()">
      <img v-if="vista && !imagenRota" :src="vista" :alt="etiqueta" :style="{ objectFit: contener ? 'contain' : 'cover' }" @error="imagenRota = true" />
      <span v-else-if="vista && imagenRota" class="iu-rota">No se pudo mostrar la imagen guardada. Sube una nueva.</span>
      <span v-else>Sin imagen</span>
      <div v-if="cargando" class="iu-carga">Subiendo…</div>
    </div>
    <div class="sec-fila" style="margin-top:8px">
      <button type="button" class="sec-btn sec-btn--sec" :disabled="cargando" @click="input.click()">{{ vista ? 'Reemplazar' : 'Subir imagen' }}</button>
    </div>
    <p class="iu-ayuda">{{ ayuda }}</p>
    <p v-if="error" class="iu-error" role="alert">{{ error }}</p>
    <input ref="input" type="file" accept="image/png,image/jpeg,image/webp" hidden @change="elegir" />
  </div>
</template>

<style scoped>
.iu-etq { font-size:12.5px; font-weight:600; color:#334155; margin-bottom:6px; }
.iu-caja { position:relative; border:2px dashed #cbd5e1; border-radius:14px; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:13px; cursor:pointer; overflow:hidden; background:#f8fafc; text-align:center; padding:6px; }
.iu-caja:hover { border-color:#3b82f6; }
.iu-caja img { width:100%; height:100%; }
.iu-rota { color:#b45309; font-size:12.5px; }
.iu-carga { position:absolute; inset:0; background:rgba(255,255,255,.75); display:flex; align-items:center; justify-content:center; font-weight:600; color:#1d4ed8; }
.iu-ayuda { font-size:11.5px; color:#94a3b8; margin-top:6px; } .iu-error { font-size:12px; color:#b91c1c; margin-top:4px; }
</style>