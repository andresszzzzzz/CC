<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import { useAuthStore } from '@/stores/auth'
import { MENU_SECRETARIA } from '@/config/menuSecretaria'

const router = useRouter()
const auth = useAuthStore()

const isSidebarOpen = ref(true)
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// Menú lateral por rol. Editar aquí agrega o quita opciones del sidebar.
const menuAcudiente = [
  {
    titulo: 'General',
    items: [{ label: 'Inicio', icon: 'home', to: '/acudiente/inicio' }]
  },
  {
    titulo: 'Académico',
    items: [
      { label: 'Calificaciones', icon: 'book-open', to: '/acudiente/calificaciones' },
      { label: 'Asistencia', icon: 'calendar-check', to: '/acudiente/asistencia' },
      { label: 'Horario de Clases', icon: 'clock', to: '/acudiente/horario' }
    ]
  },
  {
    titulo: 'Seguimiento',
    items: [{ label: 'Observador Escolar', icon: 'file-text', to: '/acudiente/observador' }]
  },
  {
    titulo: 'Comunicación',
    items: [{ label: 'Comunicados', icon: 'megaphone', to: '/acudiente/comunicados' }]
  }
]

const menuEstudiante = [
  {
    titulo: 'General',
    items: [{ label: 'Inicio', icon: 'home', to: '/estudiante/inicio' }]
  },
  {
    titulo: 'Académico',
    items: [
      { label: 'Mis Calificaciones', icon: 'book-open', to: '/estudiante/calificaciones' },
      { label: 'Mi Asistencia', icon: 'calendar-check', to: '/estudiante/asistencia' },
      { label: 'Asignaturas', icon: 'book', to: '/estudiante/asignaturas' },
      { label: 'Tareas y Actividades', icon: 'clipboard', to: '/estudiante/tareas' },
      { label: 'Material de Apoyo', icon: 'folder', to: '/estudiante/material' },
      { label: 'Horario de Clases', icon: 'clock', to: '/estudiante/horario' }
    ]
  },
  {
    titulo: 'Seguimiento',
    items: [
      { label: 'Observaciones', icon: 'eye', to: '/estudiante/observaciones' },
      { label: 'Boletines', icon: 'file-text', to: '/estudiante/boletines' },
      { label: 'Carnet Estudiantil', icon: 'id-card', to: '/estudiante/carnet' }
    ]
  },
  {
    titulo: 'Comunicación',
    items: [
      { label: 'Comunicados', icon: 'megaphone', to: '/estudiante/comunicados' },
      { label: 'Mensajes', icon: 'mail', to: '/estudiante/mensajes' }
    ]
  }
]

// --- NUEVO: menú de Rector ---
const menuRector = [
  {
    titulo: 'General',
    items: [{ label: 'Inicio', icon: 'home', to: '/rector/inicio' }]
  },
  {
    titulo: 'Académico',
    items: [
      { label: 'Estadísticas Generales', icon: 'bar-chart', to: '/rector/estadisticas' },
      { label: 'Cronograma', icon: 'calendar-check', to: '/rector/academico/cronograma' },
      { label: 'Docentes', icon: 'users', to: '/rector/academico/docentes' },
      { label: 'Estudiantes', icon: 'users', to: '/rector/academico/estudiantes' }
    ]
  },
  {
    titulo: 'Documentos',
    items: [{ label: 'Boletines', icon: 'file-text', to: '/rector/documentos/boletines' }]
  },
  {
    titulo: 'Comunicación',
    items: [{ label: 'Comunicados', icon: 'megaphone', to: '/rector/comunicados' }]
  },
  {
    titulo: 'Administración',
    items: [
      { label: 'Bitácora', icon: 'archive', to: '/rector/administracion/bitacora' },
      { label: 'Cierre de Año', icon: 'archive', to: '/rector/administracion/cierre-anio' }
    ]
  }
]

// El menú de Secretaría (títulos, rutas e íconos) viene COMPLETO de config/menuSecretaria.js
const menuSecretaria = [
  { titulo: 'General', items: [{ label: 'Inicio', icon: 'home', to: '/secretaria/inicio' }] },
  ...MENU_SECRETARIA.map((g) => ({
    titulo: g.grupo,
    items: g.items.map((i) => ({ label: i.titulo, icon: i.icon || 'file-text', to: i.ruta }))
  }))
]

