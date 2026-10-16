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
    colegios.value = resColegios.data || []

    try {
      const resSecs = await nucleoService.listarSecretarias()
      secretarias.value = resSecs.data || []
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
    adminPassword: '',
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
    <!-- Cabecera de la Vista -->
    <div class="header-section">
      <div>
        <h2 class="title">Gestión de Instituciones del Núcleo</h2>
        <p class="subtitle">Control y alta de colegios asignados, así como sus administradores iniciales.</p>
      </div>
      <div class="actions-row">
        <button @click="abrirModalCrearSecretaria" class="btn-secondary">+ Nueva Secretaría</button>
        <button @click="abrirModalCrearColegio" class="btn-primary">+ Registrar Nuevo Colegio</button>
      </div>
    </div>

    <!-- TARJETAS DE MÉTRICAS SUPERIORES -->
    <section class="tarjetas-resumen">
      <div class="tarjeta-stat">
        <div class="stat-icono stat-icono--azul"><i class="bi bi-building"></i></div>
        <div class="stat-cuerpo">
          <p class="stat-label">Instituciones Registradas</p>
          <h2 class="stat-valor">{{ colegios.length }}</h2>
        </div>
      </div>
      <div class="tarjeta-stat">
        <div class="stat-icono stat-icono--verde"><i class="bi bi-people"></i></div>
        <div class="stat-cuerpo">
          <p class="stat-label">Secretarías Activas</p>
          <h2 class="stat-valor">{{ secretarias.filter(s => s.estado !== 'inactivo').length }}</h2>
        </div>
      </div>
    </section>

    <!-- Estado de Carga -->
    <div v-if="cargando" class="estado-carga">
      Cargando información del núcleo...
    </div>

    <!-- CONTENIDO PRINCIPAL -->
    <template v-else>
      <!-- LISTADO DE INSTITUCIONES -->
      <section class="grupo-menu">
        <h3 class="seccion-titulo">Colegios Asociados</h3>
        <div v-if="colegios.length === 0" class="estado-carga">
          No hay instituciones registradas todavía.
        </div>
        <div v-else class="lista-menu">
          <div v-for="colegio in colegios" :key="colegio._id || colegio.id" class="item-menu-box">
            <div class="item-info-left">
              <span class="item-icono">🏫</span>
              <div class="item-textos">
                <b>{{ colegio.nombre }}</b>
                <small>NIT: {{ colegio.nit || 'N/D' }} — DANE: {{ colegio.codigoDane || 'No registrado' }} — Usuarios: {{ colegio.usuarios || 2 }}</small>
              </div>
            </div>
            <div class="item-acciones-right">
              <span :class="['badge', colegio.estado === 'inactivo' ? 'inactivo' : 'activo']">
                {{ colegio.estado === 'inactivo' ? 'Inactivo' : 'Activo' }}
              </span>
              <button @click="abrirModalEditarColegio(colegio)" class="btn-editar-link" title="Editar Institución">
                Editar
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- LISTADO DE SECRETARÍAS -->
      <section class="grupo-menu" style="margin-top: 2rem;">
        <h3 class="seccion-titulo">Personal de Secretaría Registrado</h3>
        <div v-if="secretarias.length === 0" class="estado-carga">
          No hay cuentas de secretaría registradas o cargadas todavía.
        </div>
        <div v-else class="lista-menu">
          <div v-for="sec in secretarias" :key="sec._id || sec.id" class="item-menu-box">
            <div class="item-info-left">
              <span class="item-icono amber">👤</span>
              <div class="item-textos">
                <b>{{ sec.nombre }}</b>
                <small>{{ sec.email }} — Tel: {{ sec.telefono || 'No registrado' }}</small>
              </div>
            </div>
            <div class="item-acciones-right">
              <span :class="['badge', sec.estado === 'inactivo' ? 'inactivo' : 'activo']">
                {{ sec.estado === 'inactivo' ? 'Inactivo' : 'Activo' }}
              </span>
              <button @click="abrirModalEditarSecretaria(sec)" class="btn-editar-link" title="Editar Perfil">
                Editar
              </button>
            </div>
          </div>
        </div>
      </section>
    </template>

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
  width: 100%;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 1.25rem;
  margin-bottom: 1.5rem;
}

.title { font-size: 1.35rem; font-weight: 800; color: #0f172a; margin: 0; }
.subtitle { font-size: 0.85rem; color: #64748b; margin-top: 0.2rem; }
.actions-row { display: flex; gap: 0.75rem; align-items: center; }

/* Tarjetas de Métricas */
.tarjetas-resumen {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.tarjeta-stat {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.03);
  border: 1px solid #e2e8f0;
  padding: 18px;
  display: flex;
  gap: 14px;
  align-items: center;
}

.stat-icono {
  width: 46px;
  height: 46px;
  min-width: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.stat-icono--azul { background: #dbeafe; color: #2563eb; }
.stat-icono--verde { background: #dcfce7; color: #16a34a; }
.stat-label { font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 2px; }
.stat-valor { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; }

.estado-carga {
  background: white;
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  color: #64748b;
  border: 1px solid #e2e8f0;
  font-size: 0.9rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

/* Estilo de filas y elementos modernos */
.grupo-menu { margin-bottom: 24px; }
.seccion-titulo { font-size: 16px; color: #0f172a; font-weight: 700; margin-bottom: 12px; }

.lista-menu {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-menu-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
}

.item-menu-box:hover {
  border-color: #93c5fd;
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.06);
}

.item-info-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.item-icono {
  background: #eff6ff;
  color: #2563eb;
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.item-icono.amber {
  background: #fef3c7;
  color: #d97706;
}

.item-textos b {
  display: block;
  font-size: 14.5px;
  color: #0f172a;
  margin-bottom: 3px;
}

.item-textos small {
  color: #64748b;
  font-size: 12.5px;
}

.item-acciones-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.3rem 0.8rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.badge.activo { background: #ecfdf5; color: #047857; }
.badge.inactivo { background: #fef2f2; color: #b91c1c; }

.btn-editar-link {
  background: #f8fafc;
  color: #1e293b;
  border: 1px solid #cbd5e1;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-editar-link:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #0f172a;
}

.btn-primary {
  background-color: #2563eb; color: white; border: none; padding: 10px 18px; border-radius: 12px; font-weight: 700; font-size: 13.5px; cursor: pointer; transition: background 0.2s;
}
.btn-primary:hover { background-color: #1d4ed8; }

.btn-secondary {
  background-color: white; color: #4b5563; border: 1px solid #cbd5e1; padding: 10px 18px; border-radius: 12px; font-weight: 600; font-size: 13.5px; cursor: pointer; transition: background 0.2s;
}
.btn-secondary:hover { background-color: #f8fafc; color: #1f2937; }

/* Modales */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 100; padding: 1rem;
}

.modal-content {
  background: white; border-radius: 16px; width: 100%; max-width: 480px; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); max-height: 90vh; overflow-y: auto;
}

.modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 16px; }
.modal-header h2 { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin: 0; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8; }

.form-grid { display: flex; flex-direction: column; gap: 12px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-group label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569; }
.form-group input, .form-select { border: 1px solid #cbd5e1; border-radius: 10px; padding: 9px 12px; font-size: 13.5px; outline: none; background: white; }
.form-group input:focus, .form-select:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; padding-top: 14px; border-top: 1px solid #f1f5f9; }
</style>