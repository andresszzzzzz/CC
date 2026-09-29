<script setup>
import { ref, computed } from 'vue'
import AppIcon from '@/components/AppIcon.vue'

const props = defineProps({
  columns: { type: Array, required: true }, // [{ key, label }]
  rows: { type: Array, default: () => [] },
  cargando: { type: Boolean, default: false },
  error: { type: String, default: '' },
  soloLectura: { type: Boolean, default: false }
})
defineEmits(['crear', 'editar', 'eliminar'])

const busqueda = ref('')

// Lee claves anidadas como "credenciales.usuario".
const leer = (obj, ruta) => ruta.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj)

function textoCelda(fila, col) {
  const v = leer(fila, col.key)
  if (v === null || v === undefined || v === '') return '—'
  if (Array.isArray(v)) return String(v.length)
  if (typeof v === 'object') return v.nombre || v.nombreCompleto || '—'
  return String(v)
}

const filas = computed(() => {
  const q = busqueda.value.trim().toLowerCase()
  if (!q) return props.rows
  return props.rows.filter((fila) =>
    props.columns.some((col) => textoCelda(fila, col).toLowerCase().includes(q))
  )
})
</script>

<template>
  <div class="tabla-card">
    <div class="tabla-barra">
      <input v-model="busqueda" type="search" class="tabla-buscar" placeholder="Buscar…" />
      <button v-if="!soloLectura" class="btn-nuevo" @click="$emit('crear')">+ Nuevo</button>
    </div>

    <div v-if="cargando" class="tabla-estado">Cargando…</div>
    <div v-else-if="error" class="tabla-estado tabla-error">{{ error }}</div>
    <div v-else-if="!filas.length" class="tabla-estado">
      {{ rows.length ? 'Ninguna coincidencia con la búsqueda.' : 'Todavía no hay registros.' }}
    </div>

    <div v-else class="tabla-scroll">
      <table class="tabla">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key">{{ col.label }}</th>
            <th v-if="!soloLectura" class="col-acciones">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="fila in filas" :key="fila._id">
            <td v-for="col in columns" :key="col.key">
              <span
                v-if="col.key === 'estado' && fila.estado"
                :class="['badge', fila.estado === 'activo' ? 'badge-ok' : 'badge-off']"
              >
                {{ fila.estado }}
              </span>
              <template v-else>{{ textoCelda(fila, col) }}</template>
            </td>
            <td v-if="!soloLectura" class="col-acciones">
              <button class="icono-btn" title="Editar" @click="$emit('editar', fila)">
                <AppIcon name="edit-3" :size="16" />
              </button>
              <button class="icono-btn peligro" title="Eliminar" @click="$emit('eliminar', fila)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.tabla-card { background: white; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 4px 16px rgba(0,0,0,0.03); padding: 16px; }
.tabla-barra { display: flex; gap: 12px; justify-content: space-between; margin-bottom: 14px; }
.tabla-buscar { flex: 1; max-width: 340px; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 10px; padding: 9px 12px; font-size: 13px; outline: none; }
.tabla-buscar:focus { border-color: #2563eb; background: white; }
.btn-nuevo { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; border: none; border-radius: 10px; padding: 9px 16px; font-size: 13px; font-weight: 700; cursor: pointer; }

.tabla-estado { padding: 36px; text-align: center; color: #64748b; font-size: 13px; }
.tabla-error { color: #dc2626; }

.tabla-scroll { overflow-x: auto; }
.tabla { width: 100%; border-collapse: collapse; font-size: 13px; }
.tabla th { text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; white-space: nowrap; }
.tabla td { padding: 11px 12px; border-bottom: 1px solid #f1f5f9; color: #0f172a; }
.tabla tbody tr:hover { background: #f8fafc; }
.col-acciones { text-align: right; white-space: nowrap; width: 1%; }

.badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: capitalize; }
.badge-ok { background: #dcfce7; color: #15803d; }
.badge-off { background: #f1f5f9; color: #64748b; }

.icono-btn { background: #f8fafc; border: 1px solid #e2e8f0; color: #475569; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; margin-left: 6px; }
.icono-btn:hover { background: #eff6ff; color: #2563eb; }
.icono-btn.peligro:hover { background: #fef2f2; color: #dc2626; }
</style>
