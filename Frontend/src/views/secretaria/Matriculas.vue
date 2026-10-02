<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import EstadoBadge from '@/components/admin/EstadoBadge.vue'
import { estudiantesApi, matriculasApi } from '@/services/secretariaApiExt'
import { useCatalogos } from '@/composables/useCatalogos'
import { useContextoInstitucional } from '@/composables/useContextoInstitucional'
import '@/styles/secretaria-ui.css'

const { anioActivo, cargarAnios } = useContextoInstitucional()
const { anios, grados, grupos, jornadas, acudientes, cargar, nombrePersona, institucionId } = useCatalogos()
const load = async () => { await cargarAnios(); await cargar('anios', 'grados', 'grupos', 'jornadas', 'acudientes') }
onMounted(load)
watch(institucionId, load)

const q = ref(''), resultados = ref([]), buscando = ref(false)
const est = ref(null), historial = ref([])
const msg = ref(''), error = ref(''), guardando = ref(false)
const form = ref({ anioAcademicoId: '', gradoId: '', grupoId: '', jornadaId: '', acudienteId: '' })

async function buscar() {
  if (q.value.trim().length < 2) return
  buscando.value = true; error.value = ''
  try { const { data } = await estudiantesApi.buscar(q.value.trim(), institucionId.value); resultados.value = Array.isArray(data) ? data : data.items || [] }
  catch { error.value = 'No se pudo buscar.' }
  buscando.value = false
}
// Se muestra siempre: ¿registrado? y ¿matriculado en el año escolar actual?
const matriculaActual = computed(() => historial.value.find((m) => m.anioAcademicoId === anioActivo.value?._id && m.estado !== 'cancelada'))
const situacion = computed(() => {
  if (!est.value) return ''
  if (est.value.estado === 'inactivo') return 'inactivo'
  const m = matriculaActual.value
  if (m?.estado === 'matriculado') return 'matriculado'
  if (m?.estado === 'retirado') return 'retirado'
  return historial.value.length ? 'no matriculado' : 'registrado'
})
async function elegir(e) {
  est.value = e; resultados.value = []; msg.value = ''; error.value = ''
  const { data } = await matriculasApi.historial(e._id).catch(() => ({ data: [] }))
  historial.value = Array.isArray(data) ? data : data.items || []
  form.value = { anioAcademicoId: anioActivo.value?._id || '', gradoId: '', grupoId: '', jornadaId: e.jornadaId || '', acudienteId: e.acudienteId || '' }
}
const gruposDelGrado = computed(() => {
  const g = grados.value.find((x) => x._id === form.value.gradoId)
  return g ? grupos.value.filter((x) => Number(x.grado) === Number(g.numero) && (!form.value.anioAcademicoId || !x.anioAcademicoId || x.anioAcademicoId === form.value.anioAcademicoId)) : []
})
const yaMatriculado = computed(() => historial.value.some((m) => m.anioAcademicoId === form.value.anioAcademicoId && m.estado !== 'cancelada'))
const nombreDe = (lista, id, campo = 'nombre') => lista.find((x) => x._id === id)?.[campo] ?? '—'

async function matricular() {
  msg.value = ''; error.value = ''
  const f = form.value
  if (!f.anioAcademicoId || !f.gradoId || !f.grupoId || !f.jornadaId) return (error.value = 'Elige año, grado, grupo y jornada.')
  if (yaMatriculado.value) return (error.value = 'Este estudiante ya tiene matrícula en ese año escolar. Cambia su estado en el historial si necesitas corregirla.')
  guardando.value = true
  try {
    const { data } = await matriculasApi.verificar(est.value._id, f.anioAcademicoId) // doble control en backend
    if (data?.existe) throw { response: { data: { mensaje: 'Ya existe una matrícula para ese año (verificada en el servidor).' } } }
    await matriculasApi.crear({ ...f, estudianteId: est.value._id, institucionId: institucionId.value, estado: 'matriculado' })
    msg.value = 'Estudiante matriculado correctamente.'
    await elegir(est.value)
  } catch (e) { error.value = e.response?.data?.mensaje || 'No se pudo matricular.' }
  guardando.value = false
}
async function cambiarEstado(m, estado) {
  const motivo = estado === 'retirado' || estado === 'cancelada' ? prompt('Motivo (opcional):') || '' : ''
  try { await matriculasApi.cambiarEstado(m._id, estado, motivo); m.estado = estado; msg.value = 'Estado de la matrícula actualizado.' }
  catch (e) { error.value = e.response?.data?.mensaje || 'No se pudo cambiar el estado.' }
}
</script>

