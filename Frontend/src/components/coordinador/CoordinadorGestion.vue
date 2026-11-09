<template>
  <div class="gestion-coordinador">
    <header class="gestion-encabezado">
      <div>
        <span class="gestion-etiqueta">{{ categoria }}</span>
        <h1>{{ titulo }}</h1>
        <p>{{ descripcion }}</p>
      </div>
      <button class="gc-btn gc-secundario" type="button" :disabled="cargando" @click="cargar">
        {{ cargando ? 'Cargando…' : 'Actualizar' }}
      </button>
    </header>

    <p v-if="error" role="alert" class="gc-alerta gc-error">{{ error }}</p>
    <p v-if="mensaje" role="status" class="gc-alerta gc-exito">{{ mensaje }}</p>
    <div v-if="cargando" class="gc-cargando">Consultando información de la institución…</div>

    <template v-else>
      <!-- Excusas docentes e informe de excusas comparten una única fuente real. -->
      <template v-if="seccion === 'excusas-docentes' || seccion === 'informe-excusas'">
        <div class="gc-acciones">
          <label class="gc-campo">Buscar <input v-model.trim="buscarExcusa" placeholder="Docente, motivo o documento" /></label>
          <label class="gc-campo">Estado
            <select v-model="estadoFiltro"><option value="">Todos</option><option value="pendiente">Pendientes</option><option value="aprobada">Aprobadas</option><option value="rechazada">Rechazadas</option></select>
          </label>
          <label class="gc-campo">Año académico
            <select v-model="anioFiltro"><option value="">Todos</option><option v-for="anio in anios" :key="anio._id" :value="anio._id">{{ anio.anio }}</option></select>
          </label>
          <button v-if="seccion === 'excusas-docentes'" class="gc-btn gc-primario" type="button" @click="nuevaExcusa">Registrar excusa</button>
          <button v-else class="gc-btn gc-primario" type="button" @click="exportarExcusas">Descargar informe CSV</button>
        </div>
        <div class="gc-resumen" v-if="seccion === 'informe-excusas'">
          <div><small>Total</small><strong>{{ excusasFiltradas.length }}</strong></div>
          <div><small>Aprobadas</small><strong>{{ contarEstado('aprobada') }}</strong></div>
          <div><small>Pendientes</small><strong>{{ contarEstado('pendiente') }}</strong></div>
          <div><small>Rechazadas</small><strong>{{ contarEstado('rechazada') }}</strong></div>
        </div>
        <div class="gc-tabla-wrap">
          <table class="gc-tabla"><thead><tr><th>Docente</th><th>Desde</th><th>Hasta</th><th>Motivo</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              <tr v-for="excusa in excusasFiltradas" :key="excusa._id">
                <td>{{ nombrePersona(excusa.docenteId) }}</td><td>{{ fecha(excusa.fechaInicio) }}</td><td>{{ fecha(excusa.fechaFin) }}</td>
                <td>{{ excusa.motivo }}</td><td><span class="gc-estado" :class="excusa.estado">{{ excusa.estado }}</span></td>
                <td><button class="gc-link" type="button" @click="detalleExcusa = excusa">Ver detalle</button>
                  <button v-if="seccion === 'excusas-docentes'" class="gc-link gc-peligro" type="button" @click="borrarExcusa(excusa)">Eliminar</button></td>
              </tr>
              <tr v-if="!excusasFiltradas.length"><td colspan="6" class="gc-vacio">No existen excusas que coincidan con estos filtros.</td></tr>
            </tbody>
          </table>
        </div>
      </template>

      <!-- Certificados, constancias y boletines se generan desde el backend como PDF auténtico. -->
      <template v-if="['certificados','constancias','boletin-estudiante'].includes(seccion)">
        <div class="gc-panel gc-form-docs">
          <h2>Datos del documento</h2>
          <label class="gc-campo">Estudiante matriculado
            <select v-model="matriculaSeleccionada"><option value="">Seleccionar estudiante</option>
              <option v-for="matricula in matriculasOrdenadas" :key="matricula._id" :value="matricula._id">{{ nombrePersona(matricula.estudianteId) }} · {{ matricula.grupoId?.nombre || 'Sin grupo' }} · {{ matricula.anioAcademicoId?.anio || '' }}</option>
            </select>
          </label>
          <label v-if="seccion !== 'boletin-estudiante'" class="gc-campo">Tipo de documento
            <select v-model="tipoDocumento">
              <template v-if="seccion === 'certificados'"><option value="certificado-notas">Certificado de calificaciones</option><option value="certificado-personal">Certificado académico general</option></template>
              <template v-else><option value="constancia-estudio">Constancia de estudio (matrícula activa)</option><option value="constancia-notas">Constancia de notas</option><option value="constancia-general">Constancia académica general</option></template>
            </select>
          </label>
          <label v-else class="gc-campo">Período académico
            <select v-model.number="periodoBoletin"><option v-for="n in [1,2,3,4]" :key="n" :value="n">Período {{ n }}</option></select>
          </label>
          <div v-if="matriculaDocumento" class="gc-ficha">
            <strong>{{ nombrePersona(matriculaDocumento.estudianteId) }}</strong>
            <span>Documento: {{ matriculaDocumento.estudianteId?.documento || 'Sin registrar' }}</span>
            <span>Grupo: {{ matriculaDocumento.grupoId?.nombre || 'Sin grupo' }}</span>
            <span>Estado: {{ matriculaDocumento.estado }}</span>
          </div>
          <div class="gc-acciones">
            <button class="gc-btn gc-secundario" type="button" :disabled="!matriculaSeleccionada || generandoPDF" @click="generarPDF(true)">Vista previa PDF</button>
            <button class="gc-btn gc-primario" type="button" :disabled="!matriculaSeleccionada || generandoPDF" @click="generarPDF(false)">{{ generandoPDF ? 'Generando…' : 'Descargar PDF' }}</button>
          </div>
          <p class="gc-ayuda">Los datos y el formato proceden del servidor. No se generan documentos de ejemplo.</p>
        </div>
      </template>

      <!-- Eventos y candidatos electorales: CRUD real persistido en MongoDB. -->
      <template v-if="['eventos-electorales','candidatos','permisos','resultados'].includes(seccion)">
        <div class="gc-acciones">
          <label class="gc-campo gc-crecer">Proceso electoral
            <select v-model="eventoSeleccionado"><option value="">Seleccione un evento</option>
              <option v-for="evento in eventos" :key="evento._id" :value="evento._id">{{ evento.titulo }} · {{ fecha(evento.fechaInicio) }}</option>
            </select>
          </label>
          <button v-if="seccion === 'eventos-electorales'" class="gc-btn gc-primario" type="button" @click="nuevoEvento">Nuevo evento</button>
          <button v-if="seccion === 'candidatos'" class="gc-btn gc-primario" type="button" :disabled="!eventoActual" @click="nuevoCandidato">Nuevo candidato</button>
        </div>
        <template v-if="seccion === 'eventos-electorales'">
          <div class="gc-tarjetas">
            <article v-for="evento in eventos" :key="evento._id" class="gc-panel">
              <small class="gestion-etiqueta">{{ evento.estado }}</small>
              <h2>{{ evento.titulo }}</h2><p>{{ evento.descripcion || 'Sin descripción' }}</p>
              <p>{{ fechaHora(evento.fechaInicio) }} — {{ fechaHora(evento.fechaFin) }}</p>
              <p>{{ evento.candidatos?.length || 0 }} candidatos · {{ evento.cargosDisponibles?.join(', ') || 'Sin cargos' }}</p>
              <div class="gc-acciones"><button class="gc-btn gc-secundario" type="button" @click="editarEvento(evento)">Editar</button>
                <button class="gc-btn gc-peligro-btn" type="button" @click="borrarEvento(evento)">Eliminar</button></div>
            </article>
            <p v-if="!eventos.length" class="gc-vacio">No hay eventos electorales. Registra el primero para organizar candidatos y habilitar la votación.</p>
          </div>
        </template>
        <template v-if="seccion === 'candidatos'">
          <div v-if="eventoActual" class="gc-tarjetas">
            <article v-for="candidato in eventoActual.candidatos || []" :key="candidato._id" class="gc-panel">
              <small class="gestion-etiqueta">{{ candidato.cargo }} · Nº {{ candidato.numero || '—' }}</small>
              <h2>{{ nombrePersona(candidato.estudianteId) }}</h2>
              <p>{{ candidato.propuesta || 'Sin propuesta registrada' }}</p>
              <div class="gc-acciones"><button class="gc-btn gc-secundario" type="button" @click="editarCandidato(candidato)">Editar</button><button class="gc-btn gc-peligro-btn" type="button" @click="borrarCandidato(candidato)">Retirar</button></div>
            </article>
            <p v-if="!eventoActual.candidatos?.length" class="gc-vacio">Todavía no se han registrado candidatos en este evento.</p>
          </div>
          <p v-else class="gc-vacio">Selecciona un evento electoral para gestionar sus candidatos.</p>
        </template>
        <template v-if="seccion === 'permisos'">
          <div v-if="eventoActual" class="gc-panel">
            <h2>Participación estudiantil</h2><p>Controla qué grupos pueden votar en <strong>{{ eventoActual.titulo }}</strong>. Este ajuste se guarda en el evento y se verifica nuevamente al votar.</p>
            <label class="gc-check"><input v-model="todosGrupos" type="checkbox" /> Habilitar todos los grupos de la institución</label>
            <div v-if="!todosGrupos" class="gc-check-grid"><label v-for="grupo in grupos" :key="grupo._id" class="gc-check"><input v-model="gruposHabilitados" type="checkbox" :value="grupo._id" /> {{ grupo.nombre }}</label></div>
            <label class="gc-check"><input v-model="resultadosPublicos" type="checkbox" /> Publicar los resultados para estudiantes y acudientes</label>
            <p class="gc-ayuda">Para impedir toda votación, cambia el estado del evento a «programado» o «finalizado». Una lista vacía de grupos significa «todos».</p>
            <button type="button" class="gc-btn gc-primario" :disabled="guardando" @click="guardarPermisos">Guardar permisos</button>
          </div>
          <p v-else class="gc-vacio">Selecciona un evento para configurar sus permisos.</p>
        </template>
        <template v-if="seccion === 'resultados'">
          <div v-if="eventoActual" class="gc-panel">
            <div class="gc-acciones"><h2>Resultados de {{ eventoActual.titulo }}</h2><button class="gc-btn gc-secundario" type="button" @click="cargarResultados">Actualizar resultados</button></div>
            <p v-if="cargandoResultados">Consultando votos…</p>
            <p v-else-if="!resultados?.resultadosPorCargo?.length" class="gc-vacio">Este evento aún no tiene cargos o resultados para mostrar.</p>
            <div v-for="cargo in resultados?.resultadosPorCargo || []" :key="cargo.cargo" class="gc-cargo">
              <h3>{{ cargo.cargo }}</h3><p>Votos: {{ cargo.votosEmitidos }} · Electores habilitados: {{ cargo.totalElegibles }} · Abstención: {{ cargo.abstencion }}</p>
              <div v-for="candidato in cargo.candidatos" :key="candidato.candidatoId" class="gc-resultado"><span>{{ nombreCandidatoResultado(candidato) }}</span><strong>{{ candidato.votos }} votos</strong></div>
              <p v-if="cargo.empate" class="gc-ayuda">Hay un empate en este cargo.</p>
              <p v-if="!cargo.votosEmitidos" class="gc-ayuda">Aún no se han emitido votos para este cargo.</p>
            </div>
          </div>
          <p v-else class="gc-vacio">Selecciona un evento para consultar los votos reales.</p>
        </template>
      </template>

      <!-- Reportes y listados reales. -->
      <template v-if="seccion === 'listados'">
        <div class="gc-acciones">
          <label class="gc-campo gc-crecer">Tipo de listado
            <select v-model="tipoListado"><option value="estudiantes">Estudiantes matriculados</option><option value="grupos">Grupos</option><option value="calificaciones">Calificaciones</option><option value="documentos">Documentos generados (bitácora)</option></select>
          </label>
          <button class="gc-btn gc-primario" type="button" @click="exportarListado">Exportar listado CSV</button>
        </div>
        <p class="gc-ayuda">Se muestran registros reales del año y la institución; los documentos solo figuran cuando su emisión quedó registrada.</p>
        <div class="gc-tabla-wrap"><table class="gc-tabla"><thead><tr><th v-for="(columna,i) in listadoColumnas" :key="i">{{ columna }}</th></tr></thead>
          <tbody><tr v-for="(fila,i) in listadoFilas" :key="i"><td v-for="(celda,j) in fila" :key="j">{{ celda }}</td></tr>
            <tr v-if="!listadoFilas.length"><td class="gc-vacio" :colspan="listadoColumnas.length">No se encontraron registros para este listado.</td></tr>
          </tbody></table></div>
      </template>

      <template v-if="seccion === 'bitacora'">
        <label class="gc-campo gc-buscar">Buscar en el historial <input v-model.trim="buscarBitacora" placeholder="Acción, descripción o usuario" /></label>
        <div class="gc-panel"><div v-for="registro in bitacoraFiltrada" :key="registro._id" class="gc-entrada"><strong>{{ registro.accion }}</strong><span>{{ fechaHora(registro.createdAt) }} · {{ nombrePersona(registro.usuarioId) }}</span><p>{{ registro.detalle || registro.coleccion || 'Acción registrada' }}</p></div>
          <p v-if="!bitacoraFiltrada.length" class="gc-vacio">No se registran acciones para esta búsqueda.</p>
        </div>
      </template>

      <!-- Cronograma institucional real con eventos persistentes y mes navegable. -->
      <template v-if="seccion === 'cronograma'">
        <div class="gc-acciones">
          <button class="gc-btn gc-secundario" type="button" @click="moverMes(-1)" aria-label="Mes anterior">‹ Anterior</button>
          <strong class="gc-mes">{{ nombreMes }}</strong>
          <button class="gc-btn gc-secundario" type="button" @click="moverMes(1)" aria-label="Mes siguiente">Siguiente ›</button>
          <button class="gc-btn gc-primario" type="button" @click="nuevoCalendario">Nueva actividad</button>
        </div>
        <div class="gc-calendario"><strong v-for="dia in ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']" :key="dia">{{ dia }}</strong>
          <div v-for="(dia,i) in diasMes" :key="i" class="gc-dia" :class="{ 'gc-dia-vacio': !dia.numero }">
            <b>{{ dia.numero || '' }}</b>
            <button v-for="evento in dia.eventos" :key="evento._id" type="button" class="gc-eventito" @click="editarCalendario(evento)">{{ evento.titulo }}</button>
          </div>
        </div>
        <h2>Actividades de {{ nombreMes }}</h2>
        <div class="gc-tabla-wrap"><table class="gc-tabla"><thead><tr><th>Inicio</th><th>Actividad</th><th>Tipo</th><th>Lugar</th><th>Acciones</th></tr></thead><tbody>
          <tr v-for="evento in eventosDelMes" :key="evento._id"><td>{{ fechaHora(evento.fechaInicio) }}</td><td><strong>{{ evento.titulo }}</strong><p>{{ evento.descripcion }}</p></td><td>{{ evento.tipo }}</td><td>{{ evento.lugar || '—' }}</td>
            <td><button type="button" class="gc-link" @click="editarCalendario(evento)">Editar</button><button type="button" class="gc-link gc-peligro" @click="borrarCalendario(evento)">Eliminar</button></td></tr>
          <tr v-if="!eventosDelMes.length"><td colspan="5" class="gc-vacio">No hay actividades programadas este mes.</td></tr>
        </tbody></table></div>
      </template>
    </template>

    <!-- Detalle de excusa: consulta, modificación, aprobación y eliminación. -->
    <div v-if="detalleExcusa" class="gc-modal-fondo" @click.self="detalleExcusa = null">
      <section class="gc-modal" role="dialog" aria-modal="true" aria-label="Detalle de la excusa">
        <header><h2>Detalle de la excusa</h2><button class="gc-cerrar" type="button" @click="detalleExcusa = null">×</button></header>
        <dl class="gc-detalles"><dt>Docente</dt><dd>{{ nombrePersona(detalleExcusa.docenteId) }}</dd><dt>Fechas</dt><dd>{{ fecha(detalleExcusa.fechaInicio) }} a {{ fecha(detalleExcusa.fechaFin) }}</dd>
          <dt>Motivo</dt><dd>{{ detalleExcusa.motivo }}</dd>
          <dt>Días de ausencia</dt><dd>{{ detalleExcusa.diasAusente ?? '—' }}</dd>
          <dt>Año académico</dt><dd>{{ detalleExcusa.anioAcademicoId?.anio || '—' }}</dd>
          <dt>Estado</dt><dd>{{ detalleExcusa.estado }}</dd>
          <dt>Revisado por</dt><dd>{{ detalleExcusa.aprobadoPor ? nombrePersona(detalleExcusa.aprobadoPor) : 'Sin revisar' }}</dd>
          <dt>Revisado en</dt><dd>{{ detalleExcusa.aprobadoEn ? fechaHora(detalleExcusa.aprobadoEn) : '—' }}</dd>
          <dt>Observaciones</dt><dd>{{ detalleExcusa.observaciones || 'Sin observaciones' }}</dd><dt>Soporte</dt><dd><a v-if="urlSoporte(detalleExcusa.soporteDocumental)" :href="urlSoporte(detalleExcusa.soporteDocumental)" target="_blank" rel="noopener noreferrer">Abrir soporte</a><span v-else>{{ detalleExcusa.soporteDocumental || 'Sin soporte' }}</span></dd>
        </dl>
        <p v-if="error" role="alert" class="gc-alerta gc-error">{{ error }}</p>
        <label class="gc-campo">Observaciones de revisión <textarea v-model="observacionRevision" rows="2" placeholder="Observaciones para el docente" /></label>
        <div class="gc-acciones">
          <button v-if="seccion === 'excusas-docentes'" class="gc-btn gc-secundario" type="button" @click="editarExcusa(detalleExcusa)">Editar</button>
          <button v-if="seccion === 'excusas-docentes'" class="gc-btn gc-primario" type="button" :disabled="guardando" @click="cambiarEstadoExcusa('aprobada')">Aprobar</button>
          <button v-if="seccion === 'excusas-docentes'" class="gc-btn gc-peligro-btn" type="button" :disabled="guardando" @click="cambiarEstadoExcusa('rechazada')">Rechazar</button>
          <button class="gc-btn gc-secundario" type="button" @click="detalleExcusa = null">Cerrar</button>
        </div>
      </section>
    </div>

    <!-- Formulario excusas -->
    <div v-if="formulario === 'excusa'" class="gc-modal-fondo" @click.self="formulario = ''">
      <section class="gc-modal" role="dialog" aria-modal="true" aria-label="Formulario de excusa">
        <header><h2>{{ idEditando ? 'Editar' : 'Registrar' }} excusa docente</h2><button class="gc-cerrar" type="button" @click="formulario = ''">×</button></header>
        <p v-if="error" role="alert" class="gc-alerta gc-error">{{ error }}</p>
        <form @submit.prevent="guardarExcusa">
          <label class="gc-campo">Docente
            <select v-model="formExcusa.docenteId" required><option value="">Seleccionar docente</option><option v-for="docente in docentes" :key="docente._id" :value="docente._id">{{ nombrePersona(docente) }}</option></select>
          </label>
          <label class="gc-campo">Año académico <select v-model="formExcusa.anioAcademicoId" required><option value="">Seleccionar año</option><option v-for="anio in anios" :key="anio._id" :value="anio._id">{{ anio.anio }}</option></select></label>
          <div class="gc-form-grid"><label class="gc-campo">Fecha de inicio <input v-model="formExcusa.fechaInicio" type="date" required /></label>
            <label class="gc-campo">Fecha final <input v-model="formExcusa.fechaFin" type="date" :min="formExcusa.fechaInicio" required /></label></div>
          <label class="gc-campo">Motivo <textarea v-model.trim="formExcusa.motivo" required rows="3" /></label>
          <label class="gc-campo">Enlace o ruta de soporte (opcional) <input v-model.trim="formExcusa.soporteDocumental" placeholder="https://…" /></label>
          <label class="gc-check"><input v-model="formExcusa.sinSoporte" type="checkbox" /> La excusa no tiene soporte</label>
          <div class="gc-acciones"><button class="gc-btn gc-secundario" type="button" @click="formulario = ''">Cancelar</button><button class="gc-btn gc-primario" type="submit" :disabled="guardando">{{ guardando ? 'Guardando…' : 'Guardar excusa' }}</button></div>
        </form>
      </section>
    </div>

    <!-- Formulario eventos electorales -->
    <div v-if="formulario === 'evento'" class="gc-modal-fondo" @click.self="formulario = ''">
      <section class="gc-modal" role="dialog" aria-modal="true" aria-label="Formulario de evento electoral">
        <header><h2>{{ idEditando ? 'Editar' : 'Nuevo' }} evento electoral</h2><button type="button" class="gc-cerrar" @click="formulario = ''">×</button></header>
        <p v-if="error" role="alert" class="gc-alerta gc-error">{{ error }}</p>
        <form @submit.prevent="guardarEvento">
          <label class="gc-campo">Nombre <input v-model.trim="formEvento.titulo" required maxlength="140" /></label>
          <label class="gc-campo">Descripción <textarea v-model.trim="formEvento.descripcion" rows="2" /></label>
          <div class="gc-form-grid"><label class="gc-campo">Inicio <input v-model="formEvento.fechaInicio" type="datetime-local" required /></label><label class="gc-campo">Finalización <input v-model="formEvento.fechaFin" type="datetime-local" required /></label></div>
          <label class="gc-campo">Estado <select v-model="formEvento.estado"><option value="programado">Programado</option><option value="en_curso">En curso (habilita votos)</option><option value="finalizado">Finalizado</option></select></label>
          <label class="gc-campo">Cargos (separados por coma) <input v-model="formEvento.cargos" required placeholder="Personería, Contraloría" /></label>
          <div class="gc-acciones"><button class="gc-btn gc-secundario" type="button" @click="formulario = ''">Cancelar</button><button type="submit" class="gc-btn gc-primario" :disabled="guardando">Guardar evento</button></div>
        </form>
      </section>
    </div>

    <!-- Formulario candidatos -->
    <div v-if="formulario === 'candidato'" class="gc-modal-fondo" @click.self="formulario = ''">
      <section class="gc-modal" role="dialog" aria-modal="true" aria-label="Formulario de candidato">
        <header><h2>{{ idEditando ? 'Editar' : 'Nuevo' }} candidato</h2><button type="button" class="gc-cerrar" @click="formulario = ''">×</button></header>
        <p v-if="error" role="alert" class="gc-alerta gc-error">{{ error }}</p>
        <form @submit.prevent="guardarCandidato">
          <label class="gc-campo">Estudiante <select v-model="formCandidato.estudianteId" required><option value="">Seleccionar estudiante matriculado</option><option v-for="item in estudiantesUnicos" :key="item._id" :value="item._id">{{ nombrePersona(item) }}</option></select></label>
          <label class="gc-campo">Cargo <select v-model="formCandidato.cargo" required><option value="">Seleccionar cargo</option><option v-for="cargo in eventoActual?.cargosDisponibles || []" :key="cargo" :value="cargo">{{ cargo }}</option></select></label>
          <label class="gc-campo">Número en tarjetón <input v-model.number="formCandidato.numero" type="number" min="1" /></label>
          <label class="gc-campo">Propuesta <textarea v-model.trim="formCandidato.propuesta" rows="3" /></label>
          <div class="gc-acciones"><button class="gc-btn gc-secundario" type="button" @click="formulario = ''">Cancelar</button><button type="submit" class="gc-btn gc-primario" :disabled="guardando">Guardar candidato</button></div>
        </form>
      </section>
    </div>

    <!-- Formulario actividad institucional -->
    <div v-if="formulario === 'calendario'" class="gc-modal-fondo" @click.self="formulario = ''">
      <section class="gc-modal" role="dialog" aria-modal="true" aria-label="Formulario de actividad institucional">
        <header><h2>{{ idEditando ? 'Editar' : 'Nueva' }} actividad</h2><button type="button" class="gc-cerrar" @click="formulario = ''">×</button></header>
        <p v-if="error" role="alert" class="gc-alerta gc-error">{{ error }}</p>
        <form @submit.prevent="guardarCalendario">
          <label class="gc-campo">Título <input v-model.trim="formCalendario.titulo" required maxlength="140" /></label>
          <label class="gc-campo">Descripción <textarea v-model.trim="formCalendario.descripcion" rows="2" /></label>
          <div class="gc-form-grid"><label class="gc-campo">Inicio <input v-model="formCalendario.fechaInicio" type="datetime-local" required /></label><label class="gc-campo">Fin <input v-model="formCalendario.fechaFin" type="datetime-local" required /></label></div>
          <label class="gc-campo">Tipo <select v-model="formCalendario.tipo"><option value="academica">Académica</option><option value="reunion">Reunión</option><option value="convivencia">Convivencia</option><option value="eleccion">Elección</option><option value="otra">Otra</option></select></label>
          <label class="gc-campo">Lugar <input v-model.trim="formCalendario.lugar" maxlength="160" /></label>
          <div class="gc-acciones"><button class="gc-btn gc-secundario" type="button" @click="formulario = ''">Cancelar</button><button class="gc-btn gc-primario" type="submit" :disabled="guardando">Guardar actividad</button></div>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import api, { urlPublica } from '@/services/api'

