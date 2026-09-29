import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Login
import LoginView from '../views/LoginView.vue'

// Importación de vistas de la carpeta 'acudiente'
import InicioAcudiente from '../views/acudiente/InicioView.vue'
import CalificacionesAcudiente from '../views/acudiente/CalificacionesView.vue'
import AsistenciaAcudiente from '../views/acudiente/AsistenciaView.vue'
import HorarioAcudiente from '../views/acudiente/HorarioView.vue'
import ObservadorAcudiente from '../views/acudiente/ObservadorView.vue'
import ComunicadosAcudiente from '../views/acudiente/ComunicadosView.vue'

// Importación de vistas de la carpeta 'estudiante'
import InicioEstudiante from '../views/estudiante/InicioView.vue'
import CalificacionesEstudiante from '../views/estudiante/CalificacionesView.vue'
import AsistenciaEstudiante from '../views/estudiante/AsistenciaView.vue'
import AsignaturasEstudiante from '../views/estudiante/AsignaturasView.vue'
import TareasEstudiante from '../views/estudiante/TareasView.vue'
import MaterialEstudiante from '../views/estudiante/MaterialView.vue'
import HorarioEstudiante from '../views/estudiante/HorarioView.vue'
import ObservacionesEstudiante from '../views/estudiante/ObservacionesView.vue'
import BoletinesEstudiante from '../views/estudiante/BoletinesView.vue'
import CarnetEstudiante from '../views/estudiante/CarnetView.vue'
import ComunicadosEstudiante from '../views/estudiante/ComunicadosView.vue'
import MensajesEstudiante from '../views/estudiante/MensajesView.vue'

// Importación de vistas de la carpeta 'rector'
import InicioRector from '../views/rector/InicioView.vue'
import EstadisticasRector from '../views/rector/EstadisticasView.vue'
import DocentesRector from '../views/rector/DocentesView.vue'
import EstudiantesRector from '../views/rector/EstudiantesView.vue'
import CronogramaRector from '../views/rector/CronogramaView.vue'
import ComunicadosRector from '../views/rector/ComunicadosView.vue'
import EnConstruccionRector from '../views/rector/EnConstruccionView.vue'

