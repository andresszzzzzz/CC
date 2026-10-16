// Llamadas de recuperación de contraseña al backend.
const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const llamar = async (ruta, body) => {
  const res = await fetch(`${API}/auth${ruta}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {})
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.mensaje || 'Ocurrió un error. Intenta de nuevo.')
  return data
}

export const recuperacion = {
  // Pantalla "¿Olvidaste tu contraseña?"
  solicitarPorCorreo: (email) => llamar('/recuperar-password', { email }),
  // Pantalla a la que llega el enlace del correo
  restablecer: (token, passwordNueva) => llamar('/restablecer-password', { token, passwordNueva })
}
