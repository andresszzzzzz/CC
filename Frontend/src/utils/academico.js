// Utilidades para trabajar con calificaciones (escala 0.0 - 5.0, sistema colombiano)

// Clasifica una nota en una etiqueta + variante de color para el badge
export function clasificarNota(nota) {
  if (nota === null || nota === undefined || Number.isNaN(nota)) {
    return { texto: 'Sin nota', variante: 'bajo' };
  }
  if (nota >= 4.6) return { texto: 'Excelente', variante: 'excelente' };
  if (nota >= 4.1) return { texto: 'Muy Bueno', variante: 'muybueno' };
  if (nota >= 3.5) return { texto: 'Bueno', variante: 'bueno' };
  if (nota >= 3.0) return { texto: 'Aceptable', variante: 'bueno' };
  return { texto: 'Bajo', variante: 'bajo' };
}

// Nota final de una calificación: prioriza habilitación > recuperación > nota normal
export function notaFinal(calificacion) {
  if (typeof calificacion.habilitacion === 'number') return calificacion.habilitacion;
  if (typeof calificacion.recuperacion === 'number') return calificacion.recuperacion;
  return calificacion.nota ?? null;
}

// Promedio simple de un arreglo de calificaciones (ya filtradas por estudiante)
export function calcularPromedio(calificaciones) {
  const notas = calificaciones.map(notaFinal).filter((n) => typeof n === 'number');
  if (!notas.length) return null;
  const suma = notas.reduce((acc, n) => acc + n, 0);
  return Math.round((suma / notas.length) * 10) / 10;
}

// Agrupa calificaciones por asignatura y calcula el promedio de cada una
export function promediarPorAsignatura(calificaciones) {
  const grupos = new Map();

  calificaciones.forEach((cal) => {
    const asignatura = cal.asignaturaId;
    const id = typeof asignatura === 'object' ? asignatura?._id : asignatura;
    if (!id) return;

    if (!grupos.has(id)) {
      grupos.set(id, {
        asignaturaId: id,
        nombre: typeof asignatura === 'object' ? asignatura.nombre : 'Asignatura',
        docente: typeof cal.docenteId === 'object' ? cal.docenteId : null,
        calificaciones: []
      });
    }
    grupos.get(id).calificaciones.push(cal);
  });

  return Array.from(grupos.values()).map((g) => ({
    ...g,
    promedio: calcularPromedio(g.calificaciones)
  }));
}

// Formatea una fecha ISO a algo legible en español, ej: "22 may 2024"
export function formatearFecha(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Días restantes hasta una fecha límite (redondeado hacia arriba)
export function diasRestantes(fecha) {
  if (!fecha) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const limite = new Date(fecha);
  limite.setHours(0, 0, 0, 0);
  const diffMs = limite.getTime() - hoy.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

// Texto + color para "En X días" / "Vencida" / "Hoy"
export function etiquetaPlazo(fecha) {
  const dias = diasRestantes(fecha);
  if (dias === null) return { texto: '', variante: 'muted' };
  if (dias < 0) return { texto: 'Vencida', variante: 'rojo' };
  if (dias === 0) return { texto: 'Hoy', variante: 'rojo' };
  if (dias === 1) return { texto: 'En 1 día', variante: 'rojo' };
  if (dias <= 3) return { texto: `En ${dias} días`, variante: 'rojo' };
  if (dias <= 7) return { texto: `En ${dias} días`, variante: 'amarillo' };
  return { texto: `En ${dias} días`, variante: 'muted' };
}

// % de asistencia a partir de registros { estado: 'presente'|'tardanza'|'ausente'|'excusa' }.
// Presente y excusa cuentan completo, tardanza cuenta a mitad, ausente no suma.
export function calcularPorcentajeAsistencia(registros) {
  if (!registros.length) return null;
  let puntos = 0;
  registros.forEach((r) => {
    if (r.estado === 'presente' || r.estado === 'excusa') puntos += 1;
    else if (r.estado === 'tardanza') puntos += 0.5;
  });
  return Math.round((puntos / registros.length) * 100);
}
