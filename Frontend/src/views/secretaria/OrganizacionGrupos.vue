<script setup>
// Organización de grupos: desde UNA sola pantalla Secretaría deja cuadrado un grupo completo:
//   · director de grupo
//   · qué docente dicta cada asignatura (asignación académica)
//   · qué estudiantes están en el grupo (matrícula): agregar, mover de grupo o quitar
// Un estudiante «tiene» a los docentes de su grupo: por eso asignar docentes al grupo es asignarlos a sus estudiantes.
import { ref, computed, onMounted, watch } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { asignacionesApi, matriculasApi } from '@/services/secretariaApiExt'
import { gruposApi } from '@/services/secretariaApi'
import { useCatalogos } from '@/composables/useCatalogos'
import { useNotificacionesStore } from '@/stores/notificaciones'
import '@/styles/secretaria-ui.css'

const notif = useNotificacionesStore()
const { anios, grupos, asignaturas, docentes, estudiantes, grados, jornadas, cargar, nombrePersona, institucionId } = useCatalogos()

const lista = (d) => (Array.isArray(d) ? d : d?.items || d?.usuarios || [])
const idDe = (v) => (v && typeof v === 'object' ? v._id : v)
const textoError = (e, porDefecto) => {
  const d = e?.response?.data
  return d?.mensaje || d?.error || (!e?.response && e?.message) || porDefecto
}
// Jornada del grupo (texto) -> tipo de Jornada del catálogo
const TIPO_JORNADA = { manana: 'manana', tarde: 'tarde', noche: 'noche', continua: 'unica', unica: 'unica' }

const anioId = ref('')
const grupoId = ref('')
const cargas = ref([])           // asignaciones del grupo elegido
const matriculas = ref([])       // matrículas vigentes del grupo elegido
const matriculasAnio = ref([])   // matrículas vigentes de TODO el año (para saber quién ya tiene grupo)
const borradores = ref({})       // asignaturaId -> { docenteId, horas }
const cargando = ref(false)
const docenteTodas = ref('')
const estSel = ref('')
const jornadaNueva = ref('')

// ---------- Carga de datos ----------
async function load() {
  await cargar('anios', 'grupos', 'asignaturas', 'docentes', 'estudiantes', 'grados', 'jornadas')
  if (!anioId.value) {
    anioId.value = (anios.value.find((a) => a.esActual) || anios.value.find((a) => a.estado === 'activo') || anios.value[0])?._id || ''
  }
}
onMounted(load)
watch(institucionId, load)

const gruposDelAnio = computed(() =>
  grupos.value
    .filter((g) => idDe(g.anioAcademicoId) === anioId.value && g.estado !== 'inactivo')
    .sort((a, b) => Number(a.grado) - Number(b.grado) || String(a.nombre).localeCompare(String(b.nombre)))
)
const grupo = computed(() => grupos.value.find((g) => g._id === grupoId.value) || null)

watch(anioId, async () => {
  grupoId.value = gruposDelAnio.value[0]?._id || ''
  await recargarMatriculasAnio()
})
watch(gruposDelAnio, (lst) => { if (grupoId.value && !lst.some((g) => g._id === grupoId.value)) grupoId.value = lst[0]?._id || '' })
watch(grupoId, () => recargarGrupo())
watch(grupo, (g) => {
  if (!g) { jornadaNueva.value = ''; return }
  const tipo = TIPO_JORNADA[g.jornada]
  const activas = jornadas.value.filter((j) => j.estado !== 'inactivo')
  jornadaNueva.value = (activas.find((j) => j.tipo === tipo) || activas[0])?._id || ''
})

async function recargarMatriculasAnio() {
  if (!anioId.value) { matriculasAnio.value = []; return }
  try {
    const { data } = await matriculasApi.listar({ anioAcademicoId: anioId.value })
    matriculasAnio.value = lista(data).filter((m) => m.estado !== 'cancelada')
  } catch { matriculasAnio.value = [] }
}

