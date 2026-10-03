import api from './api'

export default {
  // --- 1. Gestión de Instituciones y Administradores ---
  listarInstituciones() {
    return api.get('/nucleo/instituciones')
  },
  
  crearInstitucion(data) {
    return api.post('/nucleo/instituciones', data)
  },

  crearAdminInstitucion(institucionId, dataAdmin) {
    return api.post(`/nucleo/instituciones/${institucionId}/admin`, dataAdmin)
  },

  listarInstituciones() {
    return api.get('/nucleo/instituciones')
  },
  
  crearInstitucion(data) {
    return api.post('/nucleo/instituciones', data)
  },

  // Método para actualizar institución (incluyendo estado Activo/Inactivo)
  actualizarInstitucion(id, data) {
    return api.put(`/nucleo/instituciones/${id}`, data)
  },

  // --- Gestión de Personal de Secretaría ---
  crearSecretaria(data) {
    return api.post('/nucleo/secretarias', data)
  },

  listarSecretarias() {
    return api.get('/nucleo/secretarias')
  },

  // Método para actualizar secretaría
  actualizarSecretaria(id, data) {
    return api.put(`/nucleo/secretarias/${id}`, data)
  },

  // Registra el colegio y luego su administrador inicial, con los campos que
  // exige el backend (Institucion: nombre + nit obligatorios; Usuario: nombres,
  // apellidos, email y credenciales). Si falla el admin, el colegio ya quedó creado.
  async registrarInstitucionConAdmin(f) {
    const { data: institucion } = await api.post('/nucleo/instituciones', {
      nombre: f.nombre.trim(),
      nit: f.nit.trim(),
      dane: f.dane?.trim() || undefined
    })
    try {
      await api.post(`/nucleo/instituciones/${institucion._id}/admin`, {
        nombres: f.adminNombres.trim(),
        apellidos: f.adminApellidos.trim(),
        email: f.adminEmail.trim(),
        credenciales: {
          usuario: f.adminEmail.trim(),
          passwordHash: f.adminPassword // el modelo Usuario la encripta al guardar
        }
      })
    } catch (e) {
      e.institucionCreada = institucion
      throw e
    }
    return institucion
  },

  // --- 1.1. Gestión de Personal de Secretaría ---
  crearSecretaria(data) {
    return api.post('/nucleo/secretarias', data)
  },

  listarSecretarias() {
    return api.get('/nucleo/secretarias')
  },

  // --- 2. Auto-registro (Solicitudes) ---
  listarSolicitudes() {
    return api.get('/nucleo/solicitudes')
  },

  aprobarSolicitud(id) {
    return api.put(`/nucleo/solicitudes/${id}/aprobar`)
  },

  rechazarSolicitud(id, motivo) {
    return api.put(`/nucleo/solicitudes/${id}/rechazar`, { motivo })
  },

  // --- 3. Estadísticas y Reportes ---
  obtenerEstadisticasGenerales() {
    return api.get('/nucleo/estadisticas')
  },

  obtenerEstadisticasPorInstitucion(institucionId) {
    return api.get(`/nucleo/estadisticas/${institucionId}`)
  },

  obtenerComparativo() {
    return api.get('/nucleo/comparativo')
  },

  obtenerReportePorTipo(tipo, params) {
    return api.get(`/nucleo/reportes/${tipo}`, { params })
  }
}