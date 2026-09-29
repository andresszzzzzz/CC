<template>
  <div class="coordinador-page">
    <!-- SIDEBAR -->
    <aside
      class="sidebar"
      :class="{ collapsed: sidebarCollapsed }"
    >
      <div class="sidebar-header">
        <div class="logo-box">
          <span>EN</span>
        </div>

        <div
          v-if="!sidebarCollapsed"
          class="logo-text"
        >
          <strong>EasyNotes</strong>
          <small>Coordinador</small>
        </div>
      </div>

      <nav class="menu">
        <!-- INICIO -->
        <button
          class="menu-item"
          :class="{ active: seccionActual === 'inicio' }"
          @click="irA('inicio')"
        >
          <Home :size="20" />
          <span v-if="!sidebarCollapsed">Inicio</span>
        </button>

        <!-- SEGUIMIENTO ACADÉMICO -->
        <div class="menu-section">
          <div
            v-if="!sidebarCollapsed"
            class="menu-section-title"
          >
            Seguimiento Académico
          </div>

          <button
            class="menu-item"
            :class="{ active: seccionActual === 'seguimiento' }"
            @click="irA('seguimiento')"
          >
            <ClipboardCheck :size="20" />
            <span v-if="!sidebarCollapsed">Seguimiento</span>
          </button>

          <button
            class="menu-item"
            :class="{ active: seccionActual === 'informes-periodicos' }"
            @click="irA('informes-periodicos')"
          >
            <FileClock :size="20" />
            <span v-if="!sidebarCollapsed">Informes periódicos</span>
          </button>
        </div>

        <!-- OBSERVADOR -->
        <div class="menu-section">
          <div
            v-if="!sidebarCollapsed"
            class="menu-section-title"
          >
            Observador
          </div>

          <button
            class="menu-item"
            :class="{ active: seccionActual === 'observador' }"
            @click="irA('observador')"
          >
            <Eye :size="20" />
            <span v-if="!sidebarCollapsed">
              Observador del estudiante
            </span>
          </button>
        </div>

        <!-- ESTADÍSTICAS -->
        <div class="menu-section">
          <div
            v-if="!sidebarCollapsed"
            class="menu-section-title"
          >
            Estadísticas
          </div>

          <button
            class="menu-item"
            :class="{ active: seccionActual === 'estadisticas' }"
            @click="irA('estadisticas')"
          >
            <BarChart3 :size="20" />
            <span v-if="!sidebarCollapsed">
              Estadísticas académicas
            </span>
          </button>
        </div>

        <!-- GESTIÓN -->
        <div class="menu-section">
          <div
            v-if="!sidebarCollapsed"
            class="menu-section-title"
          >
            Gestión
          </div>

          <button
            class="menu-item"
            :class="{ active: seccionActual === 'excusas-docentes' }"
            @click="irA('excusas-docentes')"
          >
            <ClipboardX :size="20" />
            <span v-if="!sidebarCollapsed">
              Excusas docentes
            </span>
          </button>

          <button
            class="menu-item"
            :class="{ active: seccionActual === 'certificados' }"
            @click="irA('certificados')"
          >
            <Award :size="20" />
            <span v-if="!sidebarCollapsed">Certificados</span>
          </button>

          <button
            class="menu-item"
            :class="{ active: seccionActual === 'constancias' }"
            @click="irA('constancias')"
          >
            <FileCheck :size="20" />
            <span v-if="!sidebarCollapsed">Constancias</span>
          </button>
        </div>

        <!-- ELECCIONES -->
        <div class="menu-section">
          <div
            v-if="!sidebarCollapsed"
            class="menu-section-title"
          >
            Elecciones
          </div>

          <button
            class="menu-item"
            :class="{ active: seccionActual === 'candidatos' }"
            @click="irA('candidatos')"
          >
            <UserRoundCheck :size="20" />
            <span v-if="!sidebarCollapsed">Candidatos</span>
          </button>

          <button
            class="menu-item"
            :class="{ active: seccionActual === 'eventos-electorales' }"
            @click="irA('eventos-electorales')"
          >
            <Vote :size="20" />
            <span v-if="!sidebarCollapsed">
              Eventos electorales
            </span>
          </button>

          <button
            class="menu-item"
            :class="{ active: seccionActual === 'permisos' }"
            @click="irA('permisos')"
          >
            <KeyRound :size="20" />
            <span v-if="!sidebarCollapsed">Permisos</span>
          </button>

          <button
            class="menu-item"
            :class="{ active: seccionActual === 'resultados' }"
            @click="irA('resultados')"
          >
            <Trophy :size="20" />
            <span v-if="!sidebarCollapsed">Resultados</span>
          </button>
        </div>

        <!-- INFORMES -->
        <div class="menu-section">
          <div
            v-if="!sidebarCollapsed"
            class="menu-section-title"
          >
            Informes
          </div>

          <button
            class="menu-item"
            :class="{ active: seccionActual === 'boletin-estudiante' }"
            @click="irA('boletin-estudiante')"
          >
            <FileText :size="20" />
            <span v-if="!sidebarCollapsed">
              Boletín del estudiante
            </span>
          </button>

          <button
            class="menu-item"
            :class="{ active: seccionActual === 'listados' }"
            @click="irA('listados')"
          >
            <List :size="20" />
            <span v-if="!sidebarCollapsed">Listados varios</span>
          </button>

          <button
            class="menu-item"
            :class="{ active: seccionActual === 'informe-excusas' }"
            @click="irA('informe-excusas')"
          >
            <FileWarning :size="20" />
            <span v-if="!sidebarCollapsed">
              Informe de excusas
            </span>
          </button>
        </div>

        <!-- OTROS -->
        <div class="menu-section">
          <button
            class="menu-item"
            :class="{ active: seccionActual === 'bitacora' }"
            @click="irA('bitacora')"
          >
            <History :size="20" />
            <span v-if="!sidebarCollapsed">Bitácora</span>
          </button>

          <button
            class="menu-item"
            :class="{ active: seccionActual === 'perfil' }"
            @click="irA('perfil')"
          >
            <UserCircle :size="20" />
            <span v-if="!sidebarCollapsed">Perfil</span>
          </button>

          <button
            class="menu-item"
            :class="{ active: seccionActual === 'cronograma' }"
            @click="irA('cronograma')"
          >
            <CalendarDays :size="20" />
            <span v-if="!sidebarCollapsed">Cronograma</span>
          </button>
        </div>
      </nav>

      <div class="sidebar-footer">
        <button
          class="menu-item logout-item"
          @click="cerrarSesion"
        >
          <LogOut :size="20" />
          <span v-if="!sidebarCollapsed">Cerrar sesión</span>
        </button>
      </div>
    </aside>

    <!-- CONTENIDO -->
    <main class="main-content">
      <!-- TOPBAR -->
      <header class="topbar">
        <button
          class="icon-button"
          @click="sidebarCollapsed = !sidebarCollapsed"
        >
          <Menu :size="22" />
        </button>

        <div class="breadcrumb">
          <span>EasyNotes</span>
          <ChevronRight :size="16" />
          <strong>
            {{ titulos[seccionActual] || "Inicio" }}
          </strong>
        </div>

        <div class="topbar-actions">
          <button class="icon-button">
            <Bell :size="20" />
          </button>

          <div class="user-mini">
            <div class="avatar">
              {{
                (
                  usuario?.nombres?.charAt(0) ||
                  usuario?.usuario?.charAt(0) ||
                  "C"
                ).toUpperCase()
              }}
            </div>

            <div class="user-mini-info">
              <strong>
                {{
                  usuario?.nombres
                    ? `${usuario.nombres} ${usuario.apellidos || ""}`
                    : usuario?.usuario || "Coordinador"
                }}
              </strong>
              <small>Coordinador</small>
            </div>
          </div>
        </div>
      </header>

      <!-- CONTENIDO SCROLL -->
      <section class="page-content">

        <!-- ========================= -->
        <!-- INICIO -->
        <!-- ========================= -->
        <div
          v-if="seccionActual === 'inicio'"
          class="page-section"
        >
          <div class="page-heading">
            <div>
              <span class="eyebrow">Panel principal</span>
              <h1>Bienvenido a EasyNotes</h1>
              <p>
                Administra y consulta la información académica
                de la institución.
              </p>
            </div>
          </div>

          <div class="welcome-card">
            <div class="welcome-icon">
              <Home :size="32" />
            </div>

            <div>
              <h2>Panel del coordinador</h2>
              <p>
                Desde este espacio puedes realizar el seguimiento
                académico y acceder a los diferentes módulos
                administrativos.
              </p>
            </div>
          </div>

          <div class="dashboard-grid">
            <div class="dashboard-card">
              <div class="dashboard-card-icon blue">
                <Users :size="22" />
              </div>
              <div>
                <span>Estudiantes</span>
                <strong>{{ matriculas.length }}</strong>
              </div>
            </div>

            <div class="dashboard-card">
              <div class="dashboard-card-icon green">
                <ClipboardCheck :size="22" />
              </div>
              <div>
                <span>Grupos</span>
                <strong>{{ grupos.length }}</strong>
              </div>
            </div>

            <div class="dashboard-card">
              <div class="dashboard-card-icon purple">
                <FileText :size="22" />
              </div>
              <div>
                <span>Calificaciones</span>
                <strong>{{ calificaciones.length }}</strong>
              </div>
            </div>

            <div class="dashboard-card">
              <div class="dashboard-card-icon orange">
                <CalendarDays :size="22" />
              </div>
              <div>
                <span>Período</span>
                <strong>2026</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- ========================= -->
        <!-- SEGUIMIENTO -->
        <!-- ========================= -->
        <div
          v-else-if="seccionActual === 'seguimiento'"
          class="page-section"
        >
          <div class="page-heading">
            <div>
              <span class="eyebrow">Seguimiento Académico</span>
              <h1>Seguimiento</h1>
              <p>
                Consulta el rendimiento académico de los estudiantes
                por grupo y período.
              </p>
            </div>

            <button
              class="primary-button"
              :disabled="cargandoSeguimiento"
              @click="recargarSeguimiento"
            >
              <RefreshCw
                :size="18"
                :class="{ spinning: cargandoSeguimiento }"
              />
              Actualizar
            </button>
          </div>

          <div class="filters-card">
            <div class="filter-group">
              <label>Grupo</label>

              <select v-model="grupoSeleccionado">
                <option value="">
                  Selecciona un grupo
                </option>

                <option
                  v-for="grupo in grupos"
                  :key="grupo._id"
                  :value="grupo._id"
                >
                  {{ grupo.nombre }}
                  {{ grupo.grado ? `- ${grupo.grado}` : "" }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label>Período</label>

              <select v-model="periodoSeleccionado">
                <option
                  v-for="periodo in periodosDisponibles"
                  :key="periodo.numero"
                  :value="periodo.numero"
                >
                  {{
                    periodo.nombre ||
                    `Período ${periodo.numero}`
                  }}
                </option>
              </select>
            </div>

            <div class="filter-group search-filter">
              <label>Buscar estudiante</label>

              <div class="search-box">
                <Search :size="18" />

                <input
                  v-model="busquedaSeguimiento"
                  type="text"
                  placeholder="Nombre del estudiante..."
                />
              </div>
            </div>
          </div>

          <div
            v-if="errorSeguimiento"
            class="alert error"
          >
            <AlertCircle :size="20" />
            <span>{{ errorSeguimiento }}</span>
          </div>

          <div
            v-if="cargandoSeguimiento"
            class="loading-card"
          >
            <div class="loader"></div>
            <span>Cargando información académica...</span>
          </div>

          <template v-else>
            <div
              v-if="grupoSeleccionadoObjeto"
              class="selected-group-card"
            >
              <div>
                <span>Grupo seleccionado</span>
                <strong>
                  {{ grupoSeleccionadoObjeto.nombre }}
                </strong>
              </div>

              <div>
                <span>Período</span>
                <strong>
                  {{ periodoSeleccionado }}
                </strong>
              </div>

              <div>
                <span>Estudiantes</span>
                <strong>
                  {{ filasSeguimiento.length }}
                </strong>
              </div>
            </div>

            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon blue">
                  <Users :size="22" />
                </div>
                <div>
                  <span>Estudiantes</span>
                  <strong>{{ totalEstudiantes }}</strong>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon green">
                  <CheckCircle2 :size="22" />
                </div>
                <div>
                  <span>Con notas</span>
                  <strong>{{ estudiantesConNotas }}</strong>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon red">
                  <AlertCircle :size="22" />
                </div>
                <div>
                  <span>En riesgo</span>
                  <strong>{{ estudiantesEnRiesgo }}</strong>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon purple">
                  <BarChart3 :size="22" />
                </div>
                <div>
                  <span>Promedio</span>
                  <strong>{{ promedioGrupo }}</strong>
                </div>
              </div>
            </div>

            <div class="table-card">
              <div class="table-header">
                <div>
                  <h2>Rendimiento académico</h2>
                  <p>
                    Calificaciones registradas para el grupo.
                  </p>
                </div>
              </div>

              <div
                v-if="!grupoSeleccionado"
                class="empty-state"
              >
                <ClipboardCheck :size="42" />
                <h3>Selecciona un grupo</h3>
                <p>
                  Elige un grupo para consultar su seguimiento.
                </p>
              </div>

              <div
                v-else-if="filasSeguimiento.length === 0"
                class="empty-state"
              >
                <Users :size="42" />
                <h3>No hay estudiantes</h3>
                <p>
                  No se encontraron estudiantes para los filtros seleccionados.
                </p>
              </div>

              <div
                v-else
                class="table-wrapper"
              >
                <table>
                  <thead>
                    <tr>
                      <th>Estudiante</th>

                      <th
                        v-for="asignatura in asignaturasSeguimiento"
                        :key="asignatura._id"
                      >
                        {{ asignatura.nombre }}
                      </th>

                      <th>Promedio</th>
                      <th>Estado</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr
                      v-for="fila in filasSeguimiento"
                      :key="fila.estudianteId"
                    >
                      <td>
                        <div class="student-cell">
                          <div class="student-avatar">
                            {{ iniciales(fila.nombre) }}
                          </div>

                          <div>
                            <strong>{{ fila.nombre }}</strong>
                          </div>
                        </div>
                      </td>

                      <td
                        v-for="item in fila.notas"
                        :key="item.asignatura._id"
                      >
                        <span
                          class="grade-badge"
                          :class="claseNota(item.nota)"
                        >
                          {{ formatNota(item.nota) }}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {{ formatNota(fila.promedio) }}
                        </strong>
                      </td>

                      <td>
                        <span
                          class="status-badge"
                          :class="{
                            danger: fila.tieneNotaBaja,
                            success:
                              !fila.tieneNotaBaja &&
                              fila.promedio !== null,
                            neutral:
                              fila.promedio === null
                          }"
                        >
                          {{
                            fila.tieneNotaBaja
                              ? "En riesgo"
                              : fila.promedio === null
                                ? "Sin notas"
                                : "Al día"
                          }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </template>
        </div>

        <!-- ========================= -->
        <!-- INFORMES PERIODICOS -->
        <!-- ========================= -->
        <div
          v-else-if="seccionActual === 'informes-periodicos'"
          class="page-section"
        >
          <div class="page-heading">
            <div>
              <span class="eyebrow">
                Seguimiento Académico
              </span>

              <h1>Informes periódicos</h1>

              <p>
                Consulta el estado académico de los estudiantes
                y genera sus boletines por período.
              </p>
            </div>

            <button
              class="primary-button"
              :disabled="cargandoSeguimiento"
              @click="recargarSeguimiento"
            >
              <RefreshCw
                :size="18"
                :class="{ spinning: cargandoSeguimiento }"
              />
              Actualizar
            </button>
          </div>

          <div class="filters-card">
            <div class="filter-group">
              <label>Grupo</label>

              <select v-model="grupoInformeSeleccionado">
                <option value="">
                  Selecciona un grupo
                </option>

                <option
                  v-for="grupo in grupos"
                  :key="grupo._id"
                  :value="grupo._id"
                >
                  {{ grupo.nombre }}
                  {{ grupo.grado ? `- ${grupo.grado}` : "" }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label>Período</label>

              <select v-model="periodoInformeSeleccionado">
                <option
                  v-for="periodo in periodosDisponiblesInforme"
                  :key="periodo.numero"
                  :value="periodo.numero"
                >
                  {{
                    periodo.nombre ||
                    `Período ${periodo.numero}`
                  }}
                </option>
              </select>
            </div>

            <div class="filter-group search-filter">
              <label>Buscar estudiante</label>

              <div class="search-box">
                <Search :size="18" />

                <input
                  v-model="busquedaInforme"
                  type="text"
                  placeholder="Nombre del estudiante..."
                />
              </div>
            </div>
          </div>

          <div
            v-if="errorInformesPeriodicos"
            class="alert error"
          >
            <AlertCircle :size="20" />
            <span>{{ errorInformesPeriodicos }}</span>
          </div>

          <div
            v-if="cargandoSeguimiento"
            class="loading-card"
          >
            <div class="loader"></div>
            <span>Cargando información...</span>
          </div>

          <template v-else>
            <div
              v-if="!grupoInformeSeleccionado"
              class="empty-state large"
            >
              <FileClock :size="48" />
              <h3>Selecciona un grupo</h3>
              <p>
                Selecciona un grupo para consultar los informes
                periódicos de sus estudiantes.
              </p>
            </div>

            <template v-else>
              <div class="selected-group-card">
                <div>
                  <span>Grupo</span>
                  <strong>
                    {{ grupoInformeObjeto?.nombre || "—" }}
                  </strong>
                </div>

                <div>
                  <span>Período</span>
                  <strong>
                    {{ periodoInformeSeleccionado }}
                  </strong>
                </div>

                <div>
                  <span>Estudiantes</span>
                  <strong>
                    {{ totalInformesPeriodicos }}
                  </strong>
                </div>
              </div>

              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-icon blue">
                    <Users :size="22" />
                  </div>

                  <div>
                    <span>Estudiantes</span>
                    <strong>
                      {{ totalInformesPeriodicos }}
                    </strong>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon green">
                    <CheckCircle2 :size="22" />
                  </div>

                  <div>
                    <span>Con notas</span>
                    <strong>
                      {{ informesConNotas }}
                    </strong>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon red">
                    <AlertCircle :size="22" />
                  </div>

                  <div>
                    <span>En riesgo</span>
                    <strong>
                      {{ informesEnRiesgo }}
                    </strong>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon purple">
                    <FileText :size="22" />
                  </div>

                  <div>
                    <span>Sin notas</span>
                    <strong>
                      {{ informesSinNotas }}
                    </strong>
                  </div>
                </div>
              </div>

              <div class="table-card">
                <div class="table-header">
                  <div>
                    <h2>Informes de estudiantes</h2>
                    <p>
                      Genera el boletín correspondiente al período seleccionado.
                    </p>
                  </div>
                </div>

                <div
                  v-if="informesPeriodicos.length === 0"
                  class="empty-state"
                >
                  <Users :size="42" />

                  <h3>No se encontraron estudiantes</h3>

                  <p>
                    No hay estudiantes que coincidan con la búsqueda.
                  </p>
                </div>

                <div
                  v-else
                  class="table-wrapper"
                >
                  <table>
                    <thead>
                      <tr>
                        <th>Estudiante</th>
                        <th>Documento</th>
                        <th>Promedio</th>
                        <th>Estado</th>
                        <th>Informe</th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr
                        v-for="fila in informesPeriodicos"
                        :key="fila.matricula._id"
                      >
                        <td>
                          <div class="student-cell">
                            <div class="student-avatar">
                              {{ iniciales(fila.nombre) }}
                            </div>

                            <div>
                              <strong>{{ fila.nombre }}</strong>
                            </div>
                          </div>
                        </td>

                        <td>
                          {{ fila.documento || "No registrado" }}
                        </td>

                        <td>
                          <strong>
                            {{ formatNota(fila.promedio) }}
                          </strong>
                        </td>

                        <td>
                          <span
                            class="status-badge"
                            :class="{
                              danger: fila.tieneNotaBaja,
                              success:
                                !fila.tieneNotaBaja &&
                                fila.promedio !== null,
                              neutral:
                                fila.promedio === null
                            }"
                          >
                            {{
                              fila.tieneNotaBaja
                                ? "En riesgo"
                                : fila.promedio === null
                                  ? "Sin notas"
                                  : "Al día"
                            }}
                          </span>
                        </td>

                        <td>
                          <button
                            class="report-button"
                            :disabled="boletinCargando === fila.matricula._id"
                            @click="abrirBoletin(
                              fila.matricula._id
                            )"
                          >
                            <FileText :size="17" />

                            {{
                              boletinCargando === fila.matricula._id
                                ? "Generando..."
                                : "Ver boletín"
                            }}
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </template>
          </template>
        </div>


<!-- ========================= -->
<!-- OBSERVADOR DEL ESTUDIANTE -->
<!-- ========================= -->

<div
  v-else-if="seccionActual === 'observador'"
  class="page-section observador-section"
