<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import rectorService from '@/services/rectorService'

const cargando = ref(true)
const error = ref('')
const docentes = ref([])
const busqueda = ref('')

const listaFiltrada = computed(() => {
  const q = busqueda.value.trim().toLowerCase()
  if (!q) return docentes.value
  return docentes.value.filter((d) => `${d.nombres} ${d.apellidos} ${d.documento}`.toLowerCase().includes(q))
})

async function cargarDocentes() {
  cargando.value = true
  error.value = ''
  try {
    const res = await rectorService.obtenerUsuarios()
    const todos = res.data.usuarios || res.data || []
    docentes.value = todos.filter((u) => u.tipoPerfil === 'docente')
  } catch (e) {
    console.error('Error al cargar docentes:', e)
    error.value = 'No se pudieron cargar los docentes desde el backend.'
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarDocentes()
})
</script>

<template>
  <AppLayout>
    <template #header-title>
      <h2>Docentes 📘</h2>
      <p>Listado institucional de docentes (solo consulta).</p>
    </template>

    <div class="card-box">
      <div class="card-header-flex">
        <div class="search-bar">
          <AppIcon name="search" :size="16" />
          <input v-model="busqueda" type="text" placeholder="Buscar por nombre o documento..." />
        </div>
      </div>

      <p v-if="cargando" class="estado-carga">Cargando docentes del backend...</p>
      <p v-else-if="error" class="estado-error">{{ error }}</p>

      <table class="custom-table" v-else-if="listaFiltrada.length > 0">
        <thead>
          <tr><th>Nombre completo</th><th>Documento</th><th>Correo</th></tr>
        </thead>
        <tbody>
          <tr v-for="d in listaFiltrada" :key="d._id">
            <td class="celda-fuerte">{{ d.nombres }} {{ d.apellidos }}</td>
            <td>{{ d.tipoDocumento }} {{ d.documento }}</td>
            <td>{{ d.email || '—' }}</td>
          </tr>
        </tbody>
      </table>

      <p v-else class="sin-datos">
        {{ busqueda ? 'No hay docentes que coincidan con la búsqueda.' : 'Todavía no hay docentes registrados.' }}
      </p>
    </div>
  </AppLayout>
</template>
