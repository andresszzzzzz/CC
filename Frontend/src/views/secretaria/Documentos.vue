<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { documentosApi, estudiantesApi } from '@/services/secretariaApiExt'
import { generarPDF, descargarPDF, urlPreview, datosDemo } from '@/services/pdfDocumentos'
import { useConfigInstitucional } from '@/composables/useConfigInstitucional'
import { useCatalogos } from '@/composables/useCatalogos'
import { useContextoInstitucional } from '@/composables/useContextoInstitucional'
import '@/styles/secretaria-ui.css'

const { institucion, calificacion, firmasActivas, cargar: cargarCfg } = useConfigInstitucional()
const { anioActivo } = useContextoInstitucional()
const { periodos, grupos, cargar, nombrePersona, institucionId } = useCatalogos()
const load = () => { cargarCfg(); cargar('periodos', 'grupos') }
onMounted(load); watch(institucionId, load)

const TIPOS = [['boletin', 'Boletín de calificaciones'], ['certificado', 'Certificado de estudios'], ['constancia', 'Constancia de matrícula'], ['acta', 'Acta']]
const tipo = ref('boletin'), modo = ref('individual'), periodoId = ref(''), grupoId = ref('')
const q = ref(''), res = ref([]), est = ref(null)
const cargando = ref(false), error = ref(''), preview = ref(''), ultimo = ref(null)
const periodosAnio = computed(() => periodos.value.filter((p) => !anioActivo.value || p.anioAcademicoId === anioActivo.value._id))

async function buscar() { if (q.value.trim().length >= 2) res.value = (await estudiantesApi.buscar(q.value.trim(), institucionId.value).catch(() => ({ data: [] }))).data || [] }

// Arma el contexto con la configuración VIGENTE: escudo, datos, firmas y escala vienen de Secretaría
function contexto(d) {
  return { ...d, tipo: tipo.value, institucion: institucion.value, config: calificacion.value, firmas: firmasActivas(tipo.value), anio: d.anio || anioActivo.value?.anio,
    periodo: d.periodo || periodosAnio.value.find((p) => p._id === periodoId.value)?.nombre, asignaturas: d.asignaturas || [] }
}
async function generar(demo = false) {
  error.value = ''; preview.value = ''
  if (!demo && modo.value === 'individual' && !est.value) return (error.value = 'Busca y elige un estudiante.')
  if (!demo && tipo.value === 'boletin' && !periodoId.value) return (error.value = 'Elige el periodo.')
  if (!demo && modo.value === 'grupo' && !grupoId.value) return (error.value = 'Elige el grupo.')
  cargando.value = true
  try {
    let lista
    if (demo) lista = [datosDemo()]
    else if (modo.value === 'grupo') lista = (await documentosApi.datosGrupo({ tipo: tipo.value, grupoId: grupoId.value, periodoId: periodoId.value })).data
    else lista = [(await documentosApi.datos({ tipo: tipo.value, estudianteId: est.value._id, periodoId: periodoId.value })).data]
    const doc = await generarPDF(lista.map(contexto), tipo.value)
    ultimo.value = { doc, nombre: `${tipo.value}-${demo ? 'ejemplo' : modo.value === 'grupo' ? 'grupo' : (est.value?.documento || 'estudiante')}` }
    preview.value = urlPreview(doc)
  } catch (e) { error.value = e.response?.data?.mensaje || e.message || 'No se pudo generar el PDF.' }
  cargando.value = false
}
</script>

<template>
  <AppLayout>
    <template #header-title><h2>Boletines y documentos</h2><p>PDF con el escudo, datos, escala de notas y firmas configurados en Secretaría.</p></template>
    <div v-if="error" class="sec-msg sec-msg--err">{{ error }}</div>
    <section class="sec-panel">
      <div class="sec-grid">
        <label class="sec-campo">Documento<select v-model="tipo"><option v-for="t in TIPOS" :key="t[0]" :value="t[0]">{{ t[1] }}</option></select></label>
        <label class="sec-campo">Para<select v-model="modo"><option value="individual">Un estudiante</option><option value="grupo" :disabled="tipo === 'acta'">Todo un grupo (un solo PDF)</option></select></label>
        <label v-if="tipo === 'boletin'" class="sec-campo">Periodo<select v-model="periodoId"><option value="">Selecciona…</option><option v-for="p in periodosAnio" :key="p._id" :value="p._id">{{ p.nombre }}</option></select></label>
        <label v-if="modo === 'grupo'" class="sec-campo">Grupo<select v-model="grupoId"><option value="">Selecciona…</option><option v-for="g in grupos" :key="g._id" :value="g._id">{{ g.nombre }}</option></select></label>
      </div>
      <div v-if="modo === 'individual'" style="margin-top:12px">
        <div class="sec-fila">
          <input v-model="q" placeholder="Buscar estudiante" style="flex:1;min-width:220px;border:1px solid #cbd5e1;border-radius:10px;padding:9px 12px" @keyup.enter="buscar" />
          <button class="sec-btn sec-btn--sec" @click="buscar">Buscar</button>
          <span v-if="est" class="sec-chip">{{ nombrePersona(est) }}<button @click="est = null">×</button></span>
        </div>
        <div v-for="r in res" :key="r._id" class="sec-resultado" @click="est = r; res = []"><span>{{ nombrePersona(r) }} · {{ r.documento }}</span></div>
      </div>
      <div class="sec-fila" style="margin-top:14px">
        <button class="sec-btn" :disabled="cargando" @click="generar(false)">{{ cargando ? 'Generando…' : 'Generar PDF' }}</button>
        <button class="sec-btn sec-btn--sec" :disabled="cargando" @click="generar(true)">Ver ejemplo con mis datos institucionales</button>
        <button v-if="ultimo" class="sec-btn sec-btn--sec" @click="descargarPDF(ultimo.doc, ultimo.nombre)">Descargar PDF</button>
      </div>
    </section>
    <section v-if="preview" class="sec-panel"><iframe :src="preview" title="Vista previa del PDF" style="width:100%;height:720px;border:0;border-radius:12px" /></section>
  </AppLayout>
</template>
