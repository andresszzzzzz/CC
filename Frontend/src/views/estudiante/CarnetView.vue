<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import { useAuthStore } from '@/stores/auth'
import estudianteService from '@/services/estudianteService'

const auth = useAuthStore()
const grupo = ref(null)
const anioCarnet = ref(null)

const cargarGrupo = async () => {
  try {
    const { data } = await estudianteService.obtenerMatriculas(auth.usuario?._id)
    const miMatricula = data.find((m) => m.estado === 'activa')
    grupo.value = miMatricula && typeof miMatricula.grupoId === 'object' ? miMatricula.grupoId : null
    anioCarnet.value =
      miMatricula && typeof miMatricula.anioAcademicoId === 'object'
        ? miMatricula.anioAcademicoId.anio ?? null
        : null
  } catch {
    grupo.value = null
    anioCarnet.value = null
  }
}

onMounted(cargarGrupo)
</script>

<template>
  <AppLayout>
    <template #header-title>
      <h2>Carnet Estudiantil 🎓</h2>
      <p>Tu identificación dentro de la institución.</p>
    </template>

    <div class="carnet">
      <div class="carnet-header">
        <div class="carnet-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h12M6 10h12"/></svg>
        </div>
        <div>
          <strong>{{ auth.colegio }}</strong>
          <span>Carnet Estudiantil<template v-if="anioCarnet"> {{ anioCarnet }}</template></span>
        </div>
      </div>

      <div class="carnet-body">
        <div class="carnet-foto">{{ auth.iniciales || 'ES' }}</div>

        <div class="carnet-datos">
          <h3>{{ auth.nombreCompleto || 'Estudiante' }}</h3>
          <p class="carnet-rol">Estudiante</p>

          <div class="detail-pill">
            <span class="detail-label">Documento</span>
            <span>{{ auth.usuario?.tipoDocumento }} {{ auth.usuario?.documento || '—' }}</span>
          </div>
          <div class="detail-pill">
            <span class="detail-label">Grupo</span>
            <span>{{ grupo?.nombre || '—' }}</span>
          </div>
          <div class="detail-pill">
            <span class="detail-label">Año académico</span>
            <span>{{ anioCarnet || '—' }}</span>
          </div>
        </div>

        <div class="carnet-codigo">
          <div class="carnet-qr"><AppIcon name="id-card" :size="30" /></div>
          <span>{{ auth.usuario?._id?.slice(-8) || '—' }}</span>
        </div>
      </div>
    </div>

    <p class="carnet-nota">Presenta este carnet (o su versión física) para ingresar a la institución.</p>
  </AppLayout>
</template>

<style scoped>
.carnet {
  background: white;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  max-width: 620px;
}

.carnet-header {
  background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%);
  color: white;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 14px;
}
.carnet-header strong { display: block; font-size: 14px; font-weight: 700; }
.carnet-header span { font-size: 11px; color: #bfdbfe; }

.carnet-logo {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 10px;
  border-radius: 10px;
  display: flex;
}

.carnet-body { padding: 24px; display: flex; gap: 24px; align-items: flex-start; }

.carnet-foto {
  width: 84px;
  height: 84px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1d4ed8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 24px;
  flex-shrink: 0;
}

.carnet-datos { flex: 1; display: flex; flex-direction: column; gap: 10px; }
.carnet-datos h3 { font-size: 17px; color: #0f172a; font-weight: 700; }
.carnet-rol { font-size: 12px; color: #64748b; margin-top: -6px; }

.detail-pill {
  background: #f8fafc;
  padding: 10px 12px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #334155;
  border: 1px solid #e2e8f0;
}
.detail-label { color: #64748b; font-weight: 600; }

.carnet-codigo { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.carnet-qr {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #1d4ed8;
  border-radius: 12px;
  padding: 16px;
  display: flex;
}
.carnet-codigo span { font-size: 10px; color: #94a3b8; }

.carnet-nota { font-size: 11px; color: #94a3b8; }

@media (max-width: 700px) {
  .carnet-body { flex-direction: column; align-items: center; text-align: center; }
}
</style>
