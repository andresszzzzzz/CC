<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { inicioPorRol } from '@/router/routes'

const router = useRouter()
const auth = useAuthStore()

const usuarioOCorreo = ref('')
const password = ref('')
const cargando = ref(false)
const error = ref('')

const enviar = async () => {
  error.value = ''
  cargando.value = true
  try {
    const esCorreo = usuarioOCorreo.value.includes('@')
    const credenciales = esCorreo
      ? { email: usuarioOCorreo.value.trim(), password: password.value }
      : { usuario: usuarioOCorreo.value.trim(), password: password.value }

    await auth.iniciarSesion(credenciales)
    // Se usa el mapa inicioPorRol de routes.js (fuente única del destino por rol).
    // Antes se hacía router.push('/login') estando ya en /login: vue-router lo
    // trata como navegación duplicada y NO ejecuta el guard, por eso había que
    // recargar la página para entrar.
    router.push(inicioPorRol[auth.rol] || '/login')
  } catch (e) {
    error.value = e.response?.data?.mensaje || 'No se pudo iniciar sesión. Verifica tus datos.'
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="login-layout">
    <!-- PANEL DE MARCA -->
    <section class="brand-panel">
      <div class="brand-logo-lg">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h12M6 10h12"/></svg>
      </div>
      <h1>EasyNotes</h1>
      <p class="brand-sub">Sistema de gestión académica</p>
      <ul class="brand-list">
        <li>Calificaciones y observaciones al día</li>
        <li>Tareas y comunicados en un solo lugar</li>
        <li>Acceso para estudiantes y acudientes</li>
      </ul>
    </section>

    <!-- PANEL DE FORMULARIO -->
    <section class="form-panel">
      <div class="login-card">
        <h2>Iniciar sesión</h2>
        <p class="login-sub">Ingresa a tu portal académico.</p>

        <form class="login-form" @submit.prevent="enviar">
          <label class="field">
            <span>Usuario o correo</span>
            <input v-model="usuarioOCorreo" type="text" placeholder="usuario o correo@colegio.edu.co" required />
          </label>

          <label class="field">
            <span>Contraseña</span>
            <input v-model="password" type="password" placeholder="••••••••" required />
          </label>

          <p v-if="error" class="login-error">{{ error }}</p>

          <button type="submit" class="btn-primary" :disabled="cargando">
            {{ cargando ? 'Ingresando...' : 'Ingresar' }}
          </button>
        </form>

        <p class="login-help">¿Olvidaste tu contraseña? Comunícate con la institución.</p>

      </div>
    </section>
  </div>
</template>

<style scoped>
.login-layout {
  display: flex;
  width: 100vw;
  min-height: 100vh;
  background-color: #f1f5f9;
}

.brand-panel {
  width: 42%;
  background: linear-gradient(180deg, #1e40af 0%, #1d4ed8 100%);
  color: white;
  padding: 60px 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.brand-logo-lg {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.brand-panel h1 { font-size: 30px; font-weight: 800; }
.brand-sub { font-size: 13px; color: #bfdbfe; margin-top: 6px; }

.brand-list {
  list-style: none;
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.brand-list li {
  font-size: 13px;
  color: #dbeafe;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 12px 16px;
  border-radius: 12px;
}

.form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}

.login-card {
  background: white;
  width: 100%;
  max-width: 400px;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.login-card h2 { font-size: 19px; color: #0f172a; font-weight: 700; }
.login-sub { font-size: 12px; color: #64748b; margin-top: 2px; }

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}

.field { display: flex; flex-direction: column; gap: 6px; }
.field span { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; }
.field input {
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 13px;
  color: #0f172a;
  outline: none;
}
.field input:focus { border-color: #2563eb; background: white; }

.login-error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 12px;
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 13px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.btn-primary:disabled { opacity: 0.7; cursor: default; }

.login-help { font-size: 11px; color: #94a3b8; margin-top: 16px; text-align: center; }


@media (max-width: 900px) {
  .login-layout { flex-direction: column; }
  .brand-panel { width: 100%; padding: 32px 24px; }
  .brand-list { display: none; }
}
</style>
 