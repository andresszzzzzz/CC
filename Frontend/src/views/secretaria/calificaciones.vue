<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import api from '@/services/api'
import { gruposApi } from '@/services/secretariaApi'
import { gradosApi, matriculasApi, asignacionesApi, asignaturasApi, periodosApi } from '@/services/secretariaApiExt'
import { useAuthStore } from '@/stores/auth'
import { useCatalogos } from '@/composables/useCatalogos'
import { useContextoInstitucional } from '@/composables/useContextoInstitucional'
import { useConfigInstitucional } from '@/composables/useConfigInstitucional'
import { aplicarRecuperacion, notaFinalAnio, desempeno, formatear } from '@/utils/calificacion'
import '@/styles/secretaria-ui.css'

const auth = useAuthStore()
const { institucionId, estudiantes, cargar: cargarCatalogo, nombrePersona } = useCatalogos()
const { anios, anioActivo, cargarAnios } = useContextoInstitucional()
const { calificacion: cfg, cargar: cargarCfg } = useConfigInstitucional()

const lista = (d) => (Array.isArray(d) ? d : d?.items || [])
const idDe = (v) => (v && typeof v === 'object' ? v._id : v) || ''

// Roles que el backend deja escribir notas (ver routes/permisos.js)
const puedeEditar = computed(() => ['admin', 'rector', 'coordinador', 'secretaria', 'docente'].includes(auth.rol))

// ---------- Filtros y datos base ----------
const anioSel = ref('')
const anioId = computed(() => anioSel.value || anioActivo.value?._id || '')
const grados = ref([]), grupos = ref([]), periodos = ref([]), asignaciones = ref([]), asignaturas = ref([]), matriculas = ref([])
const cargando = ref(false), error = ref('')

const vista = ref('grados') // 'grados' | 'tabla'
const gradoSel = ref(null)
const grupoSel = ref('')
const asignaturaSel = ref('')
const periodoOrden = ref(1)

async function cargarAnio() {
  cargando.value = true; error.value = ''; vista.value = 'grados'; gradoSel.value = null
  const inst = institucionId.value, anio = anioId.value
  try {
    const [g, gr, p, a, s, m] = await Promise.all([
      gradosApi.listar({ institucionId: inst }),
      gruposApi.listar({ institucionId: inst, anioAcademicoId: anio }),
      periodosApi.listar({ institucionId: inst, anioAcademicoId: anio }),
      asignacionesApi.listar({ anioAcademicoId: anio }),
      asignaturasApi.listar({ institucionId: inst }),
      matriculasApi.listar({ anioAcademicoId: anio })
    ])
    grados.value = lista(g.data)
    grupos.value = lista(gr.data).filter((x) => idDe(x.anioAcademicoId) === anio && x.estado !== 'inactivo')
    periodos.value = lista(p.data).filter((x) => x.anioAcademicoId === anio).sort((x, y) => x.orden - y.orden)
    asignaciones.value = lista(a.data).filter((x) => x.anioAcademicoId === anio)
    asignaturas.value = lista(s.data)
    matriculas.value = lista(m.data)
    periodoOrden.value = (periodos.value.find((x) => x.estado === 'abierto') || periodos.value[0])?.orden || 1
  } catch (e) {
    error.value = e.response?.data?.mensaje || 'No se pudo cargar la información del año escolar.'
  } finally { cargando.value = false }
}

onMounted(async () => {
  await Promise.all([cargarAnios(), cargarCfg(), cargarCatalogo('estudiantes')])
})
watch(anioId, (v) => { if (v && institucionId.value) cargarAnio() }, { immediate: true })

// ---------- Paso 1: grados que existen en el año (salen de grupos reales) ----------
const matriculadas = computed(() => matriculas.value.filter((m) => m.estado === 'matriculado'))
const gradosDelAnio = computed(() =>
  grados.value
    .filter((g) => g.estado !== 'inactivo')
    .map((g) => {
      const gs = grupos.value.filter((x) => Number(x.grado) === Number(g.numero))
      const ids = new Set(gs.map((x) => x._id))
      return { ...g, nGrupos: gs.length, nEst: new Set(matriculadas.value.filter((m) => ids.has(m.grupoId)).map((m) => m.estudianteId)).size }
    })
    .filter((g) => g.nGrupos > 0)
    .sort((a, b) => a.numero - b.numero)
)

