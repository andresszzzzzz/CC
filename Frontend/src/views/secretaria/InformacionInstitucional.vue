<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import ImageUploader from '@/components/admin/ImageUploader.vue'
import { institucionCfgApi } from '@/services/secretariaApiExt'
import { useConfigInstitucional } from '@/composables/useConfigInstitucional'
import '@/styles/secretaria-ui.css'

const { recargar } = useConfigInstitucional()
const f = ref({ nombre: '', nit: '', codigoDane: '', resolucion: '', direccion: '', telefono: '', correo: '', municipio: '', departamento: '', sitioWeb: '', rectorNombre: '', rectorDocumento: '', lema: '', escudoUrl: '', fotoUrl: '' })
const cargando = ref(true), guardando = ref(false), msg = ref(''), error = ref('')

onMounted(async () => {
  try { Object.assign(f.value, (await institucionCfgApi.obtener()).data || {}) } catch { error.value = 'No se pudo cargar la información. Puedes llenarla y guardar.' }
  cargando.value = false
})
async function guardar() {
  msg.value = ''; error.value = ''
  if (!f.value.nombre?.trim()) return (error.value = 'El nombre del colegio es obligatorio.')
  guardando.value = true
  try { await institucionCfgApi.guardar(f.value); await recargar(); msg.value = 'Información guardada. Ya se usa en boletines, certificados y demás documentos.' }
  catch (e) { error.value = e.response?.data?.mensaje || 'No se pudo guardar.' }
  finally { guardando.value = false }
}
const campos = [
  ['nombre', 'Nombre del colegio *'], ['nit', 'NIT / identificación'], ['codigoDane', 'Código DANE'], ['resolucion', 'Resolución de aprobación'],
  ['direccion', 'Dirección'], ['telefono', 'Teléfono'], ['correo', 'Correo electrónico'], ['sitioWeb', 'Sitio web'],
  ['municipio', 'Municipio'], ['departamento', 'Departamento'], ['rectorNombre', 'Nombre del rector(a)'], ['rectorDocumento', 'Documento del rector(a)'], ['lema', 'Lema institucional']
]
</script>

<template>
  <AppLayout>
    <template #header-title><h2>Información institucional</h2><p>Se escribe una sola vez y se reutiliza en todos los documentos.</p></template>
    <div v-if="cargando" class="sec-vacio">Cargando…</div>
    <template v-else>
      <div v-if="msg" class="sec-msg sec-msg--ok">{{ msg }}</div>
      <div v-if="error" class="sec-msg sec-msg--err">{{ error }}</div>
      <section class="sec-panel">
        <h3>Datos del colegio</h3>
        <div class="sec-grid" style="margin-top:12px">
          <label v-for="[k, l] in campos" :key="k" class="sec-campo">{{ l }}<input v-model="f[k]" /></label>
        </div>
      </section>
      <section class="sec-panel">
        <h3>Imágenes</h3>
        <p class="sec-ayuda">El escudo se guarda al subirlo. Las firmas se administran en «Firmas».</p>
        <div class="sec-grid">
          <ImageUploader v-model="f.escudoUrl" tipo="escudo" etiqueta="Escudo / logo" @subido="(u) => institucionCfgApi.guardar({ ...f, escudoUrl: u }).then(recargar)" />
          <ImageUploader v-model="f.fotoUrl" tipo="colegio" etiqueta="Foto del colegio" :contener="false" @subido="(u) => institucionCfgApi.guardar({ ...f, fotoUrl: u }).then(recargar)" />
        </div>
      </section>
      <button class="sec-btn" :disabled="guardando" @click="guardar">{{ guardando ? 'Guardando…' : 'Guardar información' }}</button>
    </template>
  </AppLayout>
</template>