async function recargarGrupo() {
  if (!grupoId.value) { cargas.value = []; matriculas.value = []; borradores.value = {}; return }
  cargando.value = true
  try {
    const [c, m] = await Promise.all([
      asignacionesApi.listar({ grupoId: grupoId.value }),
      matriculasApi.listar({ grupoId: grupoId.value })
    ])
    cargas.value = lista(c.data)
    matriculas.value = lista(m.data).filter((x) => x.estado !== 'cancelada')
    const b = {}
    asignaturas.value.forEach((a) => {
      const carga = cargas.value.find((x) => x.asignaturaId === a._id)
      b[a._id] = { docenteId: carga?.docenteId || '', horas: carga?.intensidadHoraria ?? a.intensidadHoraria ?? '' }
    })
    borradores.value = b
  } catch (e) {
    notif.error(textoError(e, 'No se pudo cargar el grupo.'))
  } finally {
    cargando.value = false
  }
  await recargarMatriculasAnio()
}

// ---------- Director de grupo ----------
const directorId = computed(() => idDe(grupo.value?.docenteDirectorId) || '')
async function cambiarDirector(valor) {
  try {
    await gruposApi.actualizar(grupoId.value, { docenteDirectorId: valor || null })
    await cargar('grupos')
    notif.exito(valor ? 'Director de grupo asignado.' : 'Se quitó el director de grupo.')
  } catch (e) {
    notif.error(textoError(e, 'No se pudo cambiar el director de grupo.'))
  }
}

// ---------- Asignaturas y docentes ----------
const filasAsig = computed(() =>
  asignaturas.value
    .map((a) => ({ a, carga: cargas.value.find((c) => c.asignaturaId === a._id) || null }))
    .filter((f) => f.a.estado !== 'inactivo' || f.carga)
)
const docentesActivos = computed(() => docentes.value.filter((d) => d.estado !== 'inactivo'))
const sinDocente = computed(() => filasAsig.value.filter((f) => !f.carga && f.a.estado !== 'inactivo'))

const payloadCarga = (a, b) => {
  const p = { anioAcademicoId: anioId.value, grupoId: grupoId.value, asignaturaId: a._id, docenteId: b.docenteId, estado: 'activo' }
  if (b.horas !== '' && b.horas != null) p.intensidadHoraria = Number(b.horas)
  return p
}

async function guardarAsignacion(f) {
  const b = borradores.value[f.a._id]
  if (!b?.docenteId) return notif.advertencia('Elige primero el docente de esta asignatura.')
  try {
    if (f.carga) await asignacionesApi.actualizar(f.carga._id, payloadCarga(f.a, b))
    else await asignacionesApi.crear(payloadCarga(f.a, b))
    notif.exito(`«${f.a.nombre}» quedó asignada.`)
    await recargarGrupo()
  } catch (e) {
    notif.error(textoError(e, 'No se pudo guardar la asignación.'))
  }
}

async function quitarAsignacion(f) {
  const acepta = await notif.confirmar(`Se quitará el docente de «${f.a.nombre}» en este grupo.`, { titulo: '¿Quitar la asignación?', textoSi: 'Sí, quitar' })
  if (!acepta) return
  try {
    await asignacionesApi.eliminar(f.carga._id)
    notif.exito('Asignación eliminada.')
  } catch (e) {
    if (e?.response?.status === 409) {
      // Ya tiene notas: no se borra, se inactiva para conservar el historial
      const inactivar = await notif.confirmar(textoError(e, 'La asignación ya tiene notas.') + ' ¿Quieres marcarla como inactiva?', { titulo: 'No se puede eliminar:', textoSi: 'Sí, inactivar', peligro: false })
      if (!inactivar) return
      try { await asignacionesApi.actualizar(f.carga._id, { estado: 'inactivo' }); notif.exito('La asignación quedó inactiva.') }
      catch (e2) { return notif.error(textoError(e2, 'No se pudo inactivar la asignación.')) }
    } else {
      return notif.error(textoError(e, 'No se pudo eliminar la asignación.'))
    }
  }
  await recargarGrupo()
}

