<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'
import authService from '@/services/authService'
import { useNotificacionesStore } from '@/stores/notificaciones'

const auth = useAuthStore()
const notif = useNotificacionesStore()

const ROLES = { estudiante: 'Estudiante', rector: 'Rector', admin: 'Administrador', secretaria: 'Secretaría', acudiente: 'Acudiente' }
const rolTexto = computed(() => ROLES[auth.rol] || 'Usuario')
const u = computed(() => auth.usuario || {})

const ultimoIngreso = computed(() => {
  const f = u.value.credenciales?.ultimoLogin
  return f ? new Date(f).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
})

/* ---------------- Datos personales ---------------- */
const CAMPOS = ['nombres', 'apellidos', 'email', 'telefono', 'direccion']
const form = reactive({ nombres: '', apellidos: '', email: '', telefono: '', direccion: '' })
const original = ref({})
const errores = reactive({})
const guardando = ref(false)

function cargarForm() {
  const d = {}
  CAMPOS.forEach((k) => { d[k] = u.value[k] || '' })
  Object.assign(form, d)
  original.value = { ...d }
  CAMPOS.forEach((k) => delete errores[k])
}
const hayCambios = computed(() => CAMPOS.some((k) => (form[k] || '').trim() !== (original.value[k] || '')))

function validarPerfil() {
  CAMPOS.forEach((k) => delete errores[k])
  if (!form.nombres.trim()) errores.nombres = 'Los nombres son obligatorios.'
  if (!form.apellidos.trim()) errores.apellidos = 'Los apellidos son obligatorios.'
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errores.email = 'Ingresa un correo válido.'
  return Object.keys(errores).length === 0
}

async function guardarPerfil() {
  if (!validarPerfil()) return
  guardando.value = true
  try {
    const payload = {}
    CAMPOS.forEach((k) => { payload[k] = form[k].trim() })
    await auth.actualizarPerfil(payload)
    cargarForm()
    notif.exito('Tus datos se actualizaron correctamente.', 'Perfil actualizado')
  } catch (e) {
    notif.error(e.response?.data?.mensaje || 'No se pudo actualizar el perfil.')
  } finally {
    guardando.value = false
  }
}

/* ---------------- Contraseña ---------------- */
const pw = reactive({ actual: '', nueva: '', confirmar: '' })
const ver = reactive({ actual: false, nueva: false, confirmar: false })
const cambiando = ref(false)

const fuerza = computed(() => {
  const p = pw.nueva
  if (!p) return 0
  let n = 0
  if (p.length >= 6) n++
  if (p.length >= 10) n++
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) n++
  if (/\d/.test(p)) n++
  if (/[^A-Za-z0-9]/.test(p)) n++
  return Math.min(4, Math.max(1, n - 1))
})
const FUERZA_TXT = ['', 'Débil', 'Regular', 'Buena', 'Fuerte']

const errorNueva = computed(() => {
  if (!pw.nueva) return ''
  if (pw.nueva.length < 6) return 'Debe tener al menos 6 caracteres.'
  if (pw.actual && pw.nueva === pw.actual) return 'Debe ser distinta a la actual.'
  return ''
})
const errorConfirmar = computed(() =>
  pw.confirmar && pw.confirmar !== pw.nueva ? 'Las contraseñas no coinciden.' : ''
)
const puedeCambiar = computed(
  () => pw.actual && pw.nueva && pw.confirmar && !errorNueva.value && !errorConfirmar.value
)

async function cambiarPassword() {
  if (!puedeCambiar.value) return
  cambiando.value = true
  try {
    await authService.cambiarPassword({ passwordActual: pw.actual, passwordNueva: pw.nueva })
    pw.actual = pw.nueva = pw.confirmar = ''
    notif.exito('Tu contraseña se cambió correctamente. Úsala la próxima vez que inicies sesión.', 'Contraseña actualizada')
  } catch (e) {
    notif.error(e.response?.data?.mensaje || 'No se pudo cambiar la contraseña.')
  } finally {
    cambiando.value = false
  }
}

onMounted(async () => {
  cargarForm()
  try { await auth.refrescarPerfil(); cargarForm() } catch { /* se queda con los datos locales */ }
})
</script>

