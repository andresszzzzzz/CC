<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import EstadoBadge from '@/components/admin/EstadoBadge.vue'
import ImageUploader from '@/components/admin/ImageUploader.vue'
import { estudiantesApi } from '@/services/secretariaApiExt'
import { useCatalogos } from '@/composables/useCatalogos'
import { useContextoInstitucional } from '@/composables/useContextoInstitucional'
import '@/styles/secretaria-ui.css'

const { nombrePersona, institucionId } = useCatalogos()
const { anios, anioActivo, cargarAnios } = useContextoInstitucional()
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
// Año escolar que se está consultando (por defecto el activo)
const anioSel = ref('')
const anioId = computed(() => anioSel.value || anioActivo.value?._id || '')
const anioTexto = computed(() => (anios.value || []).find((a) => a._id === anioId.value)?.anio || '')
onMounted(cargarAnios)

// Matrículas del año elegido que siguen vigentes (las canceladas no cuentan)
const matriculasDelAnio = computed(() =>
  (ficha.value?.matriculas || []).filter((m) => m.anioAcademicoId === anioId.value && m.estado !== 'cancelada'))
// Si hubiera más de una, se prefiere la «matriculado»; el aviso de abajo le dice a Secretaría que hay un error de datos
const matriculaSel = computed(() => matriculasDelAnio.value.find((m) => m.estado === 'matriculado') || matriculasDelAnio.value[0] || null)
const hayDuplicadas = computed(() => matriculasDelAnio.value.filter((m) => m.estado === 'matriculado').length > 1)

const situacion = computed(() => {
  if (est.value.estado === 'inactivo') return 'inactivo'
  const m = matriculaSel.value
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
          <ImageUploader v-model="est.foto" tipo="estudiante" :extra="{ personaId: est._id }" etiqueta="Fotografía" :contener="false" :altura="220" />
          <div>
            <h3 style="font-size:18px">{{ nombrePersona(est) }}</h3>
            <p class="sec-ayuda">Documento {{ est.documento }} · {{ est.email || 'sin correo' }}</p>
            <div class="sec-fila">
              <EstadoBadge :estado="situacion" />
              <span class="sec-chip">Registrado: Sí</span>
              <span class="sec-chip">Matriculado {{ anioTexto }}: {{ matriculaSel ? 'Sí' : 'No' }}</span>
            </div>
            <div class="sec-fila" style="margin:10px 0">
              <label class="sec-campo" style="max-width:200px">Año escolar
                <select v-model="anioSel">
                  <option value="">Año actual{{ anioActivo ? ` (${anioActivo.anio})` : '' }}</option>
                  <option v-for="a in anios" :key="a._id" :value="a._id">{{ a.anio }}</option>
                </select>
              </label>
            </div>
            <div v-if="hayDuplicadas" class="sec-msg sec-msg--err">Este estudiante tiene más de una matrícula activa en {{ anioTexto }}. Revísalo en Matrículas: solo debe haber una.</div>
            <div v-if="matriculaSel" class="sec-fila">
              <span class="sec-chip">Grado: {{ matriculaSel.gradoNombre || '—' }}</span>
              <span class="sec-chip">Grupo: {{ matriculaSel.grupoNombre || '—' }}</span>
              <span class="sec-chip">Jornada: {{ matriculaSel.jornadaNombre || '—' }}</span>
              <span class="sec-chip">Matrícula N.º {{ matriculaSel.numeroMatricula }}</span>
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
        <table v-else class="sec-tabla"><thead><tr><th>Año</th><th>Grado</th><th>Grupo</th><th>Matrícula</th><th>Promedio</th></tr></thead>
          <tbody><tr v-for="h in ficha.historialAcademico" :key="h.anioAcademicoId + h.grado"><td>{{ h.anio }}</td><td>{{ h.grado }}</td><td>{{ h.grupo }}</td><td><EstadoBadge :estado="h.estadoMatricula" /></td><td>{{ h.promedio ?? 'Sin notas' }}</td></tr></tbody></table>
      </section>
    </template>
  </AppLayout>
</template>