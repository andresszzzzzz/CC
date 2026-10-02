<script setup>
import { ref, computed } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import EstadoBadge from '@/components/admin/EstadoBadge.vue'
import ImageUploader from '@/components/admin/ImageUploader.vue'
import { estudiantesApi } from '@/services/secretariaApiExt'
import { useCatalogos } from '@/composables/useCatalogos'
import { useContextoInstitucional } from '@/composables/useContextoInstitucional'
import '@/styles/secretaria-ui.css'

const { nombrePersona, institucionId } = useCatalogos()
const { anioActivo } = useContextoInstitucional()
const q = ref(''), resultados = ref([]), ficha = ref(null), error = ref(''), msg = ref('')

async function buscar() {
  if (q.value.trim().length < 2) return
  try { const { data } = await estudiantesApi.buscar(q.value.trim(), institucionId.value); resultados.value = Array.isArray(data) ? data : data.items || [] }
  catch { error.value = 'No se pudo buscar.' }
}
async function abrir(e) {
  resultados.value = []; error.value = ''
  try { ficha.value = (await estudiantesApi.ficha(e._id)).data } catch { error.value = 'No se pudo cargar la ficha.' }
}
const est = computed(() => ficha.value?.estudiante || {})
const situacion = computed(() => {
  if (est.value.estado === 'inactivo') return 'inactivo'
  const m = ficha.value?.matriculaActual
  if (m?.estado === 'matriculado') return 'matriculado'
  if (m?.estado === 'retirado') return 'retirado'
  return (ficha.value?.matriculas || []).length ? 'no matriculado' : 'registrado'
})
async function alternarEstado() {
  const nuevo = est.value.estado === 'inactivo' ? 'activo' : 'inactivo'
  try { await estudiantesApi.cambiarEstado(est.value._id, nuevo); est.value.estado = nuevo; msg.value = nuevo === 'activo' ? 'Estudiante reactivado.' : 'Estudiante desactivado. Su historial se conserva.' }
  catch { error.value = 'No se pudo cambiar el estado.' }
}
</script>

<template>
  <AppLayout>
    <template #header-title><h2>Ficha del estudiante</h2><p>Estado, foto, acudientes, matrículas e historial académico.</p></template>
    <div v-if="msg" class="sec-msg sec-msg--ok">{{ msg }}</div>
    <div v-if="error" class="sec-msg sec-msg--err">{{ error }}</div>
    <section class="sec-panel">
      <div class="sec-fila">
        <input v-model="q" placeholder="Nombre o documento" style="flex:1;min-width:220px;border:1px solid #cbd5e1;border-radius:10px;padding:9px 12px" @keyup.enter="buscar" />
        <button class="sec-btn" @click="buscar">Buscar</button>
      </div>
      <div v-for="r in resultados" :key="r._id" class="sec-resultado" @click="abrir(r)"><span><b>{{ nombrePersona(r) }}</b> · {{ r.documento }}</span></div>
    </section>

    <template v-if="ficha">
      <section class="sec-panel">
        <div class="sec-grid" style="grid-template-columns:200px 1fr">
          <ImageUploader v-model="est.fotoUrl" tipo="estudiante" :extra="{ personaId: est._id }" etiqueta="Fotografía" :contener="false" :altura="220" />
          <div>
            <h3 style="font-size:18px">{{ nombrePersona(est) }}</h3>
            <p class="sec-ayuda">Documento {{ est.documento }} · {{ est.correo || 'sin correo' }}</p>
            <div class="sec-fila">
              <EstadoBadge :estado="situacion" />
              <span class="sec-chip">Registrado: Sí</span>
              <span class="sec-chip">Matriculado {{ anioActivo?.anio || '' }}: {{ ficha.matriculaActual ? 'Sí' : 'No' }}</span>
              <span v-if="ficha.matriculaActual" class="sec-chip">{{ ficha.matriculaActual.gradoNombre }} · {{ ficha.matriculaActual.grupoNombre }} · {{ ficha.matriculaActual.jornadaNombre }}</span>
            </div>
            <button class="sec-btn sec-btn--sec" style="margin-top:14px" @click="alternarEstado">{{ est.estado === 'inactivo' ? 'Reactivar estudiante' : 'Desactivar estudiante' }}</button>
            <h3 style="margin-top:18px">Acudientes</h3>
            <p v-if="!(ficha.acudientes || []).length" class="sec-ayuda">Sin acudiente asociado. Vincúlalo en «Personas y roles».</p>
            <span v-for="a in ficha.acudientes || []" :key="a._id" class="sec-chip" style="margin-right:6px">{{ nombrePersona(a) }} · {{ a.parentesco || 'acudiente' }}</span>
          </div>
        </div>
      </section>
      <section class="sec-panel">
        <h3>Historial de matrículas</h3>
        <p v-if="!(ficha.matriculas || []).length" class="sec-vacio">Sin matrículas.</p>
        <table v-else class="sec-tabla"><thead><tr><th>Año</th><th>Grado</th><th>Grupo</th><th>Jornada</th><th>Estado</th></tr></thead>
          <tbody><tr v-for="m in ficha.matriculas" :key="m._id"><td>{{ m.anio }}</td><td>{{ m.gradoNombre }}</td><td>{{ m.grupoNombre }}</td><td>{{ m.jornadaNombre }}</td><td><EstadoBadge :estado="m.estado" /></td></tr></tbody></table>
      </section>
      <section class="sec-panel">
        <h3>Historial académico</h3>
        <p v-if="!(ficha.historialAcademico || []).length" class="sec-vacio">Aún no hay notas registradas.</p>
        <table v-else class="sec-tabla"><thead><tr><th>Año</th><th>Grado</th><th>Nota final</th><th>Desempeño</th><th>Resultado</th></tr></thead>
          <tbody><tr v-for="h in ficha.historialAcademico" :key="h.anio + h.gradoNombre"><td>{{ h.anio }}</td><td>{{ h.gradoNombre }}</td><td>{{ h.notaFinal }}</td><td>{{ h.desempeno }}</td><td>{{ h.resultado }}</td></tr></tbody></table>
      </section>
    </template>
  </AppLayout>
</template>
