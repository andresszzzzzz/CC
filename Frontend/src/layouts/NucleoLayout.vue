<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const isSidebarOpen = ref(true)
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// --- CONTROL DEL MENÚ DESPLEGABLE DEL PERFIL ---
const mostrarMenuPerfil = ref(false)
const toggleMenuPerfil = () => {
  mostrarMenuPerfil.value = !mostrarMenuPerfil.value
}

// Cerrar el menú desplegable si se hace clic fuera de él
const cerrarMenuClickFuera = (e) => {
  if (!e.target.closest('.user-profile-container')) {
    mostrarMenuPerfil.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', cerrarMenuClickFuera)
})

onUnmounted(() => {
  document.removeEventListener('click', cerrarMenuClickFuera)
})

// --- CONTROL DEL MODAL DE PERFIL ---
const mostrarModalPerfil = ref(false)
const formPerfil = ref({
  nombre: auth.nombreCompleto || '',
  email: auth.email || '',
  telefono: auth.telefono || ''
})

const abrirPerfil = () => {
  mostrarMenuPerfil.value = false
  formPerfil.value = {
    nombre: auth.nombreCompleto || '',
    email: auth.email || '',
    telefono: auth.telefono || ''
  }
  mostrarModalPerfil.value = true
}

const guardarPerfil = async () => {
  try {
    // Aquí puedes realizar la llamada a tu API para actualizar los datos en el backend si lo deseas
    // await nucleoService.actualizarPerfil(formPerfil.value)
    
    // Actualizamos temporalmente el store de autenticación
    auth.nombreCompleto = formPerfil.value.nombre
    auth.email = formPerfil.value.email
    auth.telefono = formPerfil.value.telefono

    alert('¡Perfil actualizado correctamente!')
    mostrarModalPerfil.value = false
  } catch (error) {
    console.error('Error al actualizar el perfil:', error)
    alert('No se pudo actualizar el perfil.')
  }
}

const menuNucleo = [
  {
    titulo: 'Principal',
    items: [
      { label: 'Inicio', icon: 'home', to: '/nucleo' },
      { label: 'Instituciones', icon: 'building', to: '/nucleo/instituciones' }
    ]
  },
  {
    titulo: 'Gestión',
    items: [
      { label: 'Solicitudes', icon: 'inbox', to: '/nucleo/solicitudes' },
      { label: 'Reportes', icon: 'bar-chart-2', to: '/nucleo/reportes' }
    ]
  }
]

const cerrarSesion = () => {
  auth.cerrarSesion()
  router.push('/login')
}
</script>

<template>
  <div class="portal-layout">
    <!-- BARRA LATERAL DESPLEGABLE (Sin footer de cerrar sesión) -->
    <aside :class="['sidebar', { 'collapsed': !isSidebarOpen }]">
      <div class="sidebar-top-content">
        <div class="sidebar-brand">
          <div class="brand-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h12M6 10h12"/></svg>
          </div>
          <div v-if="isSidebarOpen" class="brand-text-container">
            <h1>EasyNotes</h1>
            <p>Dirección de Núcleo</p>
          </div>
        </div>

        <button class="toggle-btn" @click="toggleSidebar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>

        <div class="sidebar-menu">
          <div v-for="seccion in menuNucleo" :key="seccion.titulo" class="menu-section">
            <span v-if="isSidebarOpen" class="menu-title">{{ seccion.titulo }}</span>
            <router-link
              v-for="item in seccion.items"
              :key="item.to"
              :to="item.to"
              class="menu-item"
            >
              <span class="menu-icon"><AppIcon :name="item.icon" :size="18" /></span>
              <span v-if="isSidebarOpen" class="menu-text">{{ item.label }}</span>
            </router-link>
          </div>
        </div>
      </div>
    </aside>

    <!-- CONTENIDO PRINCIPAL -->
    <div class="main-container" :style="{ width: isSidebarOpen ? 'calc(100vw - 280px)' : 'calc(100vw - 80px)' }">
      <header class="top-navbar">
        <div class="welcome-text">
          <slot name="header-title">
            <h2>Panel de Dirección de Núcleo</h2>
            <p>Gestión centralizada de instituciones.</p>
          </slot>
        </div>

        <div class="user-nav-right">
          <!-- PERFIL CON MENÚ DESPLEGABLE -->
          <div class="user-profile-container">
            <div class="user-profile" @click="toggleMenuPerfil">
              <div class="avatar-circle">{{ auth.iniciales || 'DN' }}</div>
              <div class="user-info">
                <span class="user-name">{{ auth.nombreCompleto || 'Director' }}</span>
                <span class="user-role">Director de Núcleo</span>
              </div>
              <span class="dropdown-arrow">▼</span>
            </div>

            <!-- Menú desplegable flotante -->
            <div v-if="mostrarMenuPerfil" class="profile-dropdown-menu">
              <button @click="abrirPerfil" class="dropdown-item-custom">
                👤 Ver Perfil
              </button>
              <div class="dropdown-divider"></div>
              <button @click="cerrarSesion" class="dropdown-item-custom text-danger">
                🚪 Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main class="dashboard-content">
        <router-view />
      </main>
    </div>

    <!-- MODAL DE VER Y EDITAR PERFIL -->
    <div v-if="mostrarModalPerfil" class="modal-overlay" @click.self="mostrarModalPerfil = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Mi Perfil de Usuario</h2>
          <button @click="mostrarModalPerfil = false" class="close-btn">&times;</button>
        </div>

        <form @submit.prevent="guardarPerfil" class="form-grid">
          <div class="form-group">
            <label>Nombres Completos</label>
            <input v-model="formPerfil.nombre" type="text" required placeholder="Tu nombre completo" />
          </div>
          <div class="form-group">
            <label>Correo Electrónico</label>
            <input v-model="formPerfil.email" type="email" required placeholder="correo@ejemplo.com" />
          </div>
          <div class="form-group">
            <label>Número de Teléfono</label>
            <input v-model="formPerfil.telefono" type="text" placeholder="Ej. 3001234567" />
          </div>

          <div class="modal-actions">
            <button type="button" @click="mostrarModalPerfil = false" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos generales del layout corporativo */