const props = defineProps({ seccion: { type: String, required: true } })
const metadatos = {
  'excusas-docentes': ['Gestión', 'Excusas docentes', 'Registra, consulta y revisa las ausencias justificadas de los docentes.'],
  'certificados': ['Gestión', 'Certificados', 'Genera certificados académicos PDF de estudiantes reales.'],
  'constancias': ['Gestión', 'Constancias', 'Expide constancias desde la matrícula y el historial académico.'],
  'candidatos': ['Elecciones', 'Candidatos', 'Administra los candidatos de cada evento electoral.'],
  'eventos-electorales': ['Elecciones', 'Eventos electorales', 'Crea y administra procesos de votación institucionales.'],
  'permisos': ['Elecciones', 'Permisos de votación', 'Selecciona los grupos habilitados y la publicación de resultados por evento.'],
  'resultados': ['Elecciones', 'Resultados', 'Consulta los votos reales de cada elección.'],
  'boletin-estudiante': ['Informes', 'Boletín del estudiante', 'Genera el boletín PDF según la matrícula y el período seleccionado.'],
  'listados': ['Informes', 'Listados varios', 'Consulta y exporta datos institucionales reales en CSV.'],
  'informe-excusas': ['Informes', 'Informe de excusas', 'Consulta el consolidado de excusas y descarga su relación.'],
  'bitacora': ['Otros', 'Bitácora', 'Consulta el registro real de acciones del sistema.'],
  'cronograma': ['Otros', 'Cronograma', 'Programa actividades y reuniones institucionales.']
}
const metadata = computed(() => metadatos[props.seccion] || ['Gestión', props.seccion, ''])
const categoria = computed(() => metadata.value[0])
const titulo = computed(() => metadata.value[1])
const descripcion = computed(() => metadata.value[2])
const cargando = ref(false), guardando = ref(false), generandoPDF = ref(false), error = ref(''), mensaje = ref('')
const excusas = ref([]), docentes = ref([]), anios = ref([]), matriculas = ref([]), grupos = ref([]), calificaciones = ref([]), bitacora = ref([]), eventos = ref([]), calendario = ref([])
const buscarExcusa = ref(''), estadoFiltro = ref(''), anioFiltro = ref('')
const detalleExcusa = ref(null), observacionRevision = ref('')
const formulario = ref(''), idEditando = ref('')
const formExcusa = ref({}), formEvento = ref({}), formCandidato = ref({}), formCalendario = ref({})
const matriculaSeleccionada = ref(''), tipoDocumento = ref('certificado-notas'), periodoBoletin = ref(1)
const eventoSeleccionado = ref(''), todosGrupos = ref(true), gruposHabilitados = ref([]), resultadosPublicos = ref(true)
const resultados = ref(null), cargandoResultados = ref(false)
const tipoListado = ref('estudiantes'), buscarBitacora = ref('')
const mesVisible = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1))

