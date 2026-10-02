<script setup>
import { computed, onMounted, watch } from 'vue'
import CrudView from './CrudView.vue'
import { periodosApi } from '@/services/secretariaApiExt'
import { useCatalogos } from '@/composables/useCatalogos'

const { cargar, opc, institucionId } = useCatalogos()
onMounted(() => cargar('anios'))
watch(institucionId, () => cargar('anios'))

const columnas = [
  { key: 'orden', label: 'Orden' }, { key: 'nombre', label: 'Periodo' }, { key: 'fechaInicio', label: 'Inicio' },
  { key: 'fechaFin', label: 'Fin' }, { key: 'porcentaje', label: '% nota final' }, { key: 'usaEnNotaFinal', label: 'Cuenta en nota final' }, { key: 'estado', label: 'Estado' }
]
const campos = computed(() => [
  { key: 'anioAcademicoId', label: 'Año escolar', type: 'select', required: true, opciones: opc('anios', (a) => String(a.anio)) },
  { key: 'nombre', label: 'Nombre del periodo', required: true, placeholder: 'ej. Periodo 1' },
  { key: 'orden', label: 'Orden', type: 'number', min: 1, required: true },
  { key: 'fechaInicio', label: 'Fecha de inicio', type: 'date', required: true },
  { key: 'fechaFin', label: 'Fecha de finalización', type: 'date', required: true },
  { key: 'usaEnNotaFinal', label: '¿Cuenta para la nota final del año?', type: 'select', opciones: [{ value: 'SI', label: 'Sí' }, { value: 'NO', label: 'No' }] },
  { key: 'porcentaje', label: 'Peso en la nota final (%)', type: 'number', min: 0, max: 100 },
  { key: 'estado', label: 'Estado', type: 'select', opciones: [{ value: 'abierto', label: 'Abierto' }, { value: 'cerrado', label: 'Cerrado (no admite notas)' }] }
])
const antesDeEnviar = (p) => {
  if (p.fechaFin <= p.fechaInicio) throw new Error('La fecha de fin debe ser posterior a la de inicio.')
  return { estado: 'abierto', usaEnNotaFinal: 'SI', ...p, orden: Number(p.orden) }
}
</script>

<template>
  <CrudView titulo="Periodos académicos" subtitulo="Define el calendario del año: nombre, fechas, orden y cuáles periodos cuentan para la nota final. Cierra un periodo para impedir más cambios en las notas." :recurso="periodosApi" :columnas="columnas" :campos="campos" :antes-de-enviar="antesDeEnviar" nombre-item="periodo" />
</template>
