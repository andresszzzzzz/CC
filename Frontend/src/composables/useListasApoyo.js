import { ref } from 'vue'
import { sedesApi, usuariosApi } from '@/services/secretariaApi'

// Listas de apoyo para los selects de los formularios (sedes y docentes).
const sedes = ref([])
const docentes = ref([])

export function useListasApoyo() {
  async function cargarSedes(institucionId) {
    try {
      const { data } = await sedesApi.listar({ institucionId })
      sedes.value = Array.isArray(data) ? data : []
    } catch {
      sedes.value = []
    }
  }

  async function cargarDocentes(institucionId) {
    try {
      const { data } = await usuariosApi.listar({ institucionId, tipoPerfil: 'docente', estado: 'activo' })
      docentes.value = data.usuarios || []
    } catch {
      docentes.value = []
    }
  }

  // Son funciones (no arreglos) para que el formulario las evalúe al dibujarse
  // y se actualicen solas cuando terminan de cargar las listas.
  const opcSedes = () => [
    { value: '', label: '— Sin sede —' },
    ...sedes.value.map((s) => ({ value: s._id, label: s.nombre }))
  ]

  const opcDocentes = () => [
    { value: '', label: '— Sin director —' },
    ...docentes.value.map((d) => ({
      value: d._id,
      label: d.nombreCompleto || `${d.nombres} ${d.apellidos}`
    }))
  ]

  return { sedes, docentes, cargarSedes, cargarDocentes, opcSedes, opcDocentes }
}