const vistasSecretaria = {
  inicio: () => import('../views/secretaria/Inicio.vue'),
  estudiantes: () => import('../views/secretaria/Estudiantes.vue'),
  docentes: () => import('../views/secretaria/Docentes.vue'),
  acudientes: () => import('../views/secretaria/Acudientes.vue'),
  usuarios: () => import('../views/secretaria/Usuarios.vue'),
  grupos: () => import('../views/secretaria/Grupos.vue'),
  areas: () => import('../views/secretaria/Areas.vue')
}
const rutasSecretaria = Object.entries(vistasSecretaria).map(([ruta, component]) => ({
  path: `/secretaria/${ruta}`,
  name: `secretaria-${ruta}`,
  component,
  meta: { rol: 'secretaria' }
}))
const routes = [
  // --- Acceso ---
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { publica: true }
  },

  // --- Rutas de Acudiente ---
  {
    path: '/acudiente/inicio',
    name: 'acudiente-inicio',
    component: InicioAcudiente,
    meta: { rol: 'acudiente' }
  },
  {
    path: '/acudiente/calificaciones',
    name: 'acudiente-calificaciones',
    component: CalificacionesAcudiente,
    meta: { rol: 'acudiente' }
  },
  {
    path: '/acudiente/asistencia',
    name: 'acudiente-asistencia',
    component: AsistenciaAcudiente,
    meta: { rol: 'acudiente' }
  },
  {
    path: '/acudiente/horario',
    name: 'acudiente-horario',
    component: HorarioAcudiente,
    meta: { rol: 'acudiente' }
  },
  {
    path: '/acudiente/observador',
    name: 'acudiente-observador',
    component: ObservadorAcudiente,
    meta: { rol: 'acudiente' }
  },
  {
    path: '/acudiente/comunicados',
    name: 'acudiente-comunicados',
    component: ComunicadosAcudiente,
    meta: { rol: 'acudiente' }
  },

  // --- Rutas de Estudiante ---
  {
    path: '/estudiante/inicio',
    name: 'estudiante-inicio',
    component: InicioEstudiante,
    meta: { rol: 'estudiante' }
  },
  {
    path: '/estudiante/calificaciones',
    name: 'estudiante-calificaciones',
    component: CalificacionesEstudiante,
    meta: { rol: 'estudiante' }
  },
  {
    path: '/estudiante/asistencia',
    name: 'estudiante-asistencia',
    component: AsistenciaEstudiante,
    meta: { rol: 'estudiante' }
  },
  {
    path: '/estudiante/asignaturas',
    name: 'estudiante-asignaturas',
    component: AsignaturasEstudiante,
    meta: { rol: 'estudiante' }
  },
  {
    path: '/estudiante/tareas',
    name: 'estudiante-tareas',
    component: TareasEstudiante,
    meta: { rol: 'estudiante' }
  },
  {
    path: '/estudiante/material',
    name: 'estudiante-material',
    component: MaterialEstudiante,
    meta: { rol: 'estudiante' }
  },
  {
    path: '/estudiante/horario',
    name: 'estudiante-horario',
    component: HorarioEstudiante,
    meta: { rol: 'estudiante' }
  },
  {
    path: '/estudiante/observaciones',
    name: 'estudiante-observaciones',
    component: ObservacionesEstudiante,
    meta: { rol: 'estudiante' }
  },
  {
    path: '/estudiante/boletines',
    name: 'estudiante-boletines',
    component: BoletinesEstudiante,
    meta: { rol: 'estudiante' }
  },
  {
    path: '/estudiante/carnet',
    name: 'estudiante-carnet',
    component: CarnetEstudiante,
    meta: { rol: 'estudiante' }
  },
  {
    path: '/estudiante/comunicados',
    name: 'estudiante-comunicados',
    component: ComunicadosEstudiante,
    meta: { rol: 'estudiante' }
  },
  {
    path: '/estudiante/mensajes',
    name: 'estudiante-mensajes',
    component: MensajesEstudiante,
    meta: { rol: 'estudiante' }
  },

  // --- Rutas de Rector ---
  {
    path: '/rector/inicio',
    name: 'rector-inicio',
    component: InicioRector,
    meta: { rol: ['rector', 'admin'] }
  },
  {
    path: '/rector/estadisticas',
    name: 'rector-estadisticas',
    component: EstadisticasRector,
    meta: { rol: ['rector', 'admin'] }
  },
  {
    path: '/rector/academico/docentes',
    name: 'rector-docentes',
    component: DocentesRector,
    meta: { rol: ['rector', 'admin'] }
  },
  {
    path: '/rector/academico/estudiantes',
    name: 'rector-estudiantes',
    component: EstudiantesRector,
    meta: { rol: ['rector', 'admin'] }
  },
  {
    path: '/rector/academico/cronograma',
    name: 'rector-cronograma',
    component: CronogramaRector,
    meta: { rol: ['rector', 'admin'] }
  },
  {
    path: '/rector/comunicados',
    name: 'rector-comunicados',
    component: ComunicadosRector,
    meta: { rol: ['rector', 'admin'] }
  },
  {
    path: '/rector/documentos/boletines',
    name: 'rector-boletines',
    component: EnConstruccionRector,
    meta: {
      rol: ['rector', 'admin'],
      titulo: 'Boletines',
      subtitulo: 'Consulta y aprobación de boletines.',
      icono: 'file-text'
    }
  },
  {
    path: '/rector/administracion/bitacora',
    name: 'rector-bitacora',
    component: EnConstruccionRector,
    meta: {
      rol: ['rector', 'admin'],
      titulo: 'Bitácora',
      subtitulo: 'Registro de actividad del sistema.',
      icono: 'archive'
    }
  },
  {
    path: '/rector/administracion/cierre-anio',
    name: 'rector-cierre-anio',
    component: EnConstruccionRector,
    meta: {
      rol: ['rector', 'admin'],
      titulo: 'Cierre de Año',
      subtitulo: 'Cierre del año académico actual.',
      icono: 'archive'
    }
  },

  // --- Portal Docente (rol 'docente') ---
  {
    path: '/profesor/inicio',
    name: 'profesor-inicio',
    component: () => import('../views/profesor/ProfesorPage.vue'),
    meta: { rol: 'docente' }
  },

  // --- Portal Coordinador ---
  {
    path: '/coordinador/inicio',
    name: 'coordinador-inicio',
    component: () => import('../views/coordinador/CoordinadorPage.vue'),
    meta: { rol: 'coordinador' }
  },

  // --- Portal Secretaría (rol 'secretaria') ---
  ...rutasSecretaria,

  // --- Portal Dirección de Núcleo (rol 'dirNucleo') ---
  {
    path: '/nucleo',
    component: () => import('../layouts/NucleoLayout.vue'),
    meta: { rol: 'dirNucleo' },
    children: [
      { path: '', redirect: '/nucleo/inicio' },
      {
        path: 'inicio',
        name: 'nucleo-inicio',
        component: () => import('../views/nucleo/InicioNucleoView.vue')
      },
      {
        path: 'instituciones',
        name: 'nucleo-instituciones',
        component: () => import('../views/nucleo/InstitucionesView.vue')
      },
      {
        path: 'solicitudes',
        name: 'nucleo-solicitudes',
        component: () => import('../views/nucleo/SolicitudesView.vue')
      },
      {
        path: 'reportes',
        name: 'nucleo-reportes',
        component: () => import('../views/nucleo/ReportesNucleoView.vue')
      }
    ]
  },

  { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// Ruta de inicio para cada rol reconocido. Si auth.rol no es ninguno de
// estos (token viejo sin usuario válido, sesión corrupta, etc.) no hay
// un "inicio" seguro al que mandarlo: se limpia la sesión y va al login.
export const inicioPorRol = {
  estudiante: '/estudiante/inicio',
  acudiente: '/acudiente/inicio',
  rector: '/rector/inicio', // <-- NUEVO
  docente: '/profesor/inicio',
  coordinador: '/coordinador/inicio',
  secretaria: '/secretaria/inicio',
  dirNucleo: '/nucleo/inicio',
  admin: '/rector/inicio' // <-- NUEVO: el admin de colegio reutiliza el portal de Rector
}

// meta.rol puede ser un solo rol ('rector') o varios (['rector', 'admin'])
// cuando más de un rol comparte el mismo portal.
const rolPermitido = (metaRol, rolUsuario) =>
  Array.isArray(metaRol) ? metaRol.includes(rolUsuario) : metaRol === rolUsuario

// Exige sesión salvo en el login, y manda a cada usuario a su portal según el rol
router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (to.meta.publica) {
    if (!auth.estaAutenticado) return true
    const inicio = inicioPorRol[auth.rol]
    if (!inicio) {
      // Token presente pero rol inválido/desconocido: no hay a dónde mandarlo.
      auth.cerrarSesion()
      return true
    }
    // Nunca redirigir a la misma ruta a la que ya se va (evita el bucle infinito)
    return inicio === to.path ? true : inicio
  }

  if (!auth.estaAutenticado) {
    return '/login'
  }

  await auth.asegurarPerfil()

  const inicio = inicioPorRol[auth.rol]
  if (!inicio) {
    auth.cerrarSesion()
    return '/login'
  }

  if (to.meta.rol && !rolPermitido(to.meta.rol, auth.rol)) {
    return inicio === to.path ? true : inicio
  }

  return true
})

export default router