>
  <!-- ENCABEZADO -->
  <div class="page-heading observador-heading">
    <div>
      <span class="eyebrow">
        Observador
      </span>

      <h1>
        Observador del estudiante
      </h1>

      <p>
        Registra, consulta y realiza seguimiento a las observaciones
        académicas, disciplinarias y de convivencia de los estudiantes.
      </p>
    </div>

    <button
      class="primary-button"
      @click="abrirNuevaObservacion"
    >
      <Eye :size="18" />
      Nueva observación
    </button>
  </div>

  <!-- FILTROS -->
  <div class="observador-filtros">
    <div class="filtro-observador">
      <label>
        Grupo
      </label>

      <select v-model="grupoObservadorSeleccionado">
        <option value="">
          Todos los grupos
        </option>

        <option
          v-for="grupo in grupos"
          :key="grupo._id"
          :value="grupo._id"
        >
          {{ grupo.nombre || grupo.codigo || "Grupo" }}
        </option>
      </select>
    </div>

    <div class="filtro-observador filtro-busqueda">
      <label>
        Buscar estudiante
      </label>

      <div class="input-icon-wrapper">
        <Search :size="18" />

        <input
          v-model="busquedaObservador"
          type="text"
          placeholder="Nombre o documento..."
        />
      </div>
    </div>

    <button
      class="secondary-button"
      type="button"
      @click="cargarObservador"
    >
      <RefreshCw :size="17" />
      Actualizar
    </button>
  </div>

  <!-- ERROR -->
  <div
    v-if="errorObservador"
    class="observador-alert observador-alert-error"
  >
    <AlertCircle :size="19" />

    <span>
      {{ errorObservador }}
    </span>
  </div>

  <!-- CONTENIDO PRINCIPAL -->
  <div class="observador-layout">

    <!-- LISTADO DE ESTUDIANTES -->
    <div class="observador-card estudiantes-card">
      <div class="observador-card-header">
        <div>
          <h2>
            Estudiantes
          </h2>

          <p>
            Selecciona un estudiante para consultar su observador.
          </p>
        </div>

        <span class="observador-count">
          {{ estudiantesObservador.length }}
        </span>
      </div>

      <div
        v-if="cargandoObservador"
        class="observador-loading"
      >
        <RefreshCw
          :size="22"
          class="loading-spin"
        />

        <span>
          Cargando información...
        </span>
      </div>

      <div
        v-else-if="estudiantesObservador.length === 0"
        class="observador-empty"
      >
        <Users :size="36" />

        <h3>
          No hay estudiantes
        </h3>

        <p>
          No se encontraron estudiantes con los filtros seleccionados.
        </p>
      </div>

      <div
        v-else
        class="estudiantes-lista"
      >
        <button
          v-for="estudiante in estudiantesObservador"
          :key="estudiante._id"
          type="button"
          class="estudiante-item"
          :class="{
            active:
              estudianteObservadorSeleccionado === estudiante._id
          }"
          @click="
            seleccionarEstudianteObservador(estudiante._id)
          "
        >
          <div class="estudiante-avatar">
            {{ iniciales(
              `${estudiante.nombres || ""} ${estudiante.apellidos || ""}`
            ) }}
          </div>

          <div class="estudiante-info">
            <strong>
              {{ estudiante.nombres }}
              {{ estudiante.apellidos }}
            </strong>

            <span>
              {{ estudiante.documento || "Sin documento" }}
            </span>
          </div>

          <ChevronRight :size="18" />
        </button>
      </div>
    </div>

    <!-- DETALLE DEL OBSERVADOR -->
    <div class="observador-card detalle-card">

      <div
        v-if="!estudianteObservadorActual"
        class="observador-empty detalle-empty"
      >
        <Eye :size="42" />

        <h3>
          Selecciona un estudiante
        </h3>

        <p>
          Aquí podrás consultar sus observaciones y realizar
          nuevos registros.
        </p>
      </div>

      <template v-else>

        <!-- CABECERA ESTUDIANTE -->
        <div class="detalle-estudiante-header">
          <div class="detalle-estudiante-avatar">
            {{ iniciales(
              `${estudianteObservadorActual.nombres || ""} ${estudianteObservadorActual.apellidos || ""}`
            ) }}
          </div>

          <div>
            <span class="eyebrow">
              Estudiante
            </span>

            <h2>
              {{ estudianteObservadorActual.nombres }}
              {{ estudianteObservadorActual.apellidos }}
            </h2>

            <p>
              Documento:
              {{ estudianteObservadorActual.documento || "No registrado" }}
            </p>
          </div>

          <button
            class="primary-button small-button"
            type="button"
            @click="abrirNuevaObservacion"
          >
            <Eye :size="17" />
            Nueva observación
          </button>
        </div>

        <!-- RESUMEN -->
        <div class="observador-resumen">

          <div class="resumen-observador-item">
            <div class="resumen-icon">
              <FileText :size="19" />
            </div>

            <div>
              <span>
                Total
              </span>

              <strong>
                {{ observacionesEstudiante.length }}
              </strong>
            </div>
          </div>

          <div class="resumen-observador-item">
            <div class="resumen-icon">
              <AlertCircle :size="19" />
            </div>

            <div>
              <span>
                Abiertas
              </span>

              <strong>
                {{ observacionesAbiertas }}
              </strong>
            </div>
          </div>

          <div class="resumen-observador-item">
            <div class="resumen-icon">
              <CheckCircle2 :size="19" />
            </div>

            <div>
              <span>
                Cerradas
              </span>

              <strong>
                {{ observacionesCerradas }}
              </strong>
            </div>
          </div>

        </div>

        <!-- HISTORIAL -->
        <div class="historial-observador">

          <div class="historial-header">
            <div>
              <h3>
                Historial de observaciones
              </h3>

              <p>
                Registros académicos, disciplinarios y de convivencia.
              </p>
            </div>
          </div>

          <div
            v-if="observacionesEstudiante.length === 0"
            class="observador-empty historial-empty"
          >
            <FileText :size="34" />

            <h3>
              Sin observaciones
            </h3>

            <p>
              Este estudiante todavía no tiene registros en el observador.
            </p>

            <button
              class="primary-button"
              type="button"
              @click="abrirNuevaObservacion"
            >
              <Eye :size="17" />
              Registrar observación
            </button>
          </div>

          <div
            v-else
            class="observaciones-lista"
          >
            <article
              v-for="observacion in observacionesEstudiante"
              :key="observacion._id"
              class="observacion-item"
            >
              <div class="observacion-indicador">
                <Eye :size="18" />
              </div>

              <div class="observacion-contenido">

                <div class="observacion-top">
                  <div class="observacion-etiquetas">

                    <span
                      class="observacion-tipo"
                      :class="`tipo-${observacion.tipo}`"
                    >
                      {{ nombreTipoObservacion(observacion.tipo) }}
                    </span>

                    <span
                      class="observacion-categoria"
                      :class="`categoria-${observacion.categoria}`"
                    >
                      {{ nombreCategoriaObservacion(observacion.categoria) }}
                    </span>

                    <span
                      class="observacion-gravedad"
                      :class="`gravedad-${observacion.gravedad}`"
                    >
                      {{ nombreGravedadObservacion(observacion.gravedad) }}
                    </span>

                    <span
                      class="observacion-estado"
                      :class="`estado-${observacion.estado}`"
                    >
                      {{ nombreEstadoObservacion(observacion.estado) }}
                    </span>

                  </div>

                  <span class="observacion-fecha">
                    {{ formatearFechaObservacion(observacion.fecha) }}
                  </span>
                </div>

                <h4>
                  {{ observacion.descripcion }}
                </h4>

                <p
                  v-if="observacion.compromiso"
                  class="observacion-compromiso"
                >
                  <strong>
                    Compromiso:
                  </strong>

                  {{ observacion.compromiso }}
                </p>

                <div class="observacion-footer">

                  <span>
                    Responsable:
                    {{
                      nombreResponsableObservacion(observacion)
                    }}
                  </span>

                  <div class="observacion-acciones">

                    <button
                      type="button"
                      class="icon-button"
                      title="Editar observación"
                      @click="
                        editarObservacion(observacion)
                      "
                    >
                      <FileText :size="17" />
                    </button>

                    <button
                      type="button"
                      class="icon-button danger"
                      title="Eliminar observación"
                      @click="
                        eliminarObservacion(observacion._id)
                      "
                    >
                      <ClipboardX :size="17" />
                    </button>

                  </div>
                </div>

                <!-- SEGUIMIENTO -->
                <div
                  v-if="
                    observacion.seguimiento &&
                    observacion.seguimiento.length
                  "
                  class="seguimiento-observacion"
                >
                  <div class="seguimiento-titulo">
                    <CheckCircle2 :size="17" />

                    <strong>
                      Seguimiento
                    </strong>
                  </div>

                  <div
                    v-for="seguimiento in observacion.seguimiento"
                    :key="seguimiento._id"
                    class="seguimiento-item"
                  >
                    <div>
                      <strong>
                        {{
                          formatearFechaObservacion(
                            seguimiento.fecha
                          )
                        }}
                      </strong>

                      <p>
                        {{ seguimiento.observacion }}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </article>
          </div>
        </div>

      </template>
    </div>
  </div>

  <!-- MODAL / FORMULARIO -->
  <div
    v-if="mostrarFormularioObservador"
    class="observador-modal-overlay"
    @click.self="cerrarFormularioObservador"
  >
    <div class="observador-modal">

      <div class="observador-modal-header">
        <div>
          <span class="eyebrow">
            Observador
          </span>

          <h2>
            {{
              observacionEditando
                ? "Editar observación"
                : "Nueva observación"
            }}
          </h2>

          <p>
            Registra la información correspondiente al estudiante.
          </p>
        </div>

        <button
          type="button"
          class="modal-close"
          @click="cerrarFormularioObservador"
        >
          ×
        </button>
      </div>

      <form
        class="observador-form"
        @submit.prevent="guardarObservacion"
      >

        <div class="form-grid">

          <div class="form-field">
            <label>
              Tipo de observación
            </label>

            <select
              v-model="formObservador.tipo"
              required
            >
              <option value="academico">
                Académico
              </option>

              <option value="disciplinario">
                Disciplinario
              </option>

              <option value="convivencia">
                Convivencia
              </option>
            </select>
          </div>

          <div class="form-field">
            <label>
              Categoría
            </label>

            <select
              v-model="formObservador.categoria"
              required
            >
              <option value="positiva">
                Positiva
              </option>

              <option value="negativa">
                Negativa
              </option>

              <option value="neutra">
                Neutra
              </option>
            </select>
          </div>

          <div class="form-field">
            <label>
              Gravedad
            </label>

            <select
              v-model="formObservador.gravedad"
              required
            >
              <option value="baja">
                Baja
              </option>

              <option value="media">
                Media
              </option>

              <option value="alta">
                Alta
              </option>
            </select>
          </div>

          <div class="form-field">
            <label>
              Estado
            </label>

            <select
              v-model="formObservador.estado"
              required
            >
              <option value="abierto">
                Abierto
              </option>

              <option value="seguimiento">
                En seguimiento
              </option>

              <option value="cerrado">
                Cerrado
              </option>
            </select>
          </div>

        </div>

        <div class="form-field">
          <label>
            Descripción
          </label>

          <textarea
            v-model="formObservador.descripcion"
            rows="5"
            placeholder="Describe la situación observada..."
            required
          ></textarea>
        </div>

        <div class="form-field">
          <label>
            Compromiso
          </label>

          <textarea
            v-model="formObservador.compromiso"
            rows="3"
            placeholder="Registra el compromiso acordado..."
          ></textarea>
        </div>

        <div
          v-if="errorFormularioObservador"
          class="observador-alert observador-alert-error"
        >
          <AlertCircle :size="18" />

          <span>
            {{ errorFormularioObservador }}
          </span>
        </div>

        <div class="observador-modal-actions">

          <button
            type="button"
            class="secondary-button"
            @click="cerrarFormularioObservador"
          >
            Cancelar
          </button>

          <button
            type="submit"
            class="primary-button"
            :disabled="guardandoObservacion"
          >
            <RefreshCw
              v-if="guardandoObservacion"
              :size="17"
              class="loading-spin"
            />

            <CheckCircle2
              v-else
              :size="17"
            />

            {{
              guardandoObservacion
                ? "Guardando..."
                : "Guardar observación"
            }}
          </button>

        </div>

      </form>
    </div>
  </div>
