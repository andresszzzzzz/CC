// Servicios NUEVOS de Secretaría. Ajusta SOLO este archivo si tus rutas del backend son distintas.
// Asume que existe una instancia de axios en '@/services/api' (la misma que usa secretariaApi.js).
import api from '@/services/api'

export const RUTAS = {
  anios: '/secretaria/anios', periodos: '/secretaria/periodos', jornadas: '/secretaria/jornadas',
  ciclos: '/secretaria/ciclos', grados: '/secretaria/grados', asignaturas: '/secretaria/asignaturas',
  asignaciones: '/secretaria/asignaciones', matriculas: '/secretaria/matriculas',
  firmas: '/secretaria/firmas', institucion: '/secretaria/institucion',
  calificacion: '/secretaria/sistema-calificacion', personas: '/secretaria/personas',
  estudiantes: '/secretaria/estudiantes', imagenes: '/secretaria/imagenes', documentos: '/secretaria/documentos'
}

function crud(base) {
  return {
    listar: (params) => api.get(base, { params }),
    obtener: (id) => api.get(`${base}/${id}`),
    crear: (d) => api.post(base, d),
    actualizar: (id, d) => api.put(`${base}/${id}`, d),
    eliminar: (id) => api.delete(`${base}/${id}`)
  }
}

export const aniosApi = { ...crud(RUTAS.anios), marcarActual: (id) => api.patch(`${RUTAS.anios}/${id}/actual`) }
export const periodosApi = { ...crud(RUTAS.periodos), cerrar: (id) => api.patch(`${RUTAS.periodos}/${id}/cerrar`) }
export const jornadasApi = crud(RUTAS.jornadas)
export const ciclosApi = crud(RUTAS.ciclos)
export const gradosApi = crud(RUTAS.grados)
export const asignaturasApi = crud(RUTAS.asignaturas)
export const asignacionesApi = crud(RUTAS.asignaciones)
export const firmasApi = crud(RUTAS.firmas)

export const matriculasApi = {
  ...crud(RUTAS.matriculas),
  // Devuelve { existe: bool, matricula } para (estudiante, año). Evita duplicados también en el backend.
  verificar: (estudianteId, anioAcademicoId) => api.get(`${RUTAS.matriculas}/verificar`, { params: { estudianteId, anioAcademicoId } }),
  historial: (estudianteId) => api.get(`${RUTAS.matriculas}/historial/${estudianteId}`),
  cambiarEstado: (id, estado, motivo) => api.patch(`${RUTAS.matriculas}/${id}/estado`, { estado, motivo })
}

export const estudiantesApi = {
  buscar: (q, institucionId) => api.get(`${RUTAS.estudiantes}/buscar`, { params: { q, institucionId } }),
  ficha: (id) => api.get(`${RUTAS.estudiantes}/${id}/ficha`), // {estudiante, acudientes, matriculaActual, matriculas, historialAcademico}
  cambiarEstado: (id, estado) => api.patch(`${RUTAS.estudiantes}/${id}/estado`, { estado })
}

// Persona única -> roles -> estudiantes relacionados (sin duplicar personas)
export const personasApi = {
  buscar: (q, institucionId) => api.get(`${RUTAS.personas}/buscar`, { params: { q, institucionId } }),
  obtener: (id) => api.get(`${RUTAS.personas}/${id}`), // {persona, roles:[], relaciones:[{estudiante, parentesco}]}
  agregarRol: (id, rol) => api.post(`${RUTAS.personas}/${id}/roles`, { rol }),
  quitarRol: (id, rol) => api.delete(`${RUTAS.personas}/${id}/roles/${rol}`),
  vincular: (id, estudianteId, parentesco) => api.post(`${RUTAS.personas}/${id}/relaciones`, { estudianteId, parentesco }),
  desvincular: (id, estudianteId) => api.delete(`${RUTAS.personas}/${id}/relaciones/${estudianteId}`)
}

// Configuración institucional ÚNICA (datos, escudo, foto). La leen boletines, certificados, etc.
export const institucionCfgApi = {
  obtener: () => api.get(RUTAS.institucion),
  guardar: (d) => api.put(RUTAS.institucion, d)
}
export const calificacionCfgApi = {
  obtener: () => api.get(RUTAS.calificacion),
  guardar: (d) => api.put(RUTAS.calificacion, d)
}

// Subida de imágenes. tipo: escudo | colegio | firma | estudiante | docente | acudiente | institucional
export const imagenesApi = {
  subir: (tipo, archivo, extra = {}) => {
    const fd = new FormData()
    fd.append('archivo', archivo)
    Object.entries(extra).forEach(([k, v]) => fd.append(k, v))
    return api.post(`${RUTAS.imagenes}/${tipo}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  galeria: (tipo) => api.get(`${RUTAS.imagenes}/${tipo}`),
  eliminar: (tipo, id) => api.delete(`${RUTAS.imagenes}/${tipo}/${id}`)
}

export const documentosApi = {
  // Datos crudos para armar el PDF (las notas y el desempeño se calculan en el cliente con la config vigente)
  datos: (params) => api.get(`${RUTAS.documentos}/datos`, { params }),
  datosGrupo: (params) => api.get(`${RUTAS.documentos}/datos-grupo`, { params })
}

// Desactivar en vez de eliminar: conserva todo el historial del usuario.
export const conDesactivacion = (recurso) => ({
  ...recurso,
  eliminar: (id) => recurso.actualizar(id, { estado: 'inactivo' })
})
export const TEXTOS_DESACTIVAR = {
  tituloEliminar: 'Desactivar',
  mensajeEliminar: 'La persona quedará inactiva y no podrá ingresar al sistema. Sus datos históricos se conservan y puedes reactivarla editando su estado.'
}
export const CAMPO_ESTADO_PERSONA = {
  key: 'estado', label: 'Estado de acceso', type: 'select',
  opciones: [{ value: 'activo', label: 'Activo' }, { value: 'inactivo', label: 'Inactivo (sin acceso)' }]
}
export const conCampoEstado = (campos) => (campos.some((c) => c.key === 'estado') ? campos : [...campos, CAMPO_ESTADO_PERSONA])
