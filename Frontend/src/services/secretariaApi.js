import api from './api'

// CRUD estándar contra la API del backend (que a su vez habla con el cluster).
// El backend ya filtra por el colegio del token, pero igual se manda el
// institucionId desde las vistas para que las consultas sean explícitas.
const crud = (base) => ({
  listar: (params) => api.get(base, { params }),
  obtener: (id) => api.get(`${base}/${id}`),
  crear: (data) => api.post(base, data),
  actualizar: (id, data) => api.put(`${base}/${id}`, data),
  eliminar: (id) => api.delete(`${base}/${id}`)
})

const LIMITE_PAGINA = 100 // máximo que acepta el backend por página
const MAX_PAGINAS = 50

export const usuariosApi = {
  ...crud('/usuarios'),

  // Si la vista pide una página concreta (o un límite, ej. limite: 1 para
  // contar), se respeta tal cual. Si no, se traen TODAS las páginas para que
  // la tabla muestre a todos los usuarios y no solo los primeros 20.
  async listar(params = {}) {
    if (params.limite || params.pagina) return api.get('/usuarios', { params })

    const primera = await api.get('/usuarios', {
      params: { ...params, pagina: 1, limite: LIMITE_PAGINA }
    })
    const { usuarios = [], totalPaginas = 1, total = usuarios.length } = primera.data

    const pedidas = []
    for (let pagina = 2; pagina <= Math.min(totalPaginas, MAX_PAGINAS); pagina++) {
      pedidas.push(api.get('/usuarios', { params: { ...params, pagina, limite: LIMITE_PAGINA } }))
    }
    const resto = await Promise.all(pedidas)

    return {
      ...primera,
      data: { usuarios: [...usuarios, ...resto.flatMap((r) => r.data.usuarios || [])], total }
    }
  },

  resetearPassword: (id, passwordNueva) => api.put(`/usuarios/${id}/password`, { passwordNueva }),
  cambiarEstado: (id, estado) => api.put(`/usuarios/${id}/estado`, { estado })
}

export const gruposApi = crud('/grupos')
export const areasApi = crud('/areas')
export const sedesApi = crud('/sedes')
export const aniosApi = {
  ...crud('/anios-academicos'),
  porInstitucion: (institucionId) => api.get(`/anios-academicos/institucion/${institucionId}`)
}
