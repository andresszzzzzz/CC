import axios from 'axios'

// La app NUNCA se conecta a MongoDB directamente — eso solo lo hace el backend.
// El frontend solo habla HTTP con la API del backend (que a su vez consulta
// el cluster de Atlas). La URL se configura por variable de entorno para que
// funcione igual en local y en producción (Render).
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// El backend valida la sesión con "Authorization: Bearer <token>" (ver
// src/middlewares/auth.js del backend), así que el header debe llamarse
// exactamente así — no "x-token".
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Si el token expiró o es inválido, el backend responde 401. Limpiamos la
// sesión local y mandamos al login en vez de dejar la vista mostrando datos
// viejos o rotos.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      if (!window.location.hash.includes('/login')) {
        window.location.hash = '#/login'
      }
    }
    return Promise.reject(error)
  }
)

// Las imágenes se guardan como ruta relativa (ej. "/uploads/instituciones/123.png") y viven en el
// BACKEND, no en el frontend. Esta función le pone delante la dirección del backend para que el
// navegador las encuentre (si no, las busca en el dominio del frontend y salen rotas).
const origenApi = (() => {
  try { return new URL(baseURL).origin } catch { return '' }
})()

export function urlPublica(url) {
  if (!url) return ''
  if (/^(https?:|data:|blob:)/i.test(url)) return url
  return origenApi + (url.startsWith('/') ? url : '/' + url)
}

export default api
export { baseURL }