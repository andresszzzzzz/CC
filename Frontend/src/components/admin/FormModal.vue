<script setup>
import { reactive, ref, computed, watch } from 'vue'

const props = defineProps({
  abierto: { type: Boolean, default: false },
  titulo: { type: String, default: '' },
  // [{ key, label, type, required, opciones, default, placeholder, min, max, minlength }]
  // "opciones" puede ser un arreglo o una función que devuelve un arreglo.
  campos: { type: Array, required: true },
  valores: { type: Object, default: () => ({}) },
  guardando: { type: Boolean, default: false },
  error: { type: String, default: '' }
})
const emit = defineEmits(['cerrar', 'guardar'])

// Claves con punto ("credenciales.usuario") <-> objetos anidados.
const leer = (obj, ruta) => ruta.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj)
function escribir(obj, ruta, valor) {
  const partes = ruta.split('.')
  let cursor = obj
  partes.slice(0, -1).forEach((k) => {
    cursor[k] = cursor[k] || {}
    cursor = cursor[k]
  })
  cursor[partes[partes.length - 1]] = valor
}

const form = reactive({})
const aviso = ref('')

// Editando = el registro ya existe. "requiredAlCrear": obligatorio solo al crear (al editar puede quedar como estaba).
const editando = computed(() => !!props.valores?._id)
const esRequerido = (c) => !!c.required || (!!c.requiredAlCrear && !editando.value)

function inicializar() {
  aviso.value = ''
  Object.keys(form).forEach((k) => delete form[k])
  props.campos.forEach((c) => {
    let v = leer(props.valores, c.key)
    if (v && typeof v === 'object') v = v._id ?? '' // relaciones pobladas -> solo el id
    if (c.type === 'date' && v) v = String(v).slice(0, 10)
    form[c.key] = v ?? c.default ?? ''
  })
}

// Se reinicia cada vez que se abre (para que "Nuevo" salga limpio y "Editar" salga con datos).
watch(() => props.abierto, (abierto) => { if (abierto) inicializar() }, { immediate: true })

// Al hacer clic en el fondo la caja se sacude un instante (como el backdrop «static» de Bootstrap)
const sacudida = ref(false)
function sacudir() {
  sacudida.value = true
  setTimeout(() => { sacudida.value = false }, 250)
}

const opcionesDe = (c) => (typeof c.opciones === 'function' ? c.opciones() : c.opciones || [])

const vacio = (v) => v === '' || v === null || v === undefined

// Validación propia (sin los globos del navegador): se avisa con una alerta de Bootstrap.
function validar() {
  const faltan = props.campos.filter((c) => esRequerido(c) && vacio(form[c.key])).map((c) => c.label.replace(/\s*\(.*\)\s*$/, ''))
  if (faltan.length) return `Debes completar los campos obligatorios: ${faltan.join(', ')}.`
  for (const c of props.campos) {
    const v = form[c.key]
    if (vacio(v)) continue
    if (c.type === 'number') {
      const n = Number(v)
      if (Number.isNaN(n)) return `«${c.label}» debe ser un número.`
      if (c.min !== undefined && n < c.min) return `«${c.label}» no puede ser menor que ${c.min}.`
      if (c.max !== undefined && n > c.max) return `«${c.label}» no puede ser mayor que ${c.max}.`
    }
    if (c.minlength && String(v).length < c.minlength) return `«${c.label}» debe tener al menos ${c.minlength} caracteres.`
    if (c.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v))) return `Escribe un correo electrónico válido en «${c.label}».`
  }
  return ''
}

function enviar() {
  aviso.value = validar()
  if (aviso.value) return
  const salida = {}
  props.campos.forEach((c) => {
    let v = form[c.key]
    if (v === '' || v === null || v === undefined) return // vacío = no se envía
    if (c.type === 'number') v = Number(v)
    escribir(salida, c.key, v)
  })
  emit('guardar', salida)
}
</script>

