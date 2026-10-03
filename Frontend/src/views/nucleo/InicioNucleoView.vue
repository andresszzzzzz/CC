<script setup>
import { ref, onMounted } from 'vue'
import nucleoService from '@/services/direccionNucleoService'

const colegios = ref([])
const secretarias = ref([])
const cargando = ref(true)

// Control de Modales
const mostrarModalColegio = ref(false)
const mostrarModalSecretaria = ref(false)
const modoEdicion = ref(false)
const idItemActual = ref(null)

// Formularios
const formColegio = ref({
  nombre: '',
  codigoDane: '',
  adminNombre: '',
  adminEmail: '',
  adminPassword: '',
  estado: 'activo'
})

const formSecretaria = ref({
  nombre: '',
  email: '',
  password: '',
  telefono: '',
  estado: 'activo'
})

const cargarDatos = async () => {
  try {
    cargando.value = true
    const resColegios = await nucleoService.listarInstituciones()
    colegios.value = resColegios.data

    // Si implementaste listar secretarías en tu backend:
    try {
      const resSecs = await nucleoService.listarSecretarias()
      secretarias.value = resSecs.data
    } catch {
      secretarias.value = []
    }
  } catch (error) {
    console.error('Error al cargar datos del núcleo:', error)
  } finally {
    cargando.value = false
  }
}

// --- ACCIONES INSTITUCIONES ---
const abrirModalCrearColegio = () => {
  modoEdicion.value = false
  idItemActual.value = null
  formColegio.value = { nombre: '', codigoDane: '', adminNombre: '', adminEmail: '', adminPassword: '', estado: 'activo' }
  mostrarModalColegio.value = true
}

const abrirModalEditarColegio = (colegio) => {
  modoEdicion.value = true
  idItemActual.value = colegio._id || colegio.id
  formColegio.value = {
    nombre: colegio.nombre || '',
    codigoDane: colegio.codigoDane || '',
    adminNombre: colegio.adminNombre || '',
    adminEmail: colegio.adminEmail || colegio.adminInicialEmail || '',
    adminPassword: '', // Opcional o dejar vacío al editar
    estado: colegio.estado || 'activo'
  }
  mostrarModalColegio.value = true
}

const guardarColegio = async () => {
  try {
    if (modoEdicion.value) {
      await nucleoService.actualizarInstitucion(idItemActual.value, formColegio.value)
      alert('¡Institución actualizada correctamente!')
    } else {
      await nucleoService.crearInstitucion(formColegio.value)
      alert('¡Institución registrada con éxito!')
    }
    mostrarModalColegio.value = false
    cargarDatos()
  } catch (error) {
    console.error('Error al guardar institución:', error)
    alert(error.response?.data?.mensaje || 'Error al procesar la solicitud.')
  }
}

// --- ACCIONES SECRETARÍAS ---
const abrirModalCrearSecretaria = () => {
  modoEdicion.value = false
  idItemActual.value = null
  formSecretaria.value = { nombre: '', email: '', password: '', telefono: '', estado: 'activo' }
  mostrarModalSecretaria.value = true
}

const abrirModalEditarSecretaria = (sec) => {
  modoEdicion.value = true
  idItemActual.value = sec._id || sec.id
  formSecretaria.value = {
    nombre: sec.nombre || '',
    email: sec.email || '',
    password: '',
    telefono: sec.telefono || '',
    estado: sec.estado || 'activo'
  }
  mostrarModalSecretaria.value = true
}

const guardarSecretaria = async () => {
  try {
    if (modoEdicion.value) {
      await nucleoService.actualizarSecretaria(idItemActual.value, formSecretaria.value)
      alert('¡Perfil de secretaría actualizado correctamente!')
    } else {
      await nucleoService.crearSecretaria(formSecretaria.value)
      alert('¡Cuenta de secretaría creada con éxito!')
    }
    mostrarModalSecretaria.value = false
    cargarDatos()
  } catch (error) {
    console.error('Error al guardar secretaría:', error)
    alert(error.response?.data?.mensaje || 'Error al procesar la secretaría.')
  }
}

onMounted(() => {
  cargarDatos()
})
</script>