async function asignarTodas() {
  if (!docenteTodas.value) return notif.advertencia('Elige el docente que se asignará a las asignaturas sin docente.')
  if (!sinDocente.value.length) return notif.info('Todas las asignaturas ya tienen docente en este grupo.')
  let ok = 0
  const fallos = []
  for (const f of sinDocente.value) {
    try {
      await asignacionesApi.crear(payloadCarga(f.a, { docenteId: docenteTodas.value, horas: borradores.value[f.a._id]?.horas }))
      ok++
    } catch (e) { fallos.push(`${f.a.nombre}: ${textoError(e, 'error')}`) }
  }
  if (ok) notif.exito(`${ok} asignatura(s) asignadas.`)
  if (fallos.length) notif.error(fallos.join(' · '))
  docenteTodas.value = ''
  await recargarGrupo()
}

// ---------- Estudiantes del grupo ----------
const estPorId = computed(() => new Map(estudiantes.value.map((e) => [e._id, e])))
const filasEst = computed(() =>
  matriculas.value
    .map((m) => ({ m, e: estPorId.value.get(m.estudianteId) }))
    .sort((x, y) => (nombrePersona(x.e || {}) || '').localeCompare(nombrePersona(y.e || {}) || ''))
)
const yaMatriculados = computed(() => new Set(matriculasAnio.value.map((m) => m.estudianteId)))
const disponibles = computed(() =>
  estudiantes.value
    .filter((e) => e.estado !== 'inactivo' && !yaMatriculados.value.has(e._id))
    .sort((a, b) => nombrePersona(a).localeCompare(nombrePersona(b)))
)
const otrosGrupos = computed(() => gruposDelAnio.value.filter((g) => g._id !== grupoId.value && Number(g.grado) === Number(grupo.value?.grado)))

async function agregarEstudiante() {
  const g = grupo.value
  if (!estSel.value) return notif.advertencia('Elige el estudiante que quieres agregar.')
  const grado = grados.value.find((x) => Number(x.numero) === Number(g.grado))
  if (!grado) return notif.error(`No existe el grado ${g.grado} en «Grados». Créalo primero para poder matricular.`)
  if (!jornadaNueva.value) return notif.advertencia('Elige la jornada del estudiante.')
  if (g.capacidad && matriculas.value.length >= g.capacidad) {
    const sigue = await notif.confirmar(`El grupo ya tiene ${matriculas.value.length} de ${g.capacidad} cupos.`, { titulo: 'Grupo lleno:', textoSi: 'Matricular de todos modos', peligro: false })
    if (!sigue) return
  }
  try {
    await matriculasApi.crear({
      estudianteId: estSel.value, anioAcademicoId: anioId.value, gradoId: grado._id,
      grupoId: g._id, jornadaId: jornadaNueva.value, institucionId: institucionId.value, estado: 'matriculado'
    })
    notif.exito('Estudiante agregado al grupo.')
    estSel.value = ''
    await recargarGrupo()
  } catch (e) {
    notif.error(textoError(e, 'No se pudo agregar al estudiante.'))
  }
}

async function quitarEstudiante(f) {
  const acepta = await notif.confirmar('La matrícula quedará cancelada (el historial se conserva) y el estudiante dejará de ver los docentes de este grupo.', { titulo: '¿Quitar del grupo?', textoSi: 'Sí, quitar' })
  if (!acepta) return
  try {
    await matriculasApi.eliminar(f.m._id)
    notif.exito('El estudiante salió del grupo.')
    await recargarGrupo()
  } catch (e) {
    notif.error(textoError(e, 'No se pudo quitar al estudiante.'))
  }
}

