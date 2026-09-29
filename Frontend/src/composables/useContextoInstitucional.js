import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { aniosApi } from '@/services/secretariaApi'

// Estado compartido entre vistas: el colegio del usuario logueado y sus años
// académicos. Vive a nivel de módulo para no repetir la consulta en cada vista.
const anios = ref([])
let institucionDeLosAnios = null

export function useContextoInstitucional() {
  const auth = useAuthStore()

  // El login devuelve institucionId como texto; /auth/me lo devuelve poblado
  // como objeto { _id, nombre }. Se acepta cualquiera de los dos.
  const institucionId = computed(() => {
    const inst = auth.usuario?.institucionId
    return (inst && typeof inst === 'object' ? inst._id : inst) || null
  })

  // Año en curso: el que está "activo"; si ninguno lo está, el más reciente.
  const anioActivo = computed(
    () => anios.value.find((a) => a.estado === 'activo') || anios.value[0] || null
  )

  async function cargarAnios() {
    const id = institucionId.value
    if (!id) {
      anios.value = []
      institucionDeLosAnios = null
      return
    }
    if (institucionDeLosAnios !== id) anios.value = [] // otro colegio: no mostrar años ajenos
    try {
      const { data } = await aniosApi.porInstitucion(id)
      anios.value = Array.isArray(data) ? data : []
      institucionDeLosAnios = id
    } catch {
      anios.value = []
    }
  }

  return { institucionId, anios, anioActivo, cargarAnios }
}