const idDe = (obj) => String(typeof obj === 'object' && obj !== null ? (obj._id || '') : (obj || ''))
const arreglo = (respuesta, llave) => Array.isArray(respuesta) ? respuesta : (respuesta?.[llave] || [])
const nombrePersona = (p) => {
  if (!p) return 'Sin registrar'
  if (typeof p === 'string') return 'ID ' + p
  return `${p.nombres || ''} ${p.apellidos || ''}`.trim() || p.usuario || p.nombre || 'Sin registrar'
}
const fecha = (d) => d ? new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }) : '—'
const fechaHora = (d) => d ? new Date(d).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
const fechaInput = (d) => d ? new Date(d).toISOString().slice(0, 10) : ''
const fechaHoraInput = (d) => {
  if (!d) return ''
  const dt = new Date(d), local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}
const errorApi = (e) => e?.response?.data?.mensaje || e?.response?.data?.error || e?.message || 'No se pudo completar la operación.'
const urlSoporte = (soporte) => {
  if (!soporte) return ''
  if (/^https:\/\/[^\s]+$/i.test(soporte)) return soporte
  if (/^\/uploads\/[\w./%-]+$/i.test(soporte) && !soporte.includes('..')) return urlPublica(soporte)
  return ''
}

const buscarTodosUsuarios = async (tipoPerfil) => {
  let lista = [], pagina = 1, paginas = 1
  do {
    const { data } = await api.get('/usuarios', { params: { tipoPerfil, pagina, limite: 100 } })
    lista = lista.concat(arreglo(data, 'usuarios'))
    paginas = Math.min(Number(data.totalPaginas) || 1, 50)
    pagina += 1
  } while (pagina <= paginas)
  return lista
}
const cargarBase = async () => {
  const [rAnios, rMatriculas, rGrupos] = await Promise.all([
    api.get('/anios-academicos'), api.get('/matriculas'), api.get('/grupos')
  ])
  anios.value = arreglo(rAnios.data, 'aniosAcademicos')
  matriculas.value = arreglo(rMatriculas.data, 'matriculas')
  grupos.value = arreglo(rGrupos.data, 'grupos')
  const activo = anios.value.find(a => a.estado === 'activo') || anios.value.slice().sort((a,b) => b.anio-a.anio)[0]
  if (activo && !anioFiltro.value) anioFiltro.value = activo._id
}
const cargar = async () => {
  cargando.value = true; error.value = ''; mensaje.value = ''
  try {
    if (['excusas-docentes', 'informe-excusas'].includes(props.seccion)) {
      await cargarBase()
      const peticiones = [api.get('/excusas')]
      if (props.seccion === 'excusas-docentes') peticiones.push(buscarTodosUsuarios('docente'))
      const [rExcusas, rDocentes] = await Promise.all(peticiones)
      excusas.value = arreglo(rExcusas.data, 'excusas')
      if (rDocentes) docentes.value = rDocentes
    } else if (['certificados', 'constancias', 'boletin-estudiante'].includes(props.seccion)) {
      await cargarBase()
      tipoDocumento.value = props.seccion === 'certificados' ? 'certificado-notas' : 'constancia-estudio'
    } else if (['candidatos', 'eventos-electorales', 'permisos', 'resultados'].includes(props.seccion)) {
      await cargarBase()
      const { data } = await api.get('/eventos-electorales')
      eventos.value = arreglo(data, 'eventos')
      if (!eventos.value.some(e => e._id === eventoSeleccionado.value)) eventoSeleccionado.value = eventos.value[0]?._id || ''
      if (props.seccion === 'resultados') await cargarResultados()
    } else if (props.seccion === 'listados') {
      await cargarBase()
      const [rNotas, rBitacora] = await Promise.all([api.get('/calificaciones'), api.get('/bitacora?limite=500')])
      calificaciones.value = arreglo(rNotas.data, 'calificaciones')
      bitacora.value = arreglo(rBitacora.data, 'registros')
    } else if (props.seccion === 'bitacora') {
      const { data } = await api.get('/bitacora?limite=500')
      bitacora.value = arreglo(data, 'registros')
    } else if (props.seccion === 'cronograma') {
      const { data } = await api.get('/eventos-calendario')
      calendario.value = arreglo(data, 'eventos')
    }
  } catch (e) { error.value = errorApi(e) }
  finally { cargando.value = false }
}
watch(() => props.seccion, cargar, { immediate: true })
const ejecutar = async (accion, ok, recargar = true) => {
  if (guardando.value) return
  guardando.value = true; error.value = ''; mensaje.value = ''
  try { await accion(); formulario.value = ''; detalleExcusa.value = null
    if (recargar) await cargar()
    mensaje.value = ok
  } catch (e) { error.value = errorApi(e) }
  finally { guardando.value = false }
}

