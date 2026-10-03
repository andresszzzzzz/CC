<script setup>
import { computed, onMounted, watch } from 'vue'
import CrudView from './CrudView.vue'
import { prematriculasApi } from '@/services/secretariaApi'
import { useCatalogos } from '@/composables/useCatalogos'
import { formatearFecha } from '@/utils/academico'

const { cargar, opc, institucionId } = useCatalogos()
const cargarApoyo = () => cargar('anios')
onMounted(cargarApoyo)
watch(institucionId, cargarApoyo)

// Las claves con punto ("estudiante.nombres") leen y escriben dentro del objeto anidado.
// OJO: al editar, el backend reemplaza el subdocumento "estudiante" / "acudiente" completo,
// por eso el formulario incluye TODOS sus campos (si faltara alguno, se perdería al guardar).
const nombreEstudiante = (_, f) => [f.estudiante?.nombres, f.estudiante?.apellidos].filter(Boolean).join(' ')
const nombreAcudiente = (_, f) => [f.acudiente?.nombres, f.acudiente?.apellidos].filter(Boolean).join(' ')

const columnas = [
  { key: 'fechaRegistro', label: 'Registro', format: (v) => formatearFecha(v) },
  { key: 'estudiante', label: 'Estudiante', format: nombreEstudiante },
  { key: 'estudiante.documento', label: 'Documento' },
  { key: 'gradoSolicitado', label: 'Grado' },
  { key: 'acudiente', label: 'Acudiente', format: nombreAcudiente },
  { key: 'estado', label: 'Estado' }
]
const campos = computed(() => [
  { key: 'anioAcademicoId', label: 'Año escolar', type: 'select', required: true, opciones: opc('anios', (a) => a.anio) },
  { key: 'gradoSolicitado', label: 'Grado solicitado', type: 'number', min: 0, max: 11, required: true },
  { key: 'estudiante.nombres', label: 'Nombres del estudiante', required: true },
  { key: 'estudiante.apellidos', label: 'Apellidos del estudiante', required: true },
  { key: 'estudiante.tipoDocumento', label: 'Tipo de documento', type: 'select', required: true,
    opciones: [{ value: 'RC', label: 'Registro civil' }, { value: 'TI', label: 'Tarjeta de identidad' }, { value: 'CC', label: 'Cédula' }, { value: 'CE', label: 'Cédula de extranjería' }, { value: 'PAS', label: 'Pasaporte' }] },
  { key: 'estudiante.documento', label: 'Número de documento', required: true },
  { key: 'estudiante.fechaNacimiento', label: 'Fecha de nacimiento', type: 'date' },
  { key: 'estudiante.genero', label: 'Género', type: 'select',
    opciones: [{ value: 'F', label: 'Femenino' }, { value: 'M', label: 'Masculino' }, { value: 'O', label: 'Otro' }] },
  { key: 'estudiante.lugarNacimiento', label: 'Lugar de nacimiento' },
  { key: 'estudiante.direccion', label: 'Dirección del estudiante' },
  { key: 'estudiante.telefono', label: 'Teléfono del estudiante' },
  { key: 'acudiente.nombres', label: 'Nombres del acudiente', required: true },
  { key: 'acudiente.apellidos', label: 'Apellidos del acudiente', required: true },
  { key: 'acudiente.tipoDocumento', label: 'Tipo de documento del acudiente' },
  { key: 'acudiente.documento', label: 'Documento del acudiente' },
  { key: 'acudiente.parentesco', label: 'Parentesco' },
  { key: 'acudiente.telefono', label: 'Teléfono del acudiente' },
  { key: 'acudiente.email', label: 'Correo del acudiente', type: 'email' },
  { key: 'estado', label: 'Estado', type: 'select',
    opciones: [{ value: 'pendiente', label: 'Pendiente' }, { value: 'aprobada', label: 'Aprobada' }, { value: 'rechazada', label: 'Rechazada' }, { value: 'matriculada', label: 'Matriculada' }] },
  { key: 'observaciones', label: 'Observaciones' }
])
</script>

<template>
  <CrudView
    titulo="Prematrículas"
    subtitulo="Solicitudes de cupo previas a la matrícula. Al aprobarlas, se matricula desde «Matrículas»."
    :recurso="prematriculasApi"
    :columnas="columnas"
    :campos="campos"
    nombre-item="prematrícula"
  />
</template>
