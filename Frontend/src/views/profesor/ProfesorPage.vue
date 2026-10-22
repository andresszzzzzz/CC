<template>
  <div
    class="profesor-layout"
    :class="{ 'sidebar-hidden': sidebarOculta }"
  >
    <!-- NOTIFICACIÓN EASYNOTES -->
    <Transition name="notificacion">
      <div
        v-if="mostrarNotificacion"
        class="notification"
        :class="tipoNotificacion"
      >
        <div class="notification-icon">
          <span v-if="tipoNotificacion === 'exito'">✓</span>
          <span v-else>!</span>
        </div>

        <div class="notification-content">
          <strong>
            {{
              tipoNotificacion === "exito"
                ? "Éxito"
                : "Ocurrió un problema"
            }}
          </strong>

          <p>{{ mensajeNotificacion }}</p>
        </div>

        <button
          type="button"
          class="notification-close"
          @click="cerrarNotificacion"
        >
          ×
        </button>
      </div>
    </Transition>

    <!-- SIDEBAR -->
    <aside class="sidebar">
      <button
        class="sidebar-toggle"
        type="button"
        @click="sidebarOculta = !sidebarOculta"
        :title="
          sidebarOculta
            ? 'Mostrar menu'
            : 'Ocultar menu'
        "
      >
        <ChevronRight
          v-if="sidebarOculta"
          :size="18"
          :stroke-width="2.5"
        />

        <ChevronLeft
          v-else
          :size="18"
          :stroke-width="2.5"
        />
      </button>

      <div class="sidebar-header">
        <div class="logo">
          E
        </div>

        <div class="brand">
          <h2>EasyNotes</h2>
          <span>Panel docente</span>
        </div>
      </div>

      <nav class="menu">
        <button
          v-for="item in menuItems"
          :key="item.id"
          type="button"
          class="menu-item"
          :class="{
            active: seccionActiva === item.id,
          }"
          @click="seccionActiva = item.id"
        >
          <span class="menu-icon">
            <component
              :is="item.icon"
              :size="18"
              :stroke-width="2"
            />
          </span>

          <span>
            {{ item.label }}
          </span>
        </button>
      </nav>

      <div class="sidebar-bottom">
        <button
          type="button"
          class="logout-button"
          @click="cerrarSesion"
        >
          <LogOut
            :size="17"
            :stroke-width="2"
          />

          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>

    <!-- CONTENIDO PRINCIPAL -->
    <main class="main-content">
      <!-- TOPBAR -->
      <header class="topbar">
        <div>
          <p class="breadcrumb">
            EasyNotes / Profesor
          </p>

          <h1>
            {{ tituloSeccion }}
          </h1>
        </div>

        <div class="profile-mini">
          <div class="profile-avatar">
            {{ inicialesProfesor }}
          </div>

          <div class="profile-info">
            <strong>
              {{ nombreProfesor }}
            </strong>

            <span>
              {{ correoProfesor }}
            </span>
          </div>
        </div>
      </header>

      <!-- ================= INICIO ================= -->
      <section
        v-if="seccionActiva === 'inicio'"
        class="content-section"
      >
        <div class="welcome">
          <div>
            <span class="welcome-label">
              Panel del profesor
            </span>

            <h2>
              Bienvenido, {{ primerNombre }}
            </h2>

            <p>
              Administra tus actividades,
              calificaciones y comunicados.
            </p>
          </div>

          <div class="welcome-icon">
            <GraduationCap
              :size="80"
              :stroke-width="1.4"
            />
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon blue">
              <Users
                :size="22"
                :stroke-width="2"
              />
            </div>

            <div>
              <span>Mis grupos</span>
              <strong>{{ grupos.length }}</strong>
              <small>Grupos asignados</small>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon purple">
              <ClipboardList
                :size="22"
                :stroke-width="2"
              />
            </div>

            <div>
              <span>Actividades</span>
              <strong>
                {{ actividades.length }}
              </strong>
              <small>Actividades creadas</small>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon orange">
              <Megaphone
                :size="22"
                :stroke-width="2"
              />
            </div>

            <div>
              <span>Comunicados</span>
              <strong>
                {{ comunicados.length }}
              </strong>
              <small>Comunicados enviados</small>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon green">
              <BookOpen
                :size="22"
                :stroke-width="2"
              />
            </div>

            <div>
              <span>Asignaturas</span>
              <strong>
                {{ asignaturas.length }}
              </strong>
              <small>Asignaturas disponibles</small>
            </div>
          </div>
        </div>

        <div class="dashboard-grid">
          <div class="panel">
            <div class="panel-header">
              <div>
                <h3>Actividades recientes</h3>
                <p>
                  Últimas actividades creadas
                </p>
              </div>

              <button
                type="button"
                class="link-button"
                @click="seccionActiva = 'tareas'"
              >
                Ver todas
              </button>
            </div>

            <div
              v-if="actividades.length"
              class="recent-list"
            >
              <div
                v-for="actividad in actividades.slice(
                  0,
                  4
                )"
                :key="
                  actividad._id ||
                  actividad.id
                "
                class="recent-item"
              >
                <div class="recent-icon">
                  <ClipboardList
                    :size="16"
                  />
                </div>

                <div>
                  <strong>
                    {{
                      actividad.titulo ||
                      "Actividad"
                    }}
                  </strong>

                  <span>
                    {{
                      actividad.tipo ||
                      "Actividad académica"
                    }}
                  </span>
                </div>
              </div>
            </div>

            <div
              v-else
              class="empty-state"
            >
              <div class="empty-icon">
                <ClipboardList
                  :size="34"
                />
              </div>

              <h4>
                No hay actividades
              </h4>

              <p>
                Crea tu primera actividad
                para comenzar.
              </p>
            </div>
          </div>

          <div class="panel">
            <div class="panel-header">
              <div>
                <h3>
                  Comunicados recientes
                </h3>

                <p>
                  Últimos comunicados enviados
                </p>
              </div>

              <button
                type="button"
                class="link-button"
                @click="
                  seccionActiva = 'comunicados'
                "
              >
                Ver todos
              </button>
            </div>

            <div
              v-if="comunicados.length"
              class="recent-list"
            >
              <div
                v-for="comunicado in comunicados.slice(
                  0,
                  4
                )"
                :key="
                  comunicado._id ||
                  comunicado.id
                "
                class="recent-item"
              >
                <div class="recent-icon">
                  <Megaphone
                    :size="16"
                  />
                </div>

                <div>
                  <strong>
                    {{
                      comunicado.asunto ||
                      "Comunicado"
                    }}
                  </strong>

                  <span>
                    {{
                      comunicado.prioridad ||
                      "normal"
                    }}
                  </span>
                </div>
              </div>
            </div>

            <div
              v-else
              class="empty-state"
            >
              <div class="empty-icon">
                <Megaphone
                  :size="34"
                />
              </div>

              <h4>
                No hay comunicados
              </h4>

              <p>
                Los comunicados que envíes
                aparecerán aquí.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= GRUPOS ================= -->
      <section
        v-else-if="seccionActiva === 'grupos'"
        class="content-section"
      >
        <div class="section-title">
          <div>
            <h2>Mis grupos</h2>
            <p>
              Grupos asignados al profesor.
            </p>
          </div>
        </div>

        <div class="panel">
          <div
            v-if="grupos.length"
            class="activity-list"
          >
            <div
              v-for="grupo in grupos"
              :key="
                grupo._id ||
                grupo.id
              "
              class="activity-card"
            >
              <div class="activity-icon">
                <Users
                  :size="20"
                />
              </div>

              <div class="activity-content">
                <h3>
                  {{ nombreElemento(grupo) }}
                </h3>

                <p>
                  Grupo académico
                </p>
              </div>
            </div>
          </div>

          <div
            v-else
            class="empty-state large"
          >
            <div class="empty-icon">
              <Users :size="42" />
            </div>

            <h3>
              No hay grupos disponibles
            </h3>

            <p>
              No se encontraron grupos
              asignados.
            </p>
          </div>
        </div>
      </section>

      <!-- ================= CALIFICACIONES ================= -->
      <section v-else-if="seccionActiva === 'calificaciones'" class="content-section">
        <div class="section-title">
          <div>
            <h2>Calificaciones</h2>
            <p>Consulta y registra las notas de tus estudiantes.</p>
          </div>
          <button type="button" class="primary-button" @click="guardarCalificaciones" :disabled="guardandoCalificaciones">
            {{ guardandoCalificaciones ? "Guardando..." : "Guardar calificaciones" }}
          </button>
        </div>
        <div class="panel">
          <div class="filters">
            <div class="field">
              <label>Grupo</label>
              <select v-model="grupoCalificacionesId" @change="cargarEstudiantesParaCalificar">
                <option value="">Selecciona un grupo</option>
                <option v-for="grupo in grupos" :key="grupo._id || grupo.id" :value="String(grupo._id || grupo.id)">
                  {{ nombreElemento(grupo) }}
                </option>
              </select>
            </div>
            <div class="field">
              <label>Asignatura</label>
              <select v-model="asignaturaCalificacionesId" @change="cargarEstudiantesParaCalificar">
                <option value="">Selecciona una asignatura</option>
                <option v-for="asignatura in asignaturas" :key="asignatura._id || asignatura.id" :value="String(asignatura._id || asignatura.id)">
                  {{ nombreElemento(asignatura) }}
                </option>
              </select>
            </div>
            <div class="field">
              <label>Periodo</label>
              <select v-model.number="periodoCalificaciones" @change="cargarEstudiantesParaCalificar">
                <option :value="1">Periodo 1</option><option :value="2">Periodo 2</option>
                <option :value="3">Periodo 3</option><option :value="4">Periodo 4</option>
              </select>
            </div>
            <div class="field">
              <label>Estudiante a calificar</label>
              <select v-model="estudianteCalificacionId">
                <option value="">Todos los estudiantes</option>
                <option v-for="estudiante in estudiantesCalificaciones" :key="estudiante.id" :value="estudiante.id">
                  {{ estudiante.nombre }}
                </option>
              </select>
            </div>
          </div>
          <div v-if="estudiantesCalificacionesVisibles.length" class="data-table-wrap">
            <table class="data-table">
              <thead><tr><th>Estudiante</th><th>Nota (0–5)</th><th>Observación</th></tr></thead>
              <tbody>
                <tr v-for="estudiante in estudiantesCalificacionesVisibles" :key="estudiante.id">
                  <td>{{ estudiante.nombre }}</td>
                  <td><input v-model.number="estudiante.nota" type="number" min="0" max="5" step="0.1" class="table-input" /></td>
                  <td><input v-model="estudiante.observacion" type="text" class="table-input" placeholder="Comentario opcional" /></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="empty-state large">
            <div class="empty-icon"><ClipboardPenLine :size="42" /></div>
            <h3>{{ grupoCalificacionesId ? "No hay estudiantes para calificar" : "Selecciona un grupo" }}</h3>
            <p>{{ grupoCalificacionesId ? "No se encontraron estudiantes matriculados en este grupo. Verifica que el grupo tenga estudiantes asignados." : "Elige un grupo para cargar únicamente los estudiantes matriculados y registrar sus calificaciones." }}</p>
          </div>
        </div>
      </section>

      <!-- ================= ASISTENCIA ================= -->
      <section v-else-if="seccionActiva === 'asistencia'" class="content-section">
        <div class="section-title">
          <div><h2>Asistencia</h2><p>Registra y consulta la asistencia de tus estudiantes.</p></div>
          <button type="button" class="primary-button" @click="guardarAsistencia" :disabled="guardandoAsistencia">
            {{ guardandoAsistencia ? "Guardando..." : "Guardar asistencia" }}
          </button>
        </div>
        <div class="panel">
          <div class="filters">
            <div class="field">
              <label>Grupo</label>
              <select v-model="grupoAsistenciaId" @change="cargarEstudiantesAsistencia">
                <option value="">Selecciona un grupo</option>
                <option v-for="grupo in grupos" :key="grupo._id || grupo.id" :value="String(grupo._id || grupo.id)">{{ nombreElemento(grupo) }}</option>
              </select>
            </div>
            <div class="field">
              <label>Fecha</label>
              <input v-model="fechaAsistencia" type="date" @change="cargarEstudiantesAsistencia" />
            </div>
          </div>
          <div v-if="estudiantesAsistencia.length" class="data-table-wrap">
            <table class="data-table">
              <thead><tr><th>Estudiante</th><th>Estado</th><th>Nota</th></tr></thead>
              <tbody>
                <tr v-for="estudiante in estudiantesAsistencia" :key="estudiante.id">
                  <td>{{ estudiante.nombre }}</td>
                  <td>
                    <select v-model="estudiante.estado" class="table-input">
                      <option value="presente">Presente</option><option value="ausente">Ausente</option>
                      <option value="retardo">Retardo</option><option value="excusa">Excusa</option>
                    </select>
                  </td>
                  <td><input v-model="estudiante.nota" class="table-input" placeholder="Observación opcional" /></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="empty-state large">
            <div class="empty-icon"><CalendarCheck :size="42" /></div>
            <h3>Selecciona un grupo</h3>
            <p>Después de seleccionar el grupo, podrás marcar presente, ausente, retardo o excusa.</p>
          </div>
        </div>
      </section>

      <!-- ================= TAREAS ================= -->
      <section
        v-else-if="seccionActiva === 'tareas'"
        class="content-section"
      >
        <div class="section-title">
          <div>
            <h2>Tareas y actividades</h2>
            <p>
              Crea y administra actividades
              académicas.
            </p>
          </div>

          <button
            type="button"
            class="primary-button"
            @click="abrirFormularioActividad"
          >
            + Crear actividad
          </button>
        </div>

        <div class="panel">
          <div
            v-if="actividades.length"
            class="activity-list"
          >
            <div
              v-for="actividad in actividades"
              :key="
                actividad._id ||
                actividad.id
              "
              class="activity-card"
            >
              <div class="activity-icon">
                <ClipboardList
                  :size="20"
                />
              </div>

              <div class="activity-content">
                <h3>
                  {{
                    actividad.titulo ||
                    "Actividad"
                  }}
                </h3>

                <p>
                  {{
                    actividad.descripcion ||
                    "Sin descripción."
                  }}
                </p>

                <div class="activity-info">
                  <span>
                    {{
                      actividad.tipo ||
                      "tarea"
                    }}
                  </span>

                  <span>
                    Periodo
                    {{
                      actividad.periodo ||
                      1
                    }}
                  </span>

                  <span>
                    {{
                      actividad.porcentaje ??
                      0
                    }}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            v-else
            class="empty-state large"
          >
            <div class="empty-icon">
              <ClipboardList
                :size="42"
              />
            </div>

            <h3>
              No hay actividades
            </h3>

            <p>
              Usa el botón
              <strong>Crear actividad</strong>
              para agregar la primera.
            </p>
          </div>
        </div>
      </section>

      <!-- ================= OBSERVACIONES ================= -->
      <section v-else-if="seccionActiva === 'observaciones'" class="content-section">
        <div class="section-title">
          <div><h2>Observaciones</h2><p>Registra y consulta observaciones académicas o de convivencia.</p></div>
          <button type="button" class="primary-button" @click="mostrarFormularioObservacion = !mostrarFormularioObservacion">
            {{ mostrarFormularioObservacion ? "Cancelar" : "+ Nueva observación" }}
          </button>
        </div>
        <div v-if="mostrarFormularioObservacion" class="panel inline-form-panel">
          <form class="modal-form" novalidate @submit.prevent="crearObservacion">
            <div class="form-grid">
              <div class="field"><label>Grupo</label>
                <select v-model="nuevaObservacion.grupoId" @change="cargarEstudiantesObservacion"><option value="">Selecciona un grupo</option>
                  <option v-for="grupo in grupos" :key="grupo._id || grupo.id" :value="String(grupo._id || grupo.id)">{{ nombreElemento(grupo) }}</option>
                </select>
              </div>
              <div class="field"><label>Estudiante</label>
                <select v-model="nuevaObservacion.estudianteId"><option value="">Selecciona estudiante</option>
                  <option v-for="estudiante in estudiantesObservacion" :key="estudiante.id" :value="estudiante.id">{{ estudiante.nombre }}</option>
                </select>
              </div>
              <div class="field"><label>Tipo</label>
                <select v-model="nuevaObservacion.tipo"><option value="academica">Académica</option><option value="convivencia">Convivencia</option><option value="positiva">Positiva</option><option value="seguimiento">Seguimiento</option></select>
              </div>
              <div class="field"><label>Fecha</label><input v-model="nuevaObservacion.fecha" type="date" /></div>
            </div>
            <div class="field"><label>Observación</label><textarea v-model="nuevaObservacion.descripcion" placeholder="Describe la observación con respeto y claridad..."></textarea></div>
            <div class="modal-actions">
              <button type="button" class="secondary-button" @click="mostrarFormularioObservacion = false">Cancelar</button>
              <button type="submit" class="primary-button">Guardar observación</button>
            </div>
          </form>
        </div>
        <div class="panel">
          <div v-if="observaciones.length" class="activity-list">
            <div v-for="observacion in observaciones" :key="observacion.id" class="activity-card">
              <div class="activity-icon"><NotebookPen :size="20" /></div>
              <div class="activity-content">
                <h3>{{ observacion.estudianteNombre || "Estudiante" }} · {{ observacion.tipo }}</h3>
                <p>{{ observacion.descripcion }}</p>
                <div class="activity-info"><span>{{ observacion.grupoNombre || "Grupo" }}</span><span>{{ observacion.fecha }}</span></div>
              </div>
              <button type="button" class="secondary-button compact-button" @click="eliminarObservacion(observacion.id)">Eliminar</button>
            </div>
          </div>
          <div v-else class="empty-state large">
            <div class="empty-icon"><NotebookPen :size="42" /></div><h3>No hay observaciones</h3><p>Usa “Nueva observación” para registrar la primera.</p>
          </div>
        </div>
      </section>

      <!-- ================= COMUNICADOS ================= -->
      <section
        v-else-if="
          seccionActiva === 'comunicados'
        "
        class="content-section"
      >
        <div class="section-title">
          <div>
            <h2>Comunicados</h2>
            <p>
              Envía información a tus grupos.
            </p>
          </div>

          <button
            type="button"
            class="primary-button"
            @click="abrirFormularioComunicado"
          >
            + Nuevo comunicado
          </button>
        </div>

        <div class="panel">
          <div
            v-if="comunicados.length"
            class="communication-list"
          >
            <div
              v-for="comunicado in comunicados"
              :key="
                comunicado._id ||
                comunicado.id
              "
              class="communication-card"
            >
              <div class="communication-icon">
                <Megaphone
                  :size="20"
                />
              </div>

              <div class="communication-content">
                <div class="communication-title">
                  <h3>
                    {{
                      comunicado.asunto ||
                      "Comunicado"
                    }}
                  </h3>

                  <span
                    class="priority"
                    :class="{
                      urgente:
                        comunicado.prioridad ===
                        'urgente',
                    }"
                  >
                    {{
                      comunicado.prioridad ||
                      "normal"
                    }}
                  </span>
                </div>

                <p>
                  {{
                    comunicado.mensaje ||
                    "Sin mensaje."
                  }}
                </p>
              </div>

              <div class="communication-actions">
                <button
                  type="button"
                  class="delete-communication-button"
                  :disabled="eliminandoComunicadoId === String(comunicado._id || comunicado.id || '')"
                  @click="eliminarComunicado(comunicado)"
                  :aria-label="`Eliminar comunicado ${comunicado.asunto || ''}`"
                >
                  {{ eliminandoComunicadoId === String(comunicado._id || comunicado.id || '') ? "Eliminando..." : "Eliminar" }}
                </button>
              </div>
            </div>
          </div>

          <div
            v-else
            class="empty-state large"
          >
            <div class="empty-icon">
              <Megaphone
                :size="42"
              />
            </div>

            <h3>
              No hay comunicados
            </h3>

            <p>
              Usa el botón
              <strong>Nuevo comunicado</strong>
              para enviar uno.
            </p>
          </div>
        </div>
      </section>

      <!-- ================= HORARIO ================= -->
      <section v-else-if="seccionActiva === 'horario'" class="content-section">
        <div class="section-title">
          <div><h2>Horario</h2><p>Organiza y consulta tus clases de la semana.</p></div>
          <button type="button" class="primary-button" @click="mostrarFormularioHorario = !mostrarFormularioHorario">
            {{ mostrarFormularioHorario ? "Cancelar" : "+ Agregar clase" }}
          </button>
        </div>
        <div v-if="mostrarFormularioHorario" class="panel inline-form-panel">
          <form class="modal-form" novalidate @submit.prevent="crearHorario">
            <div class="form-grid">
              <div class="field"><label>Día</label><select v-model="nuevoHorario.dia"><option v-for="dia in diasSemana" :key="dia" :value="dia">{{ dia }}</option></select></div>
              <div class="field"><label>Grupo</label><select v-model="nuevoHorario.grupoId"><option value="">Selecciona un grupo</option><option v-for="grupo in grupos" :key="grupo._id || grupo.id" :value="String(grupo._id || grupo.id)">{{ nombreElemento(grupo) }}</option></select></div>
              <div class="field"><label>Asignatura</label><select v-model="nuevoHorario.asignaturaId"><option value="">Selecciona asignatura</option><option v-for="asignatura in asignaturas" :key="asignatura._id || asignatura.id" :value="String(asignatura._id || asignatura.id)">{{ nombreElemento(asignatura) }}</option></select></div>
              <div class="field"><label>Hora de inicio</label><input v-model="nuevoHorario.inicio" type="time" /></div>
              <div class="field"><label>Hora de finalización</label><input v-model="nuevoHorario.fin" type="time" /></div>
              <div class="field"><label>Salón (opcional)</label><input v-model="nuevoHorario.salon" type="text" placeholder="Ej. Aula 203" /></div>
            </div>
            <div class="modal-actions"><button type="button" class="secondary-button" @click="mostrarFormularioHorario = false">Cancelar</button><button type="submit" class="primary-button">Guardar clase</button></div>
          </form>
        </div>
        <div class="panel">
          <div v-if="horarios.length" class="activity-list">
            <div v-for="clase in horariosOrdenados" :key="clase.id" class="activity-card">
              <div class="activity-icon"><CalendarDays :size="20" /></div>
              <div class="activity-content"><h3>{{ clase.dia }} · {{ clase.inicio }}–{{ clase.fin }}</h3><p>{{ clase.asignaturaNombre }} · {{ clase.grupoNombre }}</p><div class="activity-info"><span v-if="clase.salon">Salón {{ clase.salon }}</span></div></div>
              <button type="button" class="secondary-button compact-button" @click="eliminarHorario(clase.id)">Eliminar</button>
            </div>
          </div>
          <div v-else class="empty-state large"><div class="empty-icon"><CalendarDays :size="42" /></div><h3>Tu horario está vacío</h3><p>Agrega tus clases para tenerlas organizadas por día y hora.</p></div>
        </div>
      </section>

      <!-- ================= PERFIL ================= -->
      <section v-else-if="seccionActiva === 'perfil'" class="content-section">
        <div class="section-title"><div><h2>Perfil</h2><p>Consulta y actualiza tu información personal.</p></div>
          <button type="button" class="primary-button" @click="guardarPerfil" :disabled="guardandoPerfil">{{ guardandoPerfil ? "Guardando..." : "Guardar cambios" }}</button>
        </div>
        <div class="panel profile-edit-panel">
          <div class="profile-large">{{ inicialesProfesor }}</div>
          <div class="profile-edit-fields">
            <div class="form-grid">
              <div class="field"><label>Nombres</label><input v-model="perfilEditado.nombres" type="text" /></div>
              <div class="field"><label>Apellidos</label><input v-model="perfilEditado.apellidos" type="text" /></div>
              <div class="field"><label>Correo electrónico</label><input v-model="perfilEditado.email" type="email" /></div>
              <div class="field"><label>Usuario</label><input v-model="perfilEditado.usuario" type="text" /></div>
            </div>
            <p class="profile-hint">Los cambios se guardan en tu cuenta si el servidor admite la actualización; si no, se conservan localmente en este navegador.</p>
          </div>
        </div>
      </section>
    </main>

    <!-- ===================================================== -->
    <!-- MODAL CREAR ACTIVIDAD -->
    <!-- ===================================================== -->

    <div
      v-if="mostrarFormularioActividad"
      class="modal-overlay"
      @click.self="cerrarFormularioActividad"
    >
      <div class="modal">
        <div class="modal-header">
          <div>
            <h2>Crear actividad</h2>

            <p>
              Completa la información de la
              actividad.
            </p>
          </div>

          <button
            type="button"
            class="close-button"
            @click="cerrarFormularioActividad"
          >
            ×
          </button>
        </div>

        <!-- IMPORTANTE:
             novalidate evita los mensajes nativos
             de Chrome como "Completa este campo".
        -->
        <form
          class="modal-form"
          novalidate
          @submit.prevent="crearActividad"
        >
          <div class="form-grid">
            <div class="field">
              <label>Año académico</label>

              <select
                v-model="
                  nuevaActividad.anioAcademicoId
                "
              >
                <option value="">
                  Selecciona un año
                </option>

                <option
                  v-for="anio in aniosAcademicos"
                  :key="
                    anio._id ||
                    anio.id
                  "
                  :value="
                    anio._id ||
                    anio.id
                  "
                >
                  {{ nombreElemento(anio) }}
                </option>
              </select>
            </div>

            <div class="field">
              <label>Indicador</label>

              <select
                v-model="
                  nuevaActividad.indicadorId
                "
              >
                <option value="">
                  Selecciona un indicador
                </option>

                <option
                  v-for="indicador in indicadores"
                  :key="
                    indicador._id ||
                    indicador.id
                  "
                  :value="
                    indicador._id ||
                    indicador.id
                  "
                >
                  {{
                    nombreElemento(
                      indicador
                    )
                  }}
                </option>
              </select>
            </div>

            <div class="field">
              <label>Asignatura</label>

              <select
                v-model="
                  nuevaActividad.asignaturaId
                "
              >
                <option value="">
                  Selecciona una asignatura
                </option>

                <option
                  v-for="asignatura in asignaturas"
                  :key="
                    asignatura._id ||
                    asignatura.id
                  "
                  :value="
                    asignatura._id ||
                    asignatura.id
                  "
                >
                  {{
                    nombreElemento(
                      asignatura
                    )
                  }}
                </option>
              </select>
            </div>

            <div class="field">
              <label>Grupo</label>

              <select
                v-model="
                  nuevaActividad.grupoId
                "
              >
                <option value="">
                  Selecciona un grupo
                </option>

                <option
                  v-for="grupo in grupos"
                  :key="
                    grupo._id ||
                    grupo.id
                  "
                  :value="
                    grupo._id ||
                    grupo.id
                  "
                >
                  {{ nombreElemento(grupo) }}
                </option>
              </select>
            </div>

            <div class="field">
              <label>Periodo</label>

              <select
                v-model.number="
                  nuevaActividad.periodo
                "
              >
                <option :value="1">
                  Periodo 1
                </option>

                <option :value="2">
                  Periodo 2
                </option>

                <option :value="3">
                  Periodo 3
                </option>

                <option :value="4">
                  Periodo 4
                </option>
              </select>
            </div>

            <div class="field">
              <label>Tipo</label>

              <select
                v-model="
                  nuevaActividad.tipo
                "
              >
                <option value="tarea">
                  Tarea
                </option>

                <option value="examen">
                  Examen
                </option>

                <option value="quiz">
                  Quiz
                </option>

                <option value="proyecto">
                  Proyecto
                </option>

                <option value="participacion">
                  Participación
                </option>

                <option value="otro">
                  Otro
                </option>
              </select>
            </div>

            <div class="field">
              <label>Porcentaje</label>

              <input
                v-model.number="
                  nuevaActividad.porcentaje
                "
                type="number"
                min="0"
                max="100"
                step="1"
                placeholder="Ej. 20"
              />
            </div>

            <div class="field">
              <label>Fecha límite</label>

              <input
                v-model="
                  nuevaActividad.fechaLimite
                "
                type="date"
              />
            </div>
          </div>

          <div class="field">
            <label>Título</label>

            <input
              v-model="
                nuevaActividad.titulo
              "
              type="text"
              placeholder="Título de la actividad"
            />
          </div>

          <div class="field">
            <label>Descripción</label>

            <textarea
              v-model="
                nuevaActividad.descripcion
              "
              placeholder="Describe la actividad..."
            ></textarea>
          </div>

          <div
            v-if="errorActividad"
            class="form-error"
          >
            {{ errorActividad }}
          </div>

          <div class="modal-actions">
            <button
              type="button"
              class="secondary-button"
              @click="cerrarFormularioActividad"
            >
              Cancelar
            </button>

            <button
              type="submit"
              class="primary-button"
              :disabled="guardandoActividad"
            >
              {{
                guardandoActividad
                  ? "Guardando..."
                  : "Crear actividad"
              }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ===================================================== -->
    <!-- MODAL NUEVO COMUNICADO -->
    <!-- ===================================================== -->

    <div
      v-if="mostrarFormularioComunicado"
      class="modal-overlay"
      @click.self="cerrarFormularioComunicado"
    >
      <div class="modal">
        <div class="modal-header">
          <div>
            <h2>Nuevo comunicado</h2>

            <p>
              Envía un mensaje a uno de tus
              grupos.
            </p>
          </div>

          <button
            type="button"
            class="close-button"
            @click="cerrarFormularioComunicado"
          >
            ×
          </button>
        </div>

        <!-- IMPORTANTE:
             novalidate elimina la validación
             nativa del navegador.
        -->
        <form
          class="modal-form"
          novalidate
          @submit.prevent="crearComunicado"
        >
          <div class="form-grid">
            <div class="field">
              <label>Grupo destinatario</label>

              <select
                v-model="
                  nuevoComunicado.grupoId
                "
              >
                <option value="">
                  Selecciona un grupo
                </option>

                <option
                  v-for="grupo in grupos"
                  :key="
                    grupo._id ||
                    grupo.id
                  "
                  :value="
                    grupo._id ||
                    grupo.id
                  "
                >
                  {{ nombreElemento(grupo) }}
                </option>
              </select>
            </div>

            <div class="field">
              <label>Prioridad</label>

              <select
                v-model="
                  nuevoComunicado.prioridad
                "
              >
                <option value="normal">
                  Normal
                </option>

                <option value="urgente">
                  Urgente
                </option>
              </select>
            </div>
          </div>

          <div class="field">
            <label>Asunto</label>

            <input
              v-model="
                nuevoComunicado.asunto
              "
              type="text"
              placeholder="Asunto del comunicado"
            />
          </div>

          <div class="field">
            <label>Mensaje</label>

            <textarea
              v-model="
                nuevoComunicado.mensaje
              "
              placeholder="Escribe el comunicado..."
            ></textarea>
          </div>

          <div
            v-if="errorComunicado"
            class="form-error"
          >
            {{ errorComunicado }}
          </div>

          <div class="modal-actions">
            <button
              type="button"
              class="secondary-button"
              @click="
                cerrarFormularioComunicado
              "
            >
              Cancelar
            </button>

            <button
              type="submit"
              class="primary-button"
              :disabled="
                guardandoComunicado
              "
            >
              {{
                guardandoComunicado
                  ? "Enviando..."
                  : "Enviar comunicado"
              }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

import {
  House,
  Users,
  ClipboardPenLine,
  CalendarCheck,
  ClipboardList,
  NotebookPen,
  Megaphone,
  CalendarDays,
  User,
  LogOut,
  GraduationCap,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "@lucide/vue";

const router = useRouter();
const auth = useAuthStore();

/* =========================================================
   NAVEGACIÓN
========================================================= */

const seccionActiva = ref("inicio");
const sidebarOculta = ref(false);

const menuItems = [
  {
    id: "inicio",
    label: "Inicio",
    icon: House,
  },
  {
    id: "grupos",
    label: "Mis grupos",
    icon: Users,
  },
  {
    id: "calificaciones",
    label: "Calificaciones",
    icon: ClipboardPenLine,
  },
  {
    id: "asistencia",
    label: "Asistencia",
    icon: CalendarCheck,
  },
  {
    id: "tareas",
    label: "Tareas y actividades",
    icon: ClipboardList,
  },
  {
    id: "observaciones",
    label: "Observaciones",
    icon: NotebookPen,
  },
  {
    id: "comunicados",
    label: "Comunicados",
    icon: Megaphone,
  },
  {
    id: "horario",
    label: "Horario",
    icon: CalendarDays,
  },
  {
    id: "perfil",
    label: "Perfil",
    icon: User,
  },
];

/* =========================================================
   NOTIFICACIONES
========================================================= */

const mostrarNotificacion = ref(false);
const mensajeNotificacion = ref("");
const tipoNotificacion =
  ref<"exito" | "error">("exito");

let temporizadorNotificacion:
  | ReturnType<typeof setTimeout>
  | null = null;

const mostrarMensaje = (
  mensaje: string,
  tipo: "exito" | "error" = "exito"
) => {
  mensajeNotificacion.value = mensaje;
  tipoNotificacion.value = tipo;
  mostrarNotificacion.value = true;

  if (temporizadorNotificacion) {
    clearTimeout(temporizadorNotificacion);
  }

  temporizadorNotificacion =
    setTimeout(() => {
      mostrarNotificacion.value = false;
    }, 3500);
};

const cerrarNotificacion = () => {
  mostrarNotificacion.value = false;

  if (temporizadorNotificacion) {
    clearTimeout(
      temporizadorNotificacion
    );

    temporizadorNotificacion = null;
  }
};

/* =========================================================
   USUARIO
========================================================= */

const usuarioGuardado =
  localStorage.getItem("usuario");

const usuario = usuarioGuardado
  ? JSON.parse(usuarioGuardado)
  : null;

const nombreProfesor = computed(() => {
  if (!usuario) {
    return "Profesor";
  }

  const nombreCompleto = [
    usuario.nombres,
    usuario.apellidos,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    nombreCompleto ||
    usuario.nombre ||
    usuario.usuario ||
    "Profesor"
  );
});

const primerNombre = computed(() => {
  return nombreProfesor.value.split(" ")[0];
});

const correoProfesor = computed(() => {
  return (
    usuario?.email ||
    "No registrado"
  );
});

const inicialesProfesor = computed(() => {
  const palabras =
    nombreProfesor.value
      .split(" ")
      .filter(Boolean);

  if (palabras.length === 1) {
    return palabras[0]
      .substring(0, 2)
      .toUpperCase();
  }

  return (
    palabras[0][0] +
    palabras[palabras.length - 1][0]
  ).toUpperCase();
});

const tituloSeccion = computed(() => {
  const actual = menuItems.find(
    (item) =>
      item.id === seccionActiva.value
  );

  return actual?.label || "Inicio";
});

/* =========================================================
   TOKEN
========================================================= */

const obtenerToken = () => {
  return localStorage.getItem("token");
};

/* =========================================================
   ACTIVIDADES
========================================================= */

const grupos = ref<any[]>([]);
const asignaturas = ref<any[]>([]);
const indicadores = ref<any[]>([]);
const aniosAcademicos = ref<any[]>([]);
const actividades = ref<any[]>([]);

const mostrarFormularioActividad =
  ref(false);

const guardandoActividad = ref(false);

const errorActividad = ref("");

const nuevaActividad = ref({
  anioAcademicoId: "",
  indicadorId: "",
  asignaturaId: "",
  grupoId: "",
  periodo: 1,
  titulo: "",
  descripcion: "",
  tipo: "tarea",
  porcentaje: 0,
  fechaLimite: "",
});

/* =========================================================
   COMUNICADOS
========================================================= */

const comunicados = ref<any[]>([]);
const eliminandoComunicadoId = ref("");

const mostrarFormularioComunicado =
  ref(false);

const guardandoComunicado = ref(false);

const errorComunicado = ref("");

const nuevoComunicado = ref({
  grupoId: "",
  asunto: "",
  mensaje: "",
  prioridad: "normal",
});

/* =========================================================
   UTILIDADES
========================================================= */

const nombreElemento = (
  elemento: any
) => {
  if (!elemento) {
    return "Sin nombre";
  }

  return (
    elemento.nombre ||
    elemento.nombreCompleto ||
    elemento.descripcion ||
    elemento.titulo ||
    elemento.nombreAsignatura ||
    elemento.nombreGrupo ||
    elemento.codigo ||
    "Sin nombre"
  );
};

/* =========================================================
   CARGAR DATOS PARA ACTIVIDADES Y COMUNICADOS
========================================================= */

const cargarDatosActividad =
  async () => {
    const token = obtenerToken();

    if (!token) {
      mostrarMensaje(
        "No hay una sesión activa.",
        "error"
      );

      return false;
    }

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        respuestaGrupos,
        respuestaAsignaturas,
        respuestaIndicadores,
        respuestaAnios,
      ] = await Promise.all([
        fetch("/api/grupos", {
          headers,
        }),

        fetch("/api/asignaturas", {
          headers,
        }),

        fetch("/api/indicadores", {
          headers,
        }),

        fetch("/api/anios-academicos", {
          headers,
        }),
      ]);

      let huboError = false;

      if (respuestaGrupos.ok) {
        const datos =
          await respuestaGrupos.json();

        grupos.value = Array.isArray(datos)
          ? datos
          : datos.grupos ||
            datos.data ||
            [];
      } else {
        huboError = true;
      }

      if (respuestaAsignaturas.ok) {
        const datos =
          await respuestaAsignaturas.json();

        asignaturas.value =
          Array.isArray(datos)
            ? datos
            : datos.asignaturas ||
              datos.data ||
              [];
      } else {
        huboError = true;
      }

      if (respuestaIndicadores.ok) {
        const datos =
          await respuestaIndicadores.json();

        indicadores.value =
          Array.isArray(datos)
            ? datos
            : datos.indicadores ||
              datos.data ||
              [];
      } else {
        huboError = true;
      }

      if (respuestaAnios.ok) {
        const datos =
          await respuestaAnios.json();

        aniosAcademicos.value =
          Array.isArray(datos)
            ? datos
            : datos.anios ||
              datos.aniosAcademicos ||
              datos.data ||
              [];
      } else {
        huboError = true;
      }

      if (huboError) {
        mostrarMensaje(
          "No se pudo cargar toda la información necesaria para la actividad.",
          "error"
        );

        return false;
      }

      return true;
    } catch (error) {
      console.error(
        "Error cargando datos para actividad:",
        error
      );

      mostrarMensaje(
        "No se pudo cargar la información para crear la actividad.",
        "error"
      );

      return false;
    }
  };

/* =========================================================
   ABRIR / CERRAR ACTIVIDAD
========================================================= */

const abrirFormularioActividad =
  async () => {
    errorActividad.value = "";

    const datosCargados =
      await cargarDatosActividad();

    if (!datosCargados) {
      return;
    }

    mostrarFormularioActividad.value =
      true;
  };

const cerrarFormularioActividad =
  () => {
    mostrarFormularioActividad.value =
      false;

    errorActividad.value = "";

    nuevaActividad.value = {
      anioAcademicoId: "",
      indicadorId: "",
      asignaturaId: "",
      grupoId: "",
      periodo: 1,
      titulo: "",
      descripcion: "",
      tipo: "tarea",
      porcentaje: 0,
      fechaLimite: "",
    };
  };

/* =========================================================
   CARGAR ACTIVIDADES
========================================================= */

const cargarActividades =
  async () => {
    const token = obtenerToken();

    if (!token) {
      return;
    }

    try {
      const respuesta = await fetch(
        "/api/actividades",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!respuesta.ok) {
        return;
      }

      const datos =
        await respuesta.json();

      actividades.value =
        Array.isArray(datos)
          ? datos
          : datos.actividades ||
            datos.data ||
            [];
    } catch (error) {
      console.error(
        "Error cargando actividades:",
        error
      );
    }
  };

/* =========================================================
   CREAR ACTIVIDAD
   VALIDACIÓN PERSONALIZADA
   SIN ALERTAS NATIVAS DE CHROME
========================================================= */

const crearActividad = async () => {
  errorActividad.value = "";

  const token = obtenerToken();

  if (!token) {
    errorActividad.value =
      "No hay una sesión activa.";

    mostrarMensaje(
      "No hay una sesión activa.",
      "error"
    );

    return;
  }

  if (!usuario?.institucionId) {
    errorActividad.value =
      "No se encontró la institución del profesor.";

    mostrarMensaje(
      "No se encontró la institución del profesor.",
      "error"
    );

    return;
  }

  if (!usuario?.id && !usuario?._id) {
    errorActividad.value =
      "No se encontró el usuario del profesor.";

    mostrarMensaje(
      "No se encontró el usuario del profesor.",
      "error"
    );

    return;
  }

  /* VALIDACIÓN PERSONALIZADA */

  if (
    !nuevaActividad.value
      .anioAcademicoId
  ) {
    mostrarMensaje(
      "Selecciona el año académico.",
      "error"
    );

    return;
  }

  if (
    !nuevaActividad.value
      .indicadorId
  ) {
    mostrarMensaje(
      "Selecciona un indicador.",
      "error"
    );

    return;
  }

  if (
    !nuevaActividad.value
      .asignaturaId
  ) {
    mostrarMensaje(
      "Selecciona una asignatura.",
      "error"
    );

    return;
  }

  if (
    !nuevaActividad.value.grupoId
  ) {
    mostrarMensaje(
      "Selecciona un grupo.",
      "error"
    );

    return;
  }

  if (
    !nuevaActividad.value.titulo.trim()
  ) {
    mostrarMensaje(
      "Escribe un título para la actividad.",
      "error"
    );

    return;
  }

  if (
    nuevaActividad.value.porcentaje <
      0 ||
    nuevaActividad.value.porcentaje >
      100
  ) {
    mostrarMensaje(
      "El porcentaje debe estar entre 0 y 100.",
      "error"
    );

    return;
  }

  guardandoActividad.value =
    true;

  try {
    const actividad = {
      institucionId:
        usuario.institucionId,

      anioAcademicoId:
        nuevaActividad.value
          .anioAcademicoId,

      indicadorId:
        nuevaActividad.value
          .indicadorId,

      asignaturaId:
        nuevaActividad.value
          .asignaturaId,

      grupoId:
        nuevaActividad.value
          .grupoId,

      docenteId:
        usuario.id ||
        usuario._id,

      periodo:
        nuevaActividad.value.periodo,

      titulo:
        nuevaActividad.value.titulo.trim(),

      descripcion:
        nuevaActividad.value.descripcion.trim(),

      tipo:
        nuevaActividad.value.tipo,

      porcentaje:
        nuevaActividad.value.porcentaje,

      fechaLimite:
        nuevaActividad.value
          .fechaLimite
          ? nuevaActividad.value
              .fechaLimite
          : undefined,
    };

    const respuesta = await fetch(
      "/api/actividades",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(
          actividad
        ),
      }
    );

    const datos =
      await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        datos.mensaje ||
          datos.message ||
          "No se pudo crear la actividad."
      );
    }

    if (datos.actividad) {
      actividades.value.unshift(
        datos.actividad
      );
    } else {
      await cargarActividades();
    }

    cerrarFormularioActividad();

    mostrarMensaje(
      "La actividad fue creada correctamente.",
      "exito"
    );
  } catch (error: any) {
    const mensaje =
      error.message ||
      "Ocurrió un error al crear la actividad.";

    errorActividad.value =
      mensaje;

    mostrarMensaje(
      mensaje,
      "error"
    );
  } finally {
    guardandoActividad.value =
      false;
  }
};

