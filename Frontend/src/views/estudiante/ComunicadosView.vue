<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import estudianteService from '@/services/estudianteService'
import { useAuthStore } from '@/stores/auth'
import { formatearFecha } from '@/utils/academico'

const auth = useAuthStore()
const idDe = (valor) => (valor && typeof valor === 'object' ? valor._id : valor)

const cargando = ref(true)
const error = ref('')
const comunicados = ref([])

const cargarDatos = async () => {
  cargando.value = true
  error.value = ''
  try {
    const { data } = await estudianteService.obtenerComunicados(idDe(auth.usuario?.institucionId))
    comunicados.value = data
      .filter((c) => c.estado !== 'borrador')
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  } catch (e) {
    error.value = e.response?.data?.mensaje || 'No se pudieron cargar los comunicados.'
  } finally {
    cargando.value = false
  }
}

onMounted(cargarDatos)
</script>

<template>
  <AppLayout>
    <template #header-title>
      <h2>Comunicados y Circulares 📢</h2>
      <p>Avisos oficiales emitidos por el colegio.</p>
    </template>

    <div v-if="cargando" class="estado-carga">Cargando comunicados…</div>
    <div v-else-if="error" class="estado-error">{{ error }}</div>

    <div v-else class="card-box">
      <div class="card-header-flex">
        <h3>Todos los comunicados</h3>
      </div>

      <div v-if="comunicados.length" class="comunicados-list">
        <div v-for="c in comunicados" :key="c._id" class="comunicado-item">
          <div class="com-icon"><AppIcon name="megaphone" :size="16" /></div>
          <div class="com-body">
            <div class="com-header">
              <strong>{{ c.asunto }}</strong>
              <span class="com-fecha">{{ formatearFecha(c.fecha) }}</span>
            </div>
            <p class="com-texto">{{ c.mensaje }}</p>
          </div>
        </div>
      </div>

      <p v-else class="sin-datos">No hay comunicados por ahora.</p>
    </div>
  </AppLayout>
</template>

<style scoped>
.comunicados-list { display: flex; flex-direction: column; gap: 12px; }

.comunicado-item {
  display: flex;
  gap: 14px;
  padding: 14px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.com-icon {
  background: #eff6ff;
  color: #2563eb;
  padding: 10px;
  border-radius: 8px;
  height: fit-content;
  display: flex;
}

.com-body { flex: 1; }
.com-header { display: flex; justify-content: space-between; gap: 12px; font-size: 13px; color: #0f172a; }
.com-fecha { font-size: 11px; color: #64748b; white-space: nowrap; }
.com-texto { font-size: 12px; color: #64748b; margin-top: 6px; line-height: 1.6; }
</style>
