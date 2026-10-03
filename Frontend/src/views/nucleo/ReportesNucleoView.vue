<script setup>
import { ref, onMounted } from 'vue'
import nucleoService from '@/services/direccionNucleoService'

const colegios = ref([])
const filtro = ref({
  colegioId: '',
  tipoReporte: 'matricula'
})
const datosReporte = ref([])

const cargarColegiosParaFiltro = async () => {
  try {
    const respuesta = await nucleoService.listarInstituciones()
    colegios.value = respuesta.data
  } catch (error) {
    console.error('Error al cargar colegios para filtros:', error)
  }
}

const consultarReporte = async () => {
  try {
    const respuesta = await nucleoService.obtenerReportePorTipo(filtro.value.tipoReporte, {
      colegioId: filtro.value.colegioId
    })
    datosReporte.value = respuesta.data
  } catch (error) {
    console.error('Error al consultar reporte:', error)
  }
}

const generarReporteGlobal = () => {
  alert('Descargando reporte consolidado del núcleo...')
}

onMounted(() => {
  cargarColegiosParaFiltro()
})
</script>

<template>
  <div class="reportes-container">
    <!-- Cabecera de la vista -->
    <div style="margin-bottom: 2rem;">
      <h2 style="font-size: 1.875rem; font-weight: 800; color: #111827; margin: 0;">Reportes Consolidados del Núcleo 📊</h2>
      <p style="color: #6b7280; font-size: 0.875rem; margin-top: 0.25rem;">Generación de informes estadísticos macro y consolidados por institución.</p>
    </div>

    <!-- Filtros -->
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h3 style="font-size: 1.125rem; font-weight: 700; color: #111827; margin: 0;">Filtros de Generación</h3>
        <button @click="generarReporteGlobal" style="background: #eff6ff; color: #1d4ed8; border: none; padding: 0.375rem 0.75rem; border-radius: 9999px; cursor: pointer; font-size: 0.75rem; font-weight: 500;">
          Descargar Consolidado General
        </button>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; align-items: end;">
        <div>
          <label style="font-size: 0.75rem; color: #4b5563; display: block; margin-bottom: 0.25rem; font-weight: 600;">Seleccionar Institución</label>
          <select v-model="filtro.colegioId" style="width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; outline: none;">
            <option value="">Todas las instituciones (Global)</option>
            <option v-for="col in colegios" :key="col.id || col._id" :value="col.id || col._id">{{ col.nombre }}</option>
          </select>
        </div>
        <div>
          <label style="font-size: 0.75rem; color: #4b5563; display: block; margin-bottom: 0.25rem; font-weight: 600;">Tipo de Reporte Macro</label>
          <select v-model="filtro.tipoReporte" style="width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; outline: none;">
            <option value="matricula">Consolidado de Matrículas</option>
            <option value="asistencia">Promedios de Asistencia</option>
            <option value="docentes">Censo de Personal Docente</option>
          </select>
        </div>
        <div>
          <button @click="consultarReporte" style="width: 100%; background: #0f172a; color: white; border: none; padding: 0.55rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600; font-size: 0.875rem;">
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Resultados -->
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
      <h3 style="font-size: 1.125rem; font-weight: 700; color: #111827; margin: 0 0 1rem 0;">Vista previa del Reporte</h3>

      <table v-if="datosReporte && datosReporte.length > 0" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem;">
        <thead>
          <tr style="border-bottom: 1px solid #e5e7eb; color: #4b5563;">
            <th style="padding: 0.75rem 1rem;">Indicador / Métrica Macro</th>
            <th style="padding: 0.75rem 1rem; text-align: center;">Valor Consolidado</th>
            <th style="padding: 0.75rem 1rem; text-align: right;">Estado del Indicador</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in datosReporte" :key="index" style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 0.75rem 1rem; font-weight: 600; color: #1f2937;">{{ item.metrica }}</td>
            <td style="padding: 0.75rem 1rem; text-align: center;">
              <span style="background: #eff6ff; color: #1d4ed8; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500;">{{ item.valor }}</span>
            </td>
            <td style="padding: 0.75rem 1rem; text-align: right;">
              <span style="background: #ecfdf5; color: #047857; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500;">Óptimo</span>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else style="color: #6b7280; font-size: 0.875rem; margin: 0;">Selecciona los filtros y aplica la consulta para ver los resultados.</p>
    </div>
  </div>
</template>