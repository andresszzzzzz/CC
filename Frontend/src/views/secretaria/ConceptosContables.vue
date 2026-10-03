<script setup>
import CrudView from './CrudView.vue'
import { conceptosContablesApi } from '@/services/secretariaApi'

const columnas = [
  { key: 'nombre', label: 'Concepto' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'periodicidad', label: 'Periodicidad' },
  { key: 'valor', label: 'Valor', format: (v, f) => (v === undefined || v === null ? '' : f.esPorcentual ? `${v} %` : `$ ${Number(v).toLocaleString('es-CO')}`) },
  { key: 'estado', label: 'Estado' }
]
const campos = [
  { key: 'nombre', label: 'Nombre del concepto', required: true, placeholder: 'ej. Pensión' },
  { key: 'tipo', label: 'Tipo', type: 'select', required: true,
    opciones: [{ value: 'obligatorio', label: 'Obligatorio' }, { value: 'opcional', label: 'Opcional' }] },
  { key: 'periodicidad', label: 'Periodicidad', type: 'select',
    opciones: [
      { value: 'mensual', label: 'Mensual' }, { value: 'bimestral', label: 'Bimestral' }, { value: 'trimestral', label: 'Trimestral' },
      { value: 'semestral', label: 'Semestral' }, { value: 'anual', label: 'Anual' }, { value: 'unico', label: 'Pago único' }
    ] },
  { key: 'valor', label: 'Valor', type: 'number', min: 0 },
  { key: 'esPorcentual', label: '¿El valor es un porcentaje?', type: 'select',
    opciones: [{ value: false, label: 'No, es un monto en pesos' }, { value: true, label: 'Sí, es un porcentaje' }] },
  { key: 'descripcion', label: 'Descripción' },
  { key: 'estado', label: 'Estado', type: 'select', opciones: [{ value: 'activo', label: 'Activo' }, { value: 'inactivo', label: 'Inactivo' }] }
]
</script>

<template>
  <CrudView
    titulo="Conceptos de cobro"
    subtitulo="Matrícula, pensión, derechos de grado y demás conceptos contables."
    :recurso="conceptosContablesApi"
    :columnas="columnas"
    :campos="campos"
    nombre-item="concepto"
  />
</template>
