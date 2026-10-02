<script setup>
import { computed, onMounted } from 'vue'
import CrudView from './CrudView.vue'
import { aniosApi, periodosApi } from '@/services/secretariaApiExt'
import { useContextoInstitucional } from '@/composables/useContextoInstitucional'

const { cargarAnios } = useContextoInstitucional()

const columnas = [
  { key: 'anio', label: 'Año escolar' }, { key: 'fechaInicio', label: 'Inicio' }, { key: 'fechaFin', label: 'Fin' },
  { key: 'numeroPeriodos', label: 'Periodos' }, { key: 'esActual', label: '¿Año actual?' }, { key: 'estado', label: 'Estado' }
]
const campos = [
  { key: 'anio', label: 'Año escolar (ej. 2027)', type: 'number', required: true, min: 2000, max: 2100 },
  { key: 'fechaInicio', label: 'Fecha de inicio', type: 'date', required: true },
  { key: 'fechaFin', label: 'Fecha de finalización', type: 'date', required: true },
  { key: 'numeroPeriodos', label: '¿Cuántos periodos tendrá el año?', type: 'number', min: 1, max: 12, required: true },
  { key: 'esActual', label: '¿Es el año escolar actual?', type: 'select', opciones: [{ value: 'NO', label: 'No' }, { value: 'SI', label: 'Sí, usar como año actual' }] },
  { key: 'estado', label: 'Estado', type: 'select', opciones: [{ value: 'activo', label: 'Activo' }, { value: 'inactivo', label: 'Inactivo' }] }
]

function antesDeEnviar(p) {
  if (p.fechaFin && p.fechaInicio && p.fechaFin <= p.fechaInicio) throw new Error('La fecha de fin debe ser posterior a la de inicio.')
  return { estado: 'activo', esActual: 'NO', ...p, anio: Number(p.anio), numeroPeriodos: Number(p.numeroPeriodos) }
}

// Divide el año en N periodos iguales SOLO al crearlo. Después se ajustan en "Periodos académicos".
function repartir(inicio, fin, n) {
  const a = new Date(inicio).getTime(), b = new Date(fin).getTime(), paso = (b - a) / n
  const f = (t) => new Date(t).toISOString().slice(0, 10)
  return Array.from({ length: n }, (_, i) => ({ ini: f(a + paso * i + (i ? 86400000 : 0)), fin: f(a + paso * (i + 1)) }))
}

async function despuesDeGuardar(anio, fueEdicion, payload) {
  if (!fueEdicion && anio._id && payload.numeroPeriodos > 0) {
    const n = payload.numeroPeriodos
    const tramos = repartir(payload.fechaInicio, payload.fechaFin, n)
    for (let i = 0; i < n; i++) {
      await periodosApi.crear({
        institucionId: payload.institucionId, anioAcademicoId: anio._id, nombre: `Periodo ${i + 1}`, orden: i + 1,
        fechaInicio: tramos[i].ini, fechaFin: tramos[i].fin, estado: 'abierto', usaEnNotaFinal: 'SI', porcentaje: Math.round((100 / n) * 100) / 100
      })
    }
  }
  if (payload.esActual === 'SI' && anio._id) await aniosApi.marcarActual(anio._id) // el backend desmarca los demás
  await cargarAnios() // el año nuevo queda disponible en matrículas, estudiantes, docentes, notas y boletines
}
</script>

<template>
  <CrudView
    titulo="Año escolar"
    subtitulo="Crea el año escolar, elige cuál es el actual y define cuántos periodos tiene. Los periodos se crean automáticamente y luego puedes ajustar sus fechas."
    :recurso="aniosApi"
    :columnas="columnas"
    :campos="campos"
    :antes-de-enviar="antesDeEnviar"
    :despues-de-guardar="despuesDeGuardar"
    nombre-item="año escolar"
    titulo-eliminar="Eliminar año escolar"
    mensaje-eliminar="Solo elimina años sin matrículas ni notas. Si el año ya tiene información, márcalo como Inactivo en lugar de eliminarlo."
  />
</template>
