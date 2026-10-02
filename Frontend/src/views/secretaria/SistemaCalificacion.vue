<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { calificacionCfgApi } from '@/services/secretariaApiExt'
import { useCatalogos } from '@/composables/useCatalogos'
import { useConfigInstitucional } from '@/composables/useConfigInstitucional'
import { useContextoInstitucional } from '@/composables/useContextoInstitucional'
import { mezclarConfig, validarConfig, desempeno } from '@/utils/calificacion'
import '@/styles/secretaria-ui.css'

const { periodos, cargar } = useCatalogos()
const { anioActivo } = useContextoInstitucional()
const { recargar } = useConfigInstitucional()

const cfg = ref(mezclarConfig())
const cargando = ref(true), guardando = ref(false)
const msg = ref(''), errores = ref([])
const prueba = ref(3.5)

async function init() {
  cargando.value = true
  try { cfg.value = mezclarConfig((await calificacionCfgApi.obtener()).data) } catch { cfg.value = mezclarConfig() }
  await cargar('periodos')
  // Un peso por cada periodo del año actual (si aún no existe)
  const delAnio = periodos.value.filter((p) => !anioActivo.value || p.anioAcademicoId === anioActivo.value._id)
  delAnio.forEach((p) => { if (!cfg.value.pesosPeriodo.find((x) => x.orden === p.orden)) cfg.value.pesosPeriodo.push({ orden: p.orden, porcentaje: 0, incluir: true }) })
  cfg.value.pesosPeriodo.sort((a, b) => a.orden - b.orden)
  cargando.value = false
}
onMounted(init)

const totalAct = computed(() => cfg.value.pesosActividad.reduce((s, x) => s + Number(x.porcentaje || 0), 0))
const totalPer = computed(() => cfg.value.pesosPeriodo.filter((p) => p.incluir).reduce((s, x) => s + Number(x.porcentaje || 0), 0))
const nombrePeriodo = (orden) => periodos.value.find((p) => p.orden === orden)?.nombre || `Periodo ${orden}`
const pasos = computed(() => 1 / 10 ** cfg.value.escala.decimales)

function agregarRango() { cfg.value.rangos.push({ nombre: '', desde: cfg.value.escala.min, hasta: cfg.value.escala.min }) }
function agregarActividad() { cfg.value.pesosActividad.push({ nombre: '', porcentaje: 0 }) }
function restaurar() { if (confirm('¿Volver a los valores recomendados (1.0 a 5.0, Bajo/Básico/Alto/Superior)?')) cfg.value = mezclarConfig() }

async function guardar() {
  msg.value = ''
  errores.value = validarConfig(cfg.value)
  if (errores.value.length) return
  guardando.value = true
  try {
    await calificacionCfgApi.guardar(cfg.value)
    await recargar() // los documentos y el motor de notas usan ya la nueva configuración
    msg.value = 'Sistema de calificación guardado. Las notas y boletines usarán esta configuración.'
  } catch (e) {
    errores.value = [e.response?.data?.mensaje || 'No se pudo guardar. Intenta de nuevo.']
  } finally { guardando.value = false }
}
</script>