/* =========================================================
   ABRIR / CERRAR COMUNICADO
========================================================= */

const abrirFormularioComunicado =
  async () => {
    errorComunicado.value = "";

    const datosCargados =
      await cargarDatosActividad();

    if (!datosCargados) {
      return;
    }

    mostrarFormularioComunicado.value =
      true;
  };

const cerrarFormularioComunicado =
  () => {
    mostrarFormularioComunicado.value =
      false;

    errorComunicado.value = "";

    nuevoComunicado.value = {
      grupoId: "",
      asunto: "",
      mensaje: "",
      prioridad: "normal",
    };
  };

/* =========================================================
   ELIMINAR COMUNICADO
========================================================= */

const eliminarComunicado = async (comunicado: any) => {
  const id = String(comunicado?._id || comunicado?.id || "");
  if (!id) {
    mostrarMensaje("Este comunicado no tiene un identificador válido para eliminarlo.", "error");
    return;
  }
  if (eliminandoComunicadoId.value) return;

  const token = obtenerToken();
  if (!token) {
    mostrarMensaje("No hay una sesión activa para eliminar el comunicado.", "error");
    return;
  }

  eliminandoComunicadoId.value = id;
  try {
    const respuesta = await fetch(`/api/comunicados/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    let datos: any = {};
    try { datos = await respuesta.json(); } catch { /* respuesta sin JSON */ }
    if (!respuesta.ok) {
      throw new Error(datos?.mensaje || datos?.message || "No se pudo eliminar. Comprueba que el backend tenga habilitada la ruta DELETE /api/comunicados/:id.");
    }

    comunicados.value = comunicados.value.filter((item: any) => String(item?._id || item?.id || "") !== id);
    mostrarMensaje("Comunicado eliminado correctamente.", "exito");
  } catch (error: any) {
    mostrarMensaje(error?.message || "Ocurrió un error al eliminar el comunicado.", "error");
  } finally {
    eliminandoComunicadoId.value = "";
  }
};

/* =========================================================
   CARGAR COMUNICADOS
========================================================= */

const cargarComunicados =
  async () => {
    const token = obtenerToken();

    if (!token) {
      return;
    }

    try {
      const respuesta = await fetch(
        "/api/comunicados",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!respuesta.ok) {
        return;
      }

      const datos =
        await respuesta.json();

      comunicados.value =
        Array.isArray(datos)
          ? datos
          : datos.comunicados ||
            datos.data ||
            [];
    } catch (error) {
      console.error(
        "Error cargando comunicados:",
        error
      );
    }
  };

/* =========================================================
   CREAR COMUNICADO
   VALIDACIÓN PERSONALIZADA
   SIN ALERTAS NATIVAS DE CHROME
========================================================= */

const crearComunicado =
  async () => {
    errorComunicado.value = "";

    const token = obtenerToken();

    if (!token) {
      errorComunicado.value =
        "No hay una sesión activa.";

      mostrarMensaje(
        "No hay una sesión activa.",
        "error"
      );

      return;
    }

    if (!usuario?.institucionId) {
      errorComunicado.value =
        "No se encontró la institución del profesor.";

      mostrarMensaje(
        "No se encontró la institución del profesor.",
        "error"
      );

      return;
    }

    if (!usuario?.id && !usuario?._id) {
      errorComunicado.value =
        "No se encontró el usuario del profesor.";

      mostrarMensaje(
        "No se encontró el usuario del profesor.",
        "error"
      );

      return;
    }

    /* VALIDACIÓN PERSONALIZADA */

    if (
      !nuevoComunicado.value
        .grupoId
    ) {
      mostrarMensaje(
        "Selecciona el grupo destinatario.",
        "error"
      );

      return;
    }

    if (
      !nuevoComunicado.value
        .asunto.trim()
    ) {
      mostrarMensaje(
        "Escribe el asunto del comunicado.",
        "error"
      );

      return;
    }

    if (
      !nuevoComunicado.value
        .mensaje.trim()
    ) {
      mostrarMensaje(
        "Escribe el mensaje del comunicado.",
        "error"
      );

      return;
    }

    guardandoComunicado.value =
      true;

    try {
      const comunicado = {
        institucionId:
          usuario.institucionId,

        remitenteId:
          usuario.id ||
          usuario._id,

        destinatarios: [
          {
            grupoId:
              nuevoComunicado.value
                .grupoId,
          },
        ],

        asunto:
          nuevoComunicado.value
            .asunto.trim(),

        mensaje:
          nuevoComunicado.value
            .mensaje.trim(),

        prioridad:
          nuevoComunicado.value
            .prioridad,

        estado: "enviado",
      };

      const respuesta = await fetch(
        "/api/comunicados",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(
            comunicado
          ),
        }
      );

      const datos =
        await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje ||
            datos.message ||
            "No se pudo crear el comunicado."
        );
      }

      comunicados.value.unshift(
        datos
      );

      cerrarFormularioComunicado();

      mostrarMensaje(
        "El comunicado fue enviado correctamente.",
        "exito"
      );
    } catch (error: any) {
      const mensaje =
        error.message ||
        "Ocurrió un error al enviar el comunicado.";

      errorComunicado.value =
        mensaje;

      mostrarMensaje(
        mensaje,
        "error"
      );
    } finally {
      guardandoComunicado.value =
        false;
    }
  };


/* =========================================================
   FUNCIONES DE CALIFICACIONES, ASISTENCIA, OBSERVACIONES,
   HORARIO Y PERFIL
   Se intenta usar la API. Si el endpoint no está disponible,
   los registros de estas secciones se conservan en localStorage.
========================================================= */

const grupoCalificacionesId = ref("");
const asignaturaCalificacionesId = ref("");
const periodoCalificaciones = ref(1);
const estudiantesCalificaciones = ref<any[]>([]);
const estudianteCalificacionId = ref("");
const estudiantesCalificacionesVisibles = computed(() => {
  if (!estudianteCalificacionId.value) return estudiantesCalificaciones.value;
  return estudiantesCalificaciones.value.filter((e: any) => String(e.id) === String(estudianteCalificacionId.value));
});
const guardandoCalificaciones = ref(false);

const grupoAsistenciaId = ref("");
const fechaAsistencia = ref(new Date().toISOString().slice(0, 10));
const estudiantesAsistencia = ref<any[]>([]);
const guardandoAsistencia = ref(false);

const mostrarFormularioObservacion = ref(false);
const observaciones = ref<any[]>([]);
const estudiantesObservacion = ref<any[]>([]);
const nuevaObservacion = ref({
  grupoId: "",
  estudianteId: "",
  tipo: "academica",
  fecha: new Date().toISOString().slice(0, 10),
  descripcion: "",
});

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const mostrarFormularioHorario = ref(false);
const horarios = ref<any[]>([]);
const nuevoHorario = ref({
  dia: "Lunes",
  grupoId: "",
  asignaturaId: "",
  inicio: "07:00",
  fin: "08:00",
  salon: "",
});
const horariosOrdenados = computed(() => {
  const orden = diasSemana;
  return [...horarios.value].sort((a, b) =>
    orden.indexOf(a.dia) - orden.indexOf(b.dia) ||
    String(a.inicio).localeCompare(String(b.inicio))
  );
});

const perfilEditado = ref({
  nombres: usuario?.nombres || usuario?.nombre || "",
  apellidos: usuario?.apellidos || "",
  email: usuario?.email || "",
  usuario: usuario?.usuario || "",
});
const guardandoPerfil = ref(false);

const leerLocal = (clave: string) => {
  try {
    const valor = localStorage.getItem(`easynotes_profesor_${clave}`);
    return valor ? JSON.parse(valor) : [];
  } catch {
    return [];
  }
};

const guardarLocal = (clave: string, valor: any) => {
  localStorage.setItem(`easynotes_profesor_${clave}`, JSON.stringify(valor));
};

const idDe = (elemento: any) => String(elemento?._id || elemento?.id || elemento?.usuarioId || "");

const nombrePersona = (elemento: any) => {
  const nombre = [elemento?.nombres, elemento?.apellidos].filter(Boolean).join(" ").trim();
  return nombre || elemento?.nombreCompleto || elemento?.nombre || elemento?.usuario || elemento?.email || "Estudiante";
};

const rolNormalizado = (item: any): string => {
  const rol = item?.rol ?? item?.role ?? item?.tipoUsuario ?? item?.tipo_usuario ??
    item?.rolUsuario ?? item?.tipoPerfil ?? item?.tipo ?? item?.perfil?.rol ??
    item?.usuario?.rol ?? item?.usuario?.role ?? item?.usuario?.tipoUsuario ??
    item?.estudiante?.rol ?? item?.estudiante?.tipoUsuario ?? "";
  return String(rol).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
};

const esEstudiante = (item: any, asumirEstudiante = false): boolean => {
  const rol = rolNormalizado(item);
  const rolesEstudiante = ["estudiante", "alumno", "aprendiz", "student"];
  const rolesNoEstudiante = ["coordinador", "coordinator", "profesor", "docente", "administrador", "admin", "acudiente", "padre", "madre"];
  if (rolesEstudiante.some((r) => rol === r || rol.includes(r))) return true;
  if (rolesNoEstudiante.some((r) => rol === r || rol.includes(r))) return false;
  return asumirEstudiante;
};

const extraerLista = (datos: any): any[] => {
  if (Array.isArray(datos)) return datos;
  if (!datos || typeof datos !== "object") return [];
  for (const clave of ["estudiantes", "alumnos", "matriculas", "matrículas", "usuarios", "data", "results", "resultados", "docs"]) {
    const valor = datos[clave];
    if (Array.isArray(valor)) return valor;
    if (valor && typeof valor === "object") {
      const anidada = extraerLista(valor);
      if (anidada.length) return anidada;
    }
  }
  return [];
};

const normalizarEstudiantes = (datos: any, asumirEstudiante = false): any[] => {
  const lista = extraerLista(datos);
  if (!lista.length) return [];
  const normalizados: any[] = [];
  for (const original of lista) {
    if (!original || typeof original !== "object") continue;
    // Algunas APIs devuelven matrículas que contienen el usuario/estudiante anidado.
    const item = original.estudiante || original.alumno || original.usuario || original;
    const rol = rolNormalizado(item) || rolNormalizado(original);
    const candidato = { ...original, ...item, rol: rol || item?.rol };
    if (!esEstudiante(candidato, asumirEstudiante)) continue;
    const id = idDe(candidato) || idDe(original) || String(candidato.codigo || candidato.documento || nombrePersona(candidato));
    normalizados.push({ ...candidato, id, nombre: nombrePersona(candidato) });
  }
  return normalizados.filter((item, index, arr) => arr.findIndex((x) => String(x.id) === String(item.id)) === index);
};

const buscarEstudiantesGrupo = async (grupoId: string): Promise<any[]> => {
  if (!grupoId) return [];
  const grupo = grupos.value.find((g: any) => idDe(g) === String(grupoId));
  const incrustados = normalizarEstudiantes(grupo?.estudiantes || grupo?.alumnos || grupo?.matriculas || grupo?.matrículas || [], true);
  if (incrustados.length) return incrustados;

  const token = obtenerToken();
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  const id = encodeURIComponent(grupoId);
  // Se prueban rutas comunes del backend; solo las rutas dedicadas permiten
  // aceptar estudiantes sin campo de rol. Las rutas generales siempre se filtran por rol.
  const rutas = [
    { url: `/api/grupos/${id}/estudiantes`, dedicada: true },
    { url: `/api/grupos/${id}/matriculas`, dedicada: true },
    { url: `/api/matriculas?grupoId=${id}`, dedicada: true },
    { url: `/api/estudiantes?grupoId=${id}`, dedicada: true },
    { url: `/api/usuarios?rol=estudiante&grupoId=${id}`, dedicada: false },
    { url: `/api/usuarios?tipoUsuario=estudiante&grupoId=${id}`, dedicada: false },
    { url: `/api/usuarios?rol=estudiante`, dedicada: false },
  ];
  for (const ruta of rutas) {
    try {
      const respuesta = await fetch(ruta.url, { headers });
      if (!respuesta.ok) continue;
      const datos = await respuesta.json();
      let lista = normalizarEstudiantes(datos, ruta.dedicada);
      // Si el endpoint general no filtra en servidor, exige que el usuario
      // pertenezca al grupo seleccionado cuando la respuesta incluye esa relación.
      if (!ruta.dedicada && lista.length) {
        lista = lista.filter((estudiante: any) => {
          const gruposDelEstudiante = estudiante.grupos || estudiante.gruposIds || estudiante.matriculas || estudiante.matrículas;
          if (!Array.isArray(gruposDelEstudiante) || !gruposDelEstudiante.length) return true;
          return gruposDelEstudiante.some((g: any) => String(typeof g === "object" ? (g._id || g.id || g.grupoId) : g) === String(grupoId));
        });
      }
      if (lista.length) return lista;
    } catch {
      // Si una ruta no existe o responde con un formato distinto, probar la siguiente.
    }
  }
  return [];
};

const cargarEstudiantesParaCalificar = async () => {
  estudiantesCalificaciones.value = [];
  estudianteCalificacionId.value = "";
  if (!grupoCalificacionesId.value) return;
  const estudiantes = await buscarEstudiantesGrupo(grupoCalificacionesId.value);
  if (!estudiantes.length) {
    mostrarMensaje("No se encontraron estudiantes para este grupo. Comprueba que estén matriculados y que el backend exponga la lista de estudiantes del grupo.", "error");
  }
  const guardadas = leerLocal("calificaciones");
  estudiantesCalificaciones.value = estudiantes.map((estudiante: any) => {
    const anterior = guardadas.find((item: any) =>
      item.estudianteId === estudiante.id &&
      item.grupoId === grupoCalificacionesId.value &&
      item.asignaturaId === asignaturaCalificacionesId.value &&
      Number(item.periodo) === Number(periodoCalificaciones.value)
    );
    return { ...estudiante, nota: anterior?.nota ?? null, observacion: anterior?.observacion || "" };
  });
  if (!estudiantesCalificaciones.value.some((e: any) => String(e.id) === String(estudianteCalificacionId.value))) {
    estudianteCalificacionId.value = "";
  }
};

const guardarCalificaciones = async () => {
  if (!grupoCalificacionesId.value || !asignaturaCalificacionesId.value) {
    mostrarMensaje("Selecciona un grupo y una asignatura antes de guardar.", "error");
    return;
  }
  if (!estudiantesCalificaciones.value.length) {
    mostrarMensaje("No hay estudiantes cargados para calificar en este grupo.", "error");
    return;
  }
  const invalidas = estudiantesCalificaciones.value.some((e: any) =>
    e.nota !== null && e.nota !== "" && (Number(e.nota) < 0 || Number(e.nota) > 5)
  );
  if (invalidas) {
    mostrarMensaje("Las calificaciones deben estar entre 0 y 5.", "error");
    return;
  }

  guardandoCalificaciones.value = true;
  const actuales = leerLocal("calificaciones");
  const token = obtenerToken();
  const payload = estudiantesCalificacionesVisibles.value.map((e: any) => ({
    estudianteId: e.id,
    estudianteNombre: e.nombre,
    docenteId: usuario?.id || usuario?._id,
    grupoId: grupoCalificacionesId.value,
    asignaturaId: asignaturaCalificacionesId.value,
    periodo: periodoCalificaciones.value,
    nota: e.nota === "" ? null : e.nota,
    observacion: e.observacion || "",
    actualizadoEn: new Date().toISOString(),
  }));
  const fusionadas = [...actuales];
  payload.forEach((item: any) => {
    const index = fusionadas.findIndex((prev: any) =>
      prev.estudianteId === item.estudianteId && prev.grupoId === item.grupoId &&
      prev.asignaturaId === item.asignaturaId && Number(prev.periodo) === Number(item.periodo)
    );
    if (index >= 0) fusionadas[index] = item;
    else fusionadas.push(item);
  });

  try {
    let respuestaOk = false;
    if (token) {
      try {
        const respuesta = await fetch("/api/calificaciones", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ calificaciones: payload }),
        });
        respuestaOk = respuesta.ok;
      } catch { /* Se conserva en local si la API no responde. */ }
    }
    guardarLocal("calificaciones", fusionadas);
    mostrarMensaje(respuestaOk ? "Calificaciones enviadas al servidor y guardadas." : "Calificaciones guardadas en este navegador. Verifica la conexión del backend para sincronizarlas.", "exito");
  } finally {
    guardandoCalificaciones.value = false;
  }
};

const cargarEstudiantesAsistencia = async () => {
  estudiantesAsistencia.value = [];
  if (!grupoAsistenciaId.value) return;
  const estudiantes = await buscarEstudiantesGrupo(grupoAsistenciaId.value);
  const guardadas = leerLocal("asistencias");
  estudiantesAsistencia.value = estudiantes.map((estudiante: any) => {
    const anterior = guardadas.find((item: any) =>
      item.estudianteId === estudiante.id && item.grupoId === grupoAsistenciaId.value && item.fecha === fechaAsistencia.value
    );
    return { ...estudiante, estado: anterior?.estado || "presente", nota: anterior?.nota || "" };
  });
};

const guardarAsistencia = async () => {
  if (!grupoAsistenciaId.value || !fechaAsistencia.value) {
    mostrarMensaje("Selecciona un grupo y una fecha.", "error");
    return;
  }
  if (!estudiantesAsistencia.value.length) {
    mostrarMensaje("No hay estudiantes cargados para este grupo.", "error");
    return;
  }
  guardandoAsistencia.value = true;
  const actuales = leerLocal("asistencias");
  const nuevos = estudiantesAsistencia.value.map((e: any) => ({
    estudianteId: e.id, estudianteNombre: e.nombre,
    docenteId: usuario?.id || usuario?._id,
    grupoId: grupoAsistenciaId.value, fecha: fechaAsistencia.value,
    estado: e.estado, nota: e.nota || "",
  }));
  const fusionadas = [...actuales];
  nuevos.forEach((item: any) => {
    const i = fusionadas.findIndex((old: any) => old.estudianteId === item.estudianteId && old.grupoId === item.grupoId && old.fecha === item.fecha);
    if (i >= 0) fusionadas[i] = item; else fusionadas.push(item);
  });
  let remoto = false;
  try {
    const token = obtenerToken();
    if (token) {
      try {
        const respuesta = await fetch("/api/asistencias", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ grupoId: grupoAsistenciaId.value, fecha: fechaAsistencia.value, asistencias: nuevos }),
        });
        remoto = respuesta.ok;
      } catch { /* respaldo local */ }
    }
    guardarLocal("asistencias", fusionadas);
    mostrarMensaje(remoto ? "Asistencia enviada al servidor y guardada." : "Asistencia guardada en este navegador. Verifica el backend para sincronizarla.", "exito");
  } finally {
    guardandoAsistencia.value = false;
  }
};

const cargarEstudiantesObservacion = async () => {
  nuevaObservacion.value.estudianteId = "";
  estudiantesObservacion.value = await buscarEstudiantesGrupo(nuevaObservacion.value.grupoId);
};

const cargarObservaciones = async () => {
  observaciones.value = leerLocal("observaciones");
  const token = obtenerToken();
  if (!token) return;
  try {
    const respuesta = await fetch("/api/observaciones", { headers: { Authorization: `Bearer ${token}` } });
    if (!respuesta.ok) return;
    const datos = await respuesta.json();
    const lista = Array.isArray(datos) ? datos : datos?.observaciones || datos?.data || [];
    if (lista.length) observaciones.value = lista.map((o: any) => ({ ...o, id: idDe(o) || o.id || `${Date.now()}-${Math.random()}` }));
  } catch { /* se usan registros locales */ }
};

const crearObservacion = async () => {
  const form = nuevaObservacion.value;
  if (!form.grupoId || !form.estudianteId || !form.descripcion.trim()) {
    mostrarMensaje("Selecciona el grupo, el estudiante y escribe la observación.", "error");
    return;
  }
  const estudiante = estudiantesObservacion.value.find((e: any) => e.id === form.estudianteId);
  const grupo = grupos.value.find((g: any) => idDe(g) === form.grupoId);
  const item = {
    id: `obs-${Date.now()}`, grupoId: form.grupoId,
    grupoNombre: nombreElemento(grupo), estudianteId: form.estudianteId,
    estudianteNombre: estudiante?.nombre || "Estudiante", tipo: form.tipo,
    fecha: form.fecha, descripcion: form.descripcion.trim(),
    docenteId: usuario?.id || usuario?._id,
  };
  let remoto = false;
  const token = obtenerToken();
  if (token) {
    try {
      const respuesta = await fetch("/api/observaciones", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(item),
      });
      remoto = respuesta.ok;
    } catch { /* respaldo local */ }
  }
  observaciones.value.unshift(item);
  guardarLocal("observaciones", observaciones.value);
  mostrarFormularioObservacion.value = false;
  nuevaObservacion.value = { grupoId: "", estudianteId: "", tipo: "academica", fecha: new Date().toISOString().slice(0, 10), descripcion: "" };
  estudiantesObservacion.value = [];
  mostrarMensaje(remoto ? "Observación guardada en el servidor." : "Observación guardada en este navegador.", "exito");
};

const eliminarObservacion = async (id: string) => {
  observaciones.value = observaciones.value.filter((o: any) => o.id !== id && o._id !== id);
  guardarLocal("observaciones", observaciones.value);
  const token = obtenerToken();
  if (token) {
    try { await fetch(`/api/observaciones/${encodeURIComponent(id)}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); } catch { /* eliminación local */ }
  }
  mostrarMensaje("Observación eliminada de la lista.", "exito");
};