const menu = computed(() => {
  if (auth.rol === 'estudiante') return menuEstudiante
  // El admin de un colegio tiene, en el backend, permisos prácticamente
  // iguales a los de rector (mismo grupo "GESTION"), así que reutiliza
  // el mismo portal en vez de duplicar vistas.
  if (auth.rol === 'rector' || auth.rol === 'admin') return menuRector
  if (auth.rol === 'secretaria') return menuSecretaria
  return menuAcudiente
})
const rolTexto = computed(() => {
  if (auth.rol === 'estudiante') return 'Estudiante'
  if (auth.rol === 'rector') return 'Rector'
  if (auth.rol === 'admin') return 'Administrador'
  if (auth.rol === 'secretaria') return 'Secretaría'
  return 'Acudiente'
})

// --- Menú desplegable del usuario (arriba a la derecha) ---
const menuUsuarioAbierto = ref(false)
const perfilRef = ref(null)

const toggleMenuUsuario = () => {
  menuUsuarioAbierto.value = !menuUsuarioAbierto.value
}

// Cierra el menú al hacer clic fuera de él o al presionar Escape
const onClickFuera = (e) => {
  if (perfilRef.value && !perfilRef.value.contains(e.target)) {
    menuUsuarioAbierto.value = false
  }
}
const onTeclaEsc = (e) => {
  if (e.key === 'Escape') menuUsuarioAbierto.value = false
}
onMounted(() => {
  document.addEventListener('click', onClickFuera)
  document.addEventListener('keydown', onTeclaEsc)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onClickFuera)
  document.removeEventListener('keydown', onTeclaEsc)
})

const irAPerfil = () => {
  menuUsuarioAbierto.value = false
  router.push('/perfil')
}

const cerrarSesion = () => {
  menuUsuarioAbierto.value = false
  auth.cerrarSesion()
  router.push('/login')
}
</script>

<template>
  <div class="portal-layout">
    <!-- BARRA LATERAL DESPLEGABLE -->
    <aside :class="['sidebar', { 'collapsed': !isSidebarOpen }]">
      <div class="sidebar-top-content">
        <div class="sidebar-brand">
          <div class="brand-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h12M6 10h12"/></svg>
          </div>
          <div v-if="isSidebarOpen" class="brand-text-container">
            <h1>EasyNotes</h1>
            <p>{{ auth.colegio }}</p>
          </div>
        </div>

        <button class="toggle-btn" @click="toggleSidebar" :title="isSidebarOpen ? 'Contraer menú' : 'Expandir menú'">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>

        <div class="sidebar-menu">
          <div v-for="seccion in menu" :key="seccion.titulo" class="menu-section">
            <span v-if="isSidebarOpen" class="menu-title">{{ seccion.titulo }}</span>
            <router-link
              v-for="item in seccion.items"
              :key="item.to"
              :to="item.to"
              class="menu-item"
              :title="!isSidebarOpen ? item.label : ''"
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
          <!-- Slot para el encabezado/título de la página actual -->
          <slot name="header-title">
            <h2>Portal EasyNotes</h2>
            <p>Bienvenido al sistema de seguimiento escolar.</p>
          </slot>
        </div>

        <div class="user-nav-right">
          <div class="user-profile-wrapper" ref="perfilRef">
            <button
              type="button"
              class="user-profile"
              :class="{ open: menuUsuarioAbierto }"
              :aria-expanded="menuUsuarioAbierto"
              aria-haspopup="menu"
              @click="toggleMenuUsuario"
            >
              <div class="avatar-circle">{{ auth.iniciales || 'EN' }}</div>
              <div class="user-info">
                <span class="user-name">{{ auth.nombreCompleto || 'Invitado' }}</span>
                <span class="user-role">{{ rolTexto }}</span>
              </div>
              <svg class="user-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>

            <transition name="dropdown">
              <div v-if="menuUsuarioAbierto" class="user-dropdown" role="menu">
                <div class="dropdown-header">
                  <span class="dropdown-name">{{ auth.nombreCompleto || 'Invitado' }}</span>
                  <span class="dropdown-role">{{ rolTexto }}</span>
                </div>
                <button type="button" class="dropdown-item" role="menuitem" @click="irAPerfil">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span>Mi perfil</span>
                </button>
                <button type="button" class="dropdown-item logout" role="menuitem" @click="cerrarSesion">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </transition>
          </div>
        </div>
      </header>

      <main class="dashboard-content">
        <!-- AQUÍ SE RENDERIZA EL CONTENIDO DE CADA VISTA -->
        <slot></slot>
      </main>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}

