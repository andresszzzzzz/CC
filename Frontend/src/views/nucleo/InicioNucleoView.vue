<script setup>
import { ref, computed, onMounted } from 'vue'
import nucleoService from '@/services/direccionNucleoService'

const colegios = ref([])
const secretarias = ref([]) // Secretarías de los colegios del núcleo
const mostrarModalColegio = ref(false)
const mostrarModalSecretaria = ref(false)
const cargando = ref(true)

// Formulario para nueva institución (el que ya tenías)
const formColegio = ref({
  nombre: '',
  nit: '',
  dane: '',
  adminNombres: '',
  adminApellidos: '',
  adminEmail: '',
  adminPassword: ''
})

// Nuevo formulario para la Secretaría
const formSecretaria = ref({
  institucionId: '',
  nombre: '',
  email: '',
  password: '',
  telefono: ''
})

// El backend devuelve [{ institucion, kpis }]; para el selector solo hace falta la institución.
const opcionesColegios = computed(() => colegios.value.map((c) => c.institucion))

const cargarDatos = async () => {
  try {
    cargando.value = true
    const [respuestaColegios, respuestaSecs] = await Promise.all([
      nucleoService.listarInstituciones(),
      nucleoService.listarSecretarias()
    ])
    colegios.value = respuestaColegios.data
    secretarias.value = respuestaSecs.data
  } catch (error) {
    console.error('Error al cargar datos:', error)
  } finally {
    cargando.value = false
  }
}

const registrarColegio = async () => {
  try {
    await nucleoService.registrarInstitucionConAdmin(formColegio.value)
    mostrarModalColegio.value = false
    formColegio.value = { nombre: '', nit: '', dane: '', adminNombres: '', adminApellidos: '', adminEmail: '', adminPassword: '' }
    alert('Institución y administrador registrados con éxito.')
    cargarDatos()
  } catch (error) {
    console.error('Error al registrar institución:', error)
    const detalle = error.response?.data?.error || error.response?.data?.mensaje || ''
    if (error.institucionCreada) {
      mostrarModalColegio.value = false
      alert('El colegio se creó, pero no se pudo crear su administrador: ' + detalle)
      cargarDatos()
    } else {
      alert('Error al registrar la institución: ' + detalle)
    }
  }
}

const registrarSecretaria = async () => {
  try {
    await nucleoService.crearSecretaria(formSecretaria.value)
    mostrarModalSecretaria.value = false
    // Limpiar formulario
    formSecretaria.value = { institucionId: '', nombre: '', email: '', password: '', telefono: '' }
    alert('¡Perfil de secretaría registrado con éxito! Ya puede iniciar sesión con su correo y la contraseña temporal.')
    cargarDatos()
  } catch (error) {
    console.error('Error al registrar secretaría:', error)
    alert(error.response?.data?.mensaje || error.response?.data?.error || 'Error al registrar la secretaría.')
  }
}

onMounted(() => {
  cargarDatos()
})
</script>