const cargarHorarios = async () => {
  horarios.value = leerLocal("horarios");
  const token = obtenerToken();
  if (!token) return;
  const rutas = [`/api/horarios/docente/${encodeURIComponent(String(usuario?.id || usuario?._id || ""))}`, "/api/horarios"];
  for (const ruta of rutas) {
    try {
      const respuesta = await fetch(ruta, { headers: { Authorization: `Bearer ${token}` } });
      if (!respuesta.ok) continue;
      const datos = await respuesta.json();
      const lista = Array.isArray(datos) ? datos : datos?.horarios || datos?.data || [];
      if (lista.length) { horarios.value = lista.map((h: any) => ({ ...h, id: idDe(h) || h.id || `hor-${Date.now()}` })); return; }
    } catch { /* probar ruta alternativa */ }
  }
};

const crearHorario = async () => {
  const h = nuevoHorario.value;
  if (!h.grupoId || !h.asignaturaId || !h.inicio || !h.fin) {
    mostrarMensaje("Completa grupo, asignatura y horas de la clase.", "error");
    return;
  }
  if (h.fin <= h.inicio) {
    mostrarMensaje("La hora de finalización debe ser posterior a la de inicio.", "error");
    return;
  }
  const grupo = grupos.value.find((g: any) => idDe(g) === h.grupoId);
  const asignatura = asignaturas.value.find((a: any) => idDe(a) === h.asignaturaId);
  const item = {
    id: `hor-${Date.now()}`, dia: h.dia, grupoId: h.grupoId,
    grupoNombre: nombreElemento(grupo), asignaturaId: h.asignaturaId,
    asignaturaNombre: nombreElemento(asignatura), inicio: h.inicio, fin: h.fin,
    salon: h.salon.trim(), docenteId: usuario?.id || usuario?._id,
  };
  let remoto = false;
  const token = obtenerToken();
  if (token) {
    try {
      const respuesta = await fetch("/api/horarios", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(item),
      });
      remoto = respuesta.ok;
    } catch { /* respaldo local */ }
  }
  horarios.value.push(item);
  guardarLocal("horarios", horarios.value);
  mostrarFormularioHorario.value = false;
  nuevoHorario.value = { dia: "Lunes", grupoId: "", asignaturaId: "", inicio: "07:00", fin: "08:00", salon: "" };
  mostrarMensaje(remoto ? "Clase guardada en el servidor." : "Clase guardada en este navegador.", "exito");
};

