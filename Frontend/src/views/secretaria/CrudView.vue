<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import DataTable from '@/components/admin/DataTable.vue'
import FormModal from '@/components/admin/FormModal.vue'
import { useNotificacionesStore } from '@/stores/notificaciones'
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
const notif = useNotificacionesStore()

// Mensaje claro a partir de la respuesta del backend (mensaje + detalle si lo hay)
const textoError = (e, porDefecto) => {
  const d = e.response?.data
  if (d?.mensaje && d?.error && d.error !== d.mensaje) return `${d.mensaje}: ${d.error}`
  return d?.mensaje || d?.error || (!e.response && e.message) || porDefecto
}

const { institucionId } = useContextoInstitucional()

const filas = ref([])
const cargando = ref(true)
const error = ref('')

const modalAbierto = ref(false)
const editando = ref(null)
const guardando = ref(false)
const errorForm = ref('')

const eliminando = ref(false)

// ¿Este recurso maneja activo/inactivo? Se detecta por el campo «estado» del formulario.
const modoEstado = computed(() => props.campos.some((c) => c.key === 'estado' && Array.isArray(c.opciones) &&
  c.opciones.some((o) => o.value === 'activo') && c.opciones.some((o) => o.value === 'inactivo')))
// Textos de la alerta de confirmación (¿Estás seguro?) según la acción
const textosDialogo = (accion) => {
  if (accion === 'desactivar') {
    return { titulo: `¿Desactivar ${props.nombreItem}?`, boton: 'Sí, desactivar',
      mensaje: 'Quedará inactivo, pero sus datos y su historial se conservan. Podrás activarlo de nuevo cuando quieras. Para eliminarlo definitivamente primero debe estar desactivado.' }
  }
  if (modoEstado.value) {
    return { titulo: `¿Eliminar ${props.nombreItem} definitivamente?`, boton: 'Sí, eliminar',
      mensaje: 'Esta acción no se puede deshacer. Si el registro ya se usa en otros módulos, el sistema no permitirá eliminarlo.' }
  }
  return { titulo: `${props.tituloEliminar}:`, mensaje: props.mensajeEliminar, boton: 'Sí, eliminar' }
}

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
    if (fueEdicion) notif.exito('Los cambios se guardaron correctamente.', '¡Actualización exitosa!')
    else notif.exito('El registro se creó correctamente.')
    await cargar()
  } catch (e) {
    // Se muestra dentro del formulario (alerta roja); el formulario queda abierto para corregir
    errorForm.value = textoError(e, 'No se pudo guardar el registro.')
  } finally {
    guardando.value = false
  }
}

// Alerta de confirmación de Bootstrap («¿Estás seguro?»)
async function pedirDesactivar(fila) {
  const t = textosDialogo('desactivar')
  const acepta = await notif.confirmar(t.mensaje, { titulo: t.titulo, textoSi: t.boton })
  if (acepta) await ejecutar(fila, 'desactivar')
}
async function pedirEliminar(fila) {
  // En tablas con activo/inactivo nunca se elimina un registro que sigue activo: primero se desactiva
  if (modoEstado.value && fila.estado !== 'inactivo') return pedirDesactivar(fila)
  const t = textosDialogo('eliminar')
  const acepta = await notif.confirmar(t.mensaje, { titulo: t.titulo, textoSi: t.boton })
  if (acepta) await ejecutar(fila, 'eliminar')
}
async function activar(fila) {
  try {
    await props.recurso.actualizar(fila._id, { estado: 'activo' })
    notif.exito('El registro quedó activo de nuevo.', '¡Registro activado!')
    await cargar()
  } catch (e) {
    notif.error(textoError(e, 'No se pudo activar el registro.'))
  }
}
async function ejecutar(fila, accion) {
  eliminando.value = true
  try {
    if (accion === 'desactivar') {
      await props.recurso.actualizar(fila._id, { estado: 'inactivo' })
      notif.exito('El registro quedó inactivo; su historial se conserva.', '¡Registro desactivado!')
    } else {
      // eliminarDefinitivo existe cuando el recurso viene envuelto con conDesactivacion()
      await (props.recurso.eliminarDefinitivo || props.recurso.eliminar)(fila._id)
      notif.exito('El registro se eliminó correctamente.', '¡Registro eliminado!')
    }
    await cargar()
  } catch (e) {
    notif.error(textoError(e, accion === 'desactivar' ? 'No se pudo desactivar el registro.' : 'No se pudo eliminar el registro.'))
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
      :modo-estado="modoEstado"
      @crear="abrirCrear"
      @editar="abrirEditar"
      @eliminar="pedirEliminar"
      @desactivar="pedirDesactivar"
      @activar="activar"
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

  </AppLayout>
</template>