<template>
  <AppLayout>
    <template #header-title>
      <h2>Mi perfil</h2>
      <p>Consulta y actualiza tus datos personales y tu contraseña.</p>
    </template>

    <!-- Tarjeta de identidad -->
    <section class="perfil-hero">
      <div class="hero-avatar">{{ auth.iniciales || 'EN' }}</div>
      <div class="hero-info">
        <h3>{{ auth.nombreCompleto || 'Usuario' }}</h3>
        <div class="hero-tags">
          <span class="tag tag-rol">{{ rolTexto }}</span>
          <span v-if="auth.colegio" class="tag">{{ auth.colegio }}</span>
        </div>
      </div>
      <div class="hero-meta">
        <span>Último ingreso</span>
        <strong>{{ ultimoIngreso }}</strong>
      </div>
    </section>

    <div class="perfil-grid">
      <!-- DATOS PERSONALES -->
      <form class="panel" novalidate @submit.prevent="guardarPerfil">
        <header class="panel-head">
          <h3>Datos personales</h3>
          <p>Puedes editar tu nombre y tus datos de contacto.</p>
        </header>

        <div class="campos">
          <label class="campo" :class="{ invalido: errores.nombres }">
            <span>Nombres</span>
            <input v-model="form.nombres" type="text" autocomplete="given-name" />
            <small v-if="errores.nombres">{{ errores.nombres }}</small>
          </label>
          <label class="campo" :class="{ invalido: errores.apellidos }">
            <span>Apellidos</span>
            <input v-model="form.apellidos" type="text" autocomplete="family-name" />
            <small v-if="errores.apellidos">{{ errores.apellidos }}</small>
          </label>
          <label class="campo campo-full" :class="{ invalido: errores.email }">
            <span>Correo electrónico</span>
            <input v-model="form.email" type="email" autocomplete="email" />
            <small v-if="errores.email">{{ errores.email }}</small>
          </label>
          <label class="campo">
            <span>Teléfono</span>
            <input v-model="form.telefono" type="tel" autocomplete="tel" />
          </label>
          <label class="campo">
            <span>Dirección</span>
            <input v-model="form.direccion" type="text" autocomplete="street-address" />
          </label>
        </div>

        <div class="solo-lectura">
          <p class="sl-titulo">Datos de la cuenta <em>(los administra la institución)</em></p>
          <dl>
            <div><dt>Documento</dt><dd>{{ u.tipoDocumento || '' }} {{ u.documento || '—' }}</dd></div>
            <div><dt>Usuario</dt><dd>{{ u.credenciales?.usuario || '—' }}</dd></div>
            <div><dt>Rol</dt><dd>{{ rolTexto }}</dd></div>
            <div><dt>Institución</dt><dd>{{ auth.colegio || '—' }}</dd></div>
          </dl>
        </div>

        <footer class="acciones">
          <button type="button" class="btn btn-sec" :disabled="!hayCambios || guardando" @click="cargarForm">Descartar</button>
          <button type="submit" class="btn btn-pri" :disabled="!hayCambios || guardando">
            {{ guardando ? 'Guardando…' : 'Guardar cambios' }}
          </button>
        </footer>
      </form>

      <!-- SEGURIDAD -->
      <form class="panel" novalidate @submit.prevent="cambiarPassword">
        <header class="panel-head">
          <h3>Seguridad</h3>
          <p>Cambia tu contraseña de acceso.</p>
        </header>

        <div class="campos campos-1">
          <label class="campo">
            <span>Contraseña actual</span>
            <div class="pw-wrap">
              <input v-model="pw.actual" :type="ver.actual ? 'text' : 'password'" autocomplete="current-password" />
              <button type="button" class="ojo" @click="ver.actual = !ver.actual">{{ ver.actual ? 'Ocultar' : 'Ver' }}</button>
            </div>
          </label>

          <label class="campo" :class="{ invalido: errorNueva }">
            <span>Nueva contraseña</span>
            <div class="pw-wrap">
              <input v-model="pw.nueva" :type="ver.nueva ? 'text' : 'password'" autocomplete="new-password" />
              <button type="button" class="ojo" @click="ver.nueva = !ver.nueva">{{ ver.nueva ? 'Ocultar' : 'Ver' }}</button>
            </div>
            <div v-if="pw.nueva" class="fuerza">
              <div class="barras">
                <i v-for="n in 4" :key="n" :class="{ on: n <= fuerza, [`nivel-${fuerza}`]: n <= fuerza }"></i>
              </div>
              <span>{{ FUERZA_TXT[fuerza] }}</span>
            </div>
            <small v-if="errorNueva">{{ errorNueva }}</small>
          </label>

          <label class="campo" :class="{ invalido: errorConfirmar }">
            <span>Confirmar nueva contraseña</span>
            <div class="pw-wrap">
              <input v-model="pw.confirmar" :type="ver.confirmar ? 'text' : 'password'" autocomplete="new-password" />
              <button type="button" class="ojo" @click="ver.confirmar = !ver.confirmar">{{ ver.confirmar ? 'Ocultar' : 'Ver' }}</button>
            </div>
            <small v-if="errorConfirmar">{{ errorConfirmar }}</small>
          </label>
        </div>

        <ul class="consejos">
          <li>Mínimo 6 caracteres; mejor si combinas mayúsculas, números y símbolos.</li>
          <li>No uses la misma contraseña de otros sitios.</li>
        </ul>

        <footer class="acciones">
          <button type="submit" class="btn btn-pri" :disabled="!puedeCambiar || cambiando">
            {{ cambiando ? 'Actualizando…' : 'Cambiar contraseña' }}
          </button>
        </footer>
      </form>
    </div>
  </AppLayout>
