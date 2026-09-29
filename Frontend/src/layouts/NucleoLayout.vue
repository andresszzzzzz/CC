<template>
  <div class="app-layout">
    <!-- BARRA LATERAL AZUL VIBRANTE -->
    <aside class="sidebar">
      <!-- Logo / Institución -->
      <div class="sidebar-brand">
        <div class="brand-icon">📚</div>
        <div class="brand-text">
          <span class="brand-title">EasyNotes</span>
          <span class="brand-sub">Dirección de Núcleo</span>
        </div>
      </div>

      <!-- Navegación lateral con categorías -->
      <nav class="sidebar-nav">
        <div class="nav-category">Principal</div>
        <router-link to="/nucleo/inicio" class="nav-item">
          <span class="nav-icon">🏠</span> Inicio
        </router-link>
        <router-link to="/nucleo/instituciones" class="nav-item">
          <span class="nav-icon">🏫</span> Instituciones
        </router-link>

        <div class="nav-category">Gestión</div>
        <router-link to="/nucleo/solicitudes" class="nav-item">
          <span class="nav-icon">📥</span> Solicitudes
        </router-link>
        <router-link to="/nucleo/reportes" class="nav-item">
          <span class="nav-icon">📊</span> Reportes
        </router-link>
      </nav>

      <!-- Botón Inferior -->
      <div class="sidebar-footer">
        <button class="logout-btn" @click="cerrarSesion">
          <span>🚪</span> Cerrar sesión
        </button>
      </div>
    </aside>

    <!-- CONTENEDOR PRINCIPAL -->
    <div class="main-wrapper">
      <!-- Barra Superior (Topbar) -->
      <header class="topbar">
        <div class="topbar-welcome">
          <h2>¡Hola, {{ primerNombre }}! 👋</h2>
          <p>Bienvenido a tu panel de dirección de núcleo.</p>
        </div>
        <div class="topbar-profile">
          <div class="notification-badge">🔔 <span class="badge-dot"></span></div>
          <div class="user-info">
            <span class="user-name">{{ nombre }}</span>
            <span class="user-role">Director de Núcleo</span>
          </div>
          <div class="user-avatar">{{ iniciales }}</div>
        </div>
      </header>

      <!-- Vista Dinámica -->
      <main class="content-area">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
// Bootstrap solo se carga con el portal de Núcleo (las vistas usan sus clases y modales);
// así no altera los estilos de los demás portales.
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

const router = useRouter()
const auth = useAuthStore()

const nombre = computed(() => auth.nombreCompleto || 'Director Núcleo')
const iniciales = computed(() => auth.iniciales || 'DN')
const primerNombre = computed(() => auth.usuario?.nombres?.split(' ')[0] || 'Director')

const cerrarSesion = () => {
  auth.cerrarSesion()
  router.push('/login')
}
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #f8fafc;
  font-family: system-ui, -apple-system, sans-serif;
}

/* Sidebar Estilo EasyNotes */
.sidebar {
  width: 260px;
  background-color: #1d4ed8; /* Azul vibrante */
  color: white;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.05);
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.brand-icon {
  background: white;
  color: #1d4ed8;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-weight: 700;
  font-size: 1rem;
}

.brand-sub {
  font-size: 0.75rem;
  color: #93c5fd;
}

.sidebar-nav {
  flex: 1;
  padding: 1.5rem 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-category {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #93c5fd;
  margin: 1rem 0 0.5rem 0.75rem;
  font-weight: 700;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #dbeafe;
  text-decoration: none;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-item:hover,
.nav-item.router-link-exact-active {
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
}

.nav-icon {
  font-size: 1rem;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  background: transparent;
  border: none;
  color: #dbeafe;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.2s;
}

.logout-btn:hover {
  background-color: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

/* Contenedor y Topbar */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.topbar {
  background: white;
  padding: 1.25rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.topbar-welcome h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.topbar-welcome p {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0.15rem 0 0 0;
}

.topbar-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.notification-badge {
  position: relative;
  font-size: 1.25rem;
  cursor: pointer;
  background: #f1f5f9;
  padding: 0.5rem;
  border-radius: 50%;
}

.badge-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background-color: #ef4444;
  border-radius: 50%;
}

.user-info {
  text-align: right;
}

.user-name {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
}

.user-role {
  display: block;
  font-size: 0.7rem;
  color: #64748b;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background-color: #f8fafc;
}
</style>