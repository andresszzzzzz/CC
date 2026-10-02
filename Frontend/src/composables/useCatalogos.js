import { ref } from 'vue'
import { useContextoInstitucional } from '@/composables/useContextoInstitucional'
import { usuariosApi, areasApi, gruposApi } from '@/services/secretariaApi'
import { aniosApi, periodosApi, jornadasApi, ciclosApi, gradosApi, asignaturasApi } from '@/services/secretariaApiExt'

// Listas de apoyo (para selects) compartidas por todas las vistas de Secretaría.
const estado = {
  anios: ref([]), periodos: ref([]), jornadas: ref([]), ciclos: ref([]), grados: ref([]),
  areas: ref([]), asignaturas: ref([]), grupos: ref([]), docentes: ref([]), acudientes: ref([]), estudiantes: ref([])
}
const FUENTES = {
  anios: (p) => aniosApi.listar(p), periodos: (p) => periodosApi.listar(p), jornadas: (p) => jornadasApi.listar(p),
  ciclos: (p) => ciclosApi.listar(p), grados: (p) => gradosApi.listar(p), areas: (p) => areasApi.listar(p),
  asignaturas: (p) => asignaturasApi.listar(p), grupos: (p) => gruposApi.listar(p),
  docentes: (p) => usuariosApi.listar({ ...p, tipoPerfil: 'docente' }),
  acudientes: (p) => usuariosApi.listar({ ...p, tipoPerfil: 'acudiente' }),
  estudiantes: (p) => usuariosApi.listar({ ...p, tipoPerfil: 'estudiante' })
}
const lista = (d) => (Array.isArray(d) ? d : d?.items || d?.usuarios || [])

export function useCatalogos() {
  const { institucionId } = useContextoInstitucional()
  async function cargar(...claves) {
    if (!institucionId.value) return
    await Promise.all(claves.map(async (k) => {
      try { estado[k].value = lista((await FUENTES[k]({ institucionId: institucionId.value })).data) } catch { estado[k].value = [] }
    }))
  }
  // opc('grados', g => g.nombre) -> función para `opciones` de un campo select
  const opc = (k, etiqueta) => () =>
    estado[k].value.map((x) => ({ value: x._id, label: typeof etiqueta === 'function' ? etiqueta(x) : x[etiqueta] }))
  const nombrePersona = (p) => [p.nombres, p.apellidos].filter(Boolean).join(' ') || p.nombre || p.usuario || ''
  return { ...estado, cargar, opc, nombrePersona, institucionId }
}
