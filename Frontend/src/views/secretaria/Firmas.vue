<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import ImageUploader from '@/components/admin/ImageUploader.vue'
import { firmasApi } from '@/services/secretariaApiExt'
import { useConfigInstitucional } from '@/composables/useConfigInstitucional'
import { useContextoInstitucional } from '@/composables/useContextoInstitucional'
import '@/styles/secretaria-ui.css'

const { institucionId } = useContextoInstitucional()
const { recargar } = useConfigInstitucional()
const firmas = ref([]), cargando = ref(true), msg = ref(''), error = ref('')
const DOCS = [['boletin', 'Boletines'], ['certificado', 'Certificados'], ['constancia', 'Constancias'], ['acta', 'Actas'], ['otros', 'Otros documentos']]
const TIPOS = [['rector', 'Rector(a)'], ['coordinador', 'Coordinador(a)'], ['secretario', 'Secretario(a)'], ['otra', 'Otra']]

async function cargarFirmas() {
  cargando.value = true
  try { const { data } = await firmasApi.listar({ institucionId: institucionId.value }); firmas.value = Array.isArray(data) ? data : data.items || [] }
  catch { error.value = 'No se pudieron cargar las firmas.' }
  cargando.value = false
}
onMounted(cargarFirmas)

function nueva(tipo = 'otra') {
  firmas.value.push({ _nueva: true, tipo, nombre: '', cargo: TIPOS.find((t) => t[0] === tipo)?.[1] || '', imagenUrl: '', activa: true, orden: firmas.value.length + 1, usarEn: DOCS.map((d) => d[0]) })
}
async function guardar(f) {
  msg.value = ''; error.value = ''
  if (!f.nombre.trim()) return (error.value = 'Escribe el nombre de quien firma.')
  try {
    const payload = { ...f, institucionId: institucionId.value }; delete payload._nueva
    if (f._id) await firmasApi.actualizar(f._id, payload)
    else { const { data } = await firmasApi.crear(payload); f._id = data?._id; f._nueva = false }
    await recargar()
    msg.value = `Firma de ${f.nombre} guardada.`
  } catch (e) { error.value = e.response?.data?.mensaje || 'No se pudo guardar la firma.' }
}
async function quitar(f, i) {
  if (!f._id) return firmas.value.splice(i, 1)
  if (!confirm('¿Eliminar esta firma? Los documentos nuevos dejarán de usarla.')) return
  try { await firmasApi.eliminar(f._id); firmas.value.splice(i, 1); await recargar() } catch { error.value = 'No se pudo eliminar.' }
}
function alternarDoc(f, d) { const i = f.usarEn.indexOf(d); i >= 0 ? f.usarEn.splice(i, 1) : f.usarEn.push(d) }
</script>

<template>
  <AppLayout>
    <template #header-title><h2>Firmas institucionales</h2><p>Firma del rector y de otras personas que firman documentos. Se aplican solas en los PDF.</p></template>
    <div v-if="msg" class="sec-msg sec-msg--ok">{{ msg }}</div>
    <div v-if="error" class="sec-msg sec-msg--err">{{ error }}</div>
    <div v-if="cargando" class="sec-vacio">Cargando…</div>
    <template v-else>
      <div v-if="!firmas.length" class="sec-panel sec-vacio">Aún no hay firmas. Empieza agregando la del rector.</div>
      <section v-for="(f, i) in firmas" :key="f._id || i" class="sec-panel">
        <div class="sec-grid">
          <ImageUploader v-model="f.imagenUrl" tipo="firma" :extra="{ firmaId: f._id || '' }" etiqueta="Imagen de la firma" :altura="110" ayuda="PNG con fondo transparente, máximo 2 MB." />
          <div style="display:grid;gap:10px;align-content:start">
            <label class="sec-campo">Tipo<select v-model="f.tipo"><option v-for="t in TIPOS" :key="t[0]" :value="t[0]">{{ t[1] }}</option></select></label>
            <label class="sec-campo">Nombre<input v-model="f.nombre" /></label>
            <label class="sec-campo">Cargo que aparece bajo la firma<input v-model="f.cargo" /></label>
          </div>
          <div style="display:grid;gap:10px;align-content:start">
            <label class="sec-campo" style="flex-direction:row;align-items:center;gap:8px"><input type="checkbox" v-model="f.activa" style="width:auto" /> Firma activa</label>
            <label class="sec-campo">Orden en el documento<input type="number" min="1" v-model.number="f.orden" /></label>
            <div class="sec-campo">Usar en:
              <label v-for="d in DOCS" :key="d[0]" style="font-weight:400;display:flex;gap:6px;align-items:center">
                <input type="checkbox" :checked="f.usarEn.includes(d[0])" style="width:auto" @change="alternarDoc(f, d[0])" /> {{ d[1] }}</label>
            </div>
          </div>
        </div>
        <div class="sec-fila" style="margin-top:12px">
          <button class="sec-btn" @click="guardar(f)">Guardar firma</button>
          <button class="sec-btn sec-btn--peligro" @click="quitar(f, i)">Eliminar</button>
        </div>
      </section>
      <div class="sec-fila">
        <button class="sec-btn" @click="nueva('rector')">+ Firma del rector</button>
        <button class="sec-btn sec-btn--sec" @click="nueva('coordinador')">+ Coordinador</button>
        <button class="sec-btn sec-btn--sec" @click="nueva('secretario')">+ Secretario</button>
        <button class="sec-btn sec-btn--sec" @click="nueva('otra')">+ Otra firma</button>
      </div>
    </template>
  </AppLayout>
</template>