// ---------- Paso 2: filtros dentro del grado ----------
const gruposGrado = computed(() =>
  grupos.value.filter((g) => gradoSel.value && Number(g.grado) === Number(gradoSel.value.numero)).sort((a, b) => String(a.nombre).localeCompare(String(b.nombre))))
const asignacionesGrado = computed(() =>
  asignaciones.value.filter((a) => a.estado !== 'inactivo' && gruposGrado.value.some((g) => g._id === a.grupoId) && (!grupoSel.value || a.grupoId === grupoSel.value)))
const asignaturasGrado = computed(() => {
  const vistos = new Map()
  asignacionesGrado.value.forEach((a) => {
    if (vistos.has(a.asignaturaId)) return
    const cat = asignaturas.value.find((x) => x._id === a.asignaturaId)
    vistos.set(a.asignaturaId, { _id: a.asignaturaId, nombre: a.asignaturaNombre || cat?.nombre || 'Asignatura', area: cat?.areaNombre || '—' })
  })
  return [...vistos.values()].sort((x, y) => x.area.localeCompare(y.area) || x.nombre.localeCompare(y.nombre))
})
const asignaturaActual = computed(() => asignaturasGrado.value.find((a) => a._id === asignaturaSel.value) || null)
const periodoActual = computed(() => periodos.value.find((p) => p.orden === periodoOrden.value) || null)
const periodoCerrado = computed(() => periodoActual.value?.estado === 'cerrado')
// Solo los grupos del grado que realmente tienen asignada la asignatura elegida
const gruposDeAsignatura = computed(() =>
  gruposGrado.value.filter((g) => (!grupoSel.value || g._id === grupoSel.value) &&
    asignacionesGrado.value.some((a) => a.grupoId === g._id && a.asignaturaId === asignaturaSel.value)))

function abrirGrado(g) {
  gradoSel.value = g
  grupoSel.value = ''
  asignaturaSel.value = asignaturasGrado.value[0]?._id || ''
  vista.value = 'tabla'
}
function volver() { vista.value = 'grados'; gradoSel.value = null; calMap.value = {} }
watch(grupoSel, () => {
  if (!asignaturasGrado.value.some((a) => a._id === asignaturaSel.value)) asignaturaSel.value = asignaturasGrado.value[0]?._id || ''
})

// ---------- Estudiantes matriculados (una fila por estudiante, sin duplicar) ----------
const mapaEst = computed(() => new Map(estudiantes.value.map((e) => [e._id, e])))
const duplicadas = ref(0)
const alumnos = computed(() => {
  const ids = new Map(gruposDeAsignatura.value.map((g) => [g._id, g]))
  const vistos = new Map()
  let dup = 0
  matriculadas.value.forEach((m) => {
    if (!ids.has(m.grupoId)) return
    if (vistos.has(m.estudianteId)) { dup++; return }
    const e = mapaEst.value.get(m.estudianteId) || {}
    vistos.set(m.estudianteId, {
      id: m.estudianteId, grupoId: m.grupoId, grupo: ids.get(m.grupoId).nombre,
      codigo: e.codigo || e.documento || m.numeroMatricula || '—', nombre: nombrePersona(e) || 'Estudiante sin nombre'
    })
  })
  duplicadas.value = dup
  return [...vistos.values()].sort((a, b) => a.grupo.localeCompare(b.grupo) || a.nombre.localeCompare(b.nombre))
})

// ---------- Calificaciones: { estudianteId: { periodo: {_id, nota, recuperacion, estado} } } ----------
const calMap = ref({})
const cargandoNotas = ref(false), errorNotas = ref('')
async function cargarNotas() {
  calMap.value = {}; errorNotas.value = ''
  if (vista.value !== 'tabla' || !asignaturaSel.value || !gruposDeAsignatura.value.length) return
  cargandoNotas.value = true
  try {
    const resp = await Promise.all(gruposDeAsignatura.value.map((g) =>
      api.get('/calificaciones', { params: { anioAcademicoId: anioId.value, grupoId: g._id, asignaturaId: asignaturaSel.value } })))
    const mapa = {}
    resp.forEach((r) => lista(r.data).forEach((c) => {
      const eid = idDe(c.estudianteId)
      if (!mapa[eid]) mapa[eid] = {}
      mapa[eid][c.periodo] = { _id: c._id, periodo: c.periodo, nota: c.nota ?? null, recuperacion: c.recuperacion ?? null, estado: c.estado }
    }))
    calMap.value = mapa
  } catch (e) {
    errorNotas.value = e.response?.data?.mensaje || 'No se pudieron cargar las calificaciones.'
  } finally { cargandoNotas.value = false }
}
watch([gradoSel, grupoSel, asignaturaSel, vista], cargarNotas)