<template>
  <AppLayout>
    <template #header-title>
      <h2>Sistema de calificación</h2>
      <p>Define cómo se califica y cómo se calculan las notas. El sistema aplica estos cambios sin tocar el código.</p>
    </template>

    <div v-if="cargando" class="sec-vacio">Cargando…</div>
    <template v-else>
      <div v-if="msg" class="sec-msg sec-msg--ok">{{ msg }}</div>
      <div v-if="errores.length" class="sec-msg sec-msg--err"><p v-for="e in errores" :key="e">• {{ e }}</p></div>

      <section class="sec-panel">
        <h3>Escala numérica</h3>
        <p class="sec-ayuda">Rango de notas permitido y decimales. Ejemplo colombiano: de 1.0 a 5.0 con 1 decimal.</p>
        <div class="sec-grid">
          <label class="sec-campo">Nota mínima<input type="number" step="0.1" v-model.number="cfg.escala.min" /></label>
          <label class="sec-campo">Nota máxima<input type="number" step="0.1" v-model.number="cfg.escala.max" /></label>
          <label class="sec-campo">Decimales<select v-model.number="cfg.escala.decimales"><option :value="0">0</option><option :value="1">1</option><option :value="2">2</option></select></label>
          <label class="sec-campo">Nota mínima aprobatoria<input type="number" :step="pasos" v-model.number="cfg.escala.notaAprobatoria" /></label>
        </div>
      </section>

      <section class="sec-panel">
        <h3>Rangos de desempeño</h3>
        <p class="sec-ayuda">Bajo, Básico, Alto y Superior (puedes cambiar nombres, rangos o agregar más). No deben cruzarse y deben cubrir toda la escala.</p>
        <table class="sec-tabla">
          <thead><tr><th>Nombre</th><th>Desde</th><th>Hasta</th><th></th></tr></thead>
          <tbody>
            <tr v-for="(r, i) in cfg.rangos" :key="i">
              <td><input v-model="r.nombre" placeholder="ej. Superior" /></td>
              <td><input type="number" :step="pasos" v-model.number="r.desde" /></td>
              <td><input type="number" :step="pasos" v-model.number="r.hasta" /></td>
              <td><button class="sec-btn sec-btn--peligro" @click="cfg.rangos.splice(i, 1)">Quitar</button></td>
            </tr>
          </tbody>
        </table>
        <div class="sec-fila" style="margin-top:10px">
          <button class="sec-btn sec-btn--sec" @click="agregarRango">+ Agregar rango</button>
          <label class="sec-campo" style="flex-direction:row;align-items:center;gap:8px">Probar nota:
            <input type="number" :step="pasos" v-model.number="prueba" style="width:90px" />
            <span class="sec-chip">{{ desempeno(prueba, cfg) || 'Fuera de rango' }}</span></label>
        </div>
      </section>

      <section class="sec-panel">
        <h3>Cómo se calcula la nota de cada periodo</h3>
        <p class="sec-ayuda">Elige el método que usa la institución.</p>
        <label class="sec-campo" style="max-width:340px">Método
          <select v-model="cfg.metodo"><option value="simple">Promedio simple de todas las notas</option><option value="ponderado">Promedio ponderado por tipo de actividad</option></select>
        </label>
        <template v-if="cfg.metodo === 'ponderado'">
          <table class="sec-tabla" style="margin-top:12px">
            <thead><tr><th>Tipo de actividad</th><th style="width:130px">Porcentaje</th><th></th></tr></thead>
            <tbody>
              <tr v-for="(a, i) in cfg.pesosActividad" :key="i">
                <td><input v-model="a.nombre" placeholder="ej. Evaluaciones" /></td>
                <td><input type="number" min="0" max="100" v-model.number="a.porcentaje" /></td>
                <td><button class="sec-btn sec-btn--peligro" @click="cfg.pesosActividad.splice(i, 1)">Quitar</button></td>
              </tr>
            </tbody>
          </table>
          <div class="sec-fila" style="margin-top:10px">
            <button class="sec-btn sec-btn--sec" @click="agregarActividad">+ Agregar tipo de actividad</button>
            <span class="sec-chip" :style="totalAct !== 100 && 'background:#fee2e2;color:#b91c1c'">Suma: {{ totalAct }}%</span>
          </div>
        </template>
      </section>

      <section class="sec-panel">
        <h3>Nota final del año</h3>
        <p class="sec-ayuda">Qué periodos cuentan y cuánto pesa cada uno.</p>
        <label class="sec-campo" style="max-width:340px">Método de nota final
          <select v-model="cfg.notaFinal.metodo"><option value="promedio_periodos">Promedio simple de los periodos</option><option value="ponderado_periodos">Ponderado por porcentaje de cada periodo</option></select>
        </label>
        <table class="sec-tabla" style="margin-top:12px">
          <thead><tr><th>Periodo</th><th style="width:110px">¿Cuenta?</th><th style="width:130px">Porcentaje</th></tr></thead>
          <tbody>
            <tr v-for="p in cfg.pesosPeriodo" :key="p.orden">
              <td>{{ nombrePeriodo(p.orden) }}</td>
              <td><input type="checkbox" v-model="p.incluir" style="width:auto" /></td>
              <td><input type="number" min="0" max="100" v-model.number="p.porcentaje" :disabled="cfg.notaFinal.metodo !== 'ponderado_periodos' || !p.incluir" /></td>
            </tr>
          </tbody>
        </table>
        <span v-if="cfg.notaFinal.metodo === 'ponderado_periodos'" class="sec-chip" :style="totalPer !== 100 && 'background:#fee2e2;color:#b91c1c'">Suma: {{ totalPer }}%</span>
      </section>

      <section class="sec-panel">
        <h3>Recuperaciones y nivelaciones</h3>
        <div class="sec-grid">
          <label class="sec-campo">¿Se permiten recuperaciones?
            <select v-model="cfg.recuperacion.habilitada"><option :value="true">Sí</option><option :value="false">No</option></select></label>
          <label class="sec-campo">Cómo afecta la nota
            <select v-model="cfg.recuperacion.modo" :disabled="!cfg.recuperacion.habilitada">
              <option value="reemplaza_si_mayor">Reemplaza la nota si es mayor</option><option value="reemplaza">Siempre reemplaza la nota</option><option value="promedia">Se promedia con la nota original</option></select></label>
          <label class="sec-campo">Nota máxima tras recuperar
            <input type="number" :step="pasos" v-model.number="cfg.recuperacion.notaMaxima" :disabled="!cfg.recuperacion.habilitada" /></label>
        </div>
      </section>

      <div class="sec-fila">
        <button class="sec-btn" :disabled="guardando" @click="guardar">{{ guardando ? 'Guardando…' : 'Guardar sistema de calificación' }}</button>
        <button class="sec-btn sec-btn--sec" @click="restaurar">Restaurar valores recomendados</button>
      </div>
    </template>
  </AppLayout>
</template>
