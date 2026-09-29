import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import acudienteService from '@/services/acudienteService'
import { formatearFecha } from '@/utils/academico'

// Reemplaza el código que estaba copiado en las 5 vistas del acudiente.
// Carga el perfil (/auth/me), la lista de hijos vinculados y, para el hijo
// seleccionado, su matrícula activa: de ahí salen grado, grupo, jornada y los
// datos personales reales. Nada de esto se inventa: si un dato no existe en
// el backend, queda vacío y la vista decide cómo mostrarlo.

const idDe = (valor) => (valor && typeof valor === 'object' ? valor._id : valor)

const JORNADAS = { manana: 'Mañana', tarde: 'Tarde', noche: 'Noche', continua: 'Continua' }

const iniciales = (nombre) =>
  (nombre || '')
    .split(' ')
    .filter(Boolean)
    .map((parte) => parte[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

const estudianteVacio = () => ({
  nombre: '',
  iniciales: '',
  curso: '',
  grado: '',
  grupo: '',
  jornada: '',
  fechaNacimiento: '',
  telefono: ''
})

/**
 * @param {(estudianteId: string, matricula: object|null) => Promise<void>} [alSeleccionar]
 *   Se ejecuta cada vez que cambia el hijo seleccionado (incluida la carga
 *   inicial). Cada vista la usa para pedir sus propios datos.
 */
export function useHijos(alSeleccionar) {
  const auth = useAuthStore()

  const acudiente = reactive({ nombre: '', iniciales: '', colegio: '', estudiantes: [] })
  const institucion = ref(null)
  const estudianteSeleccionadoId = ref(null)
  const estudiante = ref(estudianteVacio())
  const matricula = ref(null)

  const cargandoPerfil = ref(true)
  const errorPerfil = ref('')

  // Lo define la institución; 4 es el valor por defecto del modelo Institucion.
  const numeroPeriodos = computed(() => institucion.value?.configuracion?.numeroPeriodos || 4)
  const periodos = computed(() => Array.from({ length: numeroPeriodos.value }, (_, i) => i + 1))

  const seleccionarEstudiante = async (estId) => {
    estudianteSeleccionadoId.value = estId
    matricula.value = null

    const relacion = acudiente.estudiantes.find((e) => idDe(e.estudianteId) === estId)
    estudiante.value = {
      ...estudianteVacio(),
      nombre: relacion?.nombre || '',
      iniciales: iniciales(relacion?.nombre)
    }

    try {
      const { data } = await acudienteService.obtenerMatriculas(estId)
      // Si hubiera más de una activa, se toma la más reciente.
      const activa = data
        .filter((m) => m.estado === 'activa')
        .sort((a, b) => new Date(b.fechaMatricula) - new Date(a.fechaMatricula))[0]

      if (activa) {
        matricula.value = activa
        const persona = typeof activa.estudianteId === 'object' ? activa.estudianteId : null
        const grupo = typeof activa.grupoId === 'object' ? activa.grupoId : null
        const nombre = persona ? `${persona.nombres || ''} ${persona.apellidos || ''}`.trim() : ''

        estudiante.value = {
          nombre: nombre || estudiante.value.nombre,
          iniciales: iniciales(nombre) || estudiante.value.iniciales,
          grado: grupo ? `${grupo.grado}°` : '',
          grupo: grupo?.nombre || '',
          curso: grupo ? `${grupo.grado}° - ${grupo.nombre}` : '',
          jornada: grupo ? JORNADAS[grupo.jornada] || grupo.jornada || '' : '',
          fechaNacimiento: persona?.fechaNacimiento ? formatearFecha(persona.fechaNacimiento) : '',
          telefono: persona?.telefono || ''
        }
      }
    } catch (e) {
      errorPerfil.value = e.response?.data?.mensaje || 'No se pudo cargar la matrícula del estudiante.'
    }

    if (alSeleccionar) await alSeleccionar(estId, matricula.value)
  }

  const iniciar = async () => {
    cargandoPerfil.value = true
    errorPerfil.value = ''
    try {
      const { data } = await acudienteService.obtenerMiPerfil()
      const usuario = data.usuario || data

      institucion.value = typeof usuario.institucionId === 'object' ? usuario.institucionId : null
      acudiente.nombre = usuario.nombres || ''
      acudiente.iniciales = iniciales(`${usuario.nombres || ''} ${usuario.apellidos || ''}`)
      acudiente.colegio = institucion.value?.nombre || ''
      acudiente.estudiantes = usuario.estudiantes || []

      if (acudiente.estudiantes.length) {
        await seleccionarEstudiante(idDe(acudiente.estudiantes[0].estudianteId))
      }
    } catch (e) {
      errorPerfil.value = e.response?.data?.mensaje || 'No se pudo cargar tu perfil.'
    } finally {
      cargandoPerfil.value = false
    }
  }

  onMounted(iniciar)

  return {
    auth,
    acudiente,
    institucion,
    estudianteSeleccionadoId,
    estudiante,
    matricula,
    cargandoPerfil,
    errorPerfil,
    numeroPeriodos,
    periodos,
    seleccionarEstudiante
  }
}