<template>
  <AppLayout>
    <template #header-title><h2>Matrículas</h2><p>Busca al estudiante, revisa su situación y matricúlalo en el año escolar.</p></template>
    <div v-if="msg" class="sec-msg sec-msg--ok">{{ msg }}</div>
    <div v-if="error" class="sec-msg sec-msg--err">{{ error }}</div>

    <section class="sec-panel">
      <h3>1. Buscar estudiante</h3>
      <div class="sec-fila" style="margin-top:10px">
        <input v-model="q" class="sec-campo" style="flex:1;min-width:220px;border:1px solid #cbd5e1;border-radius:10px;padding:9px 12px" placeholder="Nombre o documento" @keyup.enter="buscar" />
        <button class="sec-btn" :disabled="buscando" @click="buscar">{{ buscando ? 'Buscando…' : 'Buscar' }}</button>
      </div>
      <div v-for="r in resultados" :key="r._id" class="sec-resultado" @click="elegir(r)">
        <span><b>{{ nombrePersona(r) }}</b> · {{ r.documento }}</span>
        <span class="sec-fila"><EstadoBadge estado="registrado" /><EstadoBadge v-if="r.estadoEstudiante" :estado="r.estadoEstudiante" /></span>
      </div>
      <p v-if="q && !resultados.length && !buscando && !est" class="sec-ayuda" style="margin-top:8px">Si no aparece, primero regístralo en «Estudiantes».</p>
    </section>

    <template v-if="est">
      <section class="sec-panel">
        <h3>{{ nombrePersona(est) }} <small style="font-weight:400;color:#64748b">· {{ est.documento }}</small></h3>
        <div class="sec-fila" style="margin-top:8px">
          <EstadoBadge :estado="situacion" />
          <span class="sec-chip">Registrado: Sí</span>
          <span class="sec-chip" :style="!matriculaActual && 'background:#fef3c7;color:#b45309'">Matriculado en {{ anioActivo?.anio || 'el año actual' }}: {{ matriculaActual ? 'Sí' : 'No' }}</span>
        </div>
      </section>

      <section class="sec-panel">
        <h3>2. Nueva matrícula</h3>
        <div v-if="yaMatriculado" class="sec-msg sec-msg--info" style="margin-top:8px">Ya está matriculado en el año elegido: no se puede duplicar.</div>
        <div class="sec-grid" style="margin-top:10px">
          <label class="sec-campo">Año escolar<select v-model="form.anioAcademicoId"><option v-for="a in anios" :key="a._id" :value="a._id">{{ a.anio }}{{ a._id === anioActivo?._id ? ' (actual)' : '' }}</option></select></label>
          <label class="sec-campo">Grado<select v-model="form.gradoId" @change="form.grupoId = ''"><option value="">Selecciona…</option><option v-for="g in grados.filter((x) => x.estado !== 'inactivo')" :key="g._id" :value="g._id">{{ g.nombre }}</option></select></label>
          <label class="sec-campo">Grupo<select v-model="form.grupoId" :disabled="!form.gradoId"><option value="">Selecciona…</option><option v-for="g in gruposDelGrado" :key="g._id" :value="g._id">{{ g.nombre }}</option></select></label>
          <label class="sec-campo">Jornada<select v-model="form.jornadaId"><option value="">Selecciona…</option><option v-for="j in jornadas.filter((x) => x.estado !== 'inactivo')" :key="j._id" :value="j._id">{{ j.nombre }}</option></select></label>
          <label class="sec-campo">Acudiente<select v-model="form.acudienteId"><option value="">Sin acudiente</option><option v-for="a in acudientes" :key="a._id" :value="a._id">{{ nombrePersona(a) }}</option></select></label>
        </div>
        <button class="sec-btn" style="margin-top:14px" :disabled="guardando || yaMatriculado" @click="matricular">{{ guardando ? 'Matriculando…' : 'Matricular estudiante' }}</button>
      </section>

      <section class="sec-panel">
        <h3>Historial de matrículas</h3>
        <p v-if="!historial.length" class="sec-vacio">Sin matrículas anteriores.</p>
        <table v-else class="sec-tabla">
          <thead><tr><th>Año</th><th>Grado</th><th>Grupo</th><th>Jornada</th><th>Estado</th><th>Cambiar a</th></tr></thead>
          <tbody>
            <tr v-for="m in historial" :key="m._id">
              <td>{{ nombreDe(anios, m.anioAcademicoId, 'anio') }}</td><td>{{ nombreDe(grados, m.gradoId) }}</td>
              <td>{{ nombreDe(grupos, m.grupoId) }}</td><td>{{ nombreDe(jornadas, m.jornadaId) }}</td>
              <td><EstadoBadge :estado="m.estado" /></td>
              <td><select :value="m.estado" @change="cambiarEstado(m, $event.target.value)">
                <option value="matriculado">Matriculado</option><option value="retirado">Retirado</option><option value="cancelada">Cancelada</option></select></td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>
  </AppLayout>
</template>
