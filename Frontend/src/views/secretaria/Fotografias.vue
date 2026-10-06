<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import ImageUploader from '@/components/admin/ImageUploader.vue'
import { imagenesApi, institucionCfgApi, personasApi } from '@/services/secretariaApiExt'
import { urlPublica } from '@/services/api'
import { useConfigInstitucional } from '@/composables/useConfigInstitucional'
import { useCatalogos } from '@/composables/useCatalogos'
import '@/styles/secretaria-ui.css'

const { institucion, cargar, recargar } = useConfigInstitucional()
const { nombrePersona, institucionId } = useCatalogos()
const TABS = [['colegio', 'Colegio'], ['escudo', 'Escudo'], ['institucional', 'Institucionales'], ['estudiante', 'Estudiantes'], ['docente', 'Docentes'], ['acudiente', 'Acudientes']]
const tab = ref('colegio'), galeria = ref([]), error = ref(''), msg = ref('')
const q = ref(''), res = ref([]), persona = ref(null)
const esPersona = computed(() => ['estudiante', 'docente', 'acudiente'].includes(tab.value))

onMounted(cargar)
watch(tab, async (t) => {
  persona.value = null; res.value = []; q.value = ''; msg.value = ''; error.value = ''
  if (t === 'institucional') galeria.value = (await imagenesApi.galeria(t).catch(() => ({ data: [] }))).data || []
})
async function guardarCampo(campo, url) {
  msg.value = ''; error.value = ''
  try { await institucionCfgApi.guardar({ ...institucion.value, [campo]: url }); await recargar(); msg.value = 'Imagen actualizada.' }
  catch (e) { error.value = e.response?.data?.mensaje || 'La imagen se subió, pero no se pudo guardar en la institución.' }
}
async function buscar() { if (q.value.trim().length >= 2) res.value = (await personasApi.buscar(q.value.trim(), institucionId.value).catch(() => ({ data: [] }))).data || [] }
async function subirGaleria(e) {
  for (const f of e.target.files) {
    try { const { data } = await imagenesApi.subir('institucional', f); galeria.value.push(data) } catch (e) { error.value = e.response?.data?.mensaje || 'No se pudo subir una de las imágenes.' }
  }
  e.target.value = ''
}
async function quitarGaleria(g, i) { if (confirm('¿Eliminar esta foto?')) { await imagenesApi.eliminar('institucional', g._id).catch(() => {}); galeria.value.splice(i, 1) } }
</script>

<template>
  <AppLayout>
    <template #header-title><h2>Fotografías</h2><p>Sube y reemplaza las imágenes de la institución y de las personas.</p></template>
    <div class="sec-fila" style="margin-bottom:14px"><button v-for="t in TABS" :key="t[0]" class="sec-btn" :class="{ 'sec-btn--sec': tab !== t[0] }" @click="tab = t[0]">{{ t[1] }}</button></div>
    <div v-if="msg" class="sec-msg sec-msg--ok">{{ msg }}</div>
    <div v-if="error" class="sec-msg sec-msg--err">{{ error }}</div>

    <section v-if="tab === 'colegio'" class="sec-panel" style="max-width:560px">
      <ImageUploader :model-value="institucion.fotoUrl" tipo="colegio" etiqueta="Foto del colegio" :contener="false" :altura="220" @subido="(u) => guardarCampo('fotoUrl', u)" />
    </section>
    <section v-else-if="tab === 'escudo'" class="sec-panel" style="max-width:400px">
      <ImageUploader :model-value="institucion.escudoUrl" tipo="escudo" etiqueta="Escudo / logo" :altura="200" @subido="(u) => guardarCampo('escudoUrl', u)" />
    </section>
    <section v-else-if="tab === 'institucional'" class="sec-panel">
      <h3>Fotos institucionales adicionales</h3>
      <label class="sec-btn sec-btn--sec" style="display:inline-block;margin:10px 0;cursor:pointer">+ Subir fotos<input type="file" accept="image/*" multiple hidden @change="subirGaleria" /></label>
      <p v-if="!galeria.length" class="sec-vacio">Aún no hay fotos.</p>
      <div class="sec-grid"><div v-for="(g, i) in galeria" :key="g._id || i"><img :src="urlPublica(g.url)" style="width:100%;height:140px;object-fit:cover;border-radius:12px" /><button class="sec-btn sec-btn--peligro" style="margin-top:6px" @click="quitarGaleria(g, i)">Eliminar</button></div></div>
    </section>
    <section v-else-if="esPersona" class="sec-panel">
      <div class="sec-fila">
        <input v-model="q" placeholder="Buscar por nombre o documento" style="flex:1;min-width:220px;border:1px solid #cbd5e1;border-radius:10px;padding:9px 12px" @keyup.enter="buscar" />
        <button class="sec-btn" @click="buscar">Buscar</button>
      </div>
      <div v-for="r in res" :key="r._id" class="sec-resultado" @click="persona = r; res = []"><span>{{ nombrePersona(r) }} · {{ r.documento }}</span></div>
      <div v-if="persona" style="max-width:260px;margin-top:14px">
        <ImageUploader v-model="persona.foto" :tipo="tab" :extra="{ personaId: persona._id }" :etiqueta="'Foto de ' + nombrePersona(persona)" :contener="false" :altura="240" @subido="msg = 'Fotografía actualizada.'" />
      </div>
    </section>
  </AppLayout>
</template>