const excusasFiltradas = computed(() => excusas.value.filter(e => {
  const texto = `${nombrePersona(e.docenteId)} ${e.motivo || ''} ${e.docenteId?.documento || ''}`.toLowerCase()
  return (!buscarExcusa.value || texto.includes(buscarExcusa.value.toLowerCase())) &&
    (!estadoFiltro.value || e.estado === estadoFiltro.value) &&
    (!anioFiltro.value || idDe(e.anioAcademicoId) === anioFiltro.value)
}).sort((a,b) => new Date(b.fechaInicio) - new Date(a.fechaInicio)))
const contarEstado = (estado) => excusasFiltradas.value.filter(e => e.estado === estado).length
watch(detalleExcusa, e => { observacionRevision.value = e?.observaciones || '' })
const nuevaExcusa = () => {
  error.value = ''; idEditando.value = ''
  formExcusa.value = { docenteId: '', anioAcademicoId: anioFiltro.value, fechaInicio: fechaInput(new Date()), fechaFin: fechaInput(new Date()), motivo: '', soporteDocumental: '', sinSoporte: false }
  formulario.value = 'excusa'
}
const editarExcusa = (excusa) => {
  error.value = ''; idEditando.value = excusa._id
  formExcusa.value = { docenteId: idDe(excusa.docenteId), anioAcademicoId: idDe(excusa.anioAcademicoId), fechaInicio: fechaInput(excusa.fechaInicio), fechaFin: fechaInput(excusa.fechaFin), motivo: excusa.motivo, soporteDocumental: excusa.soporteDocumental || '', sinSoporte: !!excusa.sinSoporte }
  detalleExcusa.value = null; formulario.value = 'excusa'
}
const guardarExcusa = async () => {
  if (!formExcusa.value.docenteId || !formExcusa.value.anioAcademicoId || !formExcusa.value.motivo?.trim()) { error.value = 'Completa todos los campos obligatorios.'; return }
  if (formExcusa.value.fechaFin < formExcusa.value.fechaInicio) { error.value = 'La fecha final no puede ser anterior a la inicial.'; return }
  const datos = { ...formExcusa.value, fechaInicio: `${formExcusa.value.fechaInicio}T12:00:00.000Z`, fechaFin: `${formExcusa.value.fechaFin}T12:00:00.000Z` }
  await ejecutar(() => idEditando.value ? api.put(`/excusas/${idEditando.value}`, datos) : api.post('/excusas', datos), 'Excusa guardada correctamente.')
}
const borrarExcusa = async (excusa) => {
  if (!window.confirm(`¿Eliminar la excusa de ${nombrePersona(excusa.docenteId)}? Esta acción no se puede deshacer.`)) return
  await ejecutar(() => api.delete(`/excusas/${excusa._id}`), 'Excusa eliminada.')
}
const cambiarEstadoExcusa = async (estado) => {
  const excusa = detalleExcusa.value
  if (!excusa) return
  await ejecutar(() => api.put(`/excusas/${excusa._id}`, { estado, observaciones: observacionRevision.value }), `Excusa ${estado}.`)
}