<template>
  <div class="nucleo-container">
    <!-- Cabecera -->
    <div class="header-section">
      <div>
        <h2 class="title">Gestión de Instituciones y Personal 🏫</h2>
        <p class="subtitle">Administra colegios, cuentas de secretaría, estados y edición de registros.</p>
      </div>
      <div class="actions-row">
        <button @click="abrirModalCrearSecretaria" class="btn-secondary">+ Nueva Secretaría</button>
        <button @click="abrirModalCrearColegio" class="btn-primary">+ Nueva Institución</button>
      </div>
    </div>

    <!-- Estado de Carga -->
    <div v-if="cargando" style="text-align: center; padding: 3rem; color: #64748b;">
      Cargando información del núcleo...
    </div>

    <!-- LISTADO DE INSTITUCIONES -->
    <div v-else>
      <h3 style="font-size: 1.125rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem;">Colegios Asociados</h3>
      <div class="grid-cards" style="margin-bottom: 2.5rem;">
        <div v-for="colegio in colegios" :key="colegio._id || colegio.id" class="card">
          <div class="card-header">
            <span class="icon">🏫</span>
            <span :class="['badge', colegio.estado === 'inactivo' ? 'inactivo' : 'activo']">
              {{ colegio.estado === 'inactivo' ? 'Inactivo' : 'Activo' }}
            </span>
          </div>
          <h3>{{ colegio.nombre }}</h3>
          <p class="subtitle">DANE: {{ colegio.codigoDane || 'No registrado' }}</p>
          
          <div class="card-footer">
            <p class="label">Admin inicial:</p>
            <p class="value">{{ colegio.adminEmail || colegio.adminInicialEmail || 'N/D' }}</p>
            <button @click="abrirModalEditarColegio(colegio)" class="btn-edit">✏️ Editar Institución</button>
          </div>
        </div>
      </div>

      <!-- LISTADO DE SECRETARÍAS -->
      <h3 style="font-size: 1.125rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem;">Personal de Secretaría Registrado</h3>
      <div v-if="secretarias.length === 0" style="background: white; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.5rem; text-align: center; color: #64748b; font-size: 0.875rem;">
        No hay cuentas de secretaría registradas o cargadas todavía.
      </div>
      <div v-else class="grid-cards">
        <div v-for="sec in secretarias" :key="sec._id || sec.id" class="card">
          <div class="card-header">
            <span class="icon" style="background: #fef3c7; color: #d97706;">👩‍💻</span>
            <span :class="['badge', sec.estado === 'inactivo' ? 'inactivo' : 'activo']">
              {{ sec.estado === 'inactivo' ? 'Inactivo' : 'Activo' }}
            </span>
          </div>
          <h3>{{ sec.nombre }}</h3>
          <p class="subtitle">{{ sec.email }}</p>
          
          <div class="card-footer">
            <p class="label">Teléfono: {{ sec.telefono || 'No registrado' }}</p>
            <button @click="abrirModalEditarSecretaria(sec)" class="btn-edit">✏️ Editar Perfil</button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: CREAR / EDITAR INSTITUCIÓN -->
    <div v-if="mostrarModalColegio" class="modal-overlay" @click.self="mostrarModalColegio = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ modoEdicion ? 'Editar Institución' : 'Registrar Nueva Institución' }}</h2>
          <button @click="mostrarModalColegio = false" class="close-btn">&times;</button>
        </div>

        <form @submit.prevent="guardarColegio" class="form-grid">
          <div class="form-group">
            <label>Nombre del Colegio</label>
            <input v-model="formColegio.nombre" type="text" required placeholder="Ej. Colegio San José" />
          </div>
          <div class="form-group">
            <label>Código DANE</label>
            <input v-model="formColegio.codigoDane" type="text" placeholder="Ej. 110010..." />
          </div>
          <div class="form-group">
            <label>Estado del Colegio</label>
            <select v-model="formColegio.estado" class="form-select">
              <option value="activo">Activo (Operativo)</option>
              <option value="inactivo">Inactivo (Suspendido / Retirado)</option>
            </select>
          </div>
          <div class="form-row" v-if="!modoEdicion">
            <div class="form-group">
              <label>Nombre Admin</label>
              <input v-model="formColegio.adminNombre" type="text" placeholder="Nombre" />
            </div>
            <div class="form-group">
              <label>Email Admin</label>
              <input v-model="formColegio.adminEmail" type="email" placeholder="correo@colegio.edu" />
            </div>
          </div>
          <div class="form-group" v-if="!modoEdicion">
            <label>Contraseña Inicial</label>
            <input v-model="formColegio.adminPassword" type="password" placeholder="••••••••" />
          </div>

          <div class="modal-actions">
            <button type="button" @click="mostrarModalColegio = false" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary">{{ modoEdicion ? 'Guardar Cambios' : 'Crear Institución' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL: CREAR / EDITAR SECRETARÍA -->
    <div v-if="mostrarModalSecretaria" class="modal-overlay" @click.self="mostrarModalSecretaria = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ modoEdicion ? 'Editar Cuenta de Secretaría' : 'Registrar Cuenta de Secretaría' }}</h2>
          <button @click="mostrarModalSecretaria = false" class="close-btn">&times;</button>
        </div>

        <form @submit.prevent="guardarSecretaria" class="form-grid">
          <div class="form-group">
            <label>Nombre Completo</label>
            <input v-model="formSecretaria.nombre" type="text" required placeholder="Ej. María Gómez" />
          </div>
          <div class="form-group">
            <label>Correo Electrónico (Acceso)</label>
            <input v-model="formSecretaria.email" type="email" required placeholder="secretaria@nucleo.edu" />
          </div>
          <div class="form-group">
            <label>Estado de la Cuenta</label>
            <select v-model="formSecretaria.estado" class="form-select">
              <option value="activo">Activo (Puede iniciar sesión)</option>
              <option value="inactivo">Inactivo (Acceso bloqueado)</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Teléfono</label>
              <input v-model="formSecretaria.telefono" type="text" placeholder="3001234567" />
            </div>
            <div class="form-group">
              <label>{{ modoEdicion ? 'Nueva Contraseña (Opcional)' : 'Contraseña' }}</label>
              <input v-model="formSecretaria.password" type="password" :required="!modoEdicion" placeholder="••••••••" />
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="mostrarModalSecretaria = false" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary">{{ modoEdicion ? 'Guardar Cambios' : 'Crear Cuenta' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nucleo-container {
  max-width: 1200px;
  margin: 0 auto;
}
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 1.25rem;
  margin-bottom: 2rem;
}
.title { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0; }
.subtitle { font-size: 0.875rem; color: #64748b; margin-top: 0.25rem; }
.actions-row { display: flex; gap: 0.75rem; }

.grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
.card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
.icon {
  background: #eff6ff; color: #2563eb; padding: 0.5rem; border-radius: 0.5rem; font-size: 1.25rem;
}
.badge {
  font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.75rem; border-radius: 9999px;
}
.badge.activo { background: #ecfdf5; color: #047857; }
.badge.inactivo { background: #fef2f2; color: #b91c1c; }

.card h3 { font-size: 1.125rem; font-weight: 700; color: #0f172a; margin: 0 0 0.25rem 0; }
.card .subtitle { font-size: 0.75rem; color: #94a3b8; margin: 0; }

.card-footer {
  margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 0.5rem;
}
.label { font-size: 0.75rem; color: #64748b; margin: 0; word-break: break-all; }
.value { font-size: 0.75rem; font-weight: 600; color: #0f172a; margin: 0; }

.btn-edit {
  background: #f8fafc; color: #0f172a; border: 1px solid #cbd5e1; padding: 0.35rem 0.75rem; border-radius: 0.375rem; font-size: 0.75rem; font-weight: 600; cursor: pointer; text-align: center; margin-top: 0.5rem; transition: background 0.2s;
}
.btn-edit:hover { background: #f1f5f9; }

.btn-primary {
  background-color: #2563eb; color: white; border: none; padding: 0.625rem 1.25rem; border-radius: 0.5rem; font-weight: 600; font-size: 0.875rem; cursor: pointer;
}
.btn-primary:hover { background-color: #1d4ed8; }
.btn-secondary {
  background-color: white; color: #4b5563; border: 1px solid #cbd5e1; padding: 0.625rem 1.25rem; border-radius: 0.5rem; font-weight: 500; font-size: 0.875rem; cursor: pointer;
}
.btn-secondary:hover { background-color: #f8fafc; }

/* Modales */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 100; padding: 1rem;
}
.modal-content {
  background: white; border-radius: 1rem; width: 100%; max-width: 500px; padding: 2rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); max-height: 90vh; overflow-y: auto;
}
.modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.75rem; margin-bottom: 1.5rem; }
.modal-header h2 { font-size: 1.125rem; font-weight: 700; color: #0f172a; margin: 0; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8; }
.form-grid { display: flex; flex-direction: column; gap: 1rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.35rem; }
.form-group label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: #475569; }
.form-group input, .form-select { border: 1px solid #cbd5e1; border-radius: 0.5rem; padding: 0.625rem 0.75rem; font-size: 0.875rem; outline: none; background: white; }
.form-group input:focus, .form-select:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; }
</style>