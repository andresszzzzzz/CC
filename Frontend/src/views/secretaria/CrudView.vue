<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import DataTable from '@/components/admin/DataTable.vue'
import FormModal from '@/components/admin/FormModal.vue'
import ConfirmDialog from '@/components/admin/ConfirmDialog.vue'
import { useContextoInstitucional } from '@/composables/useContextoInstitucional'

const props = defineProps({
  titulo: { type: String, required: true },
  subtitulo: { type: String, default: '' },
  recurso: { type: Object, required: true },
  columnas: { type: Array, required: true },
  campos: { type: Array, required: true },
  filtrosFijos: { type: Object, default: () => ({}) },
  incluirInstitucion: { type: Boolean, default: true },
  soloLectura: { type: Boolean, default: false },
  antesDeEnviar: { type: Function, default: null },
  nombreItem: { type: String, default: 'el registro' },
  // --- Nuevos (opcionales) ---
  despuesDeGuardar: { type: Function, default: null },   // (registroGuardado, fueEdicion, payload)
  tituloEliminar: { type: String, default: 'Eliminar registro' },
  mensajeEliminar: { type: String, default: '¿Seguro que quieres eliminar este registro? Esta acción no se puede deshacer.' }
})
const route = useRoute()

const { institucionId } = useContextoInstitucional()

const filas = ref([])
const cargando = ref(true)
const error = ref('')

const modalAbierto = ref(false)
const editando = ref(null)
const guardando = ref(false)
const errorForm = ref('')

const confirmAbierto = ref(false)
const aEliminar = ref(null)
const eliminando = ref(false)

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    const params = { ...props.filtrosFijos }
    if (props.incluirInstitucion && institucionId.value) params.institucionId = institucionId.value
    const { data } = await props.recurso.listar(params)
    filas.value = Array.isArray(data) ? data : (data.usuarios || data.items || [])
  } catch (e) {
    error.value = e.response?.data?.mensaje || 'No se pudo cargar la información.'
  } finally {
    cargando.value = false
  }
}

onMounted(async () => {
  await cargar()
  if (route?.query?.nuevo && !props.soloLectura) abrirCrear() // ej. /secretaria/anio-escolar?nuevo=1
})
watch(institucionId, cargar)

function abrirCrear() {
  editando.value = null
  errorForm.value = ''
  modalAbierto.value = true
}
function abrirEditar(fila) {
  editando.value = fila
  errorForm.value = ''
  modalAbierto.value = true
}
function cerrarModal() {
  modalAbierto.value = false
}

async function guardar(valores) {
  guardando.value = true
  errorForm.value = ''
  try {
    let payload = { ...props.filtrosFijos, ...valores }
    if (props.incluirInstitucion && institucionId.value) payload.institucionId = institucionId.value
    if (props.antesDeEnviar) payload = props.antesDeEnviar(payload, editando.value)

    const fueEdicion = !!editando.value
    let respuesta
    if (fueEdicion) {
      respuesta = await props.recurso.actualizar(editando.value._id, payload)
    } else {
      respuesta = await props.recurso.crear(payload)
    }
    if (props.despuesDeGuardar) {
      const guardado = respuesta?.data?._id ? respuesta.data : (respuesta?.data?.item || { ...(editando.value || {}), ...payload })
      await props.despuesDeGuardar(guardado, fueEdicion, payload)
    }
    modalAbierto.value = false
    await cargar()
  } catch (e) {
    errorForm.value = e.response?.data?.mensaje || e.response?.data?.error || (!e.response && e.message) || 'No se pudo guardar el registro.'
  } finally {
    guardando.value = false
  }
}

function pedirEliminar(fila) {
  aEliminar.value = fila
  confirmAbierto.value = true
}
async function confirmarEliminar() {
  if (!aEliminar.value) return
  eliminando.value = true
  try {
    await props.recurso.eliminar(aEliminar.value._id)
    confirmAbierto.value = false
    await cargar()
  } catch (e) {
    error.value = e.response?.data?.mensaje || 'No se pudo eliminar el registro.'
    confirmAbierto.value = false
  } finally {
    eliminando.value = false
  }
}

const valoresIniciales = computed(() => editando.value || {})

// Campos marcados con soloCreacion (ej. usuario/contraseña iniciales) se
// ocultan al editar, porque el backend los ignora en la actualización y
// tienen su propio flujo (restablecer contraseña) fuera de este formulario.
// Los marcados con soloEdicion (ej. el estado activo/inactivo) solo aparecen al editar:
// al crear, el registro nace "activo" y no se pregunta.
const camposActivos = computed(() =>
  props.campos.filter((c) => !(editando.value && c.soloCreacion) && !(!editando.value && c.soloEdicion))
)
</script>

<template>
  <AppLayout>
    <template #header-title>
      <h2>{{ titulo }}</h2>
      <p>{{ subtitulo }}</p>
    </template>

    <DataTable
      :columns="columnas"
      :rows="filas"
      :cargando="cargando"
      :error="error"
      :solo-lectura="soloLectura"
      @crear="abrirCrear"
      @editar="abrirEditar"
      @eliminar="pedirEliminar"
    />

    <FormModal
      v-if="!soloLectura"
      :abierto="modalAbierto"
      :titulo="editando ? `Editar ${nombreItem}` : `Nuevo ${nombreItem}`"
      :campos="camposActivos"
      :valores="valoresIniciales"
      :guardando="guardando"
      :error="errorForm"
      @cerrar="cerrarModal"
      @guardar="guardar"
    />

    <ConfirmDialog
      v-if="!soloLectura"
      :abierto="confirmAbierto"
      :titulo="tituloEliminar"
      :mensaje="mensajeEliminar"
      :procesando="eliminando"
      @cerrar="confirmAbierto = false"
      @confirmar="confirmarEliminar"
    />
  </AppLayout>
</template>