const eliminarHorario = async (id: string) => {
  horarios.value = horarios.value.filter((h: any) => h.id !== id && h._id !== id);
  guardarLocal("horarios", horarios.value);
  const token = obtenerToken();
  if (token) {
    try { await fetch(`/api/horarios/${encodeURIComponent(id)}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); } catch { /* eliminación local */ }
  }
  mostrarMensaje("Clase eliminada del horario.", "exito");
};

const guardarPerfil = async () => {
  if (!perfilEditado.value.nombres.trim() || !perfilEditado.value.email.trim()) {
    mostrarMensaje("El nombre y el correo son obligatorios.", "error");
    return;
  }
  guardandoPerfil.value = true;
  try {
    const actualizado = { ...(usuario || {}), ...perfilEditado.value };
    let remoto = false;
    const token = obtenerToken();
    const id = usuario?.id || usuario?._id;
    if (token && id) {
      try {
        const respuesta = await fetch(`/api/usuarios/${encodeURIComponent(String(id))}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(perfilEditado.value),
        });
        remoto = respuesta.ok;
      } catch { /* se conserva localmente */ }
    }
    localStorage.setItem("usuario", JSON.stringify(actualizado));
    mostrarMensaje(remoto ? "Perfil actualizado en el servidor." : "Perfil actualizado en este navegador. Verifica el backend para sincronizarlo.", "exito");
  } finally {
    guardandoPerfil.value = false;
  }
};