<template>
  <div class="nucleo-container">
    <!-- Cabecera de la sección con múltiples acciones -->
    <div class="header-section">
      <div>
        <h2 class="title">Gestión del Núcleo 🏫</h2>
        <p class="subtitle">Administra las instituciones y el personal autorizado del núcleo.</p>
      </div>
      <div class="actions-row">
        <button @click="mostrarModalSecretaria = true" class="btn-secondary">
          + Nueva Secretaría
        </button>
        <button @click="mostrarModalColegio = true" class="btn-primary">
          + Nueva Institución
        </button>
      </div>
    </div>

    <!-- Secretarías registradas -->
    <div class="section-block" style="margin-bottom: 2.5rem;">
      <h3 style="font-size: 1.125rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem;">Personal de Secretaría</h3>

      <div v-if="cargando" class="caja-vacia">Cargando…</div>
      <div v-else-if="!secretarias.length" class="caja-vacia">
        Aún no hay secretarías registradas. Las cuentas que crees podrán entrar desde el login general con su correo y contraseña.
      </div>
      <div v-else class="tabla-wrap">
        <table class="tabla-sec">
          <thead>
            <tr><th>Nombre</th><th>Correo (usuario)</th><th>Colegio</th><th>Teléfono</th><th>Estado</th></tr>
          </thead>
          <tbody>
            <tr v-for="s in secretarias" :key="s._id">
              <td>{{ s.nombreCompleto || `${s.nombres} ${s.apellidos}` }}</td>
              <td>{{ s.email }}</td>
              <td>{{ s.institucionId?.nombre || '—' }}</td>
              <td>{{ s.telefono || '—' }}</td>
              <td><span :class="['pill', s.estado === 'activo' ? 'pill-ok' : 'pill-off']">{{ s.estado }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL: Registrar Institución -->
    <div v-if="mostrarModalColegio" class="modal-overlay" @click.self="mostrarModalColegio = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Registrar Nueva Institución</h2>
          <button @click="mostrarModalColegio = false" class="close-btn">&times;</button>
        </div>

        <form @submit.prevent="registrarColegio" class="form-grid">
          <div class="form-group">
            <label>Nombre del Colegio</label>
            <input v-model="formColegio.nombre" type="text" required placeholder="Ej. Colegio San José" />
          </div>
          <div class="form-group">
            <label>NIT</label>
            <input v-model="formColegio.nit" type="text" required placeholder="Ej. 900123456-1" />
          </div>
          <div class="form-group">
            <label>Código DANE</label>
            <input v-model="formColegio.dane" type="text" placeholder="Ej. 110010..." />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Nombres del Admin</label>
              <input v-model="formColegio.adminNombres" type="text" required placeholder="Nombres" />
            </div>
            <div class="form-group">
              <label>Apellidos del Admin</label>
              <input v-model="formColegio.adminApellidos" type="text" required placeholder="Apellidos" />
            </div>
          </div>
          <div class="form-group">
            <label>Email del Admin (también es su usuario)</label>
            <input v-model="formColegio.adminEmail" type="email" required placeholder="correo@colegio.edu" />
          </div>
          <div class="form-group">
            <label>Contraseña Inicial</label>
            <input v-model="formColegio.adminPassword" type="password" required placeholder="••••••••" />
          </div>
          <div class="modal-actions">
            <button type="button" @click="mostrarModalColegio = false" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary">Guardar Institución</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL: Registrar Secretaría -->
    <div v-if="mostrarModalSecretaria" class="modal-overlay" @click.self="mostrarModalSecretaria = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Registrar Cuenta de Secretaría</h2>
          <button @click="mostrarModalSecretaria = false" class="close-btn">&times;</button>
        </div>

        <form @submit.prevent="registrarSecretaria" class="form-grid">
          <div class="form-group">
            <label>Colegio</label>
            <select v-model="formSecretaria.institucionId" required>
              <option value="" disabled>Selecciona el colegio…</option>
              <option v-for="c in opcionesColegios" :key="c._id" :value="c._id">{{ c.nombre }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Nombre Completo</label>
            <input v-model="formSecretaria.nombre" type="text" required placeholder="Ej. María Gómez" />
          </div>

          <div class="form-group">
            <label>Correo Electrónico (Usuario de Acceso)</label>
            <input v-model="formSecretaria.email" type="email" required placeholder="secretaria@nucleo.edu" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Teléfono de Contacto</label>
              <input v-model="formSecretaria.telefono" type="text" placeholder="3001234567" />
            </div>
            <div class="form-group">
              <label>Contraseña Temporal</label>
              <input v-model="formSecretaria.password" type="password" required placeholder="••••••••" />
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="mostrarModalSecretaria = false" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary">Crear Cuenta</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos modernos acordes al diseño limpio */
.nucleo-container {
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 1.25rem;
  margin-bottom: 2rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.actions-row {
  display: flex;
  gap: 0.75rem;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: white;
  color: #4b5563;
  border: 1px solid #cbd5e1;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background-color: #f8fafc;
}

/* Estilos de Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  width: 100%;
  max-width: 480px;
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.75rem;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #94a3b8;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-group label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #475569;
}

.form-group input {
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

.form-group select {
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
  outline: none;
  background: white;
}

.form-group select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.caja-vacia {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
  color: #64748b;
  font-size: 0.875rem;
}

.tabla-wrap {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  overflow-x: auto;
}

.tabla-sec { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.tabla-sec th { text-align: left; font-size: 0.7rem; text-transform: uppercase; color: #64748b; padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0; }
.tabla-sec td { padding: 0.75rem 1rem; border-bottom: 1px solid #f1f5f9; color: #0f172a; }
.pill { padding: 2px 10px; border-radius: 999px; font-size: 0.7rem; font-weight: 700; text-transform: capitalize; }
.pill-ok { background: #dcfce7; color: #15803d; }
.pill-off { background: #f1f5f9; color: #64748b; }

.form-group input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}
</style>