async function moverEstudiante(f, nuevoGrupoId) {
  if (!nuevoGrupoId) return
  try {
    await matriculasApi.actualizar(f.m._id, { grupoId: nuevoGrupoId })
    notif.exito('Estudiante movido de grupo.')
    await recargarGrupo()
  } catch (e) {
    notif.error(textoError(e, 'No se pudo mover al estudiante.'))
  }
}

const etiquetaGrupo = (g) => `${g.nombre} — grado ${g.grado}`
</script>

<template>
  <AppLayout>
    <template #header-title>
      <h2>Organización de grupos</h2>
      <p>Elige un grupo y deja todo en un solo lugar: director, docente de cada asignatura y estudiantes. Los estudiantes ven a los docentes de su grupo.</p>
    </template>

    <section class="sec-panel">
      <div class="sec-grid">
        <label class="sec-campo">Año escolar
          <select v-model="anioId">
            <option v-for="a in anios" :key="a._id" :value="a._id">{{ a.anio }}{{ a.esActual ? ' (actual)' : '' }}</option>
          </select>
        </label>
        <label class="sec-campo">Grupo / curso
          <select v-model="grupoId" :disabled="!gruposDelAnio.length">
            <option value="" disabled>{{ gruposDelAnio.length ? 'Selecciona…' : 'No hay grupos en este año' }}</option>
            <option v-for="g in gruposDelAnio" :key="g._id" :value="g._id">{{ etiquetaGrupo(g) }}</option>
          </select>
        </label>
      </div>
      <p v-if="!gruposDelAnio.length" class="sec-ayuda" style="margin-top:10px">Crea primero los grupos del año en «Grupos / cursos».</p>
    </section>

    <template v-if="grupo">
      <section class="sec-panel">
        <h3>Grupo {{ grupo.nombre }}</h3>
        <div class="sec-fila" style="margin:8px 0 12px">
          <span class="sec-chip">Grado {{ grupo.grado }}</span>
          <span class="sec-chip">Jornada: {{ grupo.jornada }}</span>
          <span class="sec-chip">Estudiantes: {{ matriculas.length }}{{ grupo.capacidad ? ` / ${grupo.capacidad}` : '' }}</span>
          <span class="sec-chip">Asignaturas con docente: {{ cargas.filter((c) => c.estado !== 'inactivo').length }}</span>
        </div>
        <label class="sec-campo" style="max-width:420px">Docente director de grupo
          <select :value="directorId" @change="cambiarDirector($event.target.value)">
            <option value="">Sin director</option>
            <option v-for="d in docentesActivos" :key="d._id" :value="d._id">{{ nombrePersona(d) }}</option>
          </select>
        </label>
        <p v-if="!docentesActivos.length" class="sec-ayuda" style="margin-top:8px">No hay docentes activos: regístralos en «Docentes».</p>
      </section>

      <section class="sec-panel">
        <h3>Docente de cada asignatura</h3>
        <p class="sec-ayuda">Elige el docente y pulsa «Asignar». El docente verá este grupo en su panel para calificar.</p>

        <div class="sec-fila" style="margin-bottom:12px">
          <select v-model="docenteTodas" style="border:1px solid #cbd5e1;border-radius:10px;padding:8px 10px;min-width:240px">
            <option value="">Docente para todas las asignaturas sin asignar…</option>
            <option v-for="d in docentesActivos" :key="d._id" :value="d._id">{{ nombrePersona(d) }}</option>
          </select>
          <button class="sec-btn sec-btn--sec" :disabled="!docenteTodas || !sinDocente.length" @click="asignarTodas">
            Asignar a las {{ sinDocente.length }} sin docente
          </button>
        </div>

        <p v-if="!asignaturas.length" class="sec-vacio">No hay asignaturas. Créalas en «Asignaturas».</p>
        <div v-else style="overflow-x:auto">
          <table class="sec-tabla">
            <thead><tr><th>Área</th><th>Asignatura</th><th style="min-width:220px">Docente</th><th style="width:90px">I.H.</th><th style="width:1%"></th></tr></thead>
            <tbody>
              <tr v-for="f in filasAsig" :key="f.a._id">
                <td>{{ f.a.areaNombre || '—' }}</td>
                <td>
                  <b>{{ f.a.nombre }}</b>
                  <span v-if="f.carga?.estado === 'inactivo'" class="sec-chip" style="margin-left:6px;background:#fef3c7;color:#b45309">inactiva</span>
                </td>
                <td>
                  <select v-if="borradores[f.a._id]" v-model="borradores[f.a._id].docenteId">
                    <option value="">Sin docente</option>
                    <option v-for="d in docentesActivos" :key="d._id" :value="d._id">{{ nombrePersona(d) }}</option>
                  </select>
                </td>
                <td><input v-if="borradores[f.a._id]" v-model="borradores[f.a._id].horas" type="number" min="0" /></td>
                <td style="white-space:nowrap">
                  <button class="sec-btn" @click="guardarAsignacion(f)">{{ f.carga ? 'Actualizar' : 'Asignar' }}</button>
                  <button v-if="f.carga" class="sec-btn sec-btn--peligro" style="margin-left:6px" @click="quitarAsignacion(f)">Quitar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="sec-panel">
        <h3>Estudiantes del grupo</h3>
        <p class="sec-ayuda">Agrega estudiantes que aún no tengan grupo este año, muévelos a otro grupo del mismo grado o sácalos del grupo.</p>

        <div class="sec-fila" style="margin-bottom:12px">
          <select v-model="estSel" style="border:1px solid #cbd5e1;border-radius:10px;padding:8px 10px;min-width:260px;flex:1">
            <option value="">{{ disponibles.length ? 'Estudiante sin grupo este año…' : 'No hay estudiantes sin grupo' }}</option>
            <option v-for="e in disponibles" :key="e._id" :value="e._id">{{ nombrePersona(e) }}{{ e.documento ? ' · ' + e.documento : '' }}</option>
          </select>
          <select v-model="jornadaNueva" style="border:1px solid #cbd5e1;border-radius:10px;padding:8px 10px">
            <option value="" disabled>Jornada…</option>
            <option v-for="j in jornadas.filter((x) => x.estado !== 'inactivo')" :key="j._id" :value="j._id">{{ j.nombre }}</option>
          </select>
          <button class="sec-btn" :disabled="!estSel" @click="agregarEstudiante">Agregar al grupo</button>
        </div>

        <p v-if="cargando" class="sec-vacio">Cargando…</p>
        <p v-else-if="!filasEst.length" class="sec-vacio">Este grupo aún no tiene estudiantes.</p>
        <div v-else style="overflow-x:auto">
          <table class="sec-tabla">
            <thead><tr><th>#</th><th>Documento</th><th>Estudiante</th><th>Jornada</th><th>Mover a</th><th style="width:1%"></th></tr></thead>
            <tbody>
              <tr v-for="(f, i) in filasEst" :key="f.m._id">
                <td>{{ i + 1 }}</td>
                <td>{{ f.e?.documento || '—' }}</td>
                <td><b>{{ f.e ? nombrePersona(f.e) : 'Estudiante' }}</b></td>
                <td>{{ f.m.jornadaNombre || '—' }}</td>
                <td>
                  <select :disabled="!otrosGrupos.length" @change="moverEstudiante(f, $event.target.value); $event.target.value = ''">
                    <option value="">{{ otrosGrupos.length ? 'Otro grupo del grado…' : 'No hay otro grupo' }}</option>
                    <option v-for="g in otrosGrupos" :key="g._id" :value="g._id">{{ g.nombre }}</option>
                  </select>
                </td>
                <td><button class="sec-btn sec-btn--peligro" @click="quitarEstudiante(f)">Quitar</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </AppLayout>
</template>