</template>

<style scoped>
.perfil-hero {
  display: flex; align-items: center; gap: 18px; flex-wrap: wrap;
  background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); color: white;
  border-radius: 16px; padding: 22px 26px; box-shadow: 0 6px 18px rgba(37, 99, 235, 0.22);
}
.hero-avatar {
  width: 64px; height: 64px; border-radius: 50%; flex-shrink: 0;
  background: rgba(255, 255, 255, 0.2); border: 2px solid rgba(255, 255, 255, 0.45);
  display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 700;
}
.hero-info { flex: 1; min-width: 200px; }
.hero-info h3 { font-size: 19px; font-weight: 700; margin: 0 0 8px; }
.hero-tags { display: flex; gap: 8px; flex-wrap: wrap; }
.tag { background: rgba(255, 255, 255, 0.16); border-radius: 999px; padding: 4px 12px; font-size: 12px; font-weight: 600; }
.tag-rol { background: white; color: #1d4ed8; }
.hero-meta { display: flex; flex-direction: column; text-align: right; font-size: 12px; color: #bfdbfe; }
.hero-meta strong { color: white; font-size: 13px; margin-top: 2px; }

.perfil-grid { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 20px; align-items: start; }
@media (max-width: 1000px) { .perfil-grid { grid-template-columns: 1fr; } .hero-meta { text-align: left; } }

.panel { background: white; border: 1px solid #f1f5f9; border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04); padding: 24px; }
.panel-head h3 { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0; }
.panel-head p { font-size: 12.5px; color: #64748b; margin: 4px 0 18px; }

.campos { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.campos-1 { grid-template-columns: 1fr; }
.campo-full { grid-column: 1 / -1; }
@media (max-width: 600px) { .campos { grid-template-columns: 1fr; } }

.campo { display: flex; flex-direction: column; gap: 6px; }
.campo > span { font-size: 12.5px; font-weight: 600; color: #334155; }
.campo input {
  width: 100%; border: 1px solid #cbd5e1; border-radius: 10px; padding: 10px 12px;
  font: inherit; font-size: 13.5px; color: #0f172a; background: white; transition: border-color 0.15s, box-shadow 0.15s;
}
.campo input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.18); }
.campo small { font-size: 12px; color: #dc2626; }
.campo.invalido input { border-color: #f87171; }

.pw-wrap { position: relative; }
.pw-wrap input { padding-right: 70px; }
.ojo { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #2563eb; font-size: 12px; font-weight: 600; cursor: pointer; padding: 4px 6px; }

.fuerza { display: flex; align-items: center; gap: 10px; font-size: 12px; color: #64748b; }
.barras { display: flex; gap: 4px; flex: 1; }
.barras i { flex: 1; height: 5px; border-radius: 3px; background: #e2e8f0; }
.barras i.nivel-1 { background: #ef4444; }
.barras i.nivel-2 { background: #f59e0b; }
.barras i.nivel-3 { background: #84cc16; }
.barras i.nivel-4 { background: #16a34a; }

.solo-lectura { margin-top: 22px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; }
.sl-titulo { font-size: 12px; font-weight: 700; color: #475569; margin: 0 0 10px; }
.sl-titulo em { font-weight: 400; color: #94a3b8; }
.solo-lectura dl { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 16px; margin: 0; }
.solo-lectura dt { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.4px; }
.solo-lectura dd { font-size: 13px; color: #1e293b; font-weight: 600; margin: 2px 0 0; word-break: break-word; }

.consejos { margin: 16px 0 0; padding-left: 18px; font-size: 12px; color: #64748b; line-height: 1.7; }

.acciones { display: flex; justify-content: flex-end; gap: 10px; margin-top: 22px; padding-top: 18px; border-top: 1px solid #f1f5f9; }
.btn { border-radius: 10px; padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid transparent; transition: all 0.15s; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-pri { background: #2563eb; color: white; }
.btn-pri:hover:not(:disabled) { background: #1d4ed8; }
.btn-sec { background: white; border-color: #cbd5e1; color: #475569; }
.btn-sec:hover:not(:disabled) { background: #f8fafc; }
</style>