<script setup>
import { computed, ref, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import { useAuthStore } from '@/stores/auth'
import estudianteService from '@/services/estudianteService'
import {
  calcularPromedio,
  promediarPorAsignatura,
  clasificarNota,
  formatearFecha,
  etiquetaPlazo
} from '@/utils/academico'

const auth = useAuthStore()

const cargando = ref(true)
const error = ref('')

const promedioGeneral = ref(null)
const asignaturas = ref([])
const proximasTareas = ref([])
const comunicados = ref([])

const clasificacionGeneral = computed(() => clasificarNota(promedioGeneral.value))

const idDe = (valor) => (typeof valor === 'object' && valor !== null ? valor._id : valor)

const nombreDocente = (docente) => {
  if (!docente) return '—'
  return `${docente.nombres || ''} ${docente.apellidos || ''}`.trim() || '—'
}

const nombreAsignatura = (asig) => (typeof asig === 'object' && asig !== null ? asig.nombre : 'Asignatura')

const recorte = (texto, limite = 90) => {
  if (!texto) return ''
  return texto.length > limite ? texto.slice(0, limite).trim() + '…' : texto
}

const cargarDatos = async () => {
  cargando.value = true
  error.value = ''

  try {
    const estudianteId = auth.usuario?._id
    const institucionId = idDe(auth.usuario?.institucionId)

    // Cada petición ya viene filtrada por el backend: solo trae mis datos.
    const [{ data: matriculas }, { data: misCalificaciones }, { data: comunicadosTodos }] =
      await Promise.all([
        estudianteService.obtenerMatriculas(estudianteId),
        estudianteService.obtenerCalificaciones(estudianteId),
        estudianteService.obtenerComunicados(institucionId)
      ])

    // 1. Matrícula activa -> grupo actual
    const miMatricula = matriculas.find((m) => m.estado === 'activa')
    const miGrupoId = miMatricula ? idDe(miMatricula.grupoId) : null

    // 2. Promedio general y promedio por asignatura
    promedioGeneral.value = calcularPromedio(misCalificaciones)
    asignaturas.value = promediarPorAsignatura(misCalificaciones).sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    )

    // 3. Próximas tareas del grupo, ordenadas por fecha límite.
    //    Sin matrícula activa no hay grupo, así que no hay tareas que mostrar.
    if (miGrupoId) {
      const { data: actividadesGrupo } = await estudianteService.obtenerActividades({ grupoId: miGrupoId })
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      proximasTareas.value = actividadesGrupo
        .filter((t) => t.estado === 'activo' && !!t.fechaLimite && new Date(t.fechaLimite) >= hoy)
        .sort((a, b) => new Date(a.fechaLimite) - new Date(b.fechaLimite))
        .slice(0, 4)
    } else {
      proximasTareas.value = []
    }

    // 4. Últimos comunicados
    comunicados.value = comunicadosTodos
      .filter((c) => c.estado !== 'borrador')
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 3)
  } catch (e) {
    error.value = e.response?.data?.mensaje || 'No se pudo cargar la información del portal.'
  } finally {
    cargando.value = false
  }
}

onMounted(cargarDatos)
</script>