</div>


        <!-- ========================= -->
        <!-- PLACEHOLDERS -->
        <!-- ========================= -->

        <div
          v-else-if="seccionActual === 'estadisticas'"
          class="page-section estadisticas-section"
        >
          <div class="page-heading estadisticas-heading">
            <div>
              <span class="eyebrow">Rendimiento académico</span>
              <h1>Estadísticas académicas</h1>
              <p>
                Consulta el rendimiento académico de los estudiantes por grupo y período.
              </p>
            </div>

            <button
              class="primary-button"
              :disabled="cargandoEstadisticas"
              @click="actualizarEstadisticas"
            >
              <RefreshCw
                :size="18"
                :class="{ spinning: cargandoEstadisticas }"
              />
              Actualizar
            </button>
          </div>

          <div class="estadisticas-filtros">
            <div class="filtro-estadistica">
              <label>Grupo</label>
              <select v-model="grupoEstadisticasSeleccionado">
                <option value="">Selecciona un grupo</option>
                <option
                  v-for="grupo in grupos"
                  :key="grupo._id"
                  :value="grupo._id"
                >
                  {{ grupo.nombre }}
                  {{ grupo.grado ? `- ${grupo.grado}` : "" }}
                </option>
              </select>
            </div>

            <div class="filtro-estadistica">
              <label>Período académico</label>
              <select v-model="periodoEstadisticasSeleccionado">
                <option
                  v-for="periodo in periodosDisponiblesEstadisticas"
                  :key="periodo.numero"
                  :value="periodo.numero"
                >
                  {{ periodo.nombre || `Período ${periodo.numero}` }}
                </option>
              </select>
            </div>
          </div>

          <div
            v-if="errorEstadisticas"
            class="alert error"
          >
            <AlertCircle :size="20" />
            <span>{{ errorEstadisticas }}</span>
          </div>

          <div
            v-if="cargandoEstadisticas"
            class="loading-card"
          >
            <div class="loader"></div>
            <span>Calculando estadísticas académicas...</span>
          </div>

          <template v-else>
            <div class="estadisticas-resumen">
              <div class="estadistica-card">
                <div class="estadistica-icon blue">
                  <Users :size="21" />
                </div>
                <div>
                  <span>Estudiantes</span>
                  <strong>{{ estadisticasResumen.totalEstudiantes }}</strong>
                </div>
              </div>

              <div class="estadistica-card">
                <div class="estadistica-icon purple">
                  <BarChart3 :size="21" />
                </div>
                <div>
                  <span>Promedio general</span>
                  <strong>{{ formatNota(estadisticasResumen.promedioGeneral) }}</strong>
                </div>
              </div>

              <div class="estadistica-card">
                <div class="estadistica-icon green">
                  <CheckCircle2 :size="21" />
                </div>
                <div>
                  <span>En nivel aprobatorio</span>
                  <strong>{{ estadisticasResumen.aprobados }}</strong>
                </div>
              </div>

              <div class="estadistica-card">
                <div class="estadistica-icon red">
                  <AlertCircle :size="21" />
                </div>
                <div>
                  <span>Requieren atención</span>
                  <strong>{{ estadisticasResumen.enRiesgo }}</strong>
                </div>
              </div>
            </div>

            <div class="estadisticas-grid">
              <div class="estadisticas-card rendimiento-card">
                <div class="estadisticas-card-header">
                  <div>
                    <h2>Rendimiento por estudiante</h2>
                    <p>Promedio individual del período seleccionado.</p>
                  </div>
                </div>

                <div
                  v-if="estudiantesEstadisticas.length"
                  class="tabla-estadisticas-wrapper"
                >
                  <table class="tabla-estadisticas">
                    <thead>
                      <tr>
                        <th>Estudiante</th>
                        <th>Promedio</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="estudiante in estudiantesEstadisticas"
                        :key="estudiante.id"
                      >
                        <td>
                          <div class="estadistica-estudiante">
                            <div class="student-avatar">
                              {{ iniciales(estudiante.nombre) }}
                            </div>
                            <div>
                              <strong>{{ estudiante.nombre }}</strong>
                              <small>{{ estudiante.documento || "Sin documento" }}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            class="grade-badge"
                            :class="claseNota(estudiante.promedio)"
                          >
                            {{ formatNota(estudiante.promedio) }}
                          </span>
                        </td>
                        <td>
                          <span
                            class="estado-rendimiento"
                            :class="estudiante.claseEstado"
                          >
                            {{ estudiante.estado }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div
                  v-else
                  class="estadisticas-empty"
                >
                  <BarChart3 :size="40" />
                  <h3>No hay datos académicos</h3>
                  <p>
                    No se encontraron calificaciones para los filtros seleccionados.
                  </p>
                </div>
              </div>

              <div class="estadisticas-card">
                <div class="estadisticas-card-header">
                  <div>
                    <h2>Promedio por asignatura</h2>
                    <p>Resultado promedio de cada asignatura.</p>
                  </div>
                </div>

                <div
                  v-if="promediosAsignaturasEstadisticas.length"
                  class="asignaturas-estadisticas"
                >
                  <div
                    v-for="asignatura in promediosAsignaturasEstadisticas"
                    :key="asignatura.id"
                    class="asignatura-estadistica"
                  >
                    <div class="asignatura-info">
                      <strong>{{ asignatura.nombre }}</strong>
                      <span>
                        {{ asignatura.cantidad }}
                        estudiante{{ asignatura.cantidad === 1 ? "" : "s" }}
                      </span>
                    </div>
                    <span
                      class="grade-badge"
                      :class="claseNota(asignatura.promedio)"
                    >
                      {{ formatNota(asignatura.promedio) }}
                    </span>
                  </div>
                </div>

                <div
                  v-else
                  class="estadisticas-empty"
                >
                  <FileText :size="40" />
                  <h3>Sin información</h3>
                  <p>No hay calificaciones disponibles para este período.</p>
                </div>
              </div>
            </div>

            <div class="estadisticas-card atencion-card">
              <div class="estadisticas-card-header">
                <div>
                  <h2>Estudiantes que requieren atención</h2>
                  <p>
                    Estudiantes cuyo promedio del período se encuentra por debajo de 3.0.
                  </p>
                </div>
                <span class="atencion-count">
                  {{ estudiantesEnRiesgoEstadisticas.length }}
                </span>
              </div>

              <div
                v-if="estudiantesEnRiesgoEstadisticas.length"
                class="riesgo-grid"
              >
                <div
                  v-for="estudiante in estudiantesEnRiesgoEstadisticas"
                  :key="estudiante.id"
                  class="riesgo-item"
                >
                  <div class="riesgo-avatar">
                    {{ iniciales(estudiante.nombre) }}
                  </div>
                  <div class="riesgo-info">
                    <strong>{{ estudiante.nombre }}</strong>
                    <span>Promedio {{ formatNota(estudiante.promedio) }}</span>
                  </div>
                  <AlertCircle :size="19" class="riesgo-icon" />
                </div>
              </div>

              <div
                v-else
                class="sin-riesgo"
              >
                <CheckCircle2 :size="20" />
                <span>No hay estudiantes con promedio inferior a 3.0.</span>
              </div>
            </div>
          </template>
        </div>

        <!-- ========================= -->
        <!-- VISTAS ADMINISTRATIVAS -->
        <!-- ========================= -->

        <!-- EXCUSAS DOCENTES -->
        <div
          v-else-if="seccionActual === 'excusas-docentes'"
          class="page-section visual-module-section"
        >
          <div class="page-heading">
            <div>
              <span class="eyebrow">Gestión</span>
              <h1>Excusas docentes</h1>
              <p>Consulta y organiza las excusas registradas por los docentes.</p>
            </div>
            <button class="primary-button" type="button">
              <ClipboardX :size="18" />
              Registrar excusa
            </button>
          </div>
          <div class="module-toolbar">
            <div class="fake-search"><Search :size="18" /><span>Buscar docente o motivo...</span></div>
            <div class="fake-select">Todos los estados <ChevronRight :size="16" /></div>
            <div class="fake-select">Período académico <ChevronRight :size="16" /></div>
          </div>
          <div class="visual-table-card">
            <div class="visual-table-head"><span>Docente</span><span>Fecha</span><span>Motivo</span><span>Estado</span><span>Acción</span></div>
            <div v-for="(item, i) in ['Laura Gómez','Carlos Ramírez','Andrea Martínez']" :key="item" class="visual-table-row">
              <div class="person-cell"><div class="mini-avatar">{{ item.charAt(0) }}</div><strong>{{ item }}</strong></div>
              <span>12/09/2026</span><span>{{ ['Cita médica','Calamidad familiar','Permiso institucional'][i] }}</span>
              <span class="status-badge success">{{ i === 1 ? 'Aprobada' : 'Pendiente' }}</span>
              <button class="table-action" type="button">Ver detalle</button>
            </div>
          </div>
        </div>

        <!-- CERTIFICADOS -->
        <div
          v-else-if="seccionActual === 'certificados'"
          class="page-section visual-module-section"
        >
          <div class="page-heading"><div><span class="eyebrow">Gestión</span><h1>Certificados</h1><p>Genera certificados académicos para los estudiantes de la institución.</p></div></div>
          <div class="visual-form-card">
            <div class="visual-form-title"><div class="large-module-icon blue"><Award :size="24" /></div><div><h2>Generar certificado</h2><p>Selecciona el estudiante y el tipo de certificado.</p></div></div>
            <div class="visual-form-grid">
              <div class="fake-field"><label>Estudiante</label><div class="fake-input">Selecciona un estudiante <ChevronRight :size="16" /></div></div>
              <div class="fake-field"><label>Tipo de certificado</label><div class="fake-input">Certificado de estudios <ChevronRight :size="16" /></div></div>
              <div class="fake-field"><label>Fecha de expedición</label><div class="fake-input">18 de septiembre de 2026</div></div>
              <div class="fake-field"><label>Observación</label><div class="fake-input">Sin observaciones</div></div>
            </div>
            <div class="form-preview"><FileText :size="22" /><div><strong>Vista previa del certificado</strong><span>Documento listo para generar en formato PDF.</span></div><button class="secondary-button" type="button">Vista previa</button></div>
            <div class="visual-form-actions"><button class="secondary-button" type="button">Cancelar</button><button class="primary-button" type="button"><FileText :size="17" /> Generar certificado</button></div>
          </div>
        </div>

        <!-- CONSTANCIAS -->
        <div
          v-else-if="seccionActual === 'constancias'"
          class="page-section visual-module-section"
        >
          <div class="page-heading"><div><span class="eyebrow">Gestión</span><h1>Constancias</h1><p>Prepara constancias académicas y administrativas para los estudiantes.</p></div></div>
          <div class="document-options-grid">
            <div class="document-option"><div class="large-module-icon green"><FileCheck :size="24" /></div><h3>Constancia de estudios</h3><p>Acredita que el estudiante se encuentra matriculado.</p><button class="secondary-button" type="button">Seleccionar</button></div>
            <div class="document-option"><div class="large-module-icon blue"><FileText :size="24" /></div><h3>Constancia de matrícula</h3><p>Presenta información básica del proceso de matrícula.</p><button class="secondary-button" type="button">Seleccionar</button></div>
            <div class="document-option"><div class="large-module-icon purple"><ClipboardCheck :size="24" /></div><h3>Constancia académica</h3><p>Resume el estado académico actual del estudiante.</p><button class="secondary-button" type="button">Seleccionar</button></div>
          </div>
        </div>

        <!-- CANDIDATOS -->
        <div
          v-else-if="seccionActual === 'candidatos'"
          class="page-section visual-module-section"
        >
          <div class="page-heading"><div><span class="eyebrow">Elecciones</span><h1>Candidatos</h1><p>Visualiza los candidatos registrados para los procesos electorales.</p></div><button class="primary-button" type="button"><UserRoundCheck :size="18" /> Nuevo candidato</button></div>
          <div class="candidate-grid">
            <div v-for="(candidate, i) in ['María Fernanda López','Juan Sebastián Pérez','Laura Valentina Gómez','Carlos Andrés Torres']" :key="candidate" class="candidate-card">
              <div class="candidate-cover"></div><div class="candidate-avatar">{{ candidate.split(' ').map(x => x[0]).slice(0,2).join('') }}</div><div class="candidate-body"><span class="candidate-role">Personería estudiantil</span><h3>{{ candidate }}</h3><p>Grado {{ 10 + (i % 2) }}-0{{ i + 1 }}</p><div class="candidate-status"><span class="status-badge success">Activo</span><span>Propuesta {{ i + 1 }}</span></div></div><div class="candidate-actions"><button class="table-action" type="button">Ver perfil</button><button class="table-action" type="button">Editar</button></div>
            </div>
          </div>
        </div>

        <!-- EVENTOS ELECTORALES -->
        <div
          v-else-if="seccionActual === 'eventos-electorales'"
          class="page-section visual-module-section"
        >
          <div class="page-heading"><div><span class="eyebrow">Elecciones</span><h1>Eventos electorales</h1><p>Organiza visualmente los procesos y jornadas electorales de la institución.</p></div><button class="primary-button" type="button"><Vote :size="18" /> Nuevo evento</button></div>
          <div class="election-timeline">
            <div class="election-event active-event"><div class="event-date"><strong>25</strong><span>SEP</span></div><div class="event-line"></div><div class="event-content"><div class="event-top"><span class="status-badge success">Activo</span><span>2026</span></div><h2>Elección de personero estudiantil</h2><p>Jornada principal de votación para la comunidad estudiantil.</p><div class="event-meta"><span><CalendarDays :size="16" /> 8:00 a. m. - 2:00 p. m.</span><span><Users :size="16" /> 5 candidatos</span></div></div></div>
            <div class="election-event"><div class="event-date"><strong>20</strong><span>SEP</span></div><div class="event-line"></div><div class="event-content"><div class="event-top"><span class="status-badge neutral">Programado</span><span>2026</span></div><h2>Debate de candidatos</h2><p>Espacio institucional para presentación de propuestas.</p><div class="event-meta"><span><CalendarDays :size="16" /> 10:00 a. m.</span><span><Users :size="16" /> Auditorio</span></div></div></div>
          </div>
        </div>

        <!-- PERMISOS -->
        <div
          v-else-if="seccionActual === 'permisos'"
          class="page-section visual-module-section"
        >
          <div class="page-heading"><div><span class="eyebrow">Elecciones</span><h1>Permisos</h1><p>Administra visualmente los permisos asociados al proceso electoral.</p></div></div>
          <div class="permissions-card">
            <div class="permission-row"><div class="permission-icon blue"><KeyRound :size="20" /></div><div class="permission-copy"><strong>Gestión de candidatos</strong><span>Permite registrar y modificar candidatos.</span></div><div class="fake-toggle on"></div></div>
            <div class="permission-row"><div class="permission-icon purple"><Vote :size="20" /></div><div class="permission-copy"><strong>Administración de elecciones</strong><span>Permite configurar eventos electorales.</span></div><div class="fake-toggle on"></div></div>
            <div class="permission-row"><div class="permission-icon green"><Trophy :size="20" /></div><div class="permission-copy"><strong>Consulta de resultados</strong><span>Permite consultar los resultados publicados.</span></div><div class="fake-toggle"></div></div>
            <div class="permission-row"><div class="permission-icon orange"><Users :size="20" /></div><div class="permission-copy"><strong>Votación estudiantil</strong><span>Habilita la participación de los estudiantes.</span></div><div class="fake-toggle on"></div></div>
          </div>
        </div>

        <!-- RESULTADOS -->
        <div
          v-else-if="seccionActual === 'resultados'"
          class="page-section visual-module-section"
        >
          <div class="page-heading"><div><span class="eyebrow">Elecciones</span><h1>Resultados</h1><p>Consulta los resultados del proceso electoral seleccionado.</p></div><button class="secondary-button" type="button"><RefreshCw :size="17" /> Actualizar</button></div>
          <div class="result-summary"><div><span>Votos registrados</span><strong>248</strong></div><div><span>Participación</span><strong>82%</strong></div><div><span>Candidatos</span><strong>4</strong></div><div><span>Estado</span><strong class="result-open">Publicado</strong></div></div>
          <div class="results-card"><div class="results-header"><div><h2>Personería estudiantil 2026</h2><p>Resultados de la jornada electoral.</p></div></div><div v-for="(name, i) in ['María Fernanda López','Juan Sebastián Pérez','Laura Valentina Gómez','Carlos Andrés Torres']" :key="name" class="result-row"><div class="result-position">{{ i + 1 }}</div><div class="result-person"><div class="mini-avatar">{{ name.charAt(0) }}</div><strong>{{ name }}</strong></div><div class="result-bar"><div class="result-bar-fill" :style="{ width: [46,28,17,9][i] + '%' }"></div></div><strong class="result-votes">{{ [114,69,42,23][i] }} votos</strong></div></div>
        </div>

        <!-- BOLETÍN DEL ESTUDIANTE -->
        <div
          v-else-if="seccionActual === 'boletin-estudiante'"
          class="page-section visual-module-section"
        >
          <div class="page-heading"><div><span class="eyebrow">Informes</span><h1>Boletín del estudiante</h1><p>Consulta una vista previa del boletín académico del estudiante.</p></div><button class="primary-button" type="button"><FileText :size="18" /> Generar boletín</button></div>
          <div class="boletin-layout"><div class="boletin-sidebar"><div class="fake-field"><label>Estudiante</label><div class="fake-input">Juan Pérez <ChevronRight :size="16" /></div></div><div class="fake-field"><label>Grupo</label><div class="fake-input">10-01</div></div><div class="fake-field"><label>Período</label><div class="fake-input">Período 1</div></div><button class="primary-button full-button" type="button"><FileText :size="17" /> Ver boletín</button></div><div class="boletin-preview"><div class="boletin-top"><div class="logo-box small-logo"><span>EN</span></div><div><strong>EasyNotes</strong><span>Institución Educativa de Prueba</span></div><span class="boletin-period">2026 · Período 1</span></div><div class="student-banner"><div class="mini-avatar big">JP</div><div><strong>Juan Pérez</strong><span>10-01 · Estudiante</span></div><div class="preview-average"><small>Promedio</small><strong>4.3</strong></div></div><div class="boletin-subjects"><div v-for="item in [['Matemáticas','4.5'],['Lengua','4.0'],['Ciencias','3.8'],['Tecnología','4.7']]" :key="item[0]"><span>{{ item[0] }}</span><strong>{{ item[1] }}</strong></div></div></div></div>
        </div>

        <!-- LISTADOS -->
        <div
          v-else-if="seccionActual === 'listados'"
          class="page-section visual-module-section"
        >
          <div class="page-heading"><div><span class="eyebrow">Informes</span><h1>Listados varios</h1><p>Selecciona el tipo de listado que deseas consultar.</p></div></div>
          <div class="listing-grid"><div v-for="item in [{icon:'users',title:'Listado de estudiantes',text:'Relación de estudiantes activos por grupo.'},{icon:'groups',title:'Listado de grupos',text:'Consulta los grupos académicos de la institución.'},{icon:'grades',title:'Listado de calificaciones',text:'Resumen de calificaciones por período.'},{icon:'docs',title:'Listado de documentos',text:'Relación de documentos y certificados generados.'}]" :key="item.title" class="listing-card"><div class="large-module-icon blue"><Users v-if="item.icon==='users'" :size="24" /><List v-else-if="item.icon==='groups'" :size="24" /><BarChart3 v-else-if="item.icon==='grades'" :size="24" /><FileText v-else :size="24" /></div><h3>{{ item.title }}</h3><p>{{ item.text }}</p><button class="secondary-button" type="button">Consultar listado</button></div></div>
        </div>

        <!-- INFORME DE EXCUSAS -->
        <div
          v-else-if="seccionActual === 'informe-excusas'"
          class="page-section visual-module-section"
        >
          <div class="page-heading"><div><span class="eyebrow">Informes</span><h1>Informe de excusas</h1><p>Vista resumida de las excusas docentes registradas.</p></div><button class="secondary-button" type="button"><FileWarning :size="17" /> Exportar informe</button></div>
          <div class="report-metrics"><div><span>Total excusas</span><strong>18</strong></div><div><span>Aprobadas</span><strong>12</strong></div><div><span>Pendientes</span><strong>4</strong></div><div><span>Rechazadas</span><strong>2</strong></div></div>
          <div class="visual-table-card"><div class="visual-table-head"><span>Mes</span><span>Aprobadas</span><span>Pendientes</span><span>Rechazadas</span><span>Total</span></div><div v-for="row in [['Agosto','6','1','1','8'],['Septiembre','6','3','1','10']]" :key="row[0]" class="visual-table-row"><strong>{{ row[0] }}</strong><span>{{ row[1] }}</span><span>{{ row[2] }}</span><span>{{ row[3] }}</span><strong>{{ row[4] }}</strong></div></div>
        </div>

        <!-- BITÁCORA -->
        <div
          v-else-if="seccionActual === 'bitacora'"
          class="page-section visual-module-section"
        >
          <div class="page-heading"><div><span class="eyebrow">Otros</span><h1>Bitácora</h1><p>Historial visual de las acciones realizadas en el sistema.</p></div><button class="secondary-button" type="button"><RefreshCw :size="17" /> Actualizar</button></div>
          <div class="bitacora-card"><div v-for="(log, i) in [{title:'Actualización de calificación',desc:'Se actualizó la calificación de Matemáticas de Juan Pérez.',time:'Hoy · 10:42 a. m.',icon:'grade'},{title:'Nueva observación',desc:'Se registró una observación académica para María Gómez.',time:'Hoy · 09:18 a. m.',icon:'obs'},{title:'Generación de boletín',desc:'Se generó el boletín académico del grupo 10-01.',time:'Ayer · 04:35 p. m.',icon:'doc'},{title:'Inicio de sesión',desc:'El coordinador ingresó al sistema.',time:'Ayer · 08:02 a. m.',icon:'login'}]" :key="log.title" class="log-item"><div class="log-icon"><CheckCircle2 v-if="i===0" :size="18" /><Eye v-else-if="i===1" :size="18" /><FileText v-else-if="i===2" :size="18" /><UserCircle v-else :size="18" /></div><div class="log-content"><strong>{{ log.title }}</strong><p>{{ log.desc }}</p><span>{{ log.time }}</span></div><ChevronRight :size="18" /></div></div>
        </div>

        <!-- PERFIL -->
        <div
          v-else-if="seccionActual === 'perfil'"
          class="page-section visual-module-section"
        >
          <div class="page-heading"><div><span class="eyebrow">Configuración</span><h1>Perfil</h1><p>Consulta la información del coordinador y las preferencias de la cuenta.</p></div><button class="primary-button" type="button"><CheckCircle2 :size="18" /> Guardar cambios</button></div>
          <div class="profile-layout"><div class="profile-card profile-summary"><div class="profile-avatar-large">{{ (usuario?.nombres?.charAt(0) || 'C').toUpperCase() }}</div><h2>{{ usuario?.nombres || 'Coordinador' }} {{ usuario?.apellidos || '' }}</h2><span>Coordinador académico</span><div class="profile-tag"><CheckCircle2 :size="15" /> Cuenta activa</div></div><div class="visual-form-card profile-form"><div class="visual-form-title"><div><h2>Información personal</h2><p>Datos básicos de la cuenta.</p></div></div><div class="visual-form-grid"><div class="fake-field"><label>Nombres</label><div class="fake-input">{{ usuario?.nombres || 'Coordinador' }}</div></div><div class="fake-field"><label>Apellidos</label><div class="fake-input">{{ usuario?.apellidos || 'Académico' }}</div></div><div class="fake-field"><label>Usuario</label><div class="fake-input">{{ usuario?.usuario || 'coordinador.prueba' }}</div></div><div class="fake-field"><label>Rol</label><div class="fake-input">Coordinador</div></div><div class="fake-field full-span"><label>Correo electrónico</label><div class="fake-input">coordinador@easynotes.com</div></div></div></div></div>
        </div>

        <!-- CRONOGRAMA -->
        <div
          v-else-if="seccionActual === 'cronograma'"
          class="page-section visual-module-section"
        >
          <div class="page-heading"><div><span class="eyebrow">Otros</span><h1>Cronograma</h1><p>Visualiza las actividades académicas y administrativas programadas.</p></div><button class="primary-button" type="button"><CalendarDays :size="18" /> Nueva actividad</button></div>
          <div class="calendar-header"><button class="icon-button" type="button">‹</button><h2>Septiembre 2026</h2><button class="icon-button" type="button">›</button></div>
          <div class="calendar-grid"><div v-for="day in ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']" :key="day" class="calendar-weekday">{{ day }}</div><div v-for="n in 30" :key="n" class="calendar-day" :class="{ today: n === 18, event: [8,15,20,25].includes(n) }"><span>{{ n }}</span><small v-if="n===8">Reunión</small><small v-else-if="n===15">Consejo</small><small v-else-if="n===20">Debate</small><small v-else-if="n===25">Elecciones</small></div></div>
        </div>

        <div
          v-else
          class="page-section"
        >
          <div class="page-heading">
            <div>
              <span class="eyebrow">
                {{ categoriaSeccion(seccionActual) }}
              </span>

              <h1>
                {{ titulos[seccionActual] }}
              </h1>

              <p>
                Este módulo estará disponible próximamente.
              </p>
            </div>
          </div>

          <div class="module-placeholder">
            <div class="placeholder-icon">
              <component
                :is="iconos[seccionActual]"
                :size="42"
              />
            </div>

            <h2>
              {{ titulos[seccionActual] }}
            </h2>

            <p>
              Aquí se implementará la funcionalidad correspondiente
              a este módulo del coordinador.
            </p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  ref
} from "vue";

import { useRouter } from "vue-router";
import { onMounted as onMountedBody, onUnmounted } from "vue";
import { baseURL } from "@/services/api";
import { useAuthStore } from "@/stores/auth";

import {
  Home,
  ClipboardCheck,
  FileClock,
  Eye,
  BarChart3,
  ClipboardX,
  Award,
  FileCheck,
  UserRoundCheck,
  Vote,
  KeyRound,
  Trophy,
  FileText,
  List,
  FileWarning,
  History,
  UserCircle,
  CalendarDays,
  LogOut,
  Menu,
  Bell,
  ChevronRight,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Users
} from "@lucide/vue";

const router = useRouter();
const authStore = useAuthStore();

// La URL base sale del mismo lugar que el resto de la app (VITE_API_URL).
const urlApi = (ruta: string) => `${baseURL}${ruta.replace(/^\/api/, "")}`;

// Estilos globales propios de este portal, activos solo mientras esta vista está montada.
onMountedBody(() => document.body.classList.add("portal-coordinador"));
onUnmounted(() => document.body.classList.remove("portal-coordinador"));

/* =========================================================
   SESIÓN
========================================================= */

const usuarioGuardado =
  localStorage.getItem("usuario");

let usuario: any = null;

try {
  usuario = usuarioGuardado
    ? JSON.parse(usuarioGuardado)
    : null;
} catch {
  usuario = null;
}

/* =========================================================
   ESTADO GENERAL
========================================================= */

const sidebarCollapsed = ref(false);

const seccionActual =
  ref("inicio");

/* =========================================================
   TÍTULOS
========================================================= */

const titulos: Record<string, string> = {
  inicio: "Inicio",

  seguimiento: "Seguimiento",

  "informes-periodicos":
    "Informes periódicos",

  observador:
    "Observador del estudiante",

  estadisticas:
    "Estadísticas académicas",

  "excusas-docentes":
    "Excusas docentes",

  certificados:
    "Certificados",

  constancias:
    "Constancias",

  candidatos:
    "Candidatos",

  "eventos-electorales":
    "Eventos electorales",

  permisos:
    "Permisos",

  resultados:
    "Resultados",

  "boletin-estudiante":
    "Boletín del estudiante",

  listados:
    "Listados varios",

  "informe-excusas":
    "Informe de excusas",

  bitacora:
    "Bitácora",

  perfil:
    "Perfil",

  cronograma:
    "Cronograma"
};

/* =========================================================
   ICONOS
========================================================= */

const iconos: Record<string, any> = {
  seguimiento:
    ClipboardCheck,

  "informes-periodicos":
    FileClock,

  observador:
    Eye,

  estadisticas:
    BarChart3,

  "excusas-docentes":
    ClipboardX,

  certificados:
    Award,

  constancias:
    FileCheck,

  candidatos:
    UserRoundCheck,

  "eventos-electorales":
    Vote,

  permisos:
    KeyRound,

  resultados:
    Trophy,

  "boletin-estudiante":
    FileText,

  listados:
    List,

  "informe-excusas":
    FileWarning,

  bitacora:
    History,

  perfil:
    UserCircle,

  cronograma:
    CalendarDays
};

/* =========================================================
   INSTITUCIÓN
========================================================= */

const institucionIdUsuario =
  computed(() => {
    if (!usuario) {
      return "";
    }

    if (
      typeof usuario.institucionId ===
      "string"
    ) {
      return usuario.institucionId;
    }

    if (
      usuario.institucionId &&
      typeof usuario.institucionId ===
        "object"
    ) {
      return (
        usuario.institucionId._id ||
        ""
      );
    }

    if (
      usuario.institucion &&
      typeof usuario.institucion ===
        "object"
    ) {
      return (
        usuario.institucion._id ||
        ""
      );
    }

    return "";
  });

/* =========================================================
   DATOS ACADÉMICOS
========================================================= */

const grupos =
  ref<any[]>([]);

const matriculas =
  ref<any[]>([]);

const calificaciones =
  ref<any[]>([]);

const asignaturas =
  ref<any[]>([]);

/* =========================================================
   SEGUIMIENTO
========================================================= */

const cargandoSeguimiento =
  ref(false);

const seguimientoCargado =
  ref(false);

const errorSeguimiento =
  ref("");

const grupoSeleccionado =
  ref("");

const periodoSeleccionado =
  ref(1);

const busquedaSeguimiento =
  ref("");

/* =========================================================
   INFORMES PERIÓDICOS
========================================================= */

const grupoInformeSeleccionado =
  ref("");

const periodoInformeSeleccionado =
  ref(1);

const busquedaInforme =
  ref("");

const errorInformesPeriodicos =
  ref("");

const boletinCargando =
  ref("");

/* =========================================================
   OBSERVADOR DEL ESTUDIANTE
========================================================= */

const observaciones =
  ref<any[]>([]);

const cargandoObservador =
  ref(false);

const errorObservador =
  ref("");

const grupoObservadorSeleccionado =
  ref("");

const estudianteObservadorSeleccionado =
  ref("");

const busquedaObservador =
  ref("");

const mostrarFormularioObservador =
  ref(false);

const guardandoObservacion =
  ref(false);

const errorFormularioObservador =
  ref("");

const observacionEditando =
  ref<any | null>(null);

const formObservador =
  ref({
    tipo: "academico",
    categoria: "neutra",
    gravedad: "baja",
    estado: "abierto",
    descripcion: "",
    compromiso: ""
  });


/* =========================================================
   ESTADÍSTICAS ACADÉMICAS
========================================================= */

const cargandoEstadisticas =
  ref(false);

const errorEstadisticas =
  ref("");

const grupoEstadisticasSeleccionado =
  ref("");

const periodoEstadisticasSeleccionado =
  ref(1);

/* =========================================================
   API
========================================================= */

const apiFetch = async (
  url: string
) => {
  const token =
    localStorage.getItem(
      "token"
    );

  if (!token) {
    router.push("/login");

    throw new Error(
      "La sesión ha terminado."
    );
  }

  const respuesta =
    await fetch(
      url,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  const datos =
    await respuesta
      .json()
      .catch(() => ({}));

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje ||
      datos.message ||
      "No fue posible consultar la información."
    );
  }

  return datos;
};

/* =========================================================
   CARGAR INFORMACIÓN ACADÉMICA
========================================================= */

const cargarSeguimiento =
  async () => {
    cargandoSeguimiento.value =
      true;

    errorSeguimiento.value =
      "";

    try {
      const [
        gruposRespuesta,
        matriculasRespuesta,
        calificacionesRespuesta,
        asignaturasRespuesta
      ] =
        await Promise.all([
          apiFetch(
            urlApi("/grupos")
          ),

          apiFetch(
            urlApi("/matriculas")
          ),

          apiFetch(
            urlApi("/calificaciones")
          ),

          apiFetch(
            urlApi("/asignaturas")
          )
        ]);

      grupos.value =
        Array.isArray(
          gruposRespuesta
        )
          ? gruposRespuesta
          : gruposRespuesta.grupos ||
            [];

      matriculas.value =
        Array.isArray(
          matriculasRespuesta
        )
          ? matriculasRespuesta
          : matriculasRespuesta.matriculas ||
            [];

      calificaciones.value =
        Array.isArray(
          calificacionesRespuesta
        )
          ? calificacionesRespuesta
          : calificacionesRespuesta.calificaciones ||
            [];

      asignaturas.value =
        Array.isArray(
          asignaturasRespuesta
        )
          ? asignaturasRespuesta
          : asignaturasRespuesta.asignaturas ||
            [];

      /* -----------------------------------------------------
         FILTRAR POR INSTITUCIÓN
      ----------------------------------------------------- */

      const institucionId =
        institucionIdUsuario.value;

      if (institucionId) {
        grupos.value =
          grupos.value.filter(
            (grupo: any) => {
              const id =
                typeof grupo.institucionId ===
                "string"
                  ? grupo.institucionId
                  : grupo.institucionId?._id;

              return (
                String(id) ===
                String(
                  institucionId
                )
              );
            }
          );

        matriculas.value =
          matriculas.value.filter(
            (matricula: any) => {
              const id =
                typeof matricula.institucionId ===
                "string"
                  ? matricula.institucionId
                  : matricula.institucionId?._id;

              const estado =
                matricula.estado;

              return (
                String(id) ===
                  String(
                    institucionId
                  ) &&
                (
                  !estado ||
                  estado === "activa"
                )
              );
            }
          );

        calificaciones.value =
          calificaciones.value.filter(
            (calificacion: any) => {
              const id =
                typeof calificacion.institucionId ===
                "string"
                  ? calificacion.institucionId
                  : calificacion.institucionId?._id;

              return (
                String(id) ===
                String(
                  institucionId
                )
              );
            }
          );
      }

      /* -----------------------------------------------------
         SELECCIONAR PRIMER GRUPO
      ----------------------------------------------------- */

      if (
        !grupoSeleccionado.value &&
        grupos.value.length
      ) {
        grupoSeleccionado.value =
          grupos.value[0]._id;
      }

      if (
        !grupoInformeSeleccionado.value &&
        grupos.value.length
      ) {
        grupoInformeSeleccionado.value =
          grupos.value[0]._id;
      }

      if (
        !grupoObservadorSeleccionado.value &&
        grupos.value.length
      ) {
        grupoObservadorSeleccionado.value =
          grupos.value[0]._id;
      }

      if (
        !grupoEstadisticasSeleccionado.value &&
        grupos.value.length
      ) {
        grupoEstadisticasSeleccionado.value =
          grupos.value[0]._id;
      }

      seguimientoCargado.value =
        true;

    } catch (error: any) {
      console.error(
        error
      );

      errorSeguimiento.value =
        error.message ||
        "No fue posible cargar la información.";
    } finally {
      cargandoSeguimiento.value =
        false;
    }
  };