.portal-layout { display: flex; width: 100vw; height: 100vh; background-color: #f1f5f9; overflow: hidden; font-family: 'Segoe UI', system-ui, sans-serif; }
.sidebar { width: 280px; background: linear-gradient(180deg, #1e40af 0%, #1d4ed8 100%); color: white; display: flex; flex-direction: column; justify-content: space-between; flex-shrink: 0; height: 100vh; box-shadow: 4px 0 15px rgba(0, 0, 0, 0.08); z-index: 10; transition: width 0.3s ease; overflow: hidden; }
.sidebar.collapsed { width: 80px; }
.sidebar-top-content { display: flex; flex-direction: column; overflow-y: auto; flex: 1; }
.sidebar-brand { padding: 20px 16px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.12); min-height: 80px; }
.brand-logo { background: rgba(255, 255, 255, 0.2); color: white; padding: 8px 10px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.sidebar-brand h1 { font-size: 15px; font-weight: 700; }
.sidebar-brand p { font-size: 11px; color: #bfdbfe; }
.toggle-btn { background: rgba(255, 255, 255, 0.15); border: none; color: white; padding: 8px; border-radius: 10px; cursor: pointer; margin: 16px 12px 0 12px; display: flex; align-items: center; justify-content: center; }
.sidebar-menu { padding: 15px 12px; display: flex; flex-direction: column; gap: 16px; }
.menu-section { display: flex; flex-direction: column; gap: 6px; }
.menu-title { font-size: 10px; text-transform: uppercase; color: #93c5fd; font-weight: 700; letter-spacing: 0.8px; margin-bottom: 4px; padding-left: 8px; }
.menu-item { display: flex; align-items: center; padding: 12px 16px; color: #dbeafe; text-decoration: none; font-size: 13px; border-radius: 12px; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.08); transition: all 0.25s ease; }
.menu-icon { font-size: 16px; display: flex; align-items: center; justify-content: center; }
.menu-item:hover { background: rgba(255, 255, 255, 0.15); color: white; }
.menu-text { margin-left: 12px; flex: 1; }

.main-container { flex: 1; display: flex; flex-direction: column; height: 100vh; overflow-y: auto; }
.top-navbar { background: white; padding: 18px 32px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); }
.welcome-text h2 { font-size: 19px; color: #0f172a; font-weight: 700; }
.welcome-text p { font-size: 12px; color: #64748b; margin-top: 2px; }

/* Estilos de la sección del perfil y menú desplegable */
.user-profile-container { position: relative; }
.user-profile { display: flex; align-items: center; gap: 12px; border-left: 1px solid #e2e8f0; padding-left: 20px; cursor: pointer; user-select: none; }
.user-profile:hover { opacity: 0.85; }
.avatar-circle { width: 40px; height: 40px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 13px; }
.user-info { display: flex; flex-direction: column; }
.user-name { font-size: 13px; font-weight: bold; color: #1e293b; }
.user-role { font-size: 11px; color: #64748b; }
.dropdown-arrow { font-size: 10px; color: #64748b; margin-left: 4px; }

/* Menú flotante */
.profile-dropdown-menu { position: absolute; top: calc(100% + 14px); right: 0; background: white; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); width: 170px; padding: 6px; z-index: 100; display: flex; flex-direction: column; gap: 4px; }
.dropdown-item-custom { background: none; border: none; width: 100%; text-align: left; padding: 9px 12px; font-size: 13px; font-weight: 600; color: #1e293b; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: background 0.2s; }
.dropdown-item-custom:hover { background: #f1f5f9; }
.dropdown-item-custom.text-danger { color: #dc2626; }
.dropdown-item-custom.text-danger:hover { background: #fef2f2; }
.dropdown-divider { height: 1px; background: #f1f5f9; margin: 4px 0; }

.dashboard-content { padding: 30px; display: flex; flex-direction: column; gap: 24px; width: 100%; background-color: #f8fafc; flex: 1; }

/* Estilos del Modal */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 1rem; }
.modal-content { background: white; border-radius: 16px; width: 100%; max-width: 460px; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 16px; }
.modal-header h2 { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin: 0; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8; }
.form-grid { display: flex; flex-direction: column; gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569; }
.form-group input { border: 1px solid #cbd5e1; border-radius: 10px; padding: 10px 12px; font-size: 13.5px; outline: none; background: white; }
.form-group input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; padding-top: 14px; border-top: 1px solid #f1f5f9; }
.btn-primary { background-color: #2563eb; color: white; border: none; padding: 10px 18px; border-radius: 12px; font-weight: 700; font-size: 13.5px; cursor: pointer; transition: background 0.2s; }
.btn-primary:hover { background-color: #1d4ed8; }
.btn-secondary { background-color: white; color: #4b5563; border: 1px solid #cbd5e1; padding: 10px 18px; border-radius: 12px; font-weight: 600; font-size: 13.5px; cursor: pointer; transition: background 0.2s; }
.btn-secondary:hover { background-color: #f8fafc; color: #1f2937; }
</style>