const matriculasOrdenadas = computed(() => matriculas.value.filter(m => m.estudianteId && m.estado === 'activa').sort((a,b) => nombrePersona(a.estudianteId).localeCompare(nombrePersona(b.estudianteId))))
const matriculaDocumento = computed(() => matriculasOrdenadas.value.find(m => m._id === matriculaSeleccionada.value) || null)
const rutaDocumento = () => {
  const m = matriculaDocumento.value
  if (!m) return ''
  const matricula = encodeURIComponent(m._id), usuario = encodeURIComponent(idDe(m.estudianteId))
  if (props.seccion === 'boletin-estudiante') return `/reportes/boletin/${matricula}/${periodoBoletin.value}`
  const rutas = {
    'certificado-notas': `/reportes/certificado-notas/${matricula}`,
    'certificado-personal': `/documentos/certificado/${usuario}`,
    'constancia-estudio': `/reportes/constancia/${matricula}`,
    'constancia-notas': `/reportes/constancia-notas/${matricula}`,
    'constancia-general': `/documentos/constancia/${usuario}`
  }
  return rutas[tipoDocumento.value] || ''
}
const generarPDF = async (previa) => {
  const ruta = rutaDocumento()
  if (!ruta || generandoPDF.value) return
  error.value = ''; generandoPDF.value = true
  // Abrir ventana de inmediato (gesto de usuario), para que el navegador no bloquee la vista previa.
  const ventana = previa ? window.open('', '_blank') : null
  try {
    const respuesta = await api.get(ruta, { responseType: 'blob' })
    const blob = respuesta.data
    if (!/application\/pdf/i.test(blob.type || respuesta.headers?.['content-type'] || '')) {
      const contenido = await blob.text()
      let detalle = contenido
      try { detalle = JSON.parse(contenido).mensaje || contenido } catch {}
      throw new Error(detalle || 'El servidor no devolvió un PDF.')
    }
    const url = URL.createObjectURL(blob)
    if (previa && ventana) { ventana.location.href = url }
    else {
      const a = document.createElement('a'); a.href = url
      a.download = `${props.seccion}-${nombrePersona(matriculaDocumento.value.estudianteId).replace(/[^a-záéíóúñ0-9]+/gi, '_')}.pdf`
      document.body.appendChild(a); a.click(); a.remove()
      if (ventana) ventana.close()
    }
    window.setTimeout(() => URL.revokeObjectURL(url), 120000)
    await api.post('/bitacora', { accion: 'generar_documento', coleccion: 'Documentos', detalle: `${props.seccion}: ${nombrePersona(matriculaDocumento.value.estudianteId)}` }).catch(() => {})
    mensaje.value = previa && ventana ? 'Vista previa generada.' : 'PDF descargado.'
  } catch (e) { if (ventana) ventana.close(); error.value = errorApi(e) }
  finally { generandoPDF.value = false }
}

