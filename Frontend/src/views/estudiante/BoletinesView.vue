<script setup>
import { ref, onMounted } from 'vue'
import { jsPDF } from 'jspdf'
import AppLayout from '@/layouts/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import { useAuthStore } from '@/stores/auth'
import estudianteService from '@/services/estudianteService'
import { promediarPorAsignatura, calcularPromedio, clasificarNota } from '@/utils/academico'

const auth = useAuthStore()

const cargando = ref(true)
const error = ref('')
const misCalificaciones = ref([])

const totalPeriodos = auth.usuario?.institucionId?.configuracion?.numeroPeriodos || 4
const periodos = Array.from({ length: totalPeriodos }, (_, i) => i + 1)

const idDe = (valor) => (typeof valor === 'object' && valor !== null ? valor._id : valor)

const calificacionesDelPeriodo = (p) => misCalificaciones.value.filter((c) => c.periodo === p)
const tieneNotas = (p) => calificacionesDelPeriodo(p).length > 0

const descargarBoletin = (periodo) => {
  const calificaciones = calificacionesDelPeriodo(periodo)
  const porAsignatura = promediarPorAsignatura(calificaciones).sort((a, b) => a.nombre.localeCompare(b.nombre))
  const promedioPeriodo = calcularPromedio(calificaciones)

  const doc = new jsPDF()
  const institucion = auth.usuario?.institucionId?.nombre || 'Institución Educativa'

  doc.setFontSize(16)
  doc.text(institucion, 14, 18)
  doc.setFontSize(12)
  doc.text(`Boletín de Calificaciones — Periodo ${periodo}`, 14, 27)

  doc.setFontSize(10)
  doc.text(`Estudiante: ${auth.nombreCompleto}`, 14, 38)

  let y = 52
  doc.setFont('helvetica', 'bold')
  doc.text('Asignatura', 14, y)
  doc.text('Docente', 90, y)
  doc.text('Nota', 150, y)
  doc.text('Estado', 170, y)
  doc.setFont('helvetica', 'normal')
  y += 4
  doc.line(14, y, 196, y)
  y += 6

  porAsignatura.forEach((a) => {
    const nota = calcularPromedio(a.calificaciones)
    const docente = a.docente ? `${a.docente.nombres || ''} ${a.docente.apellidos || ''}`.trim() : '—'
    doc.text(a.nombre, 14, y)
    doc.text(docente, 90, y)
    doc.text(String(nota ?? '—'), 150, y)
    doc.text(clasificarNota(nota).texto, 170, y)
    y += 7
  })

  y += 6
  doc.line(14, y, 196, y)
  y += 8
  doc.setFont('helvetica', 'bold')
  doc.text(`Promedio del periodo: ${promedioPeriodo ?? '—'}`, 14, y)

  doc.save(`boletin-periodo-${periodo}-${auth.usuario?.apellidos || 'estudiante'}.pdf`)
}

const cargarDatos = async () => {
  cargando.value = true
  error.value = ''
  try {
    const { data } = await estudianteService.obtenerCalificaciones(auth.usuario?._id)
    misCalificaciones.value = data.filter((c) => idDe(c.estudianteId) === auth.usuario?._id)
  } catch (e) {
    error.value = e.response?.data?.mensaje || 'No se pudieron cargar tus boletines.'
  } finally {
    cargando.value = false
  }
}

onMounted(cargarDatos)
</script>

<template>
  <AppLayout>
    <template #header-title>
      <h2>Boletines 📄</h2>
      <p>Descarga el informe académico de cada periodo.</p>
    </template>

    <div v-if="cargando" class="estado-carga">Cargando boletines…</div>
    <div v-else-if="error" class="estado-error">{{ error }}</div>

    <div v-else class="card-box">
      <div class="card-header-flex">
        <h3>Informes por periodo</h3>
      </div>

      <div class="boletines-list">
        <div v-for="p in periodos" :key="p" class="boletin-item">
          <div class="boletin-icon"><AppIcon name="file-text" :size="16" /></div>
          <div class="boletin-body">
            <strong>Boletín — Periodo {{ p }}</strong>
            <span>{{ tieneNotas(p) ? 'Disponible para descargar' : 'Sin calificaciones registradas todavía' }}</span>
          </div>
          <button class="btn-descargar" :disabled="!tieneNotas(p)" @click="descargarBoletin(p)">
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.boletines-list { display: flex; flex-direction: column; gap: 12px; }

.boletin-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.boletin-icon {
  background: #eff6ff;
  color: #2563eb;
  padding: 10px;
  border-radius: 8px;
  display: flex;
}

.boletin-body { flex: 1; display: flex; flex-direction: column; gap: 3px; }
.boletin-body strong { font-size: 13px; color: #0f172a; }
.boletin-body span { font-size: 11px; color: #64748b; }

.btn-descargar {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 10px 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.btn-descargar:disabled { background: #e2e8f0; color: #94a3b8; cursor: default; }
</style>