/* =========================================================
   CARGA INICIAL
========================================================= */

cargarDatosActividad();
cargarActividades();
cargarComunicados();
cargarObservaciones();
cargarHorarios();

/* =========================================================
   CERRAR SESIÓN
========================================================= */

const cerrarSesion = () => {
  auth.cerrarSesion();
  localStorage.removeItem("tipoPerfil");
  router.replace("/login");
};
</script>

<style scoped>
/* =========================================================
   BASE
========================================================= */

* {
  box-sizing: border-box;
}

.profesor-layout {
  min-height: 100vh;
  width: 100%;
  display: flex;
  background: #f5f7fb;
  color: #172554;

  /* FUENTE ANTERIOR */
  font-family:
    "Segoe UI",
    Roboto,
    Helvetica,
    Arial,
    sans-serif;
}

/* =========================================================
   SIDEBAR
========================================================= */

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 255px;

  display: flex;
  flex-direction: column;

  background: #173f9f;
  color: white;

  z-index: 10;
}

.sidebar-header {
  height: 82px;

  display: flex;
  align-items: center;

  padding: 0 22px;

  border-bottom: 1px solid
    rgba(255, 255, 255, 0.12);
}

.logo {
  width: 42px;
  height: 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 11px;

  background: white;
  color: #173f9f;

  font-size: 23px;
  font-weight: 800;
}

