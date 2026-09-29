<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import rectorService from '@/services/rectorService'

const cargando = ref(true)
const error = ref('')
const estudiantes = ref([])
const busqueda = ref('')

const listaFiltrada = computed(() => {
  const q = busqueda.value.trim().toLowerCase()
  if (!q) return estudiantes.value
  return estudiantes.value.filter((e) => `${e.nombres} ${e.apellidos} ${e.documento}`.toLowerCase().includes(q))
})

async function cargarEstudiantes() {
  cargando.value = true
  error.value = ''
  try {
    const res = await rectorService.obtenerUsuarios()
    const todos = res.data.usuarios || res.data || []
    estudiantes.value = todos.filter((u) => u.tipoPerfil === 'estudiante')
  } catch (e) {
    console.error('Error al cargar estudiantes:', e)
    error.value = 'No se pudieron cargar los estudiantes desde el backend.'
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarEstudiantes()
})
</script>

<template>
  <AppLayout>
    <template #header-title>
      <h2>Estudiantes 🎓</h2>
      <p>Listado institucional de estudiantes (solo consulta).</p>
    </template>

    <div class="card-box">
      <div class="card-header-flex">
        <div class="search-bar">
          <AppIcon name="search" :size="16" />
          <input v-model="busqueda" type="text" placeholder="Buscar por nombre o documento..." />
        </div>
      </div>

      <p v-if="cargando" class="estado-carga">Cargando estudiantes del backend...</p>
      <p v-else-if="error" class="estado-error">{{ error }}</p>

      <table class="custom-table" v-else-if="listaFiltrada.length > 0">
        <thead>
          <tr><th>Nombre completo</th><th>Documento</th><th>Correo</th></tr>
        </thead>
        <tbody>
          <tr v-for="e in listaFiltrada" :key="e._id">
            <td class="celda-fuerte">{{ e.nombres }} {{ e.apellidos }}</td>
            <td>{{ e.tipoDocumento }} {{ e.documento }}</td>
            <td>{{ e.email || '—' }}</td>
          </tr>
        </tbody>
      </table>

      <p v-else class="sin-datos">
        {{ busqueda ? 'No hay estudiantes que coincidan con la búsqueda.' : 'Todavía no hay estudiantes registrados.' }}
      </p>
    </div>
  </AppLayout>
</template>
