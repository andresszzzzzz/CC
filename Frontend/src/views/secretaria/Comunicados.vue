<script setup>
import CrudView from './CrudView.vue'
import { comunicadosApi } from '@/services/secretariaApi'
import { formatearFecha } from '@/utils/academico'

const ROLES = { estudiante: 'Estudiantes', docente: 'Docentes', acudiente: 'Acudientes', coordinador: 'Coordinadores' }

// Sin destinatarios = toda la institución (así lo interpretan los portales de estudiante y acudiente).
function textoDestinatarios(lista) {
  if (!Array.isArray(lista) || !lista.length) return 'Toda la institución'
  const partes = lista.map((d) => (d.rol ? ROLES[d.rol] || d.rol : d.grupoId?.nombre ? `Grupo ${d.grupoId.nombre}` : 'Personas'))
  return [...new Set(partes)].join(', ')
}

const columnas = [
  { key: 'fecha', label: 'Fecha', format: (v) => formatearFecha(v) },
  { key: 'asunto', label: 'Asunto' },
  { key: 'destinatarios', label: 'Para', format: textoDestinatarios },
  { key: 'prioridad', label: 'Prioridad' },
  { key: 'estado', label: 'Estado' }
]

// La clave "destinatarios.0.rol" permite leer el rol actual al editar. El formulario la
// devuelve como objeto {0:{rol}}; aquí se convierte al arreglo que espera el backend.
const campos = [
  { key: 'asunto', label: 'Asunto', required: true },
  { key: 'prioridad', label: 'Prioridad', type: 'select',
    opciones: [{ value: 'normal', label: 'Normal' }, { value: 'urgente', label: 'Urgente' }] },
  { key: 'destinatarios.0.rol', label: 'Dirigido a', type: 'select',
    opciones: [{ value: 'todos', label: 'Toda la institución' }, ...Object.entries(ROLES).map(([value, label]) => ({ value, label }))] },
  { key: 'estado', label: 'Estado', type: 'select',
    opciones: [{ value: 'enviado', label: 'Enviado' }, { value: 'borrador', label: 'Borrador' }, { value: 'archivado', label: 'Archivado' }] },
  { key: 'mensaje', label: 'Mensaje', type: 'textarea', required: true }
]

function antesDeEnviar(payload) {
  const d = payload.destinatarios
  if (d && !Array.isArray(d)) {
    const rol = d['0']?.rol
    payload.destinatarios = rol && rol !== 'todos' ? [{ rol }] : []
  }
  return payload
}
</script>

<template>
  <CrudView
    titulo="Comunicados"
    subtitulo="Avisos a la comunidad educativa. El remitente es quien los envía."
    :recurso="comunicadosApi"
    :columnas="columnas"
    :campos="campos"
    :antes-de-enviar="antesDeEnviar"
    nombre-item="comunicado"
  />
</template>