const filas = computed(() => alumnos.value.map((a) => {
  const porPeriodo = calMap.value[a.id] || {}
  const cal = porPeriodo[periodoOrden.value] || null
  const efectiva = cal && cal.nota != null ? aplicarRecuperacion(cal.nota, cal.recuperacion, cfg.value) : null
  const def = notaFinalAnio(Object.values(porPeriodo).map((c) => ({ orden: c.periodo, nota: c.nota, recuperacion: c.recuperacion })), cfg.value)
  return { ...a, cal, efectiva, def }
}))
const sinNotas = computed(() => filas.value.filter((f) => !f.cal || f.cal.nota == null).length)
const fmt = (n) => formatear(n, cfg.value)
const paso = computed(() => 1 / 10 ** cfg.value.escala.decimales)
const necesitaRecup = (f) => cfg.value.recuperacion.habilitada && f.cal && f.cal.nota != null && f.cal.nota < cfg.value.escala.notaAprobatoria
const ETQ_ESTADO = { activo: 'Registrada', cerrado: 'Cerrada', recuperado: 'Recuperada', habilitado: 'Habilitada' }

// ---------- Guardar (crear o editar, nunca duplicar) ----------
const guardando = ref({}), errorFila = ref({}), okFila = ref({})
const marcar = (mapa, id, v) => { mapa.value = { ...mapa.value, [id]: v } }
const colocar = (eid, periodo, cal) => {
  calMap.value = { ...calMap.value, [eid]: { ...(calMap.value[eid] || {}), [periodo]: cal } }
}
function leerNota(texto) {
  const t = String(texto ?? '').trim().replace(',', '.')
  if (t === '') return { vacio: true }
  const n = Number(t)
  const { min, max } = cfg.value.escala
  if (isNaN(n) || n < min || n > max) return { error: `La nota debe estar entre ${min} y ${max}.` }
  return { n }
}
async function guardar(f, texto, campo) {
  const r = leerNota(texto)
  if (r.vacio) return
  if (r.error) return marcar(errorFila, f.id, r.error)
  if (f.cal && Number(f.cal[campo]) === r.n) return
  if (campo === 'recuperacion' && !f.cal) return
  marcar(errorFila, f.id, ''); marcar(okFila, f.id, false); marcar(guardando, f.id, true)
  try {
    if (campo === 'recuperacion') {
      await api.put(`/calificaciones/${f.cal._id}/recuperacion`, { recuperacion: r.n })
      colocar(f.id, periodoOrden.value, { ...f.cal, recuperacion: r.n })
    } else if (f.cal) {
      await api.put(`/calificaciones/${f.cal._id}`, { nota: r.n })
      colocar(f.id, periodoOrden.value, { ...f.cal, nota: r.n })
    } else {
      const cuerpo = {
        institucionId: institucionId.value, anioAcademicoId: anioId.value, estudianteId: f.id,
        asignaturaId: asignaturaSel.value, grupoId: f.grupoId, periodo: periodoOrden.value, nota: r.n
      }
      if (auth.rol === 'docente') cuerpo.docenteId = auth.usuario?._id || auth.usuario?.id
      const { data } = await api.post('/calificaciones', cuerpo)
      colocar(f.id, periodoOrden.value, { _id: data._id, periodo: periodoOrden.value, nota: r.n, recuperacion: null, estado: data.estado || 'activo' })
    }
    marcar(okFila, f.id, true)
  } catch (e) {
    const msg = e.response?.data?.mensaje || 'No se pudo guardar la nota.'
    if (/duplicate|E11000/i.test(msg)) { marcar(errorFila, f.id, 'Esta nota ya existía; se recargó la lista.'); await cargarNotas() }
    else marcar(errorFila, f.id, msg)
  } finally { marcar(guardando, f.id, false) }
}
</script>