const eventoActual = computed(() => eventos.value.find(e => e._id === eventoSeleccionado.value) || null)
watch(eventoActual, evento => {
  todosGrupos.value = !evento?.gruposHabilitados?.length
  gruposHabilitados.value = (evento?.gruposHabilitados || []).map(idDe)
  resultadosPublicos.value = evento?.resultadosPublicos !== false
})
watch(eventoSeleccionado, () => { resultados.value = null; if (props.seccion === 'resultados') cargarResultados() })
const candidatosLimpios = (lista) => (lista || []).map(c => ({
  ...(c._id ? { _id: c._id } : {}), estudianteId: idDe(c.estudianteId), cargo: c.cargo,
  numero: c.numero || undefined, propuesta: c.propuesta || '', foto: c.foto || ''
}))
const nuevoEvento = () => {
  error.value = ''; idEditando.value = ''
  const ahora = new Date(), fin = new Date(ahora.getTime() + 60*60*1000)
  formEvento.value = { titulo: '', descripcion: '', fechaInicio: fechaHoraInput(ahora), fechaFin: fechaHoraInput(fin), estado: 'programado', cargos: 'Personería estudiantil' }
  formulario.value = 'evento'
}
const editarEvento = (e) => {
  error.value = ''; idEditando.value = e._id
  formEvento.value = { titulo: e.titulo, descripcion: e.descripcion || '', fechaInicio: fechaHoraInput(e.fechaInicio), fechaFin: fechaHoraInput(e.fechaFin), estado: e.estado, cargos: (e.cargosDisponibles || []).join(', ') }
  formulario.value = 'evento'
}
const guardarEvento = async () => {
  const f = formEvento.value
  if (new Date(f.fechaFin) < new Date(f.fechaInicio)) { error.value = 'El fin no puede ser anterior al inicio.'; return }
  const cargosDisponibles = Array.from(new Set(f.cargos.split(',').map(s => s.trim()).filter(Boolean)))
  if (!cargosDisponibles.length) { error.value = 'Especifica al menos un cargo.'; return }
  if (idEditando.value && eventoActual.value?.candidatos?.some(c => !cargosDisponibles.includes(c.cargo))) {
    error.value = 'No puedes eliminar un cargo con candidatos inscritos. Retíralos primero.'; return
  }
  const datos = { titulo: f.titulo, descripcion: f.descripcion, fechaInicio: new Date(f.fechaInicio).toISOString(), fechaFin: new Date(f.fechaFin).toISOString(), estado: f.estado, cargosDisponibles }
  await ejecutar(() => idEditando.value ? api.put(`/eventos-electorales/${idEditando.value}`, datos) : api.post('/eventos-electorales', datos), 'Evento electoral guardado.')
}
const borrarEvento = async (e) => {
  if (!window.confirm(`¿Eliminar «${e.titulo}»? Se perderán sus candidatos y ajustes.`)) return
  await ejecutar(() => api.delete(`/eventos-electorales/${e._id}`), 'Evento eliminado.')
}
const estudiantesUnicos = computed(() => {
  const ids = new Set()
  return matriculas.value.filter(m => m.estado === 'activa' && m.estudianteId && !ids.has(idDe(m.estudianteId)) && ids.add(idDe(m.estudianteId))).map(m => m.estudianteId)
})
const nuevoCandidato = () => { error.value = ''; idEditando.value = ''; formCandidato.value = { estudianteId: '', cargo: eventoActual.value?.cargosDisponibles?.[0] || '', numero: 1, propuesta: '' }; formulario.value = 'candidato' }
const editarCandidato = (c) => { error.value = ''; idEditando.value = c._id; formCandidato.value = { estudianteId: idDe(c.estudianteId), cargo: c.cargo, numero: c.numero || 1, propuesta: c.propuesta || '' }; formulario.value = 'candidato' }
const guardarCandidato = async () => {
  const e = eventoActual.value, f = formCandidato.value
  if (!e) return
  const lista = candidatosLimpios(e.candidatos).filter(c => String(c._id) !== String(idEditando.value))
  if (lista.some(c => c.estudianteId === f.estudianteId && c.cargo === f.cargo)) { error.value = 'Este estudiante ya es candidato para ese cargo.'; return }
  lista.push({ ...(idEditando.value ? { _id: idEditando.value } : {}), estudianteId: f.estudianteId, cargo: f.cargo, numero: Number(f.numero) || undefined, propuesta: f.propuesta })
  await ejecutar(() => api.put(`/eventos-electorales/${e._id}`, { candidatos: lista }), 'Candidato guardado.')
}
const borrarCandidato = async (c) => {
  if (!window.confirm(`¿Retirar a ${nombrePersona(c.estudianteId)} de este evento?`)) return
  const e = eventoActual.value
  await ejecutar(() => api.put(`/eventos-electorales/${e._id}`, { candidatos: candidatosLimpios(e.candidatos).filter(x => String(x._id) !== String(c._id)) }), 'Candidato retirado.')
}
const guardarPermisos = async () => {
  const e = eventoActual.value
  if (!e) return
  if (!todosGrupos.value && !gruposHabilitados.value.length) { error.value = 'Selecciona algún grupo o marca “Todos”. Para suspender la votación, cambia el estado del evento.'; return }
  await ejecutar(() => api.put(`/eventos-electorales/${e._id}`, { gruposHabilitados: todosGrupos.value ? [] : gruposHabilitados.value, resultadosPublicos: resultadosPublicos.value }), 'Permisos actualizados.')
}
const cargarResultados = async () => {
  if (!eventoSeleccionado.value) { resultados.value = null; return }
  cargandoResultados.value = true
  try { const { data } = await api.get(`/votos/resultados/${eventoSeleccionado.value}`); resultados.value = data }
  catch (e) { error.value = errorApi(e); resultados.value = null }
  finally { cargandoResultados.value = false }
}
const nombreCandidatoResultado = (c) => {
  const encontrado = eventoActual.value?.candidatos?.find(x => idDe(x._id) === idDe(c.candidatoId))
  return nombrePersona(encontrado?.estudianteId || c.estudianteId)
}

