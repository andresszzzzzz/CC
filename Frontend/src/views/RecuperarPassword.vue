<script setup>
import { ref } from 'vue'
import AuthLayout from '@/components/AuthLayout.vue'
import { recuperacion } from '@/services/recuperacion'

const email = ref('')
const cargando = ref(false)
const enviado = ref(false)
const error = ref('')

const enviar = async () => {
  error.value = ''
  cargando.value = true
  try {
    await recuperacion.solicitarPorCorreo(email.value.trim())
    enviado.value = true
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <h2>Recuperar contraseña</h2>

    <template v-if="enviado">
      <p class="login-sub">Revisa tu correo</p>
      <p class="ok">
        Si el correo corresponde a una cuenta activa, te enviamos un enlace para crear una nueva contraseña.
        Revisa también la carpeta de spam. El enlace vence en 1 hora.
      </p>
    </template>

    <template v-else>
      <p class="login-sub">Escribe el correo registrado en tu cuenta y te enviaremos un enlace.</p>
      <form class="login-form" @submit.prevent="enviar">
        <label class="field">
          <span>Correo electrónico</span>
          <input v-model="email" type="email" placeholder="correo@colegio.edu.co" required autocomplete="email" />
        </label>
        <p v-if="error" class="login-error">{{ error }}</p>
        <button type="submit" class="btn-primary" :disabled="cargando || !email">
          {{ cargando ? 'Enviando...' : 'Enviar enlace' }}
        </button>
      </form>
    </template>

    <p class="login-help"><router-link to="/login" class="login-link">← Volver al inicio de sesión</router-link></p>
  </AuthLayout>
</template>

<style scoped>
h2 { font-size: 19px; color: #0f172a; font-weight: 700; }
.login-sub { font-size: 12px; color: #64748b; margin-top: 2px; }
.login-form { display: flex; flex-direction: column; gap: 16px; margin-top: 24px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field span { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; }
.field input { border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 12px; padding: 12px 14px; font-size: 13px; color: #0f172a; outline: none; }
.field input:focus { border-color: #2563eb; background: white; }
.login-error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; border-radius: 12px; padding: 10px 12px; font-size: 12px; }
.ok { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; border-radius: 12px; padding: 12px; font-size: 12px; margin-top: 16px; line-height: 1.5; }
.btn-primary { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; border: none; border-radius: 12px; padding: 13px; font-size: 13px; font-weight: 700; cursor: pointer; }
.btn-primary:disabled { opacity: 0.7; cursor: default; }
.login-help { margin-top: 20px; text-align: center; }
.login-link { color: #2563eb; font-weight: 600; font-size: 12px; text-decoration: none; }
.login-link:hover { text-decoration: underline; }
</style>
