<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import { useAuthStore } from '@/stores/auth'
import rectorService from '@/services/rectorService'

const auth = useAuthStore()
const cargando = ref(true)
const error = ref('')

const totales = ref({
  estudiantes: null,
  docentes: null,
  grupos: null,
  promedioInstitucional: null,
  asistenciaGeneral: null
})

async function cargarResumen() {
  cargando.value = true
  error.value = ''
  try {
    const [resUsuarios, resGrupos, resCalificaciones, resAsistencia] = await Promise.allSettled([
      rectorService.obtenerUsuarios(),
      rectorService.obtenerGrupos(),
      rectorService.obtenerCalificaciones(),
      rectorService.obtenerAsistencia()
    ])

    if (resUsuarios.status === 'fulfilled') {
      const usuarios = resUsuarios.value.data.usuarios || resUsuarios.value.data || []
      totales.value.estudiantes = usuarios.filter(u => u.tipoPerfil === 'estudiante').length
      totales.value.docentes = usuarios.filter(u => u.tipoPerfil === 'docente').length
    }

    if (resGrupos.status === 'fulfilled') {
      const grupos = resGrupos.value.data.grupos || resGrupos.value.data || []
      totales.value.grupos = grupos.length
    }

    if (resCalificaciones.status === 'fulfilled') {
      const calificaciones = resCalificaciones.value.data.calificaciones || resCalificaciones.value.data || []
      const notas = calificaciones.map(c => c.nota).filter(n => typeof n === 'number')
      if (notas.length > 0) {
        totales.value.promedioInstitucional = (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1)
      }
    }

    if (resAsistencia.status === 'fulfilled') {
      const registros = resAsistencia.value.data.asistencia || resAsistencia.value.data || []
      if (registros.length > 0) {
        const puntos = registros.reduce((acc, r) => {
          if (r.estado === 'presente' || r.estado === 'excusa') return acc + 1
          if (r.estado === 'tardanza') return acc + 0.5
          return acc
        }, 0)
        totales.value.asistenciaGeneral = Math.round((puntos / registros.length) * 100)
      }
    }
  } catch (e) {
    console.error('Error al cargar el resumen del rector:', e)
    error.value = 'No se pudo cargar el resumen institucional desde el backend.'
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarResumen()
})
</script>

<template>
  <AppLayout>
    <template #header-title>
      <h2>¡Hola, {{ auth.usuario?.nombres || 'Rector' }}! 👋</h2>
      <p>Panorama general de {{ auth.colegio }}.</p>
    </template>

    <p v-if="cargando" class="estado-carga">Cargando panorama institucional...</p>
    <p v-else-if="error" class="estado-error">{{ error }}</p>

    <template v-else>
      <div class="metrics-grid">
        <div class="metric-card">
          <div>
            <p class="metric-title">Estudiantes</p>
            <h3 class="metric-val">{{ totales.estudiantes ?? '—' }}</h3>
            <p class="metric-sub">Matriculados</p>
          </div>
          <div class="metric-icon blue"><AppIcon name="users" :size="20" /></div>
        </div>
        <div class="metric-card">
          <div>
            <p class="metric-title">Docentes</p>
            <h3 class="metric-val">{{ totales.docentes ?? '—' }}</h3>
            <p class="metric-sub">Activos</p>
          </div>
          <div class="metric-icon green"><AppIcon name="book-open" :size="20" /></div>
        </div>
        <div class="metric-card">
          <div>
            <p class="metric-title">Grupos</p>
            <h3 class="metric-val">{{ totales.grupos ?? '—' }}</h3>
            <p class="metric-sub">Activos</p>
          </div>
          <div class="metric-icon purple"><AppIcon name="folder" :size="20" /></div>
        </div>
        <div class="metric-card">
          <div>
            <p class="metric-title">Promedio Institucional</p>
            <h3 class="metric-val">{{ totales.promedioInstitucional ?? '—' }}</h3>
            <p class="metric-sub">Todas las calificaciones registradas</p>
          </div>
          <div class="metric-icon amber"><AppIcon name="bar-chart" :size="20" /></div>
        </div>
        <div class="metric-card">
          <div>
            <p class="metric-title">Asistencia General</p>
            <h3 class="metric-val">{{ totales.asistenciaGeneral !== null ? totales.asistenciaGeneral + '%' : '—' }}</h3>
            <p class="metric-sub">Toda la institución</p>
          </div>
          <div class="metric-icon blue"><AppIcon name="calendar-check" :size="20" /></div>
        </div>
      </div>

      <div class="card-box" style="margin-top: 20px;">
        <div class="card-header-flex">
          <h3>Accesos rápidos</h3>
        </div>
        <div class="metrics-grid">
          <router-link to="/rector/estadisticas" class="metric-card" style="text-decoration:none; cursor:pointer;">
            <div>
              <p class="metric-title">Ver</p>
              <h3 class="metric-val" style="font-size:15px;">Estadísticas</h3>
            </div>
            <div class="metric-icon amber"><AppIcon name="bar-chart" :size="18" /></div>
          </router-link>
          <router-link to="/rector/academico/cronograma" class="metric-card" style="text-decoration:none; cursor:pointer;">
            <div>
              <p class="metric-title">Ver</p>
              <h3 class="metric-val" style="font-size:15px;">Cronograma</h3>
            </div>
            <div class="metric-icon purple"><AppIcon name="calendar-check" :size="18" /></div>
          </router-link>
          <router-link to="/rector/comunicados" class="metric-card" style="text-decoration:none; cursor:pointer;">
            <div>
              <p class="metric-title">Enviar</p>
              <h3 class="metric-val" style="font-size:15px;">Comunicado</h3>
            </div>
            <div class="metric-icon blue"><AppIcon name="megaphone" :size="18" /></div>
          </router-link>
        </div>
      </div>
    </template>
  </AppLayout>
</template>
