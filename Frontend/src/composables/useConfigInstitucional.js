import { ref, computed } from 'vue'
import { institucionCfgApi, calificacionCfgApi, firmasApi } from '@/services/secretariaApiExt'
import { mezclarConfig } from '@/utils/calificacion'

// UNA sola fuente de verdad institucional: la leen boletines, certificados, matrículas, etc.
const institucion = ref({})
const firmas = ref([])
const calificacionCruda = ref({})
const cargado = ref(false)

async function cargar(forzar = false) {
  if (cargado.value && !forzar) return
  const [i, f, c] = await Promise.allSettled([institucionCfgApi.obtener(), firmasApi.listar(), calificacionCfgApi.obtener()])
  if (i.status === 'fulfilled') institucion.value = i.value.data || {}
  if (f.status === 'fulfilled') firmas.value = Array.isArray(f.value.data) ? f.value.data : f.value.data?.items || []
  if (c.status === 'fulfilled') calificacionCruda.value = c.value.data || {}
  cargado.value = true
}

export function useConfigInstitucional() {
  const calificacion = computed(() => mezclarConfig(calificacionCruda.value))
  const firmasActivas = (documento) =>
    firmas.value
      .filter((f) => f.estado !== 'inactivo' && f.activa !== false && f.imagenUrl && (!f.usarEn?.length || f.usarEn.includes(documento)))
      .sort((a, b) => (a.orden ?? 99) - (b.orden ?? 99))
  return { institucion, firmas, calificacion, firmasActivas, cargar, recargar: () => cargar(true) }
}
