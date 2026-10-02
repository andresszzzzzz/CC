<script setup>
import { ref, computed } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { personasApi } from '@/services/secretariaApiExt'
import { useCatalogos } from '@/composables/useCatalogos'
import '@/styles/secretaria-ui.css'

const { nombrePersona, institucionId } = useCatalogos()
const ROLES = [['estudiante', 'Estudiante'], ['docente', 'Docente'], ['acudiente', 'Acudiente'], ['directivo', 'Directivo'], ['administrativo', 'Administrativo']]
const q = ref(''), resultados = ref([]), persona = ref(null), roles = ref([]), relaciones = ref([])
const qEst = ref(''), resEst = ref([]), parentesco = ref('Madre/Padre')
const msg = ref(''), error = ref('')
const rolesFaltan = computed(() => ROLES.filter((r) => !roles.value.includes(r[0])))

const listar = (d) => (Array.isArray(d) ? d : d?.items || [])
async function buscar() { if (q.value.trim().length >= 2) resultados.value = listar((await personasApi.buscar(q.value.trim(), institucionId.value).catch(() => ({ data: [] }))).data) }
async function recargar(id) { const { data } = await personasApi.obtener(id); persona.value = data.persona; roles.value = data.roles || []; relaciones.value = data.relaciones || [] }
async function elegir(p) { resultados.value = []; msg.value = ''; error.value = ''; await recargar(p._id) }
async function accion(fn, ok) { error.value = ''; try { await fn(); await recargar(persona.value._id); msg.value = ok } catch (e) { error.value = e.response?.data?.mensaje || 'No se pudo completar la acción.' } }
const agregarRol = (r) => accion(() => personasApi.agregarRol(persona.value._id, r), 'Rol agregado. La persona sigue siendo un único registro.')
const quitarRol = (r) => accion(() => personasApi.quitarRol(persona.value._id, r), 'Rol retirado. Su historial se conserva.')
async function buscarEst() { if (qEst.value.trim().length >= 2) resEst.value = listar((await personasApi.buscar(qEst.value.trim(), institucionId.value).catch(() => ({ data: [] }))).data).filter((x) => x._id !== persona.value._id) }
const vincular = (e) => accion(async () => { await personasApi.vincular(persona.value._id, e._id, parentesco.value); resEst.value = []; qEst.value = '' }, 'Estudiante vinculado.')
const desvincular = (e) => accion(() => personasApi.desvincular(persona.value._id, e._id), 'Vínculo retirado.')
</script>

<template>
  <AppLayout>
    <template #header-title><h2>Personas y roles</h2><p>Una persona, varios roles: un acudiente también puede ser docente o estudiante, sin duplicar registros.</p></template>
    <div v-if="msg" class="sec-msg sec-msg--ok">{{ msg }}</div>
    <div v-if="error" class="sec-msg sec-msg--err">{{ error }}</div>
    <section class="sec-panel">
      <h3>Buscar persona</h3>
      <div class="sec-fila" style="margin-top:10px">
        <input v-model="q" placeholder="Nombre o documento" style="flex:1;min-width:220px;border:1px solid #cbd5e1;border-radius:10px;padding:9px 12px" @keyup.enter="buscar" />
        <button class="sec-btn" @click="buscar">Buscar</button>
      </div>
      <div v-for="r in resultados" :key="r._id" class="sec-resultado" @click="elegir(r)"><span><b>{{ nombrePersona(r) }}</b> · {{ r.documento }}</span><span class="sec-fila"><span v-for="x in r.roles || []" :key="x" class="sec-chip">{{ x }}</span></span></div>
    </section>
    <template v-if="persona">
      <section class="sec-panel">
        <h3>{{ nombrePersona(persona) }} <small style="font-weight:400;color:#64748b">· {{ persona.documento }}</small></h3>
        <p class="sec-ayuda">Roles de esta persona en la institución</p>
        <div class="sec-fila">
          <span v-for="r in roles" :key="r" class="sec-chip">{{ ROLES.find((x) => x[0] === r)?.[1] || r }}<button title="Quitar rol" @click="quitarRol(r)">×</button></span>
          <span v-if="!roles.length" class="sec-ayuda">Sin roles asignados.</span>
        </div>
        <div v-if="rolesFaltan.length" class="sec-fila" style="margin-top:12px">
          <span class="sec-ayuda" style="margin:0">Agregar rol:</span>
          <button v-for="r in rolesFaltan" :key="r[0]" class="sec-btn sec-btn--sec" @click="agregarRol(r[0])">+ {{ r[1] }}</button>
        </div>
      </section>
      <section v-if="roles.includes('acudiente')" class="sec-panel">
        <h3>Estudiantes a cargo</h3>
        <p v-if="!relaciones.length" class="sec-ayuda">Aún no tiene estudiantes vinculados.</p>
        <table v-else class="sec-tabla"><thead><tr><th>Estudiante</th><th>Parentesco</th><th></th></tr></thead>
          <tbody><tr v-for="r in relaciones" :key="r.estudiante._id"><td>{{ nombrePersona(r.estudiante) }}</td><td>{{ r.parentesco }}</td><td><button class="sec-btn sec-btn--peligro" @click="desvincular(r.estudiante)">Quitar</button></td></tr></tbody></table>
        <div class="sec-fila" style="margin-top:12px">
          <input v-model="qEst" placeholder="Buscar estudiante para vincular" style="flex:1;min-width:200px;border:1px solid #cbd5e1;border-radius:10px;padding:8px 10px" @keyup.enter="buscarEst" />
          <select v-model="parentesco" style="border:1px solid #cbd5e1;border-radius:10px;padding:8px"><option>Madre/Padre</option><option>Abuelo(a)</option><option>Tío(a)</option><option>Hermano(a)</option><option>Otro</option></select>
          <button class="sec-btn sec-btn--sec" @click="buscarEst">Buscar</button>
        </div>
        <div v-for="e in resEst" :key="e._id" class="sec-resultado" @click="vincular(e)"><span>{{ nombrePersona(e) }} · {{ e.documento }}</span><span class="sec-chip">Vincular</span></div>
      </section>
    </template>
  </AppLayout>
</template>
