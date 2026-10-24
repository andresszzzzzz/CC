<script setup>
import { computed, onMounted, watch } from 'vue'
import CrudView from './CrudView.vue'
import { usuariosApi } from '@/services/secretariaApi'
import { columnasPersona, camposPersona } from '@/config/camposPersona'
import { conDesactivacion, conCampoEstado, TEXTOS_DESACTIVAR } from '@/services/secretariaApiExt'
import { useCatalogos } from '@/composables/useCatalogos'

const { cargar, opc, institucionId, nombrePersona, grupos, jornadas, anios } = useCatalogos()
const load = () => cargar('grupos', 'jornadas', 'acudientes', 'anios')
onMounted(load)
watch(institucionId, load)

const recurso = conDesactivacion(usuariosApi)
// Si la matrícula que se muestra no es del año actual, se aclara el año: «5A (2025)»
const conAnio = (v, f) => (v && f.matriculaEsActual === false && f.matriculaAnio ? `${v} (${f.matriculaAnio})` : v)
const columnas = [
  ...columnasPersona.filter((c) => c.key !== 'estado'),
  { key: 'estadoEstudiante', label: 'Situación' },
  { key: 'grupoNombre', label: 'Grupo', format: conAnio },
  { key: 'jornadaNombre', label: 'Jornada', format: conAnio },
  { key: 'directorNombre', label: 'Director de grupo' },
  { key: 'docentesGrupo', label: 'Docentes' },
  { key: 'estado', label: 'Acceso' }
]
// Grupos y jornadas vigentes (no se ofrecen los inactivos ni cerrados) con el año escolar al lado
const anioDe = (g) => g.anioAcademicoId?.anio ?? anios.value.find((a) => a._id === (g.anioAcademicoId?._id ?? g.anioAcademicoId))?.anio
const opcGrupos = () => grupos.value
  .filter((g) => !['inactivo', 'cerrado'].includes(g.estado))
  .map((g) => ({ value: g._id, label: `${g.nombre} — grado ${g.grado}${anioDe(g) ? ` (${anioDe(g)})` : ''}` }))
const opcJornadas = () => jornadas.value
  .filter((j) => j.estado !== 'inactivo')
  .map((j) => ({ value: j._id, label: j.nombre }))

// El grupo y la jornada se guardan en la matrícula del estudiante: sin grupo no hay dónde registrar la jornada.
const antesDeEnviar = (p, editando) => {
  if (!editando && p.jornadaId && !p.grupoId) throw new Error('Para registrar la jornada elige también el grupo: así queda matriculado en ese grupo y jornada.')
  return p
}

const campos = computed(() => [
  ...conCampoEstado(camposPersona()),
  { key: 'grupoId', label: 'Grupo / curso (define el grado)', type: 'select', opciones: opcGrupos },
  { key: 'jornadaId', label: 'Jornada', type: 'select', opciones: opcJornadas },
  { key: 'acudienteId', label: 'Acudiente principal', type: 'select', opciones: opc('acudientes', nombrePersona) }
])
</script>

<template>
  <CrudView
    titulo="Estudiantes"
    subtitulo="Alta y edición. Situación: Registrado, No matriculado, Matriculado, Retirado o Inactivo. Foto e historial en «Ficha del estudiante»; para matricular usa «Matrículas». Los docentes del estudiante son los de su grupo: se asignan en «Organización de grupos»."
    :recurso="recurso"
    :columnas="columnas"
    :campos="campos"
    :filtros-fijos="{ tipoPerfil: 'estudiante' }"
    :antes-de-enviar="antesDeEnviar"
    nombre-item="estudiante"
    v-bind="TEXTOS_DESACTIVAR"
  />
</template>