<template>
  <!-- Modal persistente: NO se cierra al hacer clic afuera (así no se pierde lo escrito); solo con la X o «Cancelar» -->
  <div v-if="abierto" class="modal-fondo" @click.self="sacudir">
    <div :class="['modal-caja', { 'modal-caja--aviso': sacudida }]">
      <div class="modal-cabecera">
        <h3>{{ titulo }}</h3>
        <button type="button" class="modal-x" @click="$emit('cerrar')">&times;</button>
      </div>

      <form class="modal-form" novalidate @submit.prevent="enviar">
        <label v-for="c in campos" :key="c.key" :class="['campo', { 'campo--ancho': c.type === 'textarea' }]">
          <span>{{ c.label }}<b v-if="esRequerido(c)"> *</b></span>

          <select v-if="c.type === 'select'" v-model="form[c.key]" :required="esRequerido(c)">
            <option v-if="!esRequerido(c) || !form[c.key]" value="">Selecciona…</option>
            <option v-for="op in opcionesDe(c)" :key="op.value" :value="op.value">{{ op.label }}</option>
          </select>

          <textarea
            v-else-if="c.type === 'textarea'"
            v-model="form[c.key]"
            rows="4"
            :required="esRequerido(c)"
            :placeholder="c.placeholder"
          ></textarea>

          <input
            v-else
            v-model="form[c.key]"
            :type="c.type || 'text'"
            :required="esRequerido(c)"
            :placeholder="c.placeholder"
            :min="c.min"
            :max="c.max"
            :minlength="c.minlength"
            :autocomplete="c.type === 'password' ? 'new-password' : 'off'"
          />
        </label>

        <div v-if="aviso" class="alert alert-warning modal-alerta mb-0" role="alert">
          <strong>¡Atención!</strong> {{ aviso }}
        </div>
        <div v-if="error && !aviso" class="alert alert-danger modal-alerta mb-0" role="alert">
          <strong>¡Error!</strong> {{ error }}
        </div>

        <div class="modal-acciones">
          <button type="button" class="btn-sec" @click="$emit('cerrar')">Cancelar</button>
          <button type="submit" class="btn-pri" :disabled="guardando">
            {{ guardando ? 'Guardando…' : 'Guardar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-fondo { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 16px; }
.modal-caja { background: white; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; border-radius: 16px; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15); }
.modal-caja--aviso { transform: scale(1.02); }
.modal-caja { transition: transform 0.2s ease; }
.modal-cabecera { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 18px; }
.modal-cabecera h3 { font-size: 17px; font-weight: 700; color: #0f172a; text-transform: capitalize; }
.modal-x { background: none; border: none; font-size: 24px; color: #94a3b8; cursor: pointer; line-height: 1; }

.modal-form { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.campo { display: flex; flex-direction: column; gap: 5px; }
.campo span { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; }
.campo b { color: #dc2626; }
.campo textarea { border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 10px; padding: 10px 12px; font-size: 13px; color: #0f172a; outline: none; font-family: inherit; resize: vertical; }
.campo textarea:focus { border-color: #2563eb; background: white; }
.campo--ancho { grid-column: 1 / -1; }
.campo input, .campo select { border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 10px; padding: 10px 12px; font-size: 13px; color: #0f172a; outline: none; }
.campo input:focus, .campo select:focus { border-color: #2563eb; background: white; }

.modal-alerta { grid-column: 1 / -1; font-size: 13px; }
.modal-acciones { grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid #e2e8f0; padding-top: 14px; margin-top: 4px; }
.btn-sec { background: white; border: 1px solid #cbd5e1; color: #475569; border-radius: 10px; padding: 10px 18px; font-size: 13px; font-weight: 600; cursor: pointer; }
.btn-pri { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; border: none; border-radius: 10px; padding: 10px 20px; font-size: 13px; font-weight: 700; cursor: pointer; }
.btn-pri:disabled { opacity: 0.7; cursor: default; }

@media (max-width: 600px) { .modal-form { grid-template-columns: 1fr; } }
</style>