.brand {
  margin-left: 12px;
}

.brand h2 {
  margin: 0;

  font-size: 19px;
  font-weight: 800;
}

.brand span {
  display: block;

  margin-top: 2px;

  color: rgba(255, 255, 255, 0.72);

  font-size: 11px;
}

.menu {
  flex: 1;

  padding: 18px 12px;

  overflow-y: auto;
}

.menu-item {
  width: 100%;
  min-height: 46px;

  display: flex;
  align-items: center;

  margin-bottom: 5px;
  padding: 0 14px;

  border: none;
  border-radius: 8px;

  background: transparent;

  color: rgba(255, 255, 255, 0.82);

  font-family: inherit;
  font-size: 13px;

  text-align: left;

  cursor: pointer;

  transition: 0.2s;
}

.menu-item:hover {
  background: rgba(
    255,
    255,
    255,
    0.1
  );

  color: white;
}

.menu-item.active {
  background: white;
  color: #173f9f;
  font-weight: 700;
}

.menu-icon {
  width: 28px;
  height: 20px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-right: 7px;
}

.sidebar-bottom {
  padding: 15px 12px;

  border-top: 1px solid
    rgba(255, 255, 255, 0.12);
}

.logout-button {
  width: 100%;
  height: 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 8px;

  border: 1px solid
    rgba(255, 255, 255, 0.2);

  border-radius: 8px;

  background: transparent;
  color: white;

  font-family: inherit;
  font-size: 13px;
  font-weight: 600;

  cursor: pointer;

  transition: 0.2s;
}