<template>
  <AppLayout>
    <template #header-title>
      <h2>Calificaciones por grado</h2>
      <p>Elige un grado del año escolar para ver y registrar las notas de sus estudiantes.</p>
    </template>

    <section class="sec-panel">
      <div class="sec-fila">
        <label class="sec-campo" style="max-width:220px">Año escolar
          <select v-model="anioSel">
            <option value="">Año actual{{ anioActivo ? ` (${anioActivo.anio})` : '' }}</option>
            <option v-for="a in anios" :key="a._id" :value="a._id">{{ a.anio }}</option>
          </select>
        </label>
        <button v-if="vista === 'tabla'" class="sec-btn sec-btn--sec" @click="volver">← Volver a los grados</button>
      </div>
    </section>

    <div v-if="error" class="sec-msg sec-msg--err">{{ error }}</div>
    <p v-if="cargando" class="sec-vacio">Cargando información del año escolar…</p>

    <!-- PASO 1: grados -->
    <section v-else-if="vista === 'grados'" class="sec-panel">
      <h3>Grados configurados en {{ (anios.find((a) => a._id === anioId) || {}).anio || 'el año' }}</h3>
      <p v-if="!gradosDelAnio.length" class="sec-vacio">No hay grados con grupos creados para este año escolar. Crea los grupos en «Grupos / cursos».</p>
      <div v-else class="cg-grid">
        <button v-for="g in gradosDelAnio" :key="g._id" class="cg-card" @click="abrirGrado(g)">
          <b>{{ g.nombre || `Grado ${g.numero}` }}</b>
          <span>{{ g.nGrupos }} {{ g.nGrupos === 1 ? 'grupo' : 'grupos' }} · {{ g.nEst }} {{ g.nEst === 1 ? 'estudiante' : 'estudiantes' }}</span>
        </button>
      </div>
    </section>

    <!-- PASO 2: tabla del grado -->
    <template v-else>
      <section class="sec-panel">
        <h3>{{ gradoSel?.nombre || `Grado ${gradoSel?.numero}` }}</h3>
        <div class="sec-fila">
          <label class="sec-campo">Grupo
            <select v-model="grupoSel">
              <option value="">Todos los grupos</option>
              <option v-for="g in gruposGrado" :key="g._id" :value="g._id">{{ g.nombre }}</option>
            </select>
          </label>
          <label class="sec-campo" style="min-width:260px">Asignatura
            <select v-model="asignaturaSel">
              <option v-if="!asignaturasGrado.length" value="">Sin asignaturas asignadas</option>
              <option v-for="a in asignaturasGrado" :key="a._id" :value="a._id">{{ a.area }} · {{ a.nombre }}</option>
            </select>
          </label>
          <label class="sec-campo">Periodo
            <select v-model.number="periodoOrden">
              <option v-for="p in periodos" :key="p._id" :value="p.orden">{{ p.nombre || `Periodo ${p.orden}` }}{{ p.estado === 'cerrado' ? ' (cerrado)' : '' }}</option>
            </select>
          </label>
        </div>
        <p v-if="!puedeEditar" class="sec-ayuda">Tu rol puede consultar las notas pero no modificarlas.</p>
        <p v-else-if="periodoCerrado" class="sec-ayuda">Este periodo está cerrado: las notas solo se pueden consultar.</p>
        <p class="sec-ayuda">Escala {{ cfg.escala.min }} a {{ cfg.escala.max }} · aprueba desde {{ cfg.escala.notaAprobatoria }}. Los cálculos usan la configuración de «Sistema de calificación».</p>
      </section>

      <div v-if="errorNotas" class="sec-msg sec-msg--err">{{ errorNotas }}</div>
      <div v-if="duplicadas" class="sec-msg sec-msg--err">Hay {{ duplicadas }} matrícula(s) repetida(s) de un mismo estudiante en este grado; se muestra una sola fila. Revísalo en Matrículas.</div>

      <section class="sec-panel">
        <p v-if="!asignaturasGrado.length" class="sec-vacio">Este grado no tiene asignaturas asignadas en «Asignación académica».</p>
        <p v-else-if="cargandoNotas" class="sec-vacio">Cargando calificaciones…</p>
        <p v-else-if="!filas.length" class="sec-vacio">No hay estudiantes matriculados en este grado y grupo para la asignatura elegida.</p>
        <template v-else>
          <p class="sec-ayuda">{{ filas.length }} estudiantes · {{ sinNotas }} sin calificación en este periodo.</p>
          <div style="overflow-x:auto">
            <table class="sec-tabla">
              <thead>
                <tr>
                  <th>Código</th><th>Estudiante</th><th>Grupo</th><th>Área</th><th>Asignatura</th><th>Periodo</th>
                  <th>Nota</th><th>Recuperación</th><th>Nota del periodo</th><th>Desempeño</th><th>Definitiva del año</th><th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="f in filas" :key="f.id">
                  <td>{{ f.codigo }}</td>
                  <td><b>{{ f.nombre }}</b></td>
                  <td>{{ f.grupo }}</td>
                  <td>{{ asignaturaActual?.area }}</td>
                  <td>{{ asignaturaActual?.nombre }}</td>
                  <td>{{ periodoActual?.nombre || `Periodo ${periodoOrden}` }}</td>
                  <td style="min-width:90px">
                    <input v-if="puedeEditar && !periodoCerrado" type="number" :step="paso" :min="cfg.escala.min" :max="cfg.escala.max"
                      :value="f.cal?.nota ?? ''" :disabled="guardando[f.id]" @change="guardar(f, $event.target.value, 'nota')" />
                    <span v-else>{{ f.cal?.nota != null ? fmt(f.cal.nota) : '—' }}</span>
                  </td>
                  <td style="min-width:90px">
                    <template v-if="necesitaRecup(f)">
                      <input v-if="puedeEditar && !periodoCerrado" type="number" :step="paso" :min="cfg.escala.min" :max="cfg.escala.max"
                        :value="f.cal?.recuperacion ?? ''" :disabled="guardando[f.id]" @change="guardar(f, $event.target.value, 'recuperacion')" />
                      <span v-else>{{ f.cal?.recuperacion != null ? fmt(f.cal.recuperacion) : '—' }}</span>
                    </template>
                    <span v-else class="cg-nd">—</span>
                  </td>
                  <td>{{ f.efectiva != null ? fmt(f.efectiva) : '—' }}</td>
                  <td><span v-if="f.efectiva != null" class="cg-des" :class="'cg-' + desempeno(f.efectiva, cfg).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')">{{ desempeno(f.efectiva, cfg) }}</span><span v-else class="cg-nd">—</span></td>
                  <td>{{ f.def != null ? `${fmt(f.def)} · ${desempeno(f.def, cfg)}` : '—' }}</td>
                  <td>
                    <span v-if="guardando[f.id]">Guardando…</span>
                    <span v-else-if="errorFila[f.id]" style="color:#b91c1c;font-size:12px">{{ errorFila[f.id] }}</span>
                    <span v-else-if="okFila[f.id]" style="color:#166534;font-size:12px">Guardada</span>
                    <span v-else-if="!f.cal || f.cal.nota == null" class="cg-sin">Sin calificar</span>
                    <span v-else>{{ ETQ_ESTADO[f.cal.estado] || f.cal.estado }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </section>
    </template>
  </AppLayout>
</template>

<style scoped>
.cg-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(190px,1fr)); gap:14px; margin-top:12px; }
.cg-card { display:flex; flex-direction:column; gap:6px; text-align:left; padding:18px; border:1px solid #cbd5e1; border-radius:14px; background:#fff; cursor:pointer; font:inherit; }
.cg-card:hover { border-color:#3b82f6; box-shadow:0 2px 10px rgba(59,130,246,.15); }
.cg-card b { font-size:17px; color:#0f172a; } .cg-card span { font-size:12.5px; color:#64748b; }
.cg-des { display:inline-block; padding:2px 10px; border-radius:999px; font-size:12px; font-weight:700; background:#e2e8f0; color:#334155; }
.cg-bajo { background:#fee2e2; color:#b91c1c; } .cg-basico { background:#fef3c7; color:#b45309; }
.cg-alto { background:#dbeafe; color:#1d4ed8; } .cg-superior { background:#dcfce7; color:#166534; }
.cg-sin { color:#b45309; font-size:12px; font-weight:600; } .cg-nd { color:#94a3b8; }
</style>