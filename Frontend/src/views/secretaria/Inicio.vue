<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import { useAuthStore } from '@/stores/auth'
import { useContextoInstitucional } from '@/composables/useContextoInstitucional'
import { usuariosApi, gruposApi } from '@/services/secretariaApi'

const auth = useAuthStore()
const { institucionId, anioActivo, cargarAnios } = useContextoInstitucional()

const cargando = ref(true)
const error = ref('')
const totalEstudiantes = ref(null)
const totalDocentes = ref(null)
const totalAcudientes = ref(null)
const totalGrupos = ref(null)

function contarUsuarios(data) {
  if (Array.isArray(data)) return data.length
  return data?.total ?? data?.usuarios?.length ?? 0
}

async function cargar() {
  if (!institucionId.value) {
    cargando.value = false
    return
  }
  cargando.value = true
  error.value = ''
  try {
    await cargarAnios()
    const [estudiantes, docentes, acudientes, grupos] = await Promise.all([
      usuariosApi.listar({ institucionId: institucionId.value, tipoPerfil: 'estudiante', estado: 'activo', limite: 1 }),
      usuariosApi.listar({ institucionId: institucionId.value, tipoPerfil: 'docente', estado: 'activo', limite: 1 }),
      usuariosApi.listar({ institucionId: institucionId.value, tipoPerfil: 'acudiente', estado: 'activo', limite: 1 }),
      gruposApi.listar({ institucionId: institucionId.value, estado: 'activo' })
    ])
    totalEstudiantes.value = contarUsuarios(estudiantes.data)
    totalDocentes.value = contarUsuarios(docentes.data)
    totalAcudientes.value = contarUsuarios(acudientes.data)
    totalGrupos.value = grupos.data.length
  } catch (e) {
    error.value = e.response?.data?.mensaje || 'No se pudo cargar la información de la institución.'
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)
watch(institucionId, cargar)
</script>

<template>
  <AppLayout>
    <template #header-title>
      <h2>Panel de Secretaría</h2>
      <p>{{ auth.colegio }} — {{ anioActivo ? `Año académico ${anioActivo.anio}` : 'Sin año académico activo' }}</p>
    </template>

    <div v-if="!institucionId" class="estado-carga">
      Tu usuario no tiene una institución asociada todavía.
    </div>
    <div v-else-if="cargando" class="estado-carga">Cargando…</div>
    <div v-else-if="error" class="estado-error">{{ error }}</div>

    <template v-else>
      <section class="tarjetas-resumen">
        <div class="tarjeta-stat">
          <div class="stat-icono stat-icono--azul"><AppIcon name="graduation-cap" :size="22" /></div>
          <div class="stat-cuerpo">
            <p class="stat-label">Estudiantes Activos</p>
            <h2 class="stat-valor">{{ totalEstudiantes }}</h2>
          </div>
        </div>
        <div class="tarjeta-stat">
          <div class="stat-icono stat-icono--morado"><AppIcon name="users" :size="22" /></div>
          <div class="stat-cuerpo">
            <p class="stat-label">Docentes Activos</p>
            <h2 class="stat-valor">{{ totalDocentes }}</h2>
          </div>
        </div>
        <div class="tarjeta-stat">
          <div class="stat-icono stat-icono--naranja"><AppIcon name="user-plus" :size="22" /></div>
          <div class="stat-cuerpo">
            <p class="stat-label">Acudientes Activos</p>
            <h2 class="stat-valor">{{ totalAcudientes }}</h2>
          </div>
        </div>
        <div class="tarjeta-stat">
          <div class="stat-icono stat-icono--verde"><AppIcon name="layers" :size="22" /></div>
          <div class="stat-cuerpo">
            <p class="stat-label">Grupos Activos</p>
            <h2 class="stat-valor">{{ totalGrupos }}</h2>
          </div>
        </div>
      </section>

      <div class="tarjeta aviso">
        <AppIcon name="alert-triangle" :size="18" />
        <p>
          Este panel muestra conteos reales tomados en vivo de tu institución. Módulos de Calificación,
          Contabilidad, Cronograma, Documentos, Elecciones y Estadísticas se están construyendo en los
          próximos pasos.
        </p>
      </div>
    </template>
  </AppLayout>
</template>

<style scoped>
.estado-carga, .estado-error {
  background: white; border-radius: 16px; padding: 40px; text-align: center; color: #64748b;
  border: 1px solid #f1f5f9;
}
.estado-error { color: #dc2626; }

.tarjetas-resumen {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}
.tarjeta-stat {
  background: white; border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.03);
  border: 1px solid #f1f5f9; padding: 16px; display: flex; gap: 12px; align-items: flex-start;
}
.stat-icono { width: 40px; height: 40px; min-width: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.stat-icono--azul { background: #dbeafe; color: #2563eb; }
.stat-icono--morado { background: #ede9fe; color: #7c3aed; }
.stat-icono--naranja { background: #ffedd5; color: #ea580c; }
.stat-icono--verde { background: #dcfce7; color: #16a34a; }
.stat-label { font-size: 12.5px; color: #64748b; font-weight: 600; margin-bottom: 3px; }
.stat-valor { font-size: 24px; font-weight: 800; color: #0f172a; }

.tarjeta {
  background: white; border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.03);
  border: 1px solid #f1f5f9; padding: 16px 18px;
}
.aviso { display: flex; gap: 10px; align-items: flex-start; color: #92400e; background: #fffbeb; border-color: #fde68a; }
.aviso p { font-size: 12.5px; line-height: 1.6; }
</style>