/* =========================================================
   RECARGAR SEGUIMIENTO
========================================================= */

const recargarSeguimiento =
  async () => {
    await cargarSeguimiento();

    if (
      seccionActual.value ===
      "observador"
    ) {
      await cargarObservador();
    }
  };

/* =========================================================
   NAVEGACIÓN
========================================================= */

const irA = (
  seccion: string
) => {
  seccionActual.value =
    seccion;

  if (
    (
      seccion ===
        "seguimiento" ||
      seccion ===
        "informes-periodicos" ||
      seccion ===
        "estadisticas"
    ) &&
    !seguimientoCargado.value
  ) {
    cargarSeguimiento();

    return;
  }

  if (
    seccion ===
    "observador"
  ) {
    if (
      !seguimientoCargado.value
    ) {
      cargarSeguimiento()
        .then(() => {
          cargarObservador();
        });
    } else {
      cargarObservador();
    }
  }
};

/* =========================================================
   GRUPOS SELECCIONADOS
========================================================= */

const grupoSeleccionadoObjeto =
  computed(() => {
    return grupos.value.find(
      (grupo: any) =>
        String(
          grupo._id
        ) ===
        String(
          grupoSeleccionado.value
        )
    );
  });

const grupoInformeObjeto =
  computed(() => {
    return grupos.value.find(
      (grupo: any) =>
        String(
          grupo._id
        ) ===
        String(
          grupoInformeSeleccionado.value
        )
    );
  });

const grupoObservadorObjeto =
  computed(() => {
    return grupos.value.find(
      (grupo: any) =>
        String(
          grupo._id
        ) ===
        String(
          grupoObservadorSeleccionado.value
        )
    );
  });


const grupoEstadisticasObjeto =
  computed(() => {
    return grupos.value.find(
      (grupo: any) =>
        String(grupo._id) ===
        String(grupoEstadisticasSeleccionado.value)
    );
  });

const periodosDisponiblesEstadisticas =
  computed(() => {
    const periodos =
      grupoEstadisticasObjeto.value
        ?.anioAcademicoId
        ?.cronograma
        ?.periodos;

    return Array.isArray(periodos) && periodos.length
      ? periodos
      : periodosPorDefecto;
  });

const matriculasEstadisticas =
  computed(() => {
    return matriculas.value.filter(
      (matricula: any) =>
        String(obtenerIdGrupo(matricula)) ===
        String(grupoEstadisticasSeleccionado.value)
    );
  });

const estudiantesEstadisticas =
  computed(() => {
    const grupoId =
      String(grupoEstadisticasSeleccionado.value);
    const periodo =
      Number(periodoEstadisticasSeleccionado.value);

    return matriculasEstadisticas.value
      .map((matricula: any) => {
        const estudiante = matricula.estudianteId;

        if (!estudiante) return undefined;

        const estudianteId =
          typeof estudiante === "string"
            ? estudiante
            : estudiante._id;

        if (!estudianteId) return undefined;

        const nombre = [
          estudiante.nombres,
          estudiante.apellidos
        ]
          .filter(Boolean)
          .join(" ");

        const notas =
          calificaciones.value
            .filter((cal: any) => {
              const estudianteCal =
                typeof cal.estudianteId === "string"
                  ? cal.estudianteId
                  : cal.estudianteId?._id;

              const grupoCal =
                typeof cal.grupoId === "string"
                  ? cal.grupoId
                  : cal.grupoId?._id;

              return (
                String(estudianteCal) === String(estudianteId) &&
                String(grupoCal) === grupoId &&
                Number(cal.periodo) === periodo &&
                typeof cal.nota === "number"
              );
            })
            .map((cal: any) => Number(cal.nota));

        const promedio = notas.length
          ? notas.reduce(
              (total: number, nota: number) => total + nota,
              0
            ) / notas.length
          : null;

        let estado = "Sin calificaciones";
        let claseEstado = "sin-datos";

        if (promedio !== null) {
          if (promedio < 3) {
            estado = "Requiere atención";
            claseEstado = "riesgo";
          } else {
            estado = "Aprobatorio";
            claseEstado = "aprobado";
          }
        }

        return {
          id: String(estudianteId),
          nombre: nombre || "Estudiante",
          documento: estudiante.documento || "",
          promedio,
          estado,
          claseEstado
        };
      })
      .filter(
        (estudiante): estudiante is NonNullable<typeof estudiante> =>
          estudiante !== undefined
      )
      .sort((a: any, b: any) => {
        const promedioA = a.promedio ?? -1;
        const promedioB = b.promedio ?? -1;
        return promedioB - promedioA;
      });
  });

const estadisticasResumen =
  computed(() => {
    const estudiantes = estudiantesEstadisticas.value;
    const conNota = estudiantes.filter(
      (estudiante: any) => estudiante.promedio !== null
    );

    const aprobados = conNota.filter(
      (estudiante: any) => estudiante.promedio >= 3
    ).length;

    const enRiesgo = conNota.filter(
      (estudiante: any) => estudiante.promedio < 3
    ).length;

    const promedioGeneral = conNota.length
      ? conNota.reduce(
          (total: number, estudiante: any) =>
            total + estudiante.promedio,
          0
        ) / conNota.length
      : null;

    return {
      totalEstudiantes: estudiantes.length,
      promedioGeneral,
      aprobados,
      enRiesgo
    };
  });

const promediosAsignaturasEstadisticas =
  computed(() => {
    const grupoId =
      String(grupoEstadisticasSeleccionado.value);
    const periodo =
      Number(periodoEstadisticasSeleccionado.value);

    const idsEstudiantes =
      new Set(
        estudiantesEstadisticas.value.map(
          (estudiante: any) => String(estudiante.id)
        )
      );

    const mapa = new Map<
      string,
      {
        id: string;
        nombre: string;
        notas: number[];
      }
    >();

    calificaciones.value.forEach((calificacion: any) => {
      const estudianteId =
        typeof calificacion.estudianteId === "string"
          ? calificacion.estudianteId
          : calificacion.estudianteId?._id;

      const calGrupo =
        typeof calificacion.grupoId === "string"
          ? calificacion.grupoId
          : calificacion.grupoId?._id;

      if (
        !idsEstudiantes.has(String(estudianteId)) ||
        String(calGrupo) !== grupoId ||
        Number(calificacion.periodo) !== periodo ||
        typeof calificacion.nota !== "number"
      ) {
        return;
      }

      const asignatura = calificacion.asignaturaId;
      const asignaturaId =
        typeof asignatura === "string"
          ? asignatura
          : asignatura?._id;

      if (!asignaturaId) return;

      const nombre =
        typeof asignatura === "object"
          ? asignatura.nombre || "Asignatura"
          : "Asignatura";

      const key = String(asignaturaId);

      if (!mapa.has(key)) {
        mapa.set(key, {
          id: key,
          nombre,
          notas: []
        });
      }

      mapa.get(key)!.notas.push(
        Number(calificacion.nota)
      );
    });

    return Array.from(mapa.values())
      .map((asignatura) => ({
        id: asignatura.id,
        nombre: asignatura.nombre,
        cantidad: asignatura.notas.length,
        promedio:
          asignatura.notas.reduce(
            (total, nota) => total + nota,
            0
          ) / asignatura.notas.length
      }))
      .sort((a, b) => b.promedio - a.promedio);
  });

const estudiantesEnRiesgoEstadisticas =
  computed(() =>
    estudiantesEstadisticas.value.filter(
      (estudiante: any) =>
        estudiante.promedio !== null &&
        estudiante.promedio < 3
    )
  );

const actualizarEstadisticas =
  async () => {
    cargandoEstadisticas.value = true;
    errorEstadisticas.value = "";

    try {
      if (!seguimientoCargado.value) {
        await cargarSeguimiento();
      } else {
        await cargarSeguimiento();
      }
    } catch (error: any) {
      console.error(error);
      errorEstadisticas.value =
        error.message ||
        "No fue posible actualizar las estadísticas.";
    } finally {
      cargandoEstadisticas.value = false;
    }
  };

/* =========================================================
   PERÍODOS
========================================================= */

const periodosPorDefecto = [
  {
    numero: 1,
    nombre: "Período 1"
  },
  {
    numero: 2,
    nombre: "Período 2"
  },
  {
    numero: 3,
    nombre: "Período 3"
  },
  {
    numero: 4,
    nombre: "Período 4"
  },
  {
    numero: 5,
    nombre: "Período 5"
  }
];

const periodosDisponibles =
  computed(() => {
    const periodos =
      grupoSeleccionadoObjeto
        .value
        ?.anioAcademicoId
        ?.cronograma
        ?.periodos;

    return Array.isArray(
      periodos
    ) &&
      periodos.length
      ? periodos
      : periodosPorDefecto;
  });

const periodosDisponiblesInforme =
  computed(() => {
    const periodos =
      grupoInformeObjeto
        .value
        ?.anioAcademicoId
        ?.cronograma
        ?.periodos;

    return Array.isArray(
      periodos
    ) &&
      periodos.length
      ? periodos
      : periodosPorDefecto;
  });

/* =========================================================
   MATRÍCULAS DEL GRUPO
========================================================= */

const obtenerIdGrupo =
  (matricula: any) => {
    if (
      typeof matricula.grupoId ===
      "string"
    ) {
      return matricula.grupoId;
    }

    if (
      matricula.grupoId &&
      typeof matricula.grupoId ===
        "object"
    ) {
      return matricula.grupoId._id;
    }

    if (
      typeof matricula.grupo ===
      "string"
    ) {
      return matricula.grupo;
    }

    if (
      matricula.grupo &&
      typeof matricula.grupo ===
        "object"
    ) {
      return matricula.grupo._id;
    }

    return "";
  };

const matriculasGrupo =
  computed(() => {
    return matriculas.value.filter(
      (matricula: any) => {
        return (
          String(
            obtenerIdGrupo(
              matricula
            )
          ) ===
          String(
            grupoSeleccionado.value
          )
        );
      }
    );
  });

const matriculasInforme =
  computed(() => {
    return matriculas.value.filter(
      (matricula: any) => {
        return (
          String(
            obtenerIdGrupo(
              matricula
            )
          ) ===
          String(
            grupoInformeSeleccionado.value
          )
        );
      }
    );
  });

/* =========================================================
   ASIGNATURAS DEL SEGUIMIENTO
========================================================= */

const asignaturasSeguimiento =
  computed(() => {
    const grupoId =
      String(
        grupoSeleccionado.value
      );

    const ids =
      new Set<string>();

    const resultado: any[] =
      [];

    calificaciones.value.forEach(
      (calificacion: any) => {
        const calGrupo =
          typeof calificacion.grupoId ===
          "string"
            ? calificacion.grupoId
            : calificacion.grupoId?._id;

        if (
          String(
            calGrupo
          ) !== grupoId
        ) {
          return;
        }

        const asignatura =
          calificacion.asignaturaId;

        if (!asignatura) {
          return;
        }

        const id =
          String(
            asignatura._id
          );

        if (
          !ids.has(id)
        ) {
          ids.add(id);

          resultado.push(
            asignatura
          );
        }
      }
    );

    return resultado;
  });

/* =========================================================
   OBTENER NOTA
========================================================= */

const obtenerNota = (
  estudianteId: string,
  asignaturaId: string
) => {
  const calificacion =
    calificaciones.value.find(
      (calificacion: any) => {
        const estudiante =
          typeof calificacion.estudianteId ===
          "string"
            ? calificacion.estudianteId
            : calificacion.estudianteId?._id;

        const asignatura =
          typeof calificacion.asignaturaId ===
          "string"
            ? calificacion.asignaturaId
            : calificacion.asignaturaId?._id;

        const grupo =
          typeof calificacion.grupoId ===
          "string"
            ? calificacion.grupoId
            : calificacion.grupoId?._id;

        return (
          String(
            estudiante
          ) ===
          String(
            estudianteId
          ) &&
          String(
            asignatura
          ) ===
          String(
            asignaturaId
          ) &&
          String(
            grupo
          ) ===
          String(
            grupoSeleccionado.value
          ) &&
          Number(
            calificacion.periodo
          ) ===
          Number(
            periodoSeleccionado.value
          )
        );
      }
    );

  if (
    !calificacion ||
    typeof calificacion.nota !==
      "number"
  ) {
    return null;
  }

  return Number(
    calificacion.nota
  );
};

/* =========================================================
   FILAS DEL SEGUIMIENTO
========================================================= */

const filasSeguimiento =
  computed(() => {
    const busqueda =
      busquedaSeguimiento.value
        .trim()
        .toLowerCase();

    const filas =
      matriculasGrupo.value
        .map(
          (matricula: any) => {
            const estudiante =
              matricula.estudianteId;

            if (!estudiante) {
              return undefined;
            }

            const estudianteId =
              typeof estudiante ===
              "string"
                ? estudiante
                : estudiante._id;

            if (!estudianteId) {
              return undefined;
            }

            const nombre =
              [
                estudiante.nombres,
                estudiante.apellidos
              ]
                .filter(Boolean)
                .join(" ");

            const notas =
              asignaturasSeguimiento.value.map(
                (asignatura: any) => ({
                  asignatura,

                  nota:
                    obtenerNota(
                      String(
                        estudianteId
                      ),
                      String(
                        asignatura._id
                      )
                    )
                })
              );

            const notasNumericas =
              notas
                .map(
                  (
                    item: {
                      asignatura: any;
                      nota: number | null;
                    }
                  ) =>
                    item.nota
                )
                .filter(
                  (
                    nota
                  ): nota is number =>
                    nota !== null
                );

            const promedio =
              notasNumericas.length
                ? notasNumericas.reduce(
                    (
                      total,
                      nota
                    ) =>
                      total +
                      nota,
                    0
                  ) /
                  notasNumericas.length
                : null;

            const tieneNotaBaja =
              notasNumericas.some(
                (
                  nota
                ) =>
                  nota < 3
              );

            return {
              matricula,
              estudiante,
              estudianteId:
                String(
                  estudianteId
                ),
              nombre:
                nombre ||
                "Estudiante",
              notas,
              promedio,
              tieneNotaBaja
            };
          }
        )
        .filter(
          (
            fila
          ): fila is {
            matricula: any;
            estudiante: any;
            estudianteId: string;
            nombre: string;
            notas: {
              asignatura: any;
              nota: number | null;
            }[];
            promedio: number | null;
            tieneNotaBaja: boolean;
          } =>
            fila !==
            undefined
        );

    if (!busqueda) {
      return filas;
    }

    return filas.filter(
      (
        fila
      ) =>
        fila.nombre
          .toLowerCase()
          .includes(
            busqueda
          )
    );
  });

/* =========================================================
   ESTADÍSTICAS SEGUIMIENTO
========================================================= */

const totalEstudiantes =
  computed(
    () =>
      matriculasGrupo.value
        .length
  );

const estudiantesConNotas =
  computed(
    () =>
      filasSeguimiento.value.filter(
        (
          fila
        ) =>
          fila.promedio !==
          null
      ).length
  );

const estudiantesEnRiesgo =
  computed(
    () =>
      filasSeguimiento.value.filter(
        (
          fila
        ) =>
          fila.tieneNotaBaja
      ).length
  );

const promedioGrupo =
  computed(() => {
    const promedios =
      filasSeguimiento.value
        .map(
          (
            fila
          ) =>
            fila.promedio
        )
        .filter(
          (
            promedio
          ): promedio is number =>
            promedio !== null
        );

    if (!promedios.length) {
      return "—";
    }

    const promedio =
      promedios.reduce(
        (
          total,
          valor
        ) =>
          total +
          valor,
        0
      ) /
      promedios.length;

    return promedio.toFixed(
      1
    );
  });

/* =========================================================
   INFORMES PERIÓDICOS
========================================================= */

const informesPeriodicos =
  computed(() => {
    const busqueda =
      busquedaInforme.value
        .trim()
        .toLowerCase();

    const resultado =
      matriculasInforme.value
        .map(
          (matricula: any) => {
            const estudiante =
              matricula.estudianteId;

            if (!estudiante) {
              return undefined;
            }

            const estudianteId =
              typeof estudiante ===
              "string"
                ? estudiante
                : estudiante._id;

            if (!estudianteId) {
              return undefined;
            }

            const nombre =
              [
                estudiante.nombres,
                estudiante.apellidos
              ]
                .filter(Boolean)
                .join(" ");

            const notas =
              calificaciones.value
                .filter(
                  (cal: any) => {
                    const estudianteCal =
                      typeof cal.estudianteId ===
                      "string"
                        ? cal.estudianteId
                        : cal.estudianteId?._id;

                    const grupoCal =
                      typeof cal.grupoId ===
                      "string"
                        ? cal.grupoId
                        : cal.grupoId?._id;

                    return (
                      String(
                        estudianteCal
                      ) ===
                      String(
                        estudianteId
                      ) &&
                      String(
                        grupoCal
                      ) ===
                      String(
                        grupoInformeSeleccionado.value
                      ) &&
                      Number(
                        cal.periodo
                      ) ===
                      Number(
                        periodoInformeSeleccionado.value
                      ) &&
                      typeof cal.nota ===
                        "number"
                    );
                  }
                )
                .map(
                  (
                    cal: any
                  ) =>
                    Number(
                      cal.nota
                    )
                );

            const promedio =
              notas.length
                ? notas.reduce(
                    (
                      total,
                      nota
                    ) =>
                      total +
                      nota,
                    0
                  ) /
                  notas.length
                : null;

            const tieneNotaBaja =
              notas.some(
                (
                  nota
                ) =>
                  nota < 3
              );

            return {
              matricula,
              estudiante,
              estudianteId:
                String(
                  estudianteId
                ),
              nombre:
                nombre ||
                "Estudiante",
              documento:
                estudiante.documento ||
                "",
              promedio,
              tieneNotaBaja,
              cantidadNotas:
                notas.length
            };
          }
        )
        .filter(
          (
            fila
          ): fila is {
            matricula: any;
            estudiante: any;
            estudianteId: string;
            nombre: string;
            documento: string;
            promedio: number | null;
            tieneNotaBaja: boolean;
            cantidadNotas: number;
          } =>
            fila !==
            undefined
        );

    if (!busqueda) {
      return resultado;
    }

    return resultado.filter(
      (
        fila
      ) =>
        fila.nombre
          .toLowerCase()
          .includes(
            busqueda
          )
    );
  });

const totalInformesPeriodicos =
  computed(
    () =>
      informesPeriodicos.value
        .length
  );

const informesConNotas =
  computed(
    () =>
      informesPeriodicos.value.filter(
        (
          fila
        ) =>
          fila.cantidadNotas >
          0
      ).length
  );

const informesSinNotas =
  computed(
    () =>
      informesPeriodicos.value.filter(
        (
          fila
        ) =>
          fila.cantidadNotas ===
          0
      ).length
  );

const informesEnRiesgo =
  computed(
    () =>
      informesPeriodicos.value.filter(
        (
          fila
        ) =>
          fila.tieneNotaBaja
      ).length
  );

/* =========================================================
   BOLETÍN PDF
========================================================= */