const bitacoraFiltrada = computed(() => bitacora.value.filter(b => `${b.accion} ${b.detalle || ''} ${nombrePersona(b.usuarioId)}`.toLowerCase().includes(buscarBitacora.value.toLowerCase())))
const listadoColumnas = computed(() => ({
  estudiantes: ['Estudiante', 'Documento', 'Grupo', 'Año', 'Estado'],
  grupos: ['Grupo', 'Grado', 'Estado'],
  calificaciones: ['Estudiante', 'Asignatura', 'Período', 'Definitiva'],
  documentos: ['Fecha', 'Usuario', 'Detalle']
})[tipoListado.value] || [])
const listadoFilas = computed(() => {
  if (tipoListado.value === 'estudiantes') return matriculas.value.map(m => [nombrePersona(m.estudianteId), m.estudianteId?.documento || '', m.grupoId?.nombre || '', m.anioAcademicoId?.anio || '', m.estado])
  if (tipoListado.value === 'grupos') return grupos.value.map(g => [g.nombre, g.grado || '', g.estado || ''])
  if (tipoListado.value === 'calificaciones') return calificaciones.value.map(c => [nombrePersona(c.estudianteId), c.asignaturaId?.nombre || '', c.periodo || '', c.nota ?? 'Pendiente'])
  return bitacora.value.filter(b => b.accion === 'generar_documento').map(b => [fechaHora(b.createdAt), nombrePersona(b.usuarioId), b.detalle || ''])
})
const descargarCSV = (nombre, columnas, filas) => {
  const seguro = (v) => {
    let texto = String(v ?? '').replace(/\r?\n/g, ' ')
    if (/^[\s]*[=+@\-\t\r]/.test(texto)) texto = "'" + texto
    return `"${texto.replace(/"/g, '""')}"`
  }
  const csv = '\uFEFF' + [columnas, ...filas].map(fila => fila.map(seguro).join(';')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a'); a.href = url; a.download = `${nombre}.csv`; document.body.appendChild(a); a.click(); a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 120000)
}
const exportarListado = () => descargarCSV(`listado_${tipoListado.value}`, listadoColumnas.value, listadoFilas.value)
const exportarExcusas = () => descargarCSV('informe_excusas', ['Docente','Inicio','Fin','Motivo','Estado','Observaciones'],
  excusasFiltradas.value.map(e => [nombrePersona(e.docenteId), fecha(e.fechaInicio), fecha(e.fechaFin), e.motivo, e.estado, e.observaciones || '']))

const nombreMes = computed(() => new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(mesVisible.value))
const moverMes = (n) => { mesVisible.value = new Date(mesVisible.value.getFullYear(), mesVisible.value.getMonth()+n, 1) }
const eventosDelMes = computed(() => calendario.value.filter(e => {
  const d = new Date(e.fechaInicio)
  return d.getFullYear() === mesVisible.value.getFullYear() && d.getMonth() === mesVisible.value.getMonth()
}).sort((a,b) => new Date(a.fechaInicio)-new Date(b.fechaInicio)))
const diasMes = computed(() => {
  const y = mesVisible.value.getFullYear(), m = mesVisible.value.getMonth()
  const primerDia = (new Date(y,m,1).getDay()+6)%7
  const cantidad = new Date(y,m+1,0).getDate()
  const dias = Array.from({ length: primerDia }, () => ({ numero: null, eventos: [] }))
  for (let n=1; n<=cantidad; n++) dias.push({ numero: n, eventos: eventosDelMes.value.filter(e => new Date(e.fechaInicio).getDate() === n) })
  return dias
})
const nuevoCalendario = () => {
  error.value = ''; idEditando.value = ''
  const fechaBase = new Date(mesVisible.value.getFullYear(), mesVisible.value.getMonth(), Math.min(new Date().getDate(),28), 8)
  formCalendario.value = { titulo:'', descripcion:'', tipo:'academica', lugar:'', fechaInicio: fechaHoraInput(fechaBase), fechaFin: fechaHoraInput(new Date(fechaBase.getTime()+3600000)) }
  formulario.value = 'calendario'
}
const editarCalendario = e => {
  error.value = ''; idEditando.value = e._id
  formCalendario.value = { titulo: e.titulo, descripcion: e.descripcion || '', tipo: e.tipo || 'academica', lugar: e.lugar || '', fechaInicio: fechaHoraInput(e.fechaInicio), fechaFin: fechaHoraInput(e.fechaFin) }
  formulario.value = 'calendario'
}
const guardarCalendario = async () => {
  const f = formCalendario.value
  if (new Date(f.fechaFin) < new Date(f.fechaInicio)) { error.value = 'La fecha final no puede ser anterior a la inicial.'; return }
  const datos = { ...f, fechaInicio: new Date(f.fechaInicio).toISOString(), fechaFin: new Date(f.fechaFin).toISOString() }
  await ejecutar(() => idEditando.value ? api.put(`/eventos-calendario/${idEditando.value}`, datos) : api.post('/eventos-calendario', datos), 'Actividad guardada.')
}
const borrarCalendario = async e => {
  if (!window.confirm(`¿Eliminar la actividad «${e.titulo}»?`)) return
  await ejecutar(() => api.delete(`/eventos-calendario/${e._id}`), 'Actividad eliminada.')
}
</script>

<style scoped>
.gestion-coordinador { color:#172b4d; width:100%; font-size:14px; }
.gestion-encabezado { display:flex; justify-content:space-between; align-items:center; gap:16px; margin-bottom:22px; }
.gestion-encabezado h1 { font-size:26px; font-weight:750; color:#1943b2; margin:4px 0 8px; }
.gestion-encabezado p { color:#687793; margin:0; }
.gestion-etiqueta { color:#2563eb; font-size:12px; text-transform:uppercase; font-weight:750; letter-spacing:.08em; }
.gc-acciones { display:flex; flex-wrap:wrap; align-items:end; gap:10px; margin:14px 0; }
.gc-btn { border-radius:9px; cursor:pointer; padding:10px 14px; border:1px solid #cad5ed; font:inherit; font-weight:650; }
.gc-btn:disabled { opacity:.55; cursor:not-allowed; }
.gc-primario { background:#1d4ed8; border-color:#1d4ed8; color:white; }
.gc-secundario { background:white; color:#1e40af; }
.gc-peligro-btn { border-color:#efb7b7; color:#9e2424; background:#fff7f7; }
.gc-panel { background:white; border:1px solid #dfe7f3; border-radius:14px; padding:21px; margin-bottom:16px; box-shadow:0 2px 8px #122d5010; }
.gc-panel h2 { font-size:19px; margin:5px 0 10px; }
.gc-panel p { color:#697790; }
.gc-campo { display:flex; flex-direction:column; gap:6px; font-weight:650; color:#263d61; min-width:190px; margin-bottom:12px; }
.gc-campo input, .gc-campo select, .gc-campo textarea { background:white; color:#203658; min-height:39px; padding:9px; border-radius:8px; border:1px solid #cbd5e1; font:inherit; width:100%; box-sizing:border-box; }
.gc-crecer { flex:1; }
.gc-check { display:flex; gap:9px; align-items:center; margin:15px 0; cursor:pointer; }
.gc-check-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:0 15px; }
.gc-tabla-wrap { overflow-x:auto; background:white; border:1px solid #dce5f0; border-radius:12px; margin-top:14px; }
.gc-tabla { width:100%; border-collapse:collapse; min-width:660px; }
.gc-tabla th { text-align:left; background:#eef4ff; font-size:12px; color:#36548c; }
.gc-tabla th, .gc-tabla td { padding:13px; border-bottom:1px solid #e8ecf2; vertical-align:top; }
.gc-tabla tbody tr:last-child td { border-bottom:0; }
.gc-estado { display:inline-block; border-radius:99px; padding:4px 9px; background:#fff1cc; color:#885b0b; font-weight:600; text-transform:capitalize; }
.gc-estado.aprobada { color:#17613a; background:#dff7e8; }
.gc-estado.rechazada { color:#a52222; background:#ffe4e4; }
.gc-link { border:0; background:none; color:#1d4ed8; cursor:pointer; font-weight:650; margin-right:8px; }
.gc-peligro { color:#b42318; }
.gc-vacio { text-align:center; color:#697b96; padding:23px; }
.gc-alerta { padding:12px; border-radius:9px; margin-bottom:10px; }
.gc-error { background:#fff0f0; color:#a31a1a; }
.gc-exito { background:#eef9f1; color:#19643d; }
.gc-cargando { padding:35px; text-align:center; }
.gc-resumen { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:12px; margin:16px 0; }
.gc-resumen>div { background:white; padding:16px; border-radius:10px; border:1px solid #dfe7f3; display:flex; flex-direction:column; gap:6px; }
.gc-resumen strong { font-size:26px; }
.gc-resumen small { color:#697b96; }
.gc-form-docs { max-width:750px; }
.gc-ficha { padding:14px; border:1px solid #d9e5fa; border-radius:10px; margin:14px 0; display:flex; flex-direction:column; gap:6px; background:#f7faff; }
.gc-ayuda { font-size:12px; color:#71819a; }
.gc-tarjetas { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:16px; }
.gc-tarjetas>.gc-panel { margin:0; }
.gc-cargo { padding:15px 0; border-top:1px solid #e4eaf5; }
.gc-resultado { display:flex; justify-content:space-between; gap:20px; padding:10px 0; }
.gc-entrada { padding:13px 0; border-bottom:1px solid #edf0f5; display:flex; flex-direction:column; gap:5px; }
.gc-entrada span { color:#8290a4; font-size:12px; }
.gc-entrada p { margin:0; }
.gc-buscar { max-width:420px; }
.gc-mes { text-transform:capitalize; font-size:18px; margin:auto; }
.gc-calendario { display:grid; grid-template-columns:repeat(7,minmax(0,1fr)); gap:4px; margin:15px 0 25px; }
.gc-calendario>strong { text-align:center; padding:8px; color:#3056ad; }
.gc-dia { min-height:85px; padding:8px; border:1px solid #dde5f1; background:white; min-width:0; border-radius:7px; }
.gc-dia-vacio { background:#f5f6fa; }
.gc-eventito { display:block; width:100%; margin:3px 0; border:0; padding:4px; background:#eaf1ff; color:#24479a; border-radius:5px; font-size:11px; text-align:left; overflow-wrap:anywhere; cursor:pointer; }
.gc-modal-fondo { position:fixed; inset:0; z-index:1500; padding:20px; display:flex; align-items:center; justify-content:center; background:#101a35aa; }
.gc-modal { width:min(640px,100%); max-height:90vh; overflow-y:auto; background:white; border-radius:14px; padding:23px; box-shadow:0 20px 80px #0014; }
.gc-modal header { display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; }
.gc-modal h2 { margin:0; font-size:21px; color:#183d9e; }
.gc-cerrar { cursor:pointer; border:0; background:none; font-size:28px; color:#475569; }
.gc-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.gc-detalles { display:grid; grid-template-columns:120px 1fr; gap:12px; margin-bottom:20px; }
.gc-detalles dt { font-weight:700; }.gc-detalles dd { margin:0; overflow-wrap:anywhere; }
@media(max-width:650px) { .gestion-encabezado { align-items:start; flex-direction:column; } .gc-form-grid { grid-template-columns:1fr; } .gc-calendario>strong { font-size:10px; padding:3px; } .gc-dia { min-height:60px; padding:3px; } .gc-eventito { font-size:9px; } .gc-modal-fondo { padding:8px; } }
</style>