.logout-button:hover {
  background: rgba(
    255,
    255,
    255,
    0.1
  );
}

/* =========================================================
   SIDEBAR TOGGLE
========================================================= */

.sidebar-toggle {
  position: absolute;

  top: 18px;
  right: 10px;

  z-index: 1000;

  width: 30px;
  height: 30px;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0;

  border: none;
  border-radius: 7px;

  background: transparent;
  color: white;

  cursor: pointer;

  transition: 0.25s ease;
}

.sidebar-toggle:hover {
  background: rgba(
    255,
    255,
    255,
    0.24
  );
}

.sidebar-hidden .sidebar {
  width: 72px;
}

.sidebar-hidden
  .sidebar-header {
  justify-content: center;

  padding-left: 10px;
  padding-right: 10px;
}

.sidebar-hidden
  .sidebar-header
  .brand {
  display: none;
}

.sidebar-hidden .menu-item {
  justify-content: center;

  padding-left: 0;
  padding-right: 0;

  gap: 0;
}

.sidebar-hidden
  .menu-item
  > span:last-child {
  display: none;
}

.sidebar-hidden .menu-icon {
  margin: 0;
}

.sidebar-hidden
  .sidebar-bottom {
  padding-left: 10px;
  padding-right: 10px;
}

.sidebar-hidden
  .logout-button {
  justify-content: center;

  padding-left: 0;
  padding-right: 0;
}

.sidebar-hidden
  .logout-button
  span {
  display: none;
}

.sidebar-hidden
  .main-content {
  width: calc(100% - 72px);
  margin-left: 72px;
}

.sidebar-hidden
  .sidebar-toggle {
  left: 48px;
}

/* =========================================================
   MAIN
========================================================= */

.main-content {
  width: calc(100% - 255px);

  min-height: 100vh;

  margin-left: 255px;

  padding: 0 32px 40px;
}

.topbar {
  min-height: 82px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  border-bottom: 1px solid #e5e7eb;
}

.breadcrumb {
  margin: 0 0 4px;

  color: #6b7280;

  font-size: 12px;
}

.topbar h1 {
  margin: 0;

  color: #1d4ed8;

  font-size: 25px;
  font-weight: 800;
}

.profile-mini {
  display: flex;
  align-items: center;

  gap: 10px;
}

.profile-avatar {
  width: 40px;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: #dbe6ff;
  color: #1d4ed8;

  font-size: 13px;
  font-weight: 800;
}

.profile-info strong {
  display: block;

  color: #1d4ed8;

  font-size: 13px;
}

.profile-info span {
  display: block;

  margin-top: 2px;

  color: #6b7280;

  font-size: 11px;
}

/* =========================================================
   SECCIONES
========================================================= */

.content-section {
  padding-top: 28px;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 18px;
}

.section-title h2 {
  margin: 0;

  color: #1d4ed8;

  font-size: 22px;
}

.section-title p {
  margin: 5px 0 0;

  color: #6b7280;

  font-size: 12px;
}

/* =========================================================
   WELCOME
========================================================= */

.welcome {
  min-height: 150px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 28px 32px;

  border-radius: 15px;

  background:
    linear-gradient(
      135deg,
      #1d4ed8,
      #3861d0
    );

  color: white;
}

.welcome-label {
  font-size: 12px;

  opacity: 0.75;
}

.welcome h2 {
  margin: 6px 0 7px;

  font-size: 27px;
}

.welcome p {
  margin: 0;

  color: rgba(
    255,
    255,
    255,
    0.8
  );

  font-size: 13px;
}

.welcome-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  opacity: 0.9;
}

/* =========================================================
   ESTADÍSTICAS
========================================================= */

.stats-grid {
  display: grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap: 16px;

  margin-top: 20px;
}

.stat-card {
  min-height: 110px;

  display: flex;
  align-items: center;

  padding: 18px;

  border: 1px solid #e5e7eb;
  border-radius: 12px;

  background: white;
}

.stat-icon {
  width: 45px;
  height: 45px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-right: 12px;

  border-radius: 10px;
}

.stat-icon.blue {
  background: #e5edff;
  color: #3861d0;
}

.stat-icon.purple {
  background: #eee8ff;
  color: #7c3aed;
}

.stat-icon.orange {
  background: #fff0dc;
  color: #ea580c;
}

.stat-icon.green {
  background: #e1f7ea;
  color: #16a34a;
}

.stat-card span {
  display: block;

  color: #6b7280;

  font-size: 11px;
}

.stat-card strong {
  display: block;

  margin-top: 3px;

  color: #1d4ed8;

  font-size: 25px;
}

.stat-card small {
  display: block;

  margin-top: 2px;

  color: #9ca3af;

  font-size: 10px;
}

/* =========================================================
   DASHBOARD
========================================================= */

.dashboard-grid {
  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 18px;

  margin-top: 20px;
}

.panel {
  border: 1px solid #e5e7eb;
  border-radius: 12px;

  background: white;
}

.panel-header {
  min-height: 72px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 16px 20px;

  border-bottom: 1px solid
    #edf0f4;
}

.panel-header h3 {
  margin: 0;

  color: #1d4ed8;

  font-size: 15px;
}

.panel-header p {
  margin: 4px 0 0;

  color: #9ca3af;

  font-size: 11px;
}

.link-button {
  border: none;

  background: transparent;

  color: #3861d0;

  font-family: inherit;

  font-size: 12px;
  font-weight: 700;

  cursor: pointer;
}

.empty-state {
  min-height: 190px;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  padding: 30px;

  text-align: center;
}

.empty-state.large {
  min-height: 350px;
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 10px;

  color: #3861d0;
}

.empty-state h3,
.empty-state h4 {
  margin: 0;

  color: #1d4ed8;

  font-size: 14px;
}

.empty-state p {
  max-width: 380px;

  margin: 7px 0 0;

  color: #9ca3af;

  font-size: 12px;
}

/* =========================================================
   BOTONES
========================================================= */

.primary-button {
  height: 40px;

  padding: 0 16px;

  border: none;
  border-radius: 8px;

  background: #3861d0;

  color: white;

  font-family: inherit;

  font-size: 12px;
  font-weight: 700;

  cursor: pointer;

  transition: 0.2s;
}

.primary-button:hover {
  background: #2f52b5;
}

.primary-button:disabled {
  opacity: 0.6;

  cursor: not-allowed;
}