.portal-layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  background-color: #f1f5f9;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #1e40af 0%, #1d4ed8 100%);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-shrink: 0;
  height: 100vh;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.08);
  z-index: 10;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.sidebar.collapsed { width: 80px; }
.sidebar-top-content { display: flex; flex-direction: column; overflow-y: auto; overflow-x: hidden; flex: 1; }

/* Oculta la barra de desplazamiento del menú lateral (el scroll con rueda/touch sigue funcionando) */
.sidebar-top-content { scrollbar-width: none; -ms-overflow-style: none; }
.sidebar-top-content::-webkit-scrollbar { display: none; }

.sidebar-brand {
  padding: 20px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  min-height: 80px;
}
.sidebar.collapsed .sidebar-brand { justify-content: center; padding: 20px 0; }
.brand-text-container { overflow: hidden; white-space: nowrap; }

.brand-logo {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  color: white;
  padding: 8px 10px;
  border-radius: 10px;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-brand h1 { font-size: 15px; font-weight: 700; }
.sidebar-brand p { font-size: 11px; color: #bfdbfe; }

.toggle-btn {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  padding: 8px;
  border-radius: 10px;
  cursor: pointer;
  margin: 16px 12px 0 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sidebar.collapsed .toggle-btn { margin: 16px auto 0 auto; width: 44px; }
.toggle-btn:hover { background: rgba(255, 255, 255, 0.25); }

.sidebar-menu { padding: 15px 12px; display: flex; flex-direction: column; gap: 16px; }
.menu-section { display: flex; flex-direction: column; gap: 6px; }
.menu-title { font-size: 10px; text-transform: uppercase; color: #93c5fd; font-weight: 700; letter-spacing: 0.8px; margin-bottom: 4px; padding-left: 8px; }

.menu-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
  color: #dbeafe;
  text-decoration: none;
  font-size: 13px;
  border-radius: 12px;
  transition: all 0.25s ease;
  white-space: nowrap;
}
.sidebar:not(.collapsed) .menu-item {
  justify-content: flex-start;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.menu-icon { font-size: 16px; display: flex; align-items: center; justify-content: center; }
.menu-item:hover { background: rgba(255, 255, 255, 0.15); color: white; }
.menu-item.router-link-active {
  background: rgba(255, 255, 255, 0.22) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.menu-text { margin-left: 12px; flex: 1; }

.main-container { flex: 1; display: flex; flex-direction: column; height: 100vh; overflow-y: auto; transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); }

.top-navbar {
  background: white;
  padding: 18px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  width: 100%;
  z-index: 5;
}
.welcome-text h2 { font-size: 19px; color: #0f172a; font-weight: 700; }
.welcome-text p { font-size: 12px; color: #64748b; margin-top: 2px; }

.user-nav-right { display: flex; align-items: center; }

.user-profile-wrapper { position: relative; }

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  background: transparent;
  border: 1px solid transparent;
  padding: 6px 10px;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s, border-color 0.2s;
}
.user-profile:hover,
.user-profile.open { background: #f1f5f9; border-color: #e2e8f0; }

.user-chevron { color: #64748b; transition: transform 0.2s; flex-shrink: 0; }
.user-profile.open .user-chevron { transform: rotate(180deg); }

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 220px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.12);
  padding: 6px;
  z-index: 20;
}
.dropdown-header {
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 6px;
}
.dropdown-name { font-size: 13px; font-weight: 700; color: #1e293b; }
.dropdown-role { font-size: 11px; color: #64748b; margin-top: 2px; }

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  color: #334155;
  transition: background 0.15s, color 0.15s;
}
.dropdown-item:hover { background: #f1f5f9; color: #0f172a; }
.dropdown-item.logout { color: #dc2626; }
.dropdown-item.logout:hover { background: #fef2f2; color: #b91c1c; }

.dropdown-enter-active, .dropdown-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-6px); }

.avatar-circle {
  width: 40px; height: 40px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: bold; font-size: 13px;
}
.user-info { display: flex; flex-direction: column; }
.user-name { font-size: 13px; font-weight: bold; color: #1e293b; }
.user-role { font-size: 11px; color: #64748b; }

.dashboard-content { padding: 30px; display: flex; flex-direction: column; gap: 24px; width: 100%; }
</style>