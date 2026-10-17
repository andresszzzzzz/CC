<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '@/components/AuthLayout.vue'
import { recuperacion } from '@/services/recuperacion'
import PasswordInput from '@/components/PasswordInput.vue'

const route = useRoute()
const router = useRouter()

// El enlace del correo es .../#/restablecer-password?token=XXXX
const token = computed(() => String(route.query.token || ''))
const password = ref('')
const confirmacion = ref('')
const cargando = ref(false)
const listo = ref(false)
const error = ref('')

const noCoinciden = computed(() => confirmacion.value && password.value !== confirmacion.value)
const invalido = computed(() => password.value.length < 6 || password.value !== confirmacion.value)

const guardar = async () => {
  error.value = ''
  cargando.value = true
  try {
    await recuperacion.restablecer(token.value, password.value)
    listo.value = true
    setTimeout(() => router.push('/login'), 2500)
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <h2>Crear nueva contraseña</h2>

    <template v-if="!token">
      <p class="login-error" style="margin-top: 16px">El enlace no es válido.</p>
      <p class="login-help"><router-link to="/recuperar-password" class="login-link">Solicitar uno nuevo</router-link></p>
    </template>

    <template v-else-if="listo">
      <p class="ok">¡Contraseña actualizada! Te llevamos al inicio de sesión...</p>
    </template>

    <template v-else>
      <p class="login-sub">Elige una contraseña de mínimo 6 caracteres.</p>
      <form class="login-form" @submit.prevent="guardar">
        <label class="field">
          <span>Nueva contraseña</span>
          <PasswordInput v-model="password" minlength="6" autocomplete="new-password" />
        </label>
        <label class="field">
          <span>Confirmar contraseña</span>
          <PasswordInput v-model="confirmacion" minlength="6" autocomplete="new-password" />
        </label>
        <p v-if="noCoinciden" class="login-error">Las contraseñas no coinciden.</p>
        <p v-if="error" class="login-error">
          {{ error }}
          <router-link to="/recuperar-password" class="login-link">Solicitar un enlace nuevo</router-link>
        </p>
        <button type="submit" class="btn-primary" :disabled="cargando || invalido">
          {{ cargando ? 'Guardando...' : 'Guardar contraseña' }}
        </button>
      </form>
    </template>
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
.ok { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; border-radius: 12px; padding: 12px; font-size: 12px; margin-top: 16px; }
.btn-primary { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; border: none; border-radius: 12px; padding: 13px; font-size: 13px; font-weight: 700; cursor: pointer; }
.btn-primary:disabled { opacity: 0.7; cursor: default; }
.login-help { margin-top: 20px; text-align: center; }
.login-link { color: #2563eb; font-weight: 600; font-size: 12px; text-decoration: none; }
.login-link:hover { text-decoration: underline; }
</style>
