// Motor de cálculo de notas. Lee la configuración de Secretaría: NO hay reglas fijas en el código.
export const CONFIG_CALIFICACION_DEFECTO = {
  escala: { min: 1, max: 5, decimales: 1, notaAprobatoria: 3 },
  rangos: [
    { nombre: 'Bajo', desde: 1, hasta: 2.9 }, { nombre: 'Básico', desde: 3, hasta: 3.9 },
    { nombre: 'Alto', desde: 4, hasta: 4.5 }, { nombre: 'Superior', desde: 4.6, hasta: 5 }
  ],
  metodo: 'ponderado', // 'simple' | 'ponderado'
  pesosActividad: [
    { nombre: 'Seguimiento (tareas, talleres)', porcentaje: 40 },
    { nombre: 'Evaluaciones', porcentaje: 40 },
    { nombre: 'Autoevaluación y actitud', porcentaje: 20 }
  ],
  pesosPeriodo: [ // orden del periodo -> % en la nota final
    { orden: 1, porcentaje: 25, incluir: true }, { orden: 2, porcentaje: 25, incluir: true },
    { orden: 3, porcentaje: 25, incluir: true }, { orden: 4, porcentaje: 25, incluir: true }
  ],
  notaFinal: { metodo: 'ponderado_periodos' }, // 'promedio_periodos' | 'ponderado_periodos'
  recuperacion: { habilitada: true, modo: 'reemplaza_si_mayor', notaMaxima: 3 } // reemplaza | reemplaza_si_mayor | promedia
}

export const mezclarConfig = (c = {}) => ({
  ...CONFIG_CALIFICACION_DEFECTO, ...c,
  escala: { ...CONFIG_CALIFICACION_DEFECTO.escala, ...(c.escala || {}) },
  notaFinal: { ...CONFIG_CALIFICACION_DEFECTO.notaFinal, ...(c.notaFinal || {}) },
  recuperacion: { ...CONFIG_CALIFICACION_DEFECTO.recuperacion, ...(c.recuperacion || {}) }
})

export function redondear(n, dec = 1) {
  const f = 10 ** dec
  return Math.round((Number(n) + Number.EPSILON) * f) / f
}
export const formatear = (n, cfg) => (n == null || isNaN(n) ? '—' : Number(n).toFixed(cfg.escala.decimales))
export const limitar = (n, cfg) => Math.min(cfg.escala.max, Math.max(cfg.escala.min, n))

export function desempeno(nota, cfg) {
  if (nota == null || isNaN(nota)) return ''
  const r = cfg.rangos.find((x) => nota >= x.desde - 1e-9 && nota <= x.hasta + 1e-9)
  return r ? r.nombre : ''
}
export const aprueba = (nota, cfg) => nota >= cfg.escala.notaAprobatoria

// actividades: [{ categoria: 'Evaluaciones', nota: 4.2 }, ...]
export function notaPeriodo(actividades, cfg) {
  const v = actividades.filter((a) => a.nota != null && !isNaN(a.nota))
  if (!v.length) return null
  let n
  if (cfg.metodo === 'simple') n = v.reduce((s, a) => s + Number(a.nota), 0) / v.length
  else {
    const grupos = {}
    v.forEach((a) => { (grupos[a.categoria] ||= []).push(Number(a.nota)) })
    let suma = 0, pesos = 0
    cfg.pesosActividad.forEach((p) => {
      const g = grupos[p.nombre]
      if (g?.length) { suma += (g.reduce((a, b) => a + b, 0) / g.length) * p.porcentaje; pesos += p.porcentaje }
    })
    n = pesos ? suma / pesos : null
  }
  return n == null ? null : redondear(limitar(n, cfg), cfg.escala.decimales)
}

export function aplicarRecuperacion(nota, recup, cfg) {
  const r = cfg.recuperacion
  if (!r.habilitada || recup == null || nota == null || aprueba(nota, cfg)) return nota
  const tope = Math.min(Number(recup), r.notaMaxima)
  if (r.modo === 'reemplaza') return tope
  if (r.modo === 'promedia') return redondear((nota + tope) / 2, cfg.escala.decimales)
  return Math.max(nota, tope)
}

// periodos: [{ orden, nota, recuperacion }]
export function notaFinalAnio(periodos, cfg) {
  const usados = periodos.filter((p) => p.nota != null && cfg.pesosPeriodo.find((x) => x.orden === p.orden)?.incluir !== false)
  if (!usados.length) return null
  const val = usados.map((p) => ({ ...p, n: aplicarRecuperacion(p.nota, p.recuperacion, cfg) }))
  let n
  if (cfg.notaFinal.metodo === 'promedio_periodos') n = val.reduce((s, p) => s + p.n, 0) / val.length
  else {
    let s = 0, w = 0
    val.forEach((p) => { const pe = cfg.pesosPeriodo.find((x) => x.orden === p.orden)?.porcentaje ?? 0; s += p.n * pe; w += pe })
    n = w ? s / w : null
  }
  return n == null ? null : redondear(limitar(n, cfg), cfg.escala.decimales)
}

// Validaciones para el formulario de Secretaría
export function validarConfig(c) {
  const e = []
  if (!(c.escala.min < c.escala.max)) e.push('La nota mínima debe ser menor que la máxima.')
  const rs = [...c.rangos].sort((a, b) => a.desde - b.desde)
  rs.forEach((r, i) => {
    if (!r.nombre) e.push('Todos los rangos necesitan nombre.')
    if (r.desde > r.hasta) e.push(`El rango "${r.nombre}" tiene el inicio mayor que el final.`)
    if (i && r.desde <= rs[i - 1].hasta) e.push(`Los rangos "${rs[i - 1].nombre}" y "${r.nombre}" se cruzan.`)
  })
  if (rs.length && (rs[0].desde > c.escala.min || rs.at(-1).hasta < c.escala.max)) e.push('Los rangos deben cubrir toda la escala (de la nota mínima a la máxima).')
  const sum = (a) => a.reduce((s, x) => s + Number(x.porcentaje || 0), 0)
  if (c.metodo === 'ponderado' && sum(c.pesosActividad) !== 100) e.push(`Los porcentajes por actividad suman ${sum(c.pesosActividad)}%; deben sumar 100%.`)
  if (c.notaFinal.metodo === 'ponderado_periodos' && sum(c.pesosPeriodo.filter((p) => p.incluir)) !== 100) e.push('Los porcentajes de los periodos incluidos deben sumar 100%.')
  return e
}
