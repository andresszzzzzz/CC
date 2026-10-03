<script setup>
import { ref, onMounted } from 'vue'
import nucleoService from '@/services/direccionNucleoService'

const solicitudes = ref([])

const cargarSolicitudes = async () => {
  try {
    const respuesta = await nucleoService.listarSolicitudes()
    solicitudes.value = respuesta.data
  } catch (error) {
    console.error('Error al cargar solicitudes:', error)
  }
}

const gestionar = async (id, accion) => {
  try {
    if (accion === 'aprobar') {
      await nucleoService.aprobarSolicitud(id)
    } else if (accion === 'rechazar') {
      const motivo = prompt('Por favor, ingresa el motivo del rechazo:')
      if (motivo) await nucleoService.rechazarSolicitud(id, motivo)
    }
    cargarSolicitudes()
  } catch (error) {
    console.error(`Error al ${accion} la solicitud:`, error)
  }
}

onMounted(() => {
  cargarSolicitudes()
})
</script>

<template>
  <div class="solicitudes-container">
    <div style="margin-bottom: 2rem;">
      <h2 style="font-size: 1.875rem; font-weight: 800; color: #111827; margin: 0;">Solicitudes de Auto-registro 📥</h2>
      <p style="color: #6b7280; font-size: 0.875rem; margin-top: 0.25rem;">Aprueba o rechaza las solicitudes de nuevas instituciones que buscan unirse al núcleo.</p>
    </div>

    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h3 style="font-size: 1.125rem; font-weight: 700; color: #111827; margin: 0;">Bandeja de Solicitudes Pendientes</h3>
      </div>

      <table v-if="solicitudes && solicitudes.length > 0" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem; margin-top: 10px;">
        <thead>
          <tr style="border-bottom: 1px solid #e5e7eb; color: #4b5563;">
            <th style="padding: 0.75rem 1rem;">Institución Solicitante</th>
            <th style="padding: 0.75rem 1rem;">Código DANE</th>
            <th style="padding: 0.75rem 1rem;">Contacto / Correo</th>
            <th style="padding: 0.75rem 1rem;">Fecha</th>
            <th style="padding: 0.75rem 1rem;">Estado</th>
            <th style="padding: 0.75rem 1rem; text-align: right;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="solicitud in solicitudes" :key="solicitud.id || solicitud._id" style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 0.75rem 1rem; font-weight: 600; color: #1f2937;">{{ solicitud.nombreColegio }}</td>
            <td style="padding: 0.75rem 1rem; color: #4b5563;">{{ solicitud.codigoDane }}</td>
            <td style="padding: 0.75rem 1rem; color: #4b5563;">{{ solicitud.emailContacto }}</td>
            <td style="padding: 0.75rem 1rem; color: #4b5563;">{{ solicitud.fecha }}</td>
            <td style="padding: 0.75rem 1rem;">
              <span style="background: #fefce8; color: #a16207; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500;">Pendiente</span>
            </td>
            <td style="padding: 0.75rem 1rem; text-align: right;">
              <button @click="gestionar(solicitud.id || solicitud._id, 'aprobar')" style="background: #ecfdf5; color: #047857; border: none; padding: 0.25rem 0.75rem; border-radius: 0.375rem; cursor: pointer; font-size: 0.75rem; font-weight: 600; margin-right: 0.5rem;">
                Aprobar
              </button>
              <button @click="gestionar(solicitud.id || solicitud._id, 'rechazar')" style="background: #fef2f2; color: #b91c1c; border: none; padding: 0.25rem 0.75rem; border-radius: 0.375rem; cursor: pointer; font-size: 0.75rem; font-weight: 600;">
                Rechazar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else style="margin-top: 1rem; color: #6b7280; font-size: 0.875rem;">No hay solicitudes de auto-registro pendientes en este momento.</p>
    </div>
  </div>
</template>