const abrirBoletin =
  async (
    matriculaId: string
  ) => {
    const token =
      localStorage.getItem(
        "token"
      );

    if (!token) {
      router.push("/login");
      return;
    }

    boletinCargando.value =
      matriculaId;

    errorInformesPeriodicos.value =
      "";

    try {
      const respuesta =
        await fetch(
          urlApi(`/reportes/boletin/${matriculaId}/${periodoInformeSeleccionado.value}`),
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      if (!respuesta.ok) {
        const datos =
          await respuesta
            .json()
            .catch(
              () => ({})
            );

        throw new Error(
          datos.mensaje ||
          "No fue posible generar el boletín."
        );
      }

      const blob =
        await respuesta.blob();

      const url =
        URL.createObjectURL(
          blob
        );

      window.open(
        url,
        "_blank"
      );

      setTimeout(
        () => {
          URL.revokeObjectURL(
            url
          );
        },
        60000
      );

    } catch (error: any) {
      console.error(
        error
      );

      errorInformesPeriodicos.value =
        error.message ||
        "No fue posible generar el boletín.";
    } finally {
      boletinCargando.value =
        "";
    }
  };

/* =========================================================
   OBSERVADOR
   CARGAR REGISTROS
========================================================= */

const cargarObservador =
  async () => {
    cargandoObservador.value =
      true;

    errorObservador.value =
      "";

    try {
      const datos =
        await apiFetch(
          urlApi("/observador")
        );

      observaciones.value =
        Array.isArray(datos)
          ? datos
          : datos.observaciones ||
            [];

      /*
       * Si todavía no hay estudiante seleccionado,
       * seleccionamos automáticamente el primero.
       */
      if (
        !estudianteObservadorSeleccionado.value &&
        estudiantesObservador.value.length
      ) {
        estudianteObservadorSeleccionado.value =
          estudiantesObservador.value[0]._id;
      }

      /*
       * Si el estudiante seleccionado ya no aparece
       * en los filtros actuales, seleccionamos el primero.
       */
      const existeSeleccionado =
        estudiantesObservador.value.some(
          (estudiante: any) =>
            String(
              estudiante._id
            ) ===
            String(
              estudianteObservadorSeleccionado.value
            )
        );

      if (
        !existeSeleccionado
      ) {
        estudianteObservadorSeleccionado.value =
          estudiantesObservador.value.length
            ? estudiantesObservador.value[0]._id
            : "";
      }

    } catch (error: any) {
      console.error(
        error
      );

      errorObservador.value =
        error.message ||
        "No fue posible cargar el observador.";
    } finally {
      cargandoObservador.value =
        false;
    }
  };

/* =========================================================
   ESTUDIANTES DEL OBSERVADOR
========================================================= */

const estudiantesObservador =
  computed(() => {
    let lista =
      matriculas.value.filter(
        (matricula: any) => {
          const grupoId =
            obtenerIdGrupo(
              matricula
            );

          if (
            grupoObservadorSeleccionado.value &&
            String(
              grupoId
            ) !==
            String(
              grupoObservadorSeleccionado.value
            )
          ) {
            return false;
          }

          return true;
        }
      );

    const texto =
      busquedaObservador.value
        .trim()
        .toLowerCase();

    if (texto) {
      lista =
        lista.filter(
          (matricula: any) => {
            const estudiante =
              matricula.estudianteId ||
              matricula.estudiante ||
              {};

            const nombre =
              `${estudiante.nombres || ""} ${estudiante.apellidos || ""}`
                .trim()
                .toLowerCase();

            const documento =
              String(
                estudiante.documento ||
                ""
              ).toLowerCase();

            return (
              nombre.includes(
                texto
              ) ||
              documento.includes(
                texto
              )
            );
          }
        );
    }

    return lista
      .map(
        (matricula: any) => {
          const estudiante =
            matricula.estudianteId ||
            matricula.estudiante ||
            null;

          if (!estudiante) {
            return null;
          }

          return {
            ...estudiante,
            matriculaId:
              matricula._id
          };
        }
      )
      .filter(
        (
          estudiante: any
        ): estudiante is any =>
          estudiante !==
          null
      );
  });

/* =========================================================
   ESTUDIANTE SELECCIONADO
========================================================= */

const estudianteObservadorActual =
  computed(() => {
    return (
      estudiantesObservador.value.find(
        (estudiante: any) =>
          String(
            estudiante._id
          ) ===
          String(
            estudianteObservadorSeleccionado.value
          )
      ) ||
      null
    );
  });

/* =========================================================
   OBSERVACIONES DEL ESTUDIANTE
========================================================= */

const observacionesEstudiante =
  computed(() => {
    if (
      !estudianteObservadorSeleccionado.value
    ) {
      return [];
    }

    return observaciones.value
      .filter(
        (observacion: any) => {
          const estudianteId =
            typeof observacion.estudianteId ===
            "string"
              ? observacion.estudianteId
              : observacion.estudianteId?._id;

          return (
            String(
              estudianteId
            ) ===
            String(
              estudianteObservadorSeleccionado.value
            )
          );
        }
      )
      .sort(
        (
          a: any,
          b: any
        ) => {
          const fechaA =
            new Date(
              a.fecha ||
              a.createdAt ||
              0
            ).getTime();

          const fechaB =
            new Date(
              b.fecha ||
              b.createdAt ||
              0
            ).getTime();

          return (
            fechaB -
            fechaA
          );
        }
      );
  });

/* =========================================================
   ESTADÍSTICAS OBSERVADOR
========================================================= */

const observacionesAbiertas =
  computed(() => {
    return observacionesEstudiante.value
      .filter(
        (observacion: any) =>
          observacion.estado ===
            "abierto" ||
          observacion.estado ===
            "seguimiento"
      )
      .length;
  });

const observacionesCerradas =
  computed(() => {
    return observacionesEstudiante.value
      .filter(
        (observacion: any) =>
          observacion.estado ===
          "cerrado"
      )
      .length;
  });

/* =========================================================
   SELECCIONAR ESTUDIANTE
========================================================= */

const seleccionarEstudianteObservador =
  (
    estudianteId: string
  ) => {
    estudianteObservadorSeleccionado.value =
      estudianteId;

    errorObservador.value =
      "";
  };

/* =========================================================
   NUEVA OBSERVACIÓN
========================================================= */

const abrirNuevaObservacion =
  () => {
    if (
      !estudianteObservadorSeleccionado.value
    ) {
      errorObservador.value =
        "Selecciona primero un estudiante.";

      return;
    }

    observacionEditando.value =
      null;

    formObservador.value = {
      tipo: "academico",
      categoria: "neutra",
      gravedad: "baja",
      estado: "abierto",
      descripcion: "",
      compromiso: ""
    };

    errorFormularioObservador.value =
      "";

    mostrarFormularioObservador.value =
      true;
  };

/* =========================================================
   CERRAR FORMULARIO
========================================================= */

const cerrarFormularioObservador =
  () => {
    mostrarFormularioObservador.value =
      false;

    observacionEditando.value =
      null;

    errorFormularioObservador.value =
      "";
  };

/* =========================================================
   EDITAR OBSERVACIÓN
========================================================= */

const editarObservacion =
  (
    observacion: any
  ) => {
    observacionEditando.value =
      observacion;

    formObservador.value = {
      tipo:
        observacion.tipo ||
        "academico",

      categoria:
        observacion.categoria ||
        "neutra",

      gravedad:
        observacion.gravedad ||
        "baja",

      estado:
        observacion.estado ||
        "abierto",

      descripcion:
        observacion.descripcion ||
        "",

      compromiso:
        observacion.compromiso ||
        ""
    };

    errorFormularioObservador.value =
      "";

    mostrarFormularioObservador.value =
      true;
  };

/* =========================================================
   GUARDAR OBSERVACIÓN
========================================================= */

const guardarObservacion =
  async () => {
    if (
      !estudianteObservadorSeleccionado.value
    ) {
      errorFormularioObservador.value =
        "Selecciona un estudiante.";

      return;
    }

    if (
      !formObservador.value.descripcion.trim()
    ) {
      errorFormularioObservador.value =
        "La descripción es obligatoria.";

      return;
    }

    const estudiante =
      estudianteObservadorActual.value;

    if (!estudiante) {
      errorFormularioObservador.value =
        "No fue posible identificar al estudiante.";

      return;
    }

    guardandoObservacion.value =
      true;

    errorFormularioObservador.value =
      "";

    try {
      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {
        router.push(
          "/login"
        );

        return;
      }

      /*
       * Buscamos la matrícula del estudiante
       * para obtener el grupo y año académico.
       */
      const matricula =
        matriculas.value.find(
          (item: any) =>
            String(
              item._id
            ) ===
            String(
              estudiante.matriculaId
            )
        );

      /*
       * Institución
       */
      const institucionId =
        institucionIdUsuario.value;

      if (!institucionId) {
        throw new Error(
          "No fue posible identificar la institución."
        );
      }

      /*
       * Año académico.
       *
       * Primero intentamos obtenerlo desde la matrícula.
       * Si no existe, usamos el grupo seleccionado.
       */
      let anioAcademicoId =
        "";

      if (
        matricula?.anioAcademicoId
      ) {
        anioAcademicoId =
          typeof matricula.anioAcademicoId ===
          "string"
            ? matricula.anioAcademicoId
            : matricula.anioAcademicoId._id ||
              "";
      }

      if (
        !anioAcademicoId &&
        grupoObservadorObjeto.value
          ?.anioAcademicoId
      ) {
        anioAcademicoId =
          typeof grupoObservadorObjeto.value.anioAcademicoId ===
          "string"
            ? grupoObservadorObjeto.value.anioAcademicoId
            : grupoObservadorObjeto.value.anioAcademicoId._id ||
              "";
      }

      if (
        !anioAcademicoId
      ) {
        throw new Error(
          "No fue posible identificar el año académico."
        );
      }

      /*
       * Responsable:
       * como estamos trabajando desde el coordinador,
       * enviamos su ID como coordinadorId.
       */
      const cuerpo = {
        institucionId,

        anioAcademicoId,

        estudianteId:
          estudiante._id,

        tipo:
          formObservador.value.tipo,

        fecha:
          new Date().toISOString(),

        descripcion:
          formObservador.value.descripcion.trim(),

        compromiso:
          formObservador.value.compromiso.trim(),

        coordinadorId:
          usuario?._id,

        estado:
          formObservador.value.estado,

        categoria:
          formObservador.value.categoria,

        gravedad:
          formObservador.value.gravedad
      };

      const esEdicion =
        !!observacionEditando.value;

      const url =
        esEdicion
          ? urlApi(`/observador/${observacionEditando.value._id}`)
          : urlApi("/observador");

      const metodo =
        esEdicion
          ? "PUT"
          : "POST";

      const respuesta =
        await fetch(
          url,
          {
            method:
              metodo,

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`
            },

            body:
              JSON.stringify(
                cuerpo
              )
          }
        );

      const datos =
        await respuesta
          .json()
          .catch(
            () => ({})
          );

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje ||
          datos.message ||
          "No fue posible guardar la observación."
        );
      }

      /*
       * Recargamos el historial.
       */
      await cargarObservador();

      /*
       * Cerramos formulario.
       */
      mostrarFormularioObservador.value =
        false;

      observacionEditando.value =
        null;

      errorFormularioObservador.value =
        "";

    } catch (error: any) {
      console.error(
        error
      );

      errorFormularioObservador.value =
        error.message ||
        "No fue posible guardar la observación.";
    } finally {
      guardandoObservacion.value =
        false;
    }
  };

/* =========================================================
   ELIMINAR OBSERVACIÓN
========================================================= */

const eliminarObservacion =
  async (
    observacionId: string
  ) => {
    const confirmar =
      window.confirm(
        "¿Deseas eliminar esta observación?"
      );

    if (!confirmar) {
      return;
    }

    const token =
      localStorage.getItem(
        "token"
      );

    if (!token) {
      router.push(
        "/login"
      );

      return;
    }

    errorObservador.value =
      "";

    try {
      const respuesta =
        await fetch(
          urlApi(`/observador/${observacionId}`),
          {
            method:
              "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      const datos =
        await respuesta
          .json()
          .catch(
            () => ({})
          );

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje ||
          datos.message ||
          "No fue posible eliminar la observación."
        );
      }

      await cargarObservador();

    } catch (error: any) {
      console.error(
        error
      );

      errorObservador.value =
        error.message ||
        "No fue posible eliminar la observación.";
    }
  };

/* =========================================================
   NOMBRES OBSERVADOR
========================================================= */

const nombreTipoObservacion =
  (
    tipo: string
  ) => {
    const nombres:
      Record<string, string> =
      {
        academico:
          "Académico",

        disciplinario:
          "Disciplinario",

        convivencia:
          "Convivencia"
      };

    return (
      nombres[tipo] ||
      tipo
    );
  };

const nombreCategoriaObservacion =
  (
    categoria: string
  ) => {
    const nombres:
      Record<string, string> =
      {
        positiva:
          "Positiva",

        negativa:
          "Negativa",

        neutra:
          "Neutra"
      };

    return (
      nombres[categoria] ||
      categoria
    );
  };

const nombreGravedadObservacion =
  (
    gravedad: string
  ) => {
    const nombres:
      Record<string, string> =
      {
        baja:
          "Baja",

        media:
          "Media",

        alta:
          "Alta"
      };

    return (
      nombres[gravedad] ||
      gravedad
    );
  };

const nombreEstadoObservacion =
  (
    estado: string
  ) => {
    const nombres:
      Record<string, string> =
      {
        abierto:
          "Abierto",

        seguimiento:
          "En seguimiento",

        cerrado:
          "Cerrado"
      };

    return (
      nombres[estado] ||
      estado
    );
  };

/* =========================================================
   FECHA OBSERVADOR
========================================================= */

const formatearFechaObservacion =
  (
    fecha: string
  ) => {
    if (!fecha) {
      return "Sin fecha";
    }

    const fechaObj =
      new Date(
        fecha
      );

    if (
      Number.isNaN(
        fechaObj.getTime()
      )
    ) {
      return "Sin fecha";
    }

    return fechaObj.toLocaleDateString(
      "es-CO",
      {
        day:
          "2-digit",

        month:
          "2-digit",

        year:
          "numeric"
      }
    );
  };

/* =========================================================
   RESPONSABLE OBSERVACIÓN
========================================================= */

const nombreResponsableObservacion =
  (
    observacion: any
  ) => {
    const responsable =
      observacion.coordinadorId ||
      observacion.docenteId;

    if (!responsable) {
      return "Sin responsable";
    }

    if (
      typeof responsable ===
      "string"
    ) {
      return "Responsable registrado";
    }

    const nombre =
      `${responsable.nombres || ""} ${responsable.apellidos || ""}`
        .trim();

    return (
      nombre ||
      responsable.email ||
      "Responsable registrado"
    );
  };

/* =========================================================
   UTILIDADES
========================================================= */

const formatNota = (
  nota: number | null
) => {
  if (
    nota === null
  ) {
    return "—";
  }

  return Number(
    nota
  ).toFixed(1);
};

const claseNota = (
  nota: number | null
) => {
  if (
    nota === null
  ) {
    return "nota-vacia";
  }

  if (
    nota < 3
  ) {
    return "nota-baja";
  }

  return "nota-ok";
};

const iniciales = (
  nombre: string
) => {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (
        palabra
      ) =>
        palabra.charAt(0)
          .toUpperCase()
    )
    .join("");
};

/* =========================================================
   CATEGORÍA DE SECCIÓN
========================================================= */

const categoriaSeccion =
  (
    seccion: string
  ) => {
    if (
      [
        "seguimiento",
        "informes-periodicos"
      ].includes(
        seccion
      )
    ) {
      return "Seguimiento Académico";
    }

    if (
      seccion ===
      "observador"
    ) {
      return "Observador";
    }

    if (
      seccion ===
      "estadisticas"
    ) {
      return "Estadísticas";
    }

    if (
      [
        "excusas-docentes",
        "certificados",
        "constancias"
      ].includes(
        seccion
      )
    ) {
      return "Gestión";
    }

    if (
      [
        "candidatos",
        "eventos-electorales",
        "permisos",
        "resultados"
      ].includes(
        seccion
      )
    ) {
      return "Elecciones";
    }

    if (
      [
        "boletin-estudiante",
        "listados",
        "informe-excusas"
      ].includes(
        seccion
      )
    ) {
      return "Informes";
    }

    return "Administración";
  };

/* =========================================================
   CERRAR SESIÓN
========================================================= */

const cerrarSesion = () => {
  // Limpia la sesión en el store (y localStorage) para que el guard del router no rebote al portal.
  authStore.cerrarSesion();
  router.push("/login");
};

/* =========================================================
   MONTAR
========================================================= */

onMounted(() => {
  if (
    !localStorage.getItem(
      "token"
    )
  ) {
    router.push(
      "/login"
    );

    return;
  }
});
</script>

<style>
/* Global, solo con el portal coordinador montado */
body.portal-coordinador {
  background: #f5f7fb;
  overflow-x: hidden;
}
</style>

<style scoped>

/* =========================================================
   BASE
========================================================= */

.coordinador-page {
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  display: flex;
  overflow: hidden;
  background: #f5f7fb;
  color: #172033;
}

/* =========================================================
   SIDEBAR
========================================================= */

.sidebar {
  width: 270px;
  height: 100vh;
  flex-shrink: 0;
  background: #173f9f;
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease;
  overflow: hidden;
  z-index: 10;
}

.sidebar.collapsed {
  width: 78px;
}

.sidebar-header {
  height: 78px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.sidebar.collapsed .sidebar-header {
  justify-content: center;
  padding: 0;
}

.logo-box {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: white;
  color: #173f9f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  flex-shrink: 0;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-text strong {
  font-size: 17px;
}

.logo-text small {
  margin-top: 2px;
  opacity: 0.7;
  font-size: 11px;
}

.menu {
  flex: 1;
  overflow-y: auto;
  padding: 15px 10px;
}

.menu::-webkit-scrollbar {
  width: 4px;
}

.menu::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

.menu-section {
  margin-bottom: 12px;
}

.menu-section-title {
  padding: 8px 12px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  opacity: 0.55;
  font-weight: 700;
}

.menu-item {
  width: 100%;
  min-height: 44px;
  border: none;
  background: transparent;
  color: white;
  border-radius: 9px;
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 0 12px;
  margin-bottom: 3px;
  cursor: pointer;
  text-align: left;
  transition: 0.2s;
  font-size: 13px;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.menu-item.active {
  background: white;
  color: #173f9f;
  font-weight: 700;
}

.sidebar.collapsed .menu-item {
  justify-content: center;
  padding: 0;
}

.sidebar-footer {
  padding: 12px 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.logout-item {
  color: white;
}

/* =========================================================
   MAIN
========================================================= */

.main-content {
  flex: 1;
  min-width: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* =========================================================
   TOPBAR
========================================================= */

.topbar {
  height: 78px;
  flex-shrink: 0;
  background: white;
  border-bottom: 1px solid #e8ebf2;
  display: flex;
  align-items: center;
  padding: 0 25px;
  gap: 18px;
}

.icon-button {
  width: 40px;
  height: 40px;
  border: none;
  background: #f4f6fa;
  color: #26324a;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.icon-button:hover {
  background: #e9edf5;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #8992a4;
  font-size: 13px;
}

.breadcrumb strong {
  color: #1c2538;
}

.topbar-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 14px;
}

.user-mini {
  display: flex;
  align-items: center;
  gap: 9px;
}

.avatar,
.student-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #e6edff;
  color: #315bc4;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 12px;
}

.user-mini-info {
  display: flex;
  flex-direction: column;
}

.user-mini-info strong {
  font-size: 12px;
  color: #20293b;
}

.user-mini-info small {
  font-size: 11px;
  color: #8992a4;
  margin-top: 2px;
}

/* =========================================================
   CONTENT
========================================================= */

.page-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 30px;
}

.page-section {
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
}

.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 25px;
}

.eyebrow {
  display: block;
  color: #3861d0;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 6px;
}

.page-heading h1 {
  margin: 0;
  font-size: 28px;
  color: #141d2f;
}

.page-heading p {
  margin: 8px 0 0;
  color: #788398;
  font-size: 14px;
}

/* =========================================================
   BUTTONS
========================================================= */

.primary-button {
  height: 42px;
  padding: 0 16px;
  border: none;
  border-radius: 9px;
  background: #3861d0;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  transition: 0.2s;
}

.primary-button:hover {
  background: #2f55bd;
  transform: translateY(-1px);
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.report-button {
  height: 36px;
  padding: 0 12px;
  border: none;
  border-radius: 8px;
  background: #eaf0ff;
  color: #315bc4;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.report-button:hover {
  background: #dce6ff;
}

.report-button:disabled {
  opacity: 0.6;
  cursor: wait;
}

/* =========================================================
   WELCOME
========================================================= */

.welcome-card {
  background: white;
  border-radius: 15px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 18px;
  border: 1px solid #e8ebf2;
  margin-bottom: 22px;
}

.welcome-icon {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  background: #e8efff;
  color: #3861d0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.welcome-card h2 {
  margin: 0;
  font-size: 18px;
}

.welcome-card p {
  margin: 6px 0 0;
  color: #7d8799;
  font-size: 13px;
  line-height: 1.6;
}

.dashboard-grid,
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.dashboard-card,
.stat-card {
  background: white;
  border: 1px solid #e8ebf2;
  border-radius: 13px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.dashboard-card span,
.stat-card span {
  display: block;
  color: #8791a4;
  font-size: 12px;
  margin-bottom: 5px;
}

.dashboard-card strong,
.stat-card strong {
  font-size: 22px;
  color: #1a2437;
}

.dashboard-card-icon,
.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.blue {
  background: #e8efff;
  color: #3861d0;
}

.green {
  background: #e5f8ee;
  color: #21955c;
}

.purple {
  background: #f0eaff;
  color: #7653c9;
}

.orange {
  background: #fff1df;
  color: #c98126;
}

.red {
  background: #ffe9e9;
  color: #d64b4b;
}

/* =========================================================
   FILTERS
========================================================= */

.filters-card {
  background: white;
  border: 1px solid #e8ebf2;
  border-radius: 13px;
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr 1.5fr;
  gap: 16px;
  margin-bottom: 18px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.filter-group label {
  font-size: 12px;
  font-weight: 700;
  color: #465166;
}

.filter-group select,
.search-box input {
  height: 42px;
  border: 1px solid #dfe4ed;
  border-radius: 8px;
  background: white;
  color: #202a3c;
  outline: none;
  font-size: 13px;
}

.filter-group select {
  padding: 0 12px;
}

.filter-group select:focus,
.search-box:focus-within {
  border-color: #3861d0;
}

.search-box {
  height: 42px;
  border: 1px solid #dfe4ed;
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 8px;
  color: #9aa3b2;
  transition: 0.2s;
}

.search-box input {
  flex: 1;
  border: none;
  height: 100%;
  padding: 0;
}

.search-box input:focus {
  outline: none;
}

/* =========================================================
   ALERT
========================================================= */

.alert {
  border-radius: 10px;
  padding: 13px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  font-size: 13px;
}

.alert.error {
  background: #fff0f0;
  color: #c33e3e;
  border: 1px solid #ffd4d4;
}

/* =========================================================
   LOADING
========================================================= */

.loading-card {
  min-height: 220px;
  background: white;
  border: 1px solid #e8ebf2;
  border-radius: 13px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 13px;
  color: #7e899b;
  font-size: 13px;
}

.loader {
  width: 30px;
  height: 30px;
  border: 3px solid #e1e6ef;
  border-top-color: #3861d0;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinning {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* =========================================================
   SELECTED GROUP
========================================================= */

.selected-group-card {
  background: #3861d0;
  color: white;
  border-radius: 13px;
  padding: 19px 22px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 18px;
}

.selected-group-card span {
  display: block;
  opacity: 0.72;
  font-size: 11px;
  margin-bottom: 4px;
}

.selected-group-card strong {
  font-size: 17px;
}

/* =========================================================
   STATS
========================================================= */

.stats-grid {
  margin-bottom: 18px;
}

/* =========================================================
   TABLE
========================================================= */

.table-card {
  background: white;
  border: 1px solid #e8ebf2;
  border-radius: 13px;
  overflow: hidden;
}

.table-header {
  padding: 20px;
  border-bottom: 1px solid #edf0f5;
}

.table-header h2 {
  margin: 0;
  font-size: 16px;
}

.table-header p {
  margin: 5px 0 0;
  color: #8993a5;
  font-size: 12px;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 750px;
}

th {
  background: #f8f9fc;
  color: #6d778b;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-weight: 700;
  text-align: left;
  padding: 13px 15px;
  white-space: nowrap;
}

td {
  padding: 13px 15px;
  border-top: 1px solid #eef1f5;
  color: #4c566a;
  font-size: 13px;
}

tbody tr:hover {
  background: #fafbfe;
}

.student-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 190px;
}

.student-cell strong {
  color: #273146;
  font-size: 13px;
}

.student-avatar {
  width: 34px;
  height: 34px;
  font-size: 10px;
}

.grade-badge {
  min-width: 42px;
  height: 28px;
  padding: 0 8px;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 12px;
}

.nota-ok {
  background: #e4f7ed;
  color: #208552;
}

.nota-baja {
  background: #ffe8e8;
  color: #cc4141;
}

.nota-vacia {
  background: #f0f2f5;
  color: #8992a2;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 9px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
}

.status-badge.success {
  background: #e4f7ed;
  color: #208552;
}

.status-badge.danger {
  background: #ffe8e8;
  color: #cc4141;
}

.status-badge.neutral {
  background: #f0f2f5;
  color: #7d8798;
}

/* =========================================================
   EMPTY
========================================================= */

.empty-state {
  min-height: 240px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #a0a9b8;
}

.empty-state.large {
  background: white;
  border: 1px solid #e8ebf2;
  border-radius: 13px;
  min-height: 330px;
}

.empty-state h3 {
  margin: 14px 0 5px;
  color: #394459;
  font-size: 16px;
}

.empty-state p {
  margin: 0;
  color: #8a94a5;
  font-size: 13px;
}

/* =========================================================
   ESTADÍSTICAS ACADÉMICAS
========================================================= */

.estadisticas-section {
  width: 100%;
}

.estadisticas-heading {
  align-items: center;
}

.estadisticas-filtros {
  background: white;
  border: 1px solid #e8ebf2;
  border-radius: 15px;
  padding: 18px;
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(220px, 1fr);
  gap: 16px;
  margin-bottom: 18px;
}

.filtro-estadistica {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.filtro-estadistica label {
  font-size: 12px;
  font-weight: 700;
  color: #596579;
}

.filtro-estadistica select {
  width: 100%;
  height: 42px;
  border: 1px solid #dfe4ec;
  border-radius: 10px;
  padding: 0 12px;
  background: #fff;
  color: #26344a;
  outline: none;
  font-size: 13px;
}

.filtro-estadistica select:focus {
  border-color: #3861d0;
  box-shadow: 0 0 0 3px rgba(56, 97, 208, 0.08);
}

.estadisticas-resumen {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 18px;
}

.estadistica-card {
  background: white;
  border: 1px solid #e8ebf2;
  border-radius: 15px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 13px;
  min-width: 0;
}

.estadistica-card > div:last-child {
  min-width: 0;
}

.estadistica-card span {
  display: block;
  color: #7d8798;
  font-size: 12px;
  margin-bottom: 4px;
}

.estadistica-card strong {
  display: block;
  color: #18263b;
  font-size: 22px;
  line-height: 1.1;
}

.estadistica-icon {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.estadistica-icon.blue {
  background: #eaf0ff;
  color: #3861d0;
}

.estadistica-icon.green {
  background: #e9f8f0;
  color: #2f9b68;
}

.estadistica-icon.purple {
  background: #f0ebff;
  color: #7455c9;
}

.estadistica-icon.red {
  background: #ffeded;
  color: #d84c4c;
}

.estadisticas-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.65fr);
  gap: 18px;
  margin-bottom: 18px;
}

.estadisticas-card {
  background: white;
  border: 1px solid #e8ebf2;
  border-radius: 15px;
  overflow: hidden;
}

.estadisticas-card-header {
  padding: 20px 20px 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.estadisticas-card-header h2 {
  margin: 0 0 5px;
  color: #1c2b40;
  font-size: 17px;
}

.estadisticas-card-header p {
  margin: 0;
  color: #8791a3;
  font-size: 12px;
  line-height: 1.5;
}

.tabla-estadisticas-wrapper {
  overflow-x: auto;
}

.tabla-estadisticas {
  width: 100%;
  border-collapse: collapse;
}

.tabla-estadisticas th,
.tabla-estadisticas td {
  padding: 13px 20px;
  text-align: left;
  border-top: 1px solid #edf0f4;
  white-space: nowrap;
}

.tabla-estadisticas th {
  background: #fafbfc;
  color: #7b8596;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.tabla-estadisticas td {
  color: #344257;
  font-size: 13px;
}

.estadistica-estudiante {
  display: flex;
  align-items: center;
  gap: 10px;
}

.estadistica-estudiante strong {
  display: block;
  color: #26344a;
  font-size: 13px;
}

.estadistica-estudiante small {
  display: block;
  margin-top: 3px;
  color: #9099a8;
  font-size: 11px;
}

.estado-rendimiento {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 5px 9px;
  font-size: 11px;
  font-weight: 700;
}

.estado-rendimiento.aprobado {
  background: #e8f7ef;
  color: #258456;
}

.estado-rendimiento.riesgo {
  background: #ffeded;
  color: #c83e3e;
}

.estado-rendimiento.sin-datos {
  background: #f0f2f5;
  color: #778193;
}

.asignaturas-estadisticas {
  padding: 0 20px 18px;
}

.asignatura-estadistica {
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border-top: 1px solid #edf0f4;
}

.asignatura-info {
  min-width: 0;
}

.asignatura-info strong {
  display: block;
  color: #2c3950;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.asignatura-info span {
  display: block;
  margin-top: 4px;
  color: #929aaa;
  font-size: 11px;
}

.atencion-card {
  margin-bottom: 18px;
}

.atencion-count {
  min-width: 32px;
  height: 32px;
  padding: 0 9px;
  border-radius: 10px;
  background: #ffeded;
  color: #c83e3e;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
}

.riesgo-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  padding: 0 20px 20px;
}

.riesgo-item {
  min-width: 0;
  border: 1px solid #f0dfe1;
  background: #fffafb;
  border-radius: 12px;
  padding: 13px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.riesgo-avatar {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  border-radius: 10px;
  background: #ffe8e8;
  color: #c83e3e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
}

.riesgo-info {
  min-width: 0;
  flex: 1;
}

.riesgo-info strong {
  display: block;
  color: #2d394d;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.riesgo-info span {
  display: block;
  margin-top: 3px;
  color: #929aaa;
  font-size: 11px;
}

.riesgo-icon {
  color: #d64a4a;
  flex: 0 0 auto;
}

.sin-riesgo {
  margin: 0 20px 20px;
  padding: 14px 16px;
  border-radius: 11px;
  background: #eef9f3;
  color: #287c55;
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 12px;
  font-weight: 600;
}

.estadisticas-empty {
  min-height: 220px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #8993a4;
}

.estadisticas-empty svg {
  color: #9aa5b6;
  margin-bottom: 10px;
}

.estadisticas-empty h3 {
  margin: 0 0 6px;
  color: #39475c;
  font-size: 15px;
}

.estadisticas-empty p {
  max-width: 390px;
  margin: 0;
  color: #929baa;
  font-size: 12px;
  line-height: 1.5;
}

@media (max-width: 1100px) {
  .estadisticas-resumen {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .estadisticas-grid {
    grid-template-columns: 1fr;
  }

  .riesgo-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 800px) {
  .estadisticas-filtros {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 550px) {
  .estadisticas-heading {
    align-items: stretch;
  }

  .estadisticas-heading .primary-button {
    width: 100%;
    justify-content: center;
  }

  .estadisticas-resumen {
    grid-template-columns: 1fr;
  }

  .riesgo-grid {
    grid-template-columns: 1fr;
  }

  .estadisticas-card-header {
    align-items: flex-start;
  }
}

/* =========================================================
   PLACEHOLDER
========================================================= */

.module-placeholder {
  background: white;
  border: 1px solid #e8ebf2;
  border-radius: 15px;
  min-height: 380px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 30px;
}

.placeholder-icon {
  width: 75px;
  height: 75px;
  border-radius: 18px;
  background: #e8efff;
  color: #3861d0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.module-placeholder h2 {
  margin: 18px 0 7px;
  font-size: 19px;
}

.module-placeholder p {
  max-width: 480px;
  margin: 0;
  color: #8791a3;
  font-size: 13px;
  line-height: 1.6;
}

/* =========================================================
   OBSERVADOR DEL ESTUDIANTE
========================================================= */

.observador-section {
  width: 100%;
}

/* Encabezado */

.observador-heading {
  align-items: center;
}

.observador-heading .primary-button {
  flex-shrink: 0;
}

/* Filtros */

.observador-filters {
  grid-template-columns: 1fr 1.5fr auto;
  align-items: end;
}

.observador-refresh {
  height: 42px;
  width: 42px;
  border: 1px solid #dfe4ed;
  background: white;
  color: #3861d0;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
}

.observador-refresh:hover {
  background: #f0f4ff;
  border-color: #cbd7f5;
}

.observador-refresh:disabled {
  opacity: 0.6;
  cursor: wait;
}

/* Layout principal */

.observador-layout {
  display: grid;
  grid-template-columns: 330px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}

/* Lista de estudiantes */

.observador-students-card {
  background: white;
  border: 1px solid #e8ebf2;
  border-radius: 15px;
  overflow: hidden;
  position: sticky;
  top: 0;
}

.observador-card-header {
  padding: 18px 20px;
  border-bottom: 1px solid #edf0f5;
}

.observador-card-header h2 {
  margin: 0;
  font-size: 15px;
  color: #1e293b;
}

.observador-card-header p {
  margin: 5px 0 0;
  font-size: 12px;
  color: #8993a5;
}

.observador-student-list {
  max-height: 610px;
  overflow-y: auto;
}

.observador-student-list::-webkit-scrollbar {
  width: 5px;
}

.observador-student-list::-webkit-scrollbar-thumb {
  background: #d8deea;
  border-radius: 10px;
}

.observador-student-item {
  width: 100%;
  border: none;
  border-bottom: 1px solid #f0f2f6;
  background: white;
  padding: 13px 16px;
  display: flex;
  align-items: center;
  gap: 11px;
  text-align: left;
  cursor: pointer;
  transition: 0.18s;
}

.observador-student-item:hover {
  background: #f8faff;
}

.observador-student-item.active {
  background: #eef3ff;
  box-shadow: inset 3px 0 0 #3861d0;
}

.observador-student-item .student-avatar {
  flex-shrink: 0;
}

.observador-student-info {
  min-width: 0;
  flex: 1;
}

.observador-student-info strong {
  display: block;
  color: #253047;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.observador-student-info span {
  display: block;
  margin-top: 3px;
  color: #8a94a6;
  font-size: 11px;
}

.observador-student-arrow {
  color: #b0b8c7;
  flex-shrink: 0;
}

.observador-student-item.active .observador-student-arrow {
  color: #3861d0;
}

/* Detalle */

.observador-detail {
  min-width: 0;
}

.observador-detail-card {
  background: white;
  border: 1px solid #e8ebf2;
  border-radius: 15px;
  overflow: hidden;
}

/* Cabecera del estudiante */

.observador-profile {
  padding: 22px;
  display: flex;
  align-items: center;
  gap: 15px;
  border-bottom: 1px solid #edf0f5;
}

.observador-profile-avatar {
  width: 56px;
  height: 56px;
  border-radius: 15px;
  background: #e8efff;
  color: #3861d0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 16px;
  flex-shrink: 0;
}

.observador-profile-info {
  min-width: 0;
  flex: 1;
}

.observador-profile-info h2 {
  margin: 0;
  color: #182235;
  font-size: 19px;
}

.observador-profile-info p {
  margin: 5px 0 0;
  color: #8791a4;
  font-size: 12px;
}

.observador-profile-action {
  flex-shrink: 0;
}

/* Resumen */

.observador-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-bottom: 1px solid #edf0f5;
}

.observador-summary-item {
  padding: 17px 20px;
  display: flex;
  align-items: center;
  gap: 11px;
  border-right: 1px solid #edf0f5;
}

.observador-summary-item:last-child {
  border-right: none;
}

.observador-summary-icon {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.observador-summary-icon.blue {
  background: #e8efff;
  color: #3861d0;
}

.observador-summary-icon.orange {
  background: #fff1df;
  color: #c98126;
}

.observador-summary-icon.green {
  background: #e5f8ee;
  color: #21955c;
}

.observador-summary-text span {
  display: block;
  color: #8b95a7;
  font-size: 11px;
}

.observador-summary-text strong {
  display: block;
  margin-top: 2px;
  color: #202a3c;
  font-size: 18px;
}

/* Historial */

.observador-history {
  padding: 20px;
}

.observador-history-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 15px;
}

.observador-history-title h3 {
  margin: 0;
  color: #263146;
  font-size: 14px;
}

.observador-history-title span {
  color: #8993a5;
  font-size: 11px;
}

/* Tarjeta de observación */

.observacion-card {
  position: relative;
  background: #fbfcfe;
  border: 1px solid #e6eaf1;
  border-radius: 13px;
  padding: 18px;
  margin-bottom: 13px;
  transition: 0.2s;
}

.observacion-card:last-child {
  margin-bottom: 0;
}

.observacion-card:hover {
  border-color: #d8e0ef;
  box-shadow: 0 4px 14px rgba(28, 47, 85, 0.05);
}

.observacion-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.observacion-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.observacion-tag {
  display: inline-flex;
  align-items: center;
  height: 25px;
  padding: 0 9px;
  border-radius: 7px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.25px;
}

.observacion-tag.tipo {
  background: #e8efff;
  color: #3861d0;
}

.observacion-tag.positiva {
  background: #e5f8ee;
  color: #208552;
}

.observacion-tag.negativa {
  background: #ffe8e8;
  color: #cc4141;
}

.observacion-tag.neutra {
  background: #f0f2f5;
  color: #747e91;
}

.observacion-tag.baja {
  background: #eef7ff;
  color: #3976a9;
}

.observacion-tag.media {
  background: #fff1df;
  color: #bd7620;
}

.observacion-tag.alta {
  background: #ffe7e7;
  color: #c53e3e;
}

.observacion-date {
  color: #929bac;
  font-size: 11px;
  white-space: nowrap;
}

.observacion-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 9px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
}

.observacion-status.abierto {
  background: #fff1df;
  color: #bd7620;
}

.observacion-status.seguimiento {
  background: #e8efff;
  color: #3861d0;
}

.observacion-status.cerrado {
  background: #e5f8ee;
  color: #208552;
}

/* Texto */

.observacion-card h4 {
  margin: 0 0 7px;
  color: #263146;
  font-size: 13px;
}

.observacion-description {
  margin: 0;
  color: #59657a;
  font-size: 13px;
  line-height: 1.65;
  white-space: pre-line;
}

/* Compromiso */

.observacion-commitment {
  margin-top: 14px;
  padding: 12px 13px;
  background: #f4f6fa;
  border-radius: 9px;
  border-left: 3px solid #3861d0;
}

.observacion-commitment strong {
  display: block;
  margin-bottom: 4px;
  color: #465166;
  font-size: 11px;
}

.observacion-commitment p {
  margin: 0;
  color: #657084;
  font-size: 12px;
  line-height: 1.5;
}

/* Responsable */

.observacion-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-top: 15px;
  padding-top: 12px;
  border-top: 1px solid #e9edf3;
}

.observacion-responsable {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #8993a5;
  font-size: 11px;
}

.observacion-responsable strong {
  color: #59657a;
  font-weight: 700;
}

.observacion-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.observacion-action {
  width: 31px;
  height: 31px;
  border: 1px solid #e1e5ed;
  background: white;
  color: #69758a;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.18s;
}

.observacion-action:hover {
  background: #f1f4fa;
  color: #3861d0;
  border-color: #cfd8ec;
}

.observacion-action.delete:hover {
  color: #cc4141;
  background: #fff2f2;
  border-color: #ffd4d4;
}

/* Seguimientos internos */

.observacion-followups {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px dashed #dfe4ed;
}

.observacion-followups-title {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 10px;
  color: #59657a;
  font-size: 11px;
  font-weight: 800;
}

.observacion-followup {
  position: relative;
  padding: 9px 0 9px 18px;
  border-left: 2px solid #dce4f7;
}

.observacion-followup::before {
  content: "";
  position: absolute;
  left: -5px;
  top: 13px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3861d0;
}

.observacion-followup-date {
  color: #9aa3b2;
  font-size: 10px;
}

.observacion-followup p {
  margin: 4px 0 0;
  color: #657084;
  font-size: 11px;
  line-height: 1.5;
}

/* Estado vacío */

.observador-empty-history {
  padding: 45px 20px;
  text-align: center;
  color: #9aa3b2;
}

.observador-empty-history-icon {
  width: 50px;
  height: 50px;
  margin: 0 auto 12px;
  border-radius: 13px;
  background: #f1f3f7;
  color: #9ba5b5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.observador-empty-history h3 {
  margin: 0 0 5px;
  color: #586378;
  font-size: 14px;
}

.observador-empty-history p {
  margin: 0;
  color: #949dac;
  font-size: 12px;
}

/* =========================================================
   MODAL OBSERVADOR
========================================================= */

.observador-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(17, 28, 50, 0.48);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 100;
}

.observador-modal {
  width: min(620px, 100%);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  background: white;
  border-radius: 17px;
  box-shadow: 0 20px 60px rgba(17, 28, 50, 0.22);
  animation: modalIn 0.2s ease;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.observador-modal::-webkit-scrollbar {
  width: 5px;
}

.observador-modal::-webkit-scrollbar-thumb {
  background: #d8deea;
  border-radius: 10px;
}

.observador-modal-header {
  padding: 20px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  border-bottom: 1px solid #edf0f5;
}

.observador-modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.observador-modal-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #e8efff;
  color: #3861d0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.observador-modal-header h2 {
  margin: 0;
  color: #202a3c;
  font-size: 17px;
}

.observador-modal-header p {
  margin: 3px 0 0;
  color: #8993a5;
  font-size: 11px;
}

.observador-modal-close {
  width: 34px;
  height: 34px;
  border: none;
  background: #f4f6fa;
  color: #69758a;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.observador-modal-close:hover {
  background: #e9edf4;
  color: #28344a;
}

.observador-modal-body {
  padding: 22px;
}

.observador-form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 17px;
}

.observador-form-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.observador-form-group.full {
  grid-column: 1 / -1;
}

.observador-form-group label {
  color: #465166;
  font-size: 12px;
  font-weight: 700;
}

.observador-form-group select,
.observador-form-group input,
.observador-form-group textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #dfe4ed;
  border-radius: 9px;
  background: white;
  color: #202a3c;
  font-family: inherit;
  font-size: 13px;
  outline: none;
  transition: 0.2s;
}

.observador-form-group select,
.observador-form-group input {
  height: 42px;
  padding: 0 12px;
}

.observador-form-group textarea {
  min-height: 115px;
  resize: vertical;
  padding: 12px;
  line-height: 1.55;
}

.observador-form-group select:focus,
.observador-form-group input:focus,
.observador-form-group textarea:focus {
  border-color: #3861d0;
  box-shadow: 0 0 0 3px rgba(56, 97, 208, 0.08);
}

.observador-form-hint {
  color: #98a1b0;
  font-size: 10px;
}

.observador-form-error {
  margin-top: 16px;
  padding: 11px 13px;
  border-radius: 9px;
  background: #fff0f0;
  color: #c33e3e;
  border: 1px solid #ffd4d4;
  font-size: 12px;
}

.observador-modal-footer {
  padding: 16px 22px;
  border-top: 1px solid #edf0f5;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 9px;
}

.observador-cancel-button {
  height: 40px;
  padding: 0 15px;
  border: 1px solid #dfe4ed;
  border-radius: 9px;
  background: white;
  color: #59657a;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.observador-cancel-button:hover {
  background: #f5f7fa;
}

.observador-save-button {
  height: 40px;
  padding: 0 17px;
  border: none;
  border-radius: 9px;
  background: #3861d0;
  color: white;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.observador-save-button:hover {
  background: #2f55bd;
}

.observador-save-button:disabled {
  opacity: 0.6;
  cursor: wait;
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 1100px) {
  .dashboard-grid,
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .filters-card {
    grid-template-columns: 1fr 1fr;
  }

  .search-filter {
    grid-column: 1 / -1;
  }

  .observador-layout {
    grid-template-columns: 280px minmax(0, 1fr);
  }

  .observador-filters {
    grid-template-columns: 1fr 1.5fr auto;
  }
}

@media (max-width: 900px) {
  .observador-layout {
    grid-template-columns: 1fr;
  }

  .observador-students-card {
    position: static;
  }

  .observador-student-list {
    max-height: 300px;
  }

  .observador-profile {
    flex-wrap: wrap;
  }
}

@media (max-width: 800px) {
  .sidebar {
    width: 78px;
  }

  .sidebar:not(.collapsed) {
    width: 250px;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
  }

  .sidebar.collapsed .sidebar-header {
    justify-content: center;
  }

  .sidebar.collapsed .menu-item {
    justify-content: center;
  }

  .topbar {
    padding: 0 15px;
  }

  .user-mini-info {
    display: none;
  }

  .page-content {
    padding: 20px 15px;
  }

  .page-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .dashboard-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filters-card {
    grid-template-columns: 1fr;
  }

  .search-filter {
    grid-column: auto;
  }

  .selected-group-card {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .observador-filters {
    grid-template-columns: 1fr;
  }

  .observador-refresh {
    width: 100%;
  }

  .observador-summary {
    grid-template-columns: 1fr;
  }

  .observador-summary-item {
    border-right: none;
    border-bottom: 1px solid #edf0f5;
  }

  .observador-summary-item:last-child {
    border-bottom: none;
  }

  .observador-form-grid {
    grid-template-columns: 1fr;
  }

  .observador-form-group.full {
    grid-column: auto;
  }
}

@media (max-width: 500px) {
  .breadcrumb span,
  .breadcrumb svg {
    display: none;
  }

  .page-heading h1 {
    font-size: 23px;
  }

  .welcome-card {
    align-items: flex-start;
    flex-direction: column;
  }

  

  /* =========================================================
   OBSERVADOR DEL ESTUDIANTE
   DISEÑO PRINCIPAL
========================================================= */

.observador-section {
  width: 100%;
}

/* =========================================================
   ENCABEZADO
========================================================= */

.observador-heading {
  align-items: center;
}

.observador-heading .primary-button {
  flex-shrink: 0;
  box-shadow: 0 5px 14px rgba(56, 97, 208, 0.18);
}

.observador-heading .primary-button:hover {
  transform: translateY(-1px);
}

/* =========================================================
   FILTROS
========================================================= */

.observador-filtros {
  width: 100%;
  background: white;
  border: 1px solid #e8ebf2;
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 18px;

  display: grid;
  grid-template-columns: 220px minmax(250px, 1fr) auto;
  align-items: end;
  gap: 15px;

  box-sizing: border-box;
}

.filtro-observador {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.filtro-observador label {
  color: #465166;
  font-size: 12px;
  font-weight: 700;
}

.filtro-observador select {
  width: 100%;
  height: 42px;
  padding: 0 12px;

  border: 1px solid #dfe4ed;
  border-radius: 9px;

  background: #fff;
  color: #202a3c;

  font-family: inherit;
  font-size: 13px;
  outline: none;

  cursor: pointer;
  transition: 0.2s;
}

.filtro-observador select:hover {
  border-color: #cbd3e2;
}

.filtro-observador select:focus {
  border-color: #3861d0;
  box-shadow: 0 0 0 3px rgba(56, 97, 208, 0.08);
}

.input-icon-wrapper {
  height: 42px;
  width: 100%;
  box-sizing: border-box;

  display: flex;
  align-items: center;
  gap: 9px;

  padding: 0 12px;

  background: white;
  border: 1px solid #dfe4ed;
  border-radius: 9px;

  color: #9aa3b2;

  transition: 0.2s;
}

.input-icon-wrapper:focus-within {
  border-color: #3861d0;
  box-shadow: 0 0 0 3px rgba(56, 97, 208, 0.08);
}

.input-icon-wrapper input {
  flex: 1;
  min-width: 0;

  height: 100%;
  padding: 0;

  border: none;
  outline: none;

  background: transparent;
  color: #202a3c;

  font-family: inherit;
  font-size: 13px;
}

.input-icon-wrapper input::placeholder {
  color: #a1a9b7;
}

.secondary-button {
  height: 42px;
  padding: 0 15px;

  border: 1px solid #dbe2ef;
  border-radius: 9px;

  background: white;
  color: #3861d0;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;

  font-family: inherit;
  font-size: 12px;
  font-weight: 700;

  cursor: pointer;
  transition: 0.2s;
  white-space: nowrap;
}

.secondary-button:hover {
  background: #f2f5ff;
  border-color: #cbd7f1;
}

.secondary-button:active {
  transform: translateY(1px);
}

/* =========================================================
   ALERTA
========================================================= */

.observador-alert {
  width: 100%;
  box-sizing: border-box;

  display: flex;
  align-items: center;
  gap: 10px;

  padding: 13px 16px;
  margin-bottom: 18px;

  border-radius: 10px;

  font-size: 13px;
}

.observador-alert-error {
  background: #fff1f1;
  border: 1px solid #ffd5d5;
  color: #c43d3d;
}

/* =========================================================
   CONTENIDO PRINCIPAL
========================================================= */

.observador-layout {
  width: 100%;

  display: grid;
  grid-template-columns: 330px minmax(0, 1fr);
  gap: 18px;

  align-items: start;
}

/* =========================================================
   TARJETAS PRINCIPALES
========================================================= */

.observador-card {
  background: white;
  border: 1px solid #e8ebf2;
  border-radius: 15px;

  overflow: hidden;

  box-shadow: 0 2px 8px rgba(31, 47, 76, 0.025);
}

.estudiantes-card {
  min-width: 0;
}

.detalle-card {
  min-width: 0;
}

/* =========================================================
   HEADER DE TARJETA
========================================================= */

.observador-card-header {
  min-height: 76px;
  padding: 17px 18px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  border-bottom: 1px solid #edf0f5;
  box-sizing: border-box;
}

.observador-card-header h2 {
  margin: 0;

  color: #1c2639;
  font-size: 15px;
  font-weight: 800;
}

.observador-card-header p {
  margin: 5px 0 0;

  color: #8a94a6;
  font-size: 11px;
  line-height: 1.4;
}

.observador-count {
  min-width: 30px;
  height: 30px;

  padding: 0 8px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background: #e8efff;
  color: #3861d0;

  font-size: 12px;
  font-weight: 800;
}

/* =========================================================
   LOADING
========================================================= */

.observador-loading {
  min-height: 250px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;

  color: #8993a5;
  font-size: 12px;
}

.loading-spin {
  color: #3861d0;
  animation: spin 0.8s linear infinite;
}

/* =========================================================
   ESTADO VACÍO
========================================================= */

.observador-empty {
  min-height: 250px;

  padding: 30px 22px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  text-align: center;

  color: #a0a9b8;
  box-sizing: border-box;
}

.observador-empty svg {
  color: #aeb7c6;
}

.observador-empty h3 {
  margin: 13px 0 6px;

  color: #3d485c;
  font-size: 15px;
}

.observador-empty p {
  max-width: 310px;

  margin: 0;

  color: #8d97a7;
  font-size: 12px;
  line-height: 1.55;
}

/* =========================================================
   LISTA DE ESTUDIANTES
========================================================= */

.estudiantes-lista {
  max-height: 610px;
  overflow-y: auto;
}

.estudiantes-lista::-webkit-scrollbar {
  width: 5px;
}

.estudiantes-lista::-webkit-scrollbar-thumb {
  background: #d8deea;
  border-radius: 10px;
}

.estudiantes-lista::-webkit-scrollbar-track {
  background: transparent;
}

.estudiante-item {
  width: 100%;
  min-height: 67px;

  padding: 10px 14px;

  display: flex;
  align-items: center;
  gap: 11px;

  border: none;
  border-bottom: 1px solid #eef1f5;

  background: white;

  text-align: left;

  cursor: pointer;

  box-sizing: border-box;
  transition: 0.18s;
}

.estudiante-item:hover {
  background: #f8faff;
}

.estudiante-item.active {
  background: #eef3ff;

  box-shadow: inset 3px 0 0 #3861d0;
}

.estudiante-item > svg {
  flex-shrink: 0;
  color: #b1bac8;
}

.estudiante-item.active > svg {
  color: #3861d0;
}

/* Avatar */

.estudiante-avatar {
  width: 38px;
  height: 38px;

  flex-shrink: 0;

  border-radius: 11px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #e8efff;
  color: #3861d0;

  font-size: 11px;
  font-weight: 800;
}

/* Información */

.estudiante-info {
  min-width: 0;
  flex: 1;
}

.estudiante-info strong {
  display: block;

  color: #273146;
  font-size: 12px;
  font-weight: 800;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.estudiante-info span {
  display: block;

  margin-top: 3px;

  color: #929bac;
  font-size: 10px;
}

/* =========================================================
   DETALLE DEL ESTUDIANTE
========================================================= */

.detalle-estudiante-header {
  min-height: 100px;

  padding: 20px 22px;

  display: flex;
  align-items: center;
  gap: 14px;

  border-bottom: 1px solid #edf0f5;
}

.detalle-estudiante-avatar {
  width: 58px;
  height: 58px;

  flex-shrink: 0;

  border-radius: 15px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: linear-gradient(
    135deg,
    #e8efff,
    #dce7ff
  );

  color: #315bc4;

  font-size: 16px;
  font-weight: 800;
}

.detalle-estudiante-header > div:nth-child(2) {
  flex: 1;
  min-width: 0;
}

.detalle-estudiante-header .eyebrow {
  margin-bottom: 3px;
}

.detalle-estudiante-header h2 {
  margin: 0;

  color: #182235;
  font-size: 19px;
  font-weight: 800;
}

.detalle-estudiante-header p {
  margin: 5px 0 0;

  color: #8791a4;
  font-size: 11px;
}

.small-button {
  height: 38px;
  padding: 0 13px;

  font-size: 12px;

  white-space: nowrap;
}

/* =========================================================
   RESUMEN
========================================================= */

.observador-resumen {
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  border-bottom: 1px solid #edf0f5;
}

.resumen-observador-item {
  min-height: 75px;

  padding: 14px 18px;

  display: flex;
  align-items: center;
  gap: 11px;

  border-right: 1px solid #edf0f5;
  box-sizing: border-box;
}

.resumen-observador-item:last-child {
  border-right: none;
}

.resumen-icon {
  width: 37px;
  height: 37px;

  flex-shrink: 0;

  border-radius: 10px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #e8efff;
  color: #3861d0;
}

.resumen-observador-item:nth-child(2) .resumen-icon {
  background: #fff1df;
  color: #c98126;
}

.resumen-observador-item:nth-child(3) .resumen-icon {
  background: #e5f8ee;
  color: #21955c;
}

.resumen-observador-item span {
  display: block;

  color: #8993a5;
  font-size: 10px;
}

.resumen-observador-item strong {
  display: block;

  margin-top: 2px;

  color: #1d273a;
  font-size: 19px;
}

/* =========================================================
   HISTORIAL
========================================================= */

.historial-observador {
  padding: 20px 22px;
}

.historial-header {
  margin-bottom: 16px;
}

.historial-header h3 {
  margin: 0;

  color: #253047;
  font-size: 15px;
}

.historial-header p {
  margin: 5px 0 0;

  color: #8993a5;
  font-size: 11px;
}

/* =========================================================
   HISTORIAL VACÍO
========================================================= */

.historial-empty {
  min-height: 300px;
  padding: 35px 20px;
}

.historial-empty svg {
  color: #a8b1c0;
}

.historial-empty .primary-button {
  margin-top: 18px;
}

/* =========================================================
   OBSERVACIÓN
========================================================= */

.observaciones-lista {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.observacion-item {
  position: relative;

  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);

  gap: 13px;

  padding: 17px;

  background: #fbfcfe;

  border: 1px solid #e5e9f0;
  border-radius: 13px;

  box-sizing: border-box;

  transition: 0.2s;
}

.observacion-item:hover {
  border-color: #d7dfed;

  box-shadow:
    0 5px 16px rgba(33, 50, 84, 0.05);
}

/* Indicador */

.observacion-indicador {
  width: 42px;
  height: 42px;

  border-radius: 11px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #e8efff;
  color: #3861d0;
}

/* Contenido */

.observacion-contenido {
  min-width: 0;
}

.observacion-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  margin-bottom: 10px;
}

.observacion-etiquetas {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
}

.observacion-etiquetas span {
  display: inline-flex;
  align-items: center;

  min-height: 24px;

  padding: 0 8px;

  border-radius: 6px;

  font-size: 9px;
  font-weight: 800;

  text-transform: uppercase;
  letter-spacing: 0.2px;
}

/* Tipo */

.observacion-tipo {
  background: #e8efff;
  color: #3861d0;
}

.observacion-tipo.tipo-disciplinario {
  background: #ffe8e8;
  color: #c64141;
}

.observacion-tipo.tipo-convivencia {
  background: #f0eaff;
  color: #7653c9;
}

/* Categoría */

.observacion-categoria.categoria-positiva {
  background: #e5f8ee;
  color: #208552;
}

.observacion-categoria.categoria-negativa {
  background: #ffe8e8;
  color: #cc4141;
}

.observacion-categoria.categoria-neutra {
  background: #f0f2f5;
  color: #737d8f;
}

/* Gravedad */

.observacion-gravedad.gravedad-baja {
  background: #eef7ff;
  color: #3976a9;
}

.observacion-gravedad.gravedad-media {
  background: #fff1df;
  color: #bd7620;
}

.observacion-gravedad.gravedad-alta {
  background: #ffe5e5;
  color: #c43d3d;
}

/* Estado */

.observacion-estado.estado-abierto {
  background: #fff1df;
  color: #bd7620;
}

.observacion-estado.estado-seguimiento {
  background: #e8efff;
  color: #3861d0;
}

.observacion-estado.estado-cerrado {
  background: #e5f8ee;
  color: #208552;
}

/* Fecha */

.observacion-fecha {
  flex-shrink: 0;

  color: #949dac;
  font-size: 10px;

  white-space: nowrap;
}

/* Descripción */

.observacion-contenido h4 {
  margin: 0;

  color: #344056;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.65;

  white-space: pre-line;
}

/* Compromiso */

.observacion-compromiso {
  margin: 13px 0 0;

  padding: 11px 12px;

  background: #f2f5fa;

  border-left: 3px solid #3861d0;
  border-radius: 0 8px 8px 0;

  color: #657084;
  font-size: 11px;
  line-height: 1.5;
}

.observacion-compromiso strong {
  color: #465166;
  font-weight: 800;
}

/* =========================================================
   FOOTER DE OBSERVACIÓN
========================================================= */

.observacion-footer {
  min-height: 35px;

  margin-top: 13px;
  padding-top: 11px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  border-top: 1px solid #e9edf3;
}

.observacion-footer > span {
  color: #8993a5;
  font-size: 10px;
}

.observacion-footer > span::first-line {
  color: #657084;
}

.observacion-acciones {
  display: flex;
  align-items: center;
  gap: 6px;
}

.observacion-acciones .icon-button {
  width: 30px;
  height: 30px;

  border: 1px solid #dfe4ed;

  background: white;
  color: #69758a;

  border-radius: 7px;
}

.observacion-acciones .icon-button:hover {
  background: #eef3ff;
  border-color: #cbd7f1;
  color: #3861d0;
}

.observacion-acciones .icon-button.danger:hover {
  background: #fff0f0;
  border-color: #ffd2d2;
  color: #c43d3d;
}

/* =========================================================
   SEGUIMIENTO
========================================================= */

.seguimiento-observacion {
  margin-top: 14px;

  padding: 13px 14px;

  background: #f7f9fc;

  border: 1px solid #e5e9f0;
  border-radius: 10px;
}

.seguimiento-titulo {
  display: flex;
  align-items: center;
  gap: 7px;

  margin-bottom: 9px;

  color: #465166;
  font-size: 11px;
}

.seguimiento-titulo svg {
  color: #3861d0;
}

.seguimiento-item {
  padding: 8px 0 8px 14px;

  border-left: 2px solid #d8e2f7;
}

.seguimiento-item + .seguimiento-item {
  margin-top: 2px;
}

.seguimiento-item strong {
  color: #8993a5;
  font-size: 10px;
  font-weight: 700;
}

.seguimiento-item p {
  margin: 3px 0 0;

  color: #657084;
  font-size: 11px;
  line-height: 1.5;
}

/* =========================================================
   RESPONSIVE OBSERVADOR
========================================================= */

@media (max-width: 1100px) {
  .observador-layout {
    grid-template-columns: 290px minmax(0, 1fr);
  }

  .observador-filtros {
    grid-template-columns: 190px minmax(200px, 1fr) auto;
  }
}

@media (max-width: 900px) {
  .observador-layout {
    grid-template-columns: 1fr;
  }

  .estudiantes-lista {
    max-height: 300px;
  }

  .detalle-estudiante-header {
    flex-wrap: wrap;
  }

  .small-button {
    margin-left: auto;
  }
}

@media (max-width: 800px) {
  .observador-filtros {
    grid-template-columns: 1fr;
  }

  .secondary-button {
    width: 100%;
  }

  .observador-resumen {
    grid-template-columns: 1fr;
  }

  .resumen-observador-item {
    border-right: none;
    border-bottom: 1px solid #edf0f5;
  }

  .resumen-observador-item:last-child {
    border-bottom: none;
  }
}

@media (max-width: 600px) {
  .observador-heading {
    align-items: stretch;
  }

  .observador-heading .primary-button {
    width: 100%;
    justify-content: center;
  }

  .detalle-estudiante-header {
    padding: 17px;
  }

  .detalle-estudiante-avatar {
    width: 50px;
    height: 50px;
  }

  .detalle-estudiante-header h2 {
    font-size: 16px;
  }

  .small-button {
    width: 100%;
    margin-left: 0;
    justify-content: center;
  }

  .historial-observador {
    padding: 16px;
  }

  .observacion-item {
    grid-template-columns: 1fr;
    padding: 14px;
  }

  .observacion-indicador {
    width: 38px;
    height: 38px;
  }

  .observacion-top {
    flex-direction: column;
  }

  .observacion-fecha {
    order: -1;
  }

  .observacion-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .observacion-acciones {
    align-self: flex-end;
  }
}

@media (max-width: 450px) {
  .observador-card-header {
    padding: 14px;
  }

  .observador-card-header p {
    max-width: 220px;
  }

  .estudiante-item {
    padding: 10px 12px;
  }

  .historial-header h3 {
    font-size: 14px;
  }

  .observacion-etiquetas span {
    font-size: 8px;
  }
}
}

/* =========================================================
   OBSERVADOR DEL ESTUDIANTE
========================================================= */

.observador-section {
  width: 100%;
  max-width: 1500px;
}

/* =========================================================
   ENCABEZADO
========================================================= */

.observador-heading {
  width: 100%;
  margin-bottom: 22px;
  align-items: center;
}

.observador-heading > div:first-child {
  min-width: 0;
}

.observador-heading h1 {
  margin: 0;
}

.observador-heading p {
  max-width: 900px;
  line-height: 1.6;
}

.observador-heading .primary-button {
  flex-shrink: 0;
  height: 44px;
  padding: 0 18px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(56, 97, 208, 0.18);
}

/* =========================================================
   FILTROS
========================================================= */

.observador-filtros {
  width: 100%;
  box-sizing: border-box;

  display: grid !important;
  grid-template-columns: 240px minmax(300px, 1fr) auto !important;
  align-items: end;

  gap: 16px;

  padding: 18px 20px;

  margin-bottom: 20px;

  background: #ffffff;

  border: 1px solid #e5e9f1;
  border-radius: 14px;

  box-shadow: 0 2px 8px rgba(27, 43, 72, 0.03);
}

.filtro-observador {
  width: 100%;
  min-width: 0;

  display: flex;
  flex-direction: column;

  gap: 7px;
}

.filtro-observador label {
  color: #465166;
  font-size: 12px;
  font-weight: 700;
}

.filtro-observador select {
  width: 100%;
  height: 42px;

  box-sizing: border-box;

  padding: 0 12px;

  border: 1px solid #dce2eb;
  border-radius: 9px;

  background: #ffffff;
  color: #273146;

  font-family: inherit;
  font-size: 13px;

  outline: none;

  transition: all 0.2s ease;
}

.filtro-observador select:focus {
  border-color: #3861d0;
  box-shadow: 0 0 0 3px rgba(56, 97, 208, 0.08);
}

.filtro-busqueda {
  min-width: 0;
}

.input-icon-wrapper {
  width: 100%;
  height: 42px;

  box-sizing: border-box;

  display: flex;
  align-items: center;

  gap: 9px;

  padding: 0 12px;

  border: 1px solid #dce2eb;
  border-radius: 9px;

  background: #ffffff;

  color: #98a2b3;

  transition: all 0.2s ease;
}

.input-icon-wrapper:focus-within {
  border-color: #3861d0;
  box-shadow: 0 0 0 3px rgba(56, 97, 208, 0.08);
}

.input-icon-wrapper input {
  width: 100%;
  min-width: 0;

  height: 100%;

  padding: 0;

  border: none;
  outline: none;

  background: transparent;

  color: #263148;

  font-family: inherit;
  font-size: 13px;
}

.input-icon-wrapper input::placeholder {
  color: #9ba4b3;
}

.secondary-button {
  height: 42px;

  padding: 0 17px;

  border: 1px solid #dce3ef;
  border-radius: 9px;

  background: #ffffff;
  color: #3861d0;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  gap: 7px;

  font-family: inherit;
  font-size: 12px;
  font-weight: 700;

  cursor: pointer;

  white-space: nowrap;

  transition: all 0.2s ease;
}

.secondary-button:hover {
  background: #f2f5ff;
  border-color: #c9d5f0;
}

/* =========================================================
   ERROR
========================================================= */

.observador-alert {
  width: 100%;
  box-sizing: border-box;

  display: flex;
  align-items: center;

  gap: 10px;

  padding: 13px 16px;

  margin-bottom: 18px;

  border-radius: 10px;

  font-size: 13px;
}

.observador-alert-error {
  background: #fff1f1;
  border: 1px solid #ffd4d4;
  color: #c33e3e;
}

/* =========================================================
   ESTRUCTURA PRINCIPAL
========================================================= */

.observador-layout {
  width: 100%;

  display: grid !important;

  grid-template-columns: 320px minmax(0, 1fr) !important;

  gap: 20px;

  align-items: start;
}

/* =========================================================
   TARJETAS
========================================================= */

.observador-card {
  width: 100%;
  box-sizing: border-box;

  background: #ffffff;

  border: 1px solid #e5e9f1;

  border-radius: 14px;

  overflow: hidden;

  box-shadow: 0 2px 8px rgba(27, 43, 72, 0.035);
}

.estudiantes-card {
  min-width: 0;
}

.detalle-card {
  min-width: 0;
}

/* =========================================================
   CABECERA DE TARJETAS
========================================================= */

.observador-card-header {
  min-height: 74px;

  padding: 17px 18px;

  box-sizing: border-box;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 12px;

  border-bottom: 1px solid #edf0f4;
}

.observador-card-header h2 {
  margin: 0;

  color: #202a3d;

  font-size: 15px;
  font-weight: 800;
}

.observador-card-header p {
  margin: 5px 0 0;

  color: #8b95a6;

  font-size: 11px;
  line-height: 1.4;
}

.observador-count {
  min-width: 31px;
  height: 31px;

  padding: 0 8px;

  box-sizing: border-box;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background: #e8efff;

  color: #3861d0;

  font-size: 12px;
  font-weight: 800;
}

/* =========================================================
   LISTA DE ESTUDIANTES
========================================================= */

.estudiantes-lista {
  width: 100%;

  max-height: 590px;

  overflow-y: auto;
}

.estudiantes-lista::-webkit-scrollbar {
  width: 5px;
}

.estudiantes-lista::-webkit-scrollbar-thumb {
  background: #d7deea;
  border-radius: 10px;
}

.estudiante-item {
  width: 100% !important;

  min-height: 70px;

  padding: 11px 14px !important;

  box-sizing: border-box;

  display: flex !important;
  align-items: center !important;

  gap: 11px;

  border: none !important;
  border-bottom: 1px solid #edf0f4 !important;

  border-radius: 0 !important;

  background: #ffffff !important;

  color: #263148 !important;

  text-align: left;

  cursor: pointer;

  transition: all 0.18s ease;
}

.estudiante-item:hover {
  background: #f7f9fd !important;
}

.estudiante-item.active {
  background: #eef3ff !important;

  box-shadow: inset 3px 0 0 #3861d0;
}

.estudiante-item > svg {
  flex-shrink: 0;

  color: #9ba5b5;
}

.estudiante-item.active > svg {
  color: #3861d0;
}

/* Avatar */

.estudiante-avatar {
  width: 40px;
  height: 40px;

  flex-shrink: 0;

  border-radius: 11px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #e8efff;

  color: #3861d0;

  font-size: 11px;
  font-weight: 800;
}

/* Información */

.estudiante-info {
  flex: 1;
  min-width: 0;
}

.estudiante-info strong {
  display: block;

  overflow: hidden;

  color: #273146;

  font-size: 12px;
  font-weight: 800;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.estudiante-info span {
  display: block;

  margin-top: 4px;

  color: #929bab;

  font-size: 10px;
}

/* =========================================================
   DETALLE DEL ESTUDIANTE
========================================================= */

.detalle-estudiante-header {
  min-height: 105px;

  padding: 20px 22px;

  box-sizing: border-box;

  display: flex;
  align-items: center;

  gap: 14px;

  border-bottom: 1px solid #edf0f4;
}

.detalle-estudiante-avatar {
  width: 58px;
  height: 58px;

  flex-shrink: 0;

  border-radius: 15px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #e8efff;

  color: #3861d0;

  font-size: 15px;
  font-weight: 800;
}

.detalle-estudiante-header > div:nth-child(2) {
  flex: 1;
  min-width: 0;
}

.detalle-estudiante-header .eyebrow {
  margin-bottom: 3px;
}

.detalle-estudiante-header h2 {
  margin: 0;

  color: #182235;

  font-size: 20px;
  font-weight: 800;
}

.detalle-estudiante-header p {
  margin: 5px 0 0;

  color: #8791a3;

  font-size: 11px;
}

.small-button {
  flex-shrink: 0;

  height: 38px;

  padding: 0 14px;
}

/* =========================================================
   RESUMEN
========================================================= */

.observador-resumen {
  width: 100%;

  display: grid !important;

  grid-template-columns: repeat(3, 1fr) !important;

  border-bottom: 1px solid #edf0f4;
}

.resumen-observador-item {
  min-height: 78px;

  padding: 14px 17px;

  box-sizing: border-box;

  display: flex;
  align-items: center;

  gap: 10px;

  border-right: 1px solid #edf0f4;
}

.resumen-observador-item:last-child {
  border-right: none;
}

.resumen-icon {
  width: 36px;
  height: 36px;

  flex-shrink: 0;

  border-radius: 10px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #e8efff;

  color: #3861d0;
}

.resumen-observador-item:nth-child(2) .resumen-icon {
  background: #fff1df;
  color: #c98126;
}

.resumen-observador-item:nth-child(3) .resumen-icon {
  background: #e5f8ee;
  color: #21955c;
}

.resumen-observador-item span {
  display: block;

  color: #8b95a6;

  font-size: 10px;
}

.resumen-observador-item strong {
  display: block;

  margin-top: 3px;

  color: #202a3d;

  font-size: 19px;
}

/* =========================================================
   HISTORIAL
========================================================= */

.historial-observador {
  padding: 20px 22px;
}

.historial-header {
  margin-bottom: 16px;
}

.historial-header h3 {
  margin: 0;

  color: #253047;

  font-size: 15px;
  font-weight: 800;
}

.historial-header p {
  margin: 5px 0 0;

  color: #8993a5;

  font-size: 11px;
}

/* =========================================================
   OBSERVACIONES
========================================================= */

.observaciones-lista {
  width: 100%;

  display: flex;
  flex-direction: column;

  gap: 12px;
}

.observacion-item {
  width: 100%;

  box-sizing: border-box;

  display: grid;

  grid-template-columns: 42px minmax(0, 1fr);

  gap: 13px;

  padding: 16px;

  background: #fbfcfe;

  border: 1px solid #e3e8f0;

  border-radius: 12px;
}

.observacion-indicador {
  width: 42px;
  height: 42px;

  border-radius: 11px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #e8efff;

  color: #3861d0;
}

.observacion-contenido {
  min-width: 0;
}

.observacion-top {
  width: 100%;

  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  gap: 12px;

  margin-bottom: 10px;
}

.observacion-etiquetas {
  display: flex;
  flex-wrap: wrap;

  gap: 5px;
}

.observacion-etiquetas span {
  min-height: 23px;

  padding: 0 8px;

  display: inline-flex;
  align-items: center;

  border-radius: 6px;

  font-size: 9px;
  font-weight: 800;

  text-transform: uppercase;
}

.observacion-tipo {
  background: #e8efff;
  color: #3861d0;
}

.observacion-categoria.categoria-positiva {
  background: #e5f8ee;
  color: #208552;
}

.observacion-categoria.categoria-negativa {
  background: #ffe8e8;
  color: #cc4141;
}

.observacion-categoria.categoria-neutra {
  background: #f0f2f5;
  color: #737d8f;
}

.observacion-gravedad.gravedad-baja {
  background: #eef7ff;
  color: #3976a9;
}

.observacion-gravedad.gravedad-media {
  background: #fff1df;
  color: #bd7620;
}

.observacion-gravedad.gravedad-alta {
  background: #ffe5e5;
  color: #c43d3d;
}

.observacion-estado.estado-abierto {
  background: #fff1df;
  color: #bd7620;
}

.observacion-estado.estado-seguimiento {
  background: #e8efff;
  color: #3861d0;
}

.observacion-estado.estado-cerrado {
  background: #e5f8ee;
  color: #208552;
}

.observacion-fecha {
  flex-shrink: 0;

  color: #929bab;

  font-size: 10px;

  white-space: nowrap;
}

.observacion-contenido h4 {
  margin: 0;

  color: #344056;

  font-size: 13px;
  font-weight: 500;

  line-height: 1.65;

  white-space: pre-line;
}

.observacion-compromiso {
  margin: 12px 0 0;

  padding: 10px 12px;

  background: #f2f5fa;

  border-left: 3px solid #3861d0;

  border-radius: 0 7px 7px 0;

  color: #687388;

  font-size: 11px;

  line-height: 1.5;
}

.observacion-compromiso strong {
  color: #465166;
}

/* =========================================================
   FOOTER
========================================================= */

.observacion-footer {
  min-height: 31px;

  margin-top: 12px;
  padding-top: 10px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 10px;

  border-top: 1px solid #e8ecf2;
}

.observacion-footer > span {
  color: #8993a5;

  font-size: 10px;
}

.observacion-acciones {
  display: flex;
  align-items: center;

  gap: 5px;
}

.observacion-acciones .icon-button {
  width: 30px;
  height: 30px;

  padding: 0;

  border: 1px solid #dfe4ed;

  background: white;

  border-radius: 7px;

  color: #687388;
}

.observacion-acciones .icon-button:hover {
  background: #eef3ff;
  color: #3861d0;
}

.observacion-acciones .icon-button.danger:hover {
  background: #fff0f0;
  color: #c43d3d;
}

/* =========================================================
   SEGUIMIENTO
========================================================= */

.seguimiento-observacion {
  margin-top: 12px;

  padding: 12px 14px;

  background: #f7f9fc;

  border: 1px solid #e4e9f1;

  border-radius: 9px;
}

.seguimiento-titulo {
  display: flex;
  align-items: center;

  gap: 7px;

  margin-bottom: 8px;

  color: #465166;

  font-size: 11px;
  font-weight: 700;
}

.seguimiento-titulo svg {
  color: #3861d0;
}

.seguimiento-item {
  padding: 7px 0 7px 12px;

  border-left: 2px solid #d5def1;
}

.seguimiento-item strong {
  color: #8993a5;

  font-size: 10px;
}

.seguimiento-item p {
  margin: 3px 0 0;

  color: #657084;

  font-size: 11px;

  line-height: 1.5;
}

/* =========================================================
   ESTADOS VACÍOS / CARGA
========================================================= */

.observador-loading,
.observador-empty {
  min-height: 250px;

  padding: 30px 20px;

  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  text-align: center;

  color: #8b95a6;
}

.observador-empty h3 {
  margin: 12px 0 6px;

  color: #3d485c;

  font-size: 15px;
}

.observador-empty p {
  max-width: 380px;

  margin: 0;

  color: #8993a5;

  font-size: 12px;

  line-height: 1.6;
}

.loading-spin {
  color: #3861d0;

  animation: spin 0.8s linear infinite;
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 1050px) {
  .observador-layout {
    grid-template-columns: 280px minmax(0, 1fr) !important;
  }

  .observador-filtros {
    grid-template-columns: 200px minmax(200px, 1fr) auto !important;
  }
}

@media (max-width: 850px) {
  .observador-layout {
    grid-template-columns: 1fr !important;
  }

  .estudiantes-lista {
    max-height: 300px;
  }
}

@media (max-width: 700px) {
  .observador-filtros {
    grid-template-columns: 1fr !important;
  }

  .secondary-button {
    width: 100%;
  }

  .observador-resumen {
    grid-template-columns: 1fr !important;
  }

  .resumen-observador-item {
    border-right: none;
    border-bottom: 1px solid #edf0f4;
  }

  .resumen-observador-item:last-child {
    border-bottom: none;
  }
}

@media (max-width: 550px) {
  .observador-heading {
    align-items: stretch;
  }

  .observador-heading .primary-button {
    width: 100%;
    justify-content: center;
  }

  .detalle-estudiante-header {
    flex-wrap: wrap;
    padding: 17px;
  }

  .small-button {
    width: 100%;
    justify-content: center;
  }

  .historial-observador {
    padding: 16px;
  }

  .observacion-item {
    grid-template-columns: 1fr;
  }

  .observacion-top {
    flex-direction: column;
  }

  .observacion-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .observacion-acciones {
    align-self: flex-end;
  }
}


/* =========================================================
   VISTAS ADMINISTRATIVAS - DISEÑO VISUAL
========================================================= */

.visual-module-section { max-width: 1280px; }
.visual-module-section .page-heading { margin-bottom: 22px; }
.module-toolbar { display:flex; gap:12px; flex-wrap:wrap; background:#fff; border:1px solid #e8ebf2; border-radius:15px; padding:16px; margin-bottom:18px; }
.fake-search,.fake-select { height:42px; border:1px solid #e1e6ef; border-radius:10px; display:flex; align-items:center; gap:9px; padding:0 13px; color:#8791a3; background:#fff; font-size:13px; }
.fake-search { flex:1; min-width:250px; }
.fake-select { min-width:180px; justify-content:space-between; }
.visual-table-card,.visual-form-card,.permissions-card,.results-card,.bitacora-card { background:#fff; border:1px solid #e8ebf2; border-radius:15px; overflow:hidden; }
.visual-table-head,.visual-table-row { display:grid; grid-template-columns:1.5fr 1fr 1.5fr 1fr 1fr; gap:14px; align-items:center; padding:15px 18px; font-size:13px; }
.visual-table-head { background:#f8f9fc; color:#7d8799; font-weight:700; text-transform:uppercase; font-size:11px; letter-spacing:.03em; }
.visual-table-row { border-top:1px solid #edf0f5; color:#667085; }
.visual-table-row strong { color:#26344d; }
.person-cell,.result-person { display:flex; align-items:center; gap:10px; }
.mini-avatar { width:34px; height:34px; border-radius:50%; background:#e8efff; color:#3861d0; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; flex:none; }
.table-action { border:0; background:transparent; color:#3861d0; font-weight:700; font-size:12px; cursor:pointer; }
.visual-form-card { padding:24px; }
.visual-form-title { display:flex; align-items:center; gap:13px; margin-bottom:22px; }
.visual-form-title h2,.results-header h2 { margin:0 0 5px; color:#24324a; font-size:19px; }
.visual-form-title p,.results-header p { margin:0; color:#8992a3; font-size:13px; }
.large-module-icon { width:46px; height:46px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex:none; }
.large-module-icon.blue,.permission-icon.blue { background:#edf3ff; color:#3861d0; }
.large-module-icon.green,.permission-icon.green { background:#eaf9f0; color:#2d9b5f; }
.large-module-icon.purple,.permission-icon.purple { background:#f1edff; color:#7357c7; }
.large-module-icon.orange,.permission-icon.orange { background:#fff3e5; color:#e28b2f; }
.visual-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:17px; }
.fake-field { display:flex; flex-direction:column; gap:7px; }
.fake-field.full-span { grid-column:1 / -1; }
.fake-field label { color:#4f5d73; font-size:12px; font-weight:700; }
.fake-input { min-height:43px; border:1px solid #e1e6ef; border-radius:10px; padding:0 13px; display:flex; align-items:center; justify-content:space-between; color:#68758a; font-size:13px; background:#fff; }
.form-preview { margin-top:22px; padding:15px; background:#f7f9fc; border:1px dashed #dce2ec; border-radius:11px; display:flex; align-items:center; gap:12px; }
.form-preview > div { flex:1; display:flex; flex-direction:column; gap:3px; }
.form-preview strong { color:#2d3b53; font-size:13px; }.form-preview span { color:#8a94a6; font-size:12px; }
.visual-form-actions { display:flex; justify-content:flex-end; gap:10px; margin-top:20px; }
.document-options-grid,.listing-grid,.candidate-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
.document-option,.listing-card { background:#fff; border:1px solid #e8ebf2; border-radius:15px; padding:22px; }
.document-option h3,.listing-card h3 { margin:16px 0 7px; color:#27354c; font-size:16px; }.document-option p,.listing-card p { margin:0 0 18px; color:#8992a3; font-size:13px; line-height:1.55; }
.candidate-grid { grid-template-columns:repeat(4,1fr); }
.candidate-card { background:#fff; border:1px solid #e8ebf2; border-radius:15px; overflow:hidden; }
.candidate-cover { height:66px; background:linear-gradient(135deg,#173f9f,#4b70d8); }
.candidate-avatar { width:58px; height:58px; border-radius:50%; background:#eef3ff; border:4px solid #fff; margin:-29px 0 0 18px; position:relative; display:flex; align-items:center; justify-content:center; color:#3861d0; font-weight:800; }
.candidate-body { padding:11px 18px 15px; }.candidate-role { font-size:10px; color:#8791a3; text-transform:uppercase; font-weight:700; }.candidate-body h3 { margin:5px 0; font-size:15px; color:#27354c; }.candidate-body p { margin:0; font-size:12px; color:#8992a3; }.candidate-status { margin-top:13px; display:flex; justify-content:space-between; align-items:center; font-size:11px; color:#8a94a6; }.candidate-actions { border-top:1px solid #edf0f5; padding:11px 18px; display:flex; justify-content:space-between; }
.election-timeline { background:#fff; border:1px solid #e8ebf2; border-radius:15px; padding:10px 22px; }.election-event { display:grid; grid-template-columns:70px 25px 1fr; gap:15px; padding:20px 0; }.event-date { text-align:center; background:#f7f9fc; border-radius:10px; padding:9px 4px; height:max-content; }.event-date strong { display:block; font-size:24px; color:#24324a; }.event-date span { font-size:10px; font-weight:800; color:#8791a3; }.event-line { position:relative; width:2px; background:#e2e7ef; min-height:110px; }.active-event .event-line { background:#3861d0; }.event-content { padding:3px 0; }.event-top { display:flex; gap:10px; align-items:center; color:#8a94a6; font-size:12px; }.event-content h2 { margin:10px 0 6px; font-size:18px; color:#27354c; }.event-content p { margin:0; color:#8992a3; font-size:13px; }.event-meta { display:flex; gap:22px; margin-top:15px; color:#68758a; font-size:12px; }.event-meta span { display:flex; align-items:center; gap:6px; }
.permissions-card { padding:5px 20px; }.permission-row { display:flex; align-items:center; gap:14px; padding:19px 0; border-bottom:1px solid #edf0f5; }.permission-row:last-child { border-bottom:0; }.permission-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; }.permission-copy { flex:1; display:flex; flex-direction:column; gap:4px; }.permission-copy strong { color:#29374f; font-size:13px; }.permission-copy span { color:#8a94a6; font-size:12px; }.fake-toggle { width:42px; height:23px; border-radius:20px; background:#d9dee8; position:relative; }.fake-toggle:after { content:""; width:17px; height:17px; border-radius:50%; background:#fff; position:absolute; top:3px; left:3px; box-shadow:0 1px 3px #b9bfca; }.fake-toggle.on { background:#3861d0; }.fake-toggle.on:after { left:22px; }
.result-summary,.report-metrics { display:grid; grid-template-columns:repeat(4,1fr); gap:15px; margin-bottom:18px; }.result-summary > div,.report-metrics > div { background:#fff; border:1px solid #e8ebf2; border-radius:13px; padding:17px; display:flex; flex-direction:column; gap:7px; }.result-summary span,.report-metrics span { font-size:11px; color:#8992a3; }.result-summary strong,.report-metrics strong { font-size:24px; color:#29374f; }.result-open { color:#2d9b5f !important; font-size:14px !important; }.results-card { padding:22px; }.results-header { margin-bottom:10px; }.result-row { display:grid; grid-template-columns:34px 1.3fr 2fr 90px; gap:15px; align-items:center; padding:15px 0; border-top:1px solid #edf0f5; }.result-position { width:30px; height:30px; border-radius:8px; background:#f1f4fa; display:flex; align-items:center; justify-content:center; font-weight:800; color:#6c778b; }.result-bar { height:8px; background:#edf0f5; border-radius:10px; overflow:hidden; }.result-bar-fill { height:100%; background:#3861d0; border-radius:10px; }.result-votes { color:#29374f; font-size:12px; text-align:right; }
.boletin-layout { display:grid; grid-template-columns:270px 1fr; gap:18px; }.boletin-sidebar { background:#fff; border:1px solid #e8ebf2; border-radius:15px; padding:20px; display:flex; flex-direction:column; gap:16px; height:max-content; }.full-button { width:100%; justify-content:center; }.boletin-preview { background:#fff; border:1px solid #e8ebf2; border-radius:15px; padding:25px; }.boletin-top { display:flex; align-items:center; gap:11px; padding-bottom:18px; border-bottom:1px solid #edf0f5; }.small-logo { width:38px !important; height:38px !important; }.boletin-top > div:nth-child(2) { flex:1; display:flex; flex-direction:column; }.boletin-top strong { color:#26344d; }.boletin-top span { color:#8992a3; font-size:11px; }.boletin-period { font-size:11px; color:#3861d0 !important; font-weight:700; }.student-banner { margin:20px 0; padding:17px; background:#f7f9fc; border-radius:12px; display:flex; align-items:center; gap:12px; }.mini-avatar.big { width:45px; height:45px; }.student-banner > div:nth-child(2) { flex:1; display:flex; flex-direction:column; }.student-banner strong { color:#29374f; }.student-banner span { color:#8992a3; font-size:12px; margin-top:3px; }.preview-average { text-align:right; }.preview-average small { display:block; color:#8992a3; font-size:10px; }.preview-average strong { font-size:25px; color:#3861d0; }.boletin-subjects { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }.boletin-subjects > div { border:1px solid #edf0f5; border-radius:10px; padding:13px; display:flex; justify-content:space-between; }.boletin-subjects span { color:#68758a; font-size:12px; }.boletin-subjects strong { color:#29374f; }
.bitacora-card { padding:0 20px; }.log-item { display:flex; align-items:center; gap:13px; padding:18px 0; border-bottom:1px solid #edf0f5; }.log-item:last-child { border-bottom:0; }.log-icon { width:40px; height:40px; border-radius:11px; background:#edf3ff; color:#3861d0; display:flex; align-items:center; justify-content:center; }.log-content { flex:1; }.log-content strong { color:#29374f; font-size:13px; }.log-content p { margin:4px 0; color:#7f899b; font-size:12px; }.log-content span { color:#a0a8b6; font-size:11px; }
.profile-layout { display:grid; grid-template-columns:260px 1fr; gap:18px; }.profile-card { background:#fff; border:1px solid #e8ebf2; border-radius:15px; }.profile-summary { padding:28px 20px; text-align:center; height:max-content; }.profile-avatar-large { width:82px; height:82px; margin:0 auto 15px; border-radius:50%; background:#eaf0ff; color:#3861d0; display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:800; }.profile-summary h2 { margin:0; font-size:17px; color:#29374f; }.profile-summary > span { display:block; color:#8992a3; font-size:12px; margin-top:6px; }.profile-tag { display:inline-flex; align-items:center; gap:5px; margin-top:15px; padding:6px 10px; border-radius:20px; background:#eaf9f0; color:#2d9b5f; font-size:11px; font-weight:700; }.profile-form { margin:0; }
.calendar-header { display:flex; align-items:center; justify-content:center; gap:15px; margin-bottom:15px; }.calendar-header h2 { margin:0; color:#29374f; font-size:18px; }.calendar-header .icon-button { width:34px; height:34px; }.calendar-grid { display:grid; grid-template-columns:repeat(7,1fr); background:#fff; border:1px solid #e8ebf2; border-radius:15px; overflow:hidden; }.calendar-weekday { padding:12px; text-align:center; background:#f7f9fc; color:#7d8799; font-size:11px; font-weight:800; }.calendar-day { min-height:100px; border-top:1px solid #edf0f5; border-right:1px solid #edf0f5; padding:10px; color:#6c778b; font-size:12px; }.calendar-day:nth-child(7n) { border-right:0; }.calendar-day.today { background:#f0f5ff; }.calendar-day.today > span { display:inline-flex; width:25px; height:25px; border-radius:50%; background:#3861d0; color:#fff; align-items:center; justify-content:center; }.calendar-day.event small { display:block; margin-top:10px; background:#edf3ff; color:#3861d0; border-radius:6px; padding:5px; font-size:10px; font-weight:700; }
@media (max-width:1100px) { .candidate-grid,.document-options-grid,.listing-grid { grid-template-columns:repeat(2,1fr); } .boletin-layout,.profile-layout { grid-template-columns:1fr; } }
@media (max-width:800px) { .visual-table-card { overflow-x:auto; }.visual-table-head,.visual-table-row { min-width:850px; }.visual-form-grid,.result-summary,.report-metrics { grid-template-columns:1fr 1fr; }.result-row { min-width:650px; }.results-card { overflow-x:auto; }.candidate-grid,.document-options-grid,.listing-grid { grid-template-columns:1fr; }.boletin-subjects { grid-template-columns:1fr; }.calendar-day { min-height:75px; } }
@media (max-width:500px) { .visual-form-grid,.result-summary,.report-metrics { grid-template-columns:1fr; }.fake-search,.fake-select { width:100%; min-width:0; }.election-event { grid-template-columns:55px 12px 1fr; gap:9px; }.event-meta { flex-direction:column; gap:7px; }.visual-form-actions { flex-direction:column; }.visual-form-actions button { width:100%; justify-content:center; } }

</style>