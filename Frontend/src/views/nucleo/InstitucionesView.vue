<template>
  <div class="container-fluid py-4">
    <!-- Encabezado -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold text-dark">Gestión de Instituciones del Núcleo</h2>
        <p class="text-muted">Control y alta de colegios asignados, así como sus administradores iniciales.</p>
      </div>
      <button class="btn btn-primary shadow-sm" @click="mostrarModal = true">
        <i class="bi bi-plus-circle me-2"></i> Registrar Nuevo Colegio
      </button>
    </div>

    <!-- Tabla de Instituciones -->
    <div class="card shadow-sm border-0">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th>Colegio</th>
                <th>NIT</th>
                <th>Código DANE</th>
                <th>Usuarios</th>
                <th>Estado</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in colegios" :key="item.institucion._id">
                <td class="fw-semibold">{{ item.institucion.nombre }}</td>
                <td>{{ item.institucion.nit }}</td>
                <td>{{ item.institucion.dane || '—' }}</td>
                <td>{{ item.kpis?.totalUsuarios ?? 0 }}</td>
                <td>
                  <span class="badge" :class="item.institucion.estado === 'activo' ? 'bg-success' : 'bg-secondary'">
                    {{ item.institucion.estado === 'activo' ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-primary me-2" title="Ver detalles macro">
                    <i class="bi bi-graph-up"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" title="Suspender">
                    <i class="bi bi-slash-circle"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal para Registrar Colegio y Admin -->
    <div class="modal fade show d-block" tabindex="-1" v-if="mostrarModal" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">Registrar Nueva Institución y Admin</h5>
            <button type="button" class="btn-close" @click="mostrarModal = false"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="registrarColegio">
              <h6 class="text-primary fw-bold mb-3">1. Datos del Colegio</h6>
              <div class="row g-3 mb-4">
                <div class="col-md-8">
                  <label class="form-label">Nombre del Colegio</label>
                  <input type="text" class="form-control" v-model="form.nombre" required />
                </div>
                <div class="col-md-4">
                  <label class="form-label">NIT</label>
                  <input type="text" class="form-control" v-model="form.nit" required />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Código DANE</label>
                  <input type="text" class="form-control" v-model="form.dane" />
                </div>
              </div>

              <h6 class="text-primary fw-bold mb-3">2. Administrador Inicial</h6>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Nombres del Administrador</label>
                  <input type="text" class="form-control" v-model="form.adminNombres" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Apellidos del Administrador</label>
                  <input type="text" class="form-control" v-model="form.adminApellidos" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Correo Electrónico (Institucional)</label>
                  <input type="email" class="form-control" v-model="form.adminEmail" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Contraseña Temporal</label>
                  <input type="password" class="form-control" v-model="form.adminPassword" required />
                </div>
              </div>

              <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" class="btn btn-secondary" @click="mostrarModal = false">Cancelar</button>
                <button type="submit" class="btn btn-primary">Guardar e Inicializar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import nucleoService from '@/services/direccionNucleoService'

export default {
  name: 'InstitucionesView',
  data() {
    return {
      mostrarModal: false,
      colegios: [],
      form: { nombre: '', nit: '', dane: '', adminNombres: '', adminApellidos: '', adminEmail: '', adminPassword: '' }
    }
  },
  mounted() {
    this.cargarInstituciones()
  },
  methods: {
    async cargarInstituciones() {
      try {
        const respuesta = await nucleoService.listarInstituciones()
        this.colegios = respuesta.data
      } catch (error) {
        console.error('Error al cargar instituciones:', error)
      }
    },
    async registrarColegio() {
      try {
        // POST /api/nucleo/instituciones y luego POST .../:id/admin
        await nucleoService.registrarInstitucionConAdmin(this.form)
        this.mostrarModal = false
        this.form = { nombre: '', nit: '', dane: '', adminNombres: '', adminApellidos: '', adminEmail: '', adminPassword: '' }
        this.cargarInstituciones()
      } catch (error) {
        console.error('Error al registrar institución:', error)
        const detalle = error.response?.data?.error || error.response?.data?.mensaje || ''
        if (error.institucionCreada) {
          this.mostrarModal = false
          this.cargarInstituciones()
          alert('El colegio se creó, pero no se pudo crear su administrador: ' + detalle)
        } else {
          alert('Error al registrar la institución: ' + detalle)
        }
      }
    }
  }
}
</script>