.secondary-button {
  height: 40px;

  padding: 0 16px;

  border: 1px solid #d1d5db;
  border-radius: 8px;

  background: white;

  color: #374151;

  font-family: inherit;

  font-size: 12px;
  font-weight: 700;

  cursor: pointer;
}

.secondary-button:hover {
  background: #f9fafb;
}

/* =========================================================
   FILTROS / CAMPOS
========================================================= */

.filters {
  display: flex;

  gap: 16px;

  padding: 20px;

  border-bottom: 1px solid
    #edf0f4;
}

.field {
  flex: 1;

  margin-bottom: 16px;
}

.field label {
  display: block;

  margin-bottom: 7px;

  color: #374151;

  font-size: 12px;
  font-weight: 700;
}

.field select,
.field input,
.field textarea {
  width: 100%;

  padding: 0 10px;

  border: 1px solid #d1d5db;
  border-radius: 7px;

  background: white;

  color: #111827;

  outline: none;

  font-family: inherit;

  font-size: 12px;
}

.field select,
.field input {
  height: 40px;
}

.field textarea {
  min-height: 100px;

  padding: 11px;

  resize: vertical;
}

.field select:focus,
.field input:focus,
.field textarea:focus {
  border-color: #3861d0;
}

/* =========================================================
   PERFIL
========================================================= */

.profile-panel {
  display: flex;
  align-items: center;

  gap: 25px;

  padding: 30px;
}

.profile-large {
  width: 80px;
  height: 80px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: #dbe6ff;
  color: #173f9f;

  font-size: 22px;
  font-weight: 800;
}

.profile-data {
  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  flex: 1;

  gap: 25px;
}

.profile-data span {
  display: block;

  margin-bottom: 5px;

  color: #9ca3af;

  font-size: 11px;
}

.profile-data strong {
  color: #1d4ed8;

  font-size: 13px;
}

/* =========================================================
   ACTIVIDADES
========================================================= */

.activity-list {
  padding: 18px;

  display: flex;
  flex-direction: column;

  gap: 12px;
}

.activity-card {
  display: flex;

  gap: 14px;

  padding: 18px;

  border: 1px solid #e5e7eb;
  border-radius: 10px;

  background: #fafbff;
}

.activity-icon {
  width: 42px;
  height: 42px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background: #e5edff;
  color: #1d4ed8;
}

.activity-content {
  flex: 1;
}

.activity-content h3 {
  margin: 0;

  color: #1d4ed8;

  font-size: 15px;
}

.activity-content p {
  margin: 6px 0 10px;

  color: #6b7280;

  font-size: 12px;
}

.activity-info {
  display: flex;

  flex-wrap: wrap;

  gap: 8px;
}

.activity-info span {
  padding: 5px 8px;

  border-radius: 5px;

  background: #eef2ff;
  color: #3861d0;

  font-size: 10px;
  font-weight: 600;
}

/* =========================================================
   COMUNICADOS
========================================================= */

.communication-list {
  padding: 18px;

  display: flex;
  flex-direction: column;

  gap: 12px;
}

.communication-card {
  display: flex;

  gap: 14px;

  padding: 18px;

  border: 1px solid #e5e7eb;
  border-radius: 10px;

  background: #fafbff;
}

.communication-icon {
  width: 42px;
  height: 42px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background: #eee8ff;
  color: #7c3aed;
}

.communication-content {
  flex: 1;
  min-width: 0;
}

.communication-actions {
  display: flex;
  align-items: flex-start;
  flex-shrink: 0;
}

.delete-communication-button {
  border: 1px solid #fecaca;
  border-radius: 7px;
  padding: 8px 11px;
  background: #fff;
  color: #b91c1c;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.delete-communication-button:hover:not(:disabled) {
  background: #fef2f2;
  border-color: #f87171;
}

.delete-communication-button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.communication-title {
  display: flex;
  align-items: center;

  gap: 10px;
}

.communication-title h3 {
  margin: 0;

  color: #1d4ed8;

  font-size: 15px;
}

.communication-content p {
  margin: 7px 0 0;

  color: #6b7280;

  font-size: 12px;

  line-height: 1.5;
}

.priority {
  padding: 4px 7px;

  border-radius: 5px;

  background: #eef2ff;
  color: #1d4ed8;

  font-size: 9px;
  font-weight: 700;

  text-transform: uppercase;
}

.priority.urgente {
  background: #fee2e2;
  color: #dc2626;
}

/* =========================================================
   RECIENTES
========================================================= */

.recent-list {
  padding: 16px;

  display: flex;
  flex-direction: column;

  gap: 10px;
}

.recent-item {
  display: flex;
  align-items: flex-start;

  gap: 10px;

  padding: 10px;

  border-radius: 8px;

  background: #f8faff;
}

.recent-icon {
  width: 32px;
  height: 32px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 7px;

  background: #eee8ff;
  color: #7c3aed;
}

.recent-item strong {
  display: block;

  color: #1d4ed8;

  font-size: 12px;
}

.recent-item span {
  display: block;

  margin-top: 3px;

  color: #6b7280;

  font-size: 10px;
}

/* =========================================================
   MODALES
========================================================= */

.modal-overlay {
  position: fixed;

  inset: 0;

  z-index: 2000;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  background: rgba(
    15,
    23,
    42,
    0.55
  );

  backdrop-filter: blur(3px);
}

.modal {
  width: min(680px, 100%);

  max-height: 90vh;

  overflow-y: auto;

  border-radius: 14px;

  background: white;

  box-shadow:
    0 25px 60px
    rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  padding: 22px 24px;

  border-bottom: 1px solid
    #edf0f4;
}

.modal-header h2 {
  margin: 0;

  color: #1d4ed8;

  font-size: 19px;
}

.modal-header p {
  margin: 5px 0 0;

  color: #6b7280;

  font-size: 11px;
}

.close-button {
  width: 32px;
  height: 32px;

  border: none;
  border-radius: 7px;

  background: #f3f4f6;

  color: #1d4ed8;

  font-size: 23px;

  line-height: 1;

  cursor: pointer;
}

.close-button:hover {
  background: #e5e7eb;
}

.modal-form {
  padding: 22px 24px 24px;
}

.form-grid {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 16px;

  margin-bottom: 0;
}

.form-error {
  margin-top: 15px;

  padding: 10px 12px;

  border-radius: 7px;

  background: #fee2e2;

  color: #b91c1c;

  font-size: 11px;
}

.modal-actions {
  display: flex;

  justify-content: flex-end;

  gap: 10px;

  margin-top: 22px;

  padding-top: 18px;

  border-top: 1px solid
    #edf0f4;
}

/* =========================================================
   NOTIFICACIONES EASYNOTES
========================================================= */

.notification {
  position: fixed;

  top: 22px;
  right: 22px;

  z-index: 5000;

  width: min(
    390px,
    calc(100vw - 44px)
  );

  min-height: 72px;

  display: flex;
  align-items: center;

  gap: 12px;

  padding: 13px 14px;

  border: 1px solid #e5e7eb;
  border-radius: 12px;

  background: white;

  box-shadow:
    0 12px 35px
    rgba(15, 23, 42, 0.15);
}

.notification.exito {
  border-left: 4px solid #16a34a;
}

.notification.error {
  border-left: 4px solid #dc2626;
}

.notification-icon {
  width: 38px;
  height: 38px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  font-size: 19px;
  font-weight: 800;
}

.notification.exito
  .notification-icon {
  background: #dcfce7;

  color: #16a34a;
}

.notification.error
  .notification-icon {
  background: #fee2e2;

  color: #dc2626;
}

.notification-content {
  flex: 1;

  min-width: 0;
}

.notification-content strong {
  display: block;

  color: #1d4ed8;

  font-size: 13px;
  font-weight: 800;
}

.notification-content p {
  margin: 3px 0 0;

  color: #6b7280;

  font-size: 11px;

  line-height: 1.4;
}

.notification-close {
  width: 28px;
  height: 28px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0;

  border: none;
  border-radius: 6px;

  background: transparent;

  color: #9ca3af;

  font-size: 20px;

  line-height: 1;

  cursor: pointer;

  transition: 0.2s;
}

.notification-close:hover {
  background: #f3f4f6;

  color: #1d4ed8;
}

.notificacion-enter-active,
.notificacion-leave-active {
  transition: 0.25s ease;
}

.notificacion-enter-from,
.notificacion-leave-to {
  opacity: 0;

  transform: translateX(30px);
}

/* =========================================================
   TABLET
========================================================= */

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .profile-data {
    grid-template-columns: 1fr;
  }
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 750px) {
  .notification {
    top: 12px;
    right: 12px;

    width: calc(100vw - 24px);
  }

  .sidebar {
    position: static;

    width: 100%;

    min-height: auto;
  }

  .profesor-layout {
    display: block;
  }

  .sidebar-header {
    height: 70px;
  }

  .menu {
    display: flex;

    gap: 5px;

    padding: 10px;

    overflow-x: auto;
  }

  .menu-item {
    width: auto;

    min-width: 120px;

    flex-shrink: 0;
  }

  .sidebar-bottom {
    display: none;
  }

  .main-content {
    width: 100%;

    margin-left: 0;

    padding: 0 15px 30px;
  }

  .topbar {
    min-height: 75px;
  }

  .profile-info {
    display: none;
  }

  .welcome {
    padding: 24px;
  }

  .welcome-icon {
    transform: scale(0.8);
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filters {
    flex-direction: column;
  }

  .profile-panel {
    flex-direction: column;

    align-items: flex-start;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .modal-overlay {
    padding: 10px;
  }

  .modal-header,
  .modal-form {
    padding-left: 18px;
    padding-right: 18px;
  }

  .sidebar-toggle {
    display: none;
  }
}

/* =========================================================
   TABLAS Y FORMULARIOS DE LAS SECCIONES FUNCIONALES
========================================================= */
.data-table-wrap {
  width: 100%;
  overflow-x: auto;
  padding: 8px 18px 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  color: #1d4ed8;
  font-size: 12px;
}

.data-table th,
.data-table td {
  padding: 13px 12px;
  border-bottom: 1px solid #edf0f4;
  text-align: left;
  vertical-align: middle;
}

.data-table th {
  background: #f8faff;
  color: #374151;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.table-input {
  width: 100%;
  min-width: 95px;
  min-height: 36px;
  padding: 7px 9px;
  border: 1px solid #d1d5db;
  border-radius: 7px;
  background: white;
  color: #1d4ed8;
  font-family: inherit;
  font-size: 12px;
}

.table-input:focus {
  outline: none;
  border-color: #1d4ed8;
}

.inline-form-panel {
  margin-bottom: 18px;
}

.profile-edit-panel {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  padding: 28px;
}

.profile-edit-fields {
  flex: 1;
  min-width: 0;
}

.profile-hint {
  margin: 0;
  color: #6b7280;
  font-size: 11px;
  line-height: 1.5;
}

.compact-button {
  align-self: center;
  flex-shrink: 0;
}

@media (max-width: 750px) {
  .profile-edit-panel {
    flex-direction: column;
    padding: 20px;
  }

  .compact-button {
    align-self: flex-start;
  }

  .data-table th,
  .data-table td {
    padding: 10px 8px;
  }
}
</style>