<template>
  <AppLayout>
    <template #header-title>
      <h2>¡Hola, {{ auth.usuario?.nombres || 'Estudiante' }}! 👋</h2>
      <p>Bienvenido a tu portal estudiantil.</p>
    </template>

    <div v-if="cargando" class="estado-carga">Cargando tu información…</div>
    <div v-else-if="error" class="estado-error">{{ error }}</div>

    <template v-else>
      <!-- MÉTRICAS PRINCIPALES -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div>
            <p class="metric-title">Promedio General</p>
            <h3 class="metric-val">{{ promedioGeneral ?? '—' }}</h3>
            <span v-if="promedioGeneral !== null" class="status-badge" :class="clasificacionGeneral.variante">
              {{ clasificacionGeneral.texto }}
            </span>
            <p v-else class="metric-sub">Aún no hay notas registradas</p>
          </div>
          <div class="metric-icon blue"><AppIcon name="clipboard-check" :size="18" /></div>
        </div>

        <div class="metric-card">
          <div>
            <p class="metric-title">Puesto en el Grupo</p>
            <h3 class="metric-val">—</h3>
            <p class="metric-sub">Aún no disponible</p>
          </div>
          <div class="metric-icon amber"><AppIcon name="star" :size="18" /></div>
        </div>

        <div class="metric-card">
          <div>
            <p class="metric-title">Asistencia General</p>
            <h3 class="metric-val">—</h3>
            <p class="metric-sub">Aún no disponible</p>
          </div>
          <div class="metric-icon green"><AppIcon name="calendar-check" :size="18" /></div>
        </div>

        <div class="metric-card">
          <div>
            <p class="metric-title">Tareas Próximas</p>
            <h3 class="metric-val">{{ proximasTareas.length }}</h3>
            <p class="metric-sub">Por entregar</p>
          </div>
          <div class="metric-icon purple"><AppIcon name="clipboard" :size="18" /></div>
        </div>
      </div>

      <!-- CONTENIDO EN DOS COLUMNAS -->
      <div class="content-grid">
        <div class="card-box">
          <div class="card-header-flex">
            <h3>Mis Asignaturas y Calificaciones</h3>
            <router-link to="/estudiante/calificaciones" class="link-blue">Ver todas</router-link>
          </div>

          <table v-if="asignaturas.length" class="custom-table">
            <thead>
              <tr>
                <th>Asignatura</th>
                <th>Docente</th>
                <th>Promedio</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in asignaturas" :key="a.asignaturaId">
                <td class="celda-fuerte">{{ a.nombre }}</td>
                <td>{{ nombreDocente(a.docente) }}</td>
                <td>{{ a.promedio ?? '—' }}</td>
                <td>
                  <span class="status-badge" :class="clasificarNota(a.promedio).variante">
                    {{ clasificarNota(a.promedio).texto }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="sin-datos">Todavía no tienes calificaciones registradas.</p>
        </div>

        <div class="card-box">
          <div class="card-header-flex">
            <h3>Próximas Tareas y Actividades</h3>
            <router-link to="/estudiante/tareas" class="link-blue">Ver todas</router-link>
          </div>

          <div v-if="proximasTareas.length" class="item-list">
            <div v-for="t in proximasTareas" :key="t._id" class="item-row">
              <div class="item-icon"><AppIcon name="clipboard" :size="16" /></div>
              <div class="item-body">
                <span class="item-title">{{ t.titulo }}</span>
                <span class="item-sub">{{ nombreAsignatura(t.asignaturaId) }}</span>
              </div>
              <div class="item-right">
                <span class="item-sub">{{ formatearFecha(t.fechaLimite) }}</span>
                <span class="status-badge" :class="etiquetaPlazo(t.fechaLimite).variante === 'muted' ? 'neutro' : etiquetaPlazo(t.fechaLimite).variante">
                  {{ etiquetaPlazo(t.fechaLimite).texto }}
                </span>
              </div>
            </div>
          </div>
          <p v-else class="sin-datos">No tienes tareas próximas por entregar.</p>
        </div>
      </div>

      <!-- COMUNICADOS -->
      <div class="card-box">
        <div class="card-header-flex">
          <h3>Últimos Comunicados</h3>
          <router-link to="/estudiante/comunicados" class="link-blue">Ver todos</router-link>
        </div>

        <div v-if="comunicados.length" class="item-list">
          <div v-for="c in comunicados" :key="c._id" class="item-row">
            <div class="item-icon"><AppIcon name="megaphone" :size="16" /></div>
            <div class="item-body">
              <span class="item-title">{{ c.asunto }}</span>
              <span class="item-sub">{{ recorte(c.mensaje) }}</span>
            </div>
            <span class="item-sub">{{ formatearFecha(c.fecha) }}</span>
          </div>
        </div>
        <p v-else class="sin-datos">No hay comunicados recientes.</p>
      </div>
    </template>
  </AppLayout>
</template>

<style scoped>
.item-list { display: flex; flex-direction: column; gap: 12px; }

.item-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.item-icon {
  background: #eff6ff;
  color: #2563eb;
  padding: 10px;
  border-radius: 8px;
  display: flex;
}

.item-body { flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.item-title { font-size: 13px; font-weight: 600; color: #0f172a; }
.item-sub { font-size: 11px; color: #64748b; }
.item-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
</style>
