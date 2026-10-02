// Generación de documentos en PDF (en el navegador). Requiere:  npm i jspdf jspdf-autotable
// Todos los documentos leen la MISMA configuración institucional: nombre, escudo, rector, firmas y escala de notas.
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { desempeno, formatear } from '@/utils/calificacion'

const AZUL = [30, 58, 138]
const GRIS = [100, 116, 139]

export async function urlADataUrl(url) {
  if (!url) return null
  if (url.startsWith('data:')) return url
  try {
    const blob = await (await fetch(url, { credentials: 'include' })).blob()
    return await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob) })
  } catch { return null }
}
const tipoImg = (d) => (d?.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG')

async function prepararContexto(ctx) {
  const escudo = await urlADataUrl(ctx.institucion.escudoUrl)
  const firmas = await Promise.all((ctx.firmas || []).map(async (f) => ({ ...f, img: await urlADataUrl(f.imagenUrl) })))
  const foto = await urlADataUrl(ctx.estudiante?.fotoUrl)
  return { ...ctx, escudo, firmas, foto }
}

function encabezado(doc, c, titulo) {
  const W = doc.internal.pageSize.getWidth()
  const i = c.institucion
  if (c.escudo) doc.addImage(c.escudo, tipoImg(c.escudo), 14, 10, 24, 24)
  doc.setTextColor(...AZUL).setFont('helvetica', 'bold').setFontSize(15)
  doc.text(i.nombre || 'Institución educativa', W / 2, 16, { align: 'center' })
  doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(...GRIS)
  const l1 = [i.nit && `NIT ${i.nit}`, i.resolucion].filter(Boolean).join('  |  ')
  const l2 = [i.direccion, i.municipio, i.departamento].filter(Boolean).join(', ')
  const l3 = [i.telefono && `Tel. ${i.telefono}`, i.correo].filter(Boolean).join('  |  ')
  ;[l1, l2, l3].filter(Boolean).forEach((t, k) => doc.text(t, W / 2, 21 + k * 4, { align: 'center' }))
  doc.setDrawColor(...AZUL).setLineWidth(0.6).line(14, 37, W - 14, 37)
  doc.setTextColor(20, 20, 20).setFont('helvetica', 'bold').setFontSize(13)
  doc.text(titulo, W / 2, 46, { align: 'center' })
  return 52
}

function bloqueFirmas(doc, c, y, tipoDoc) {
  const W = doc.internal.pageSize.getWidth()
  const lista = c.firmas.length ? c.firmas : []
  if (!lista.length) return y
  if (y > 240) { doc.addPage(); y = 30 }
  const ancho = (W - 28) / lista.length
  lista.forEach((f, k) => {
    const x = 14 + k * ancho + ancho / 2
    if (f.img) doc.addImage(f.img, tipoImg(f.img), x - 22, y, 44, 18)
    doc.setDrawColor(60).setLineWidth(0.3).line(x - 30, y + 20, x + 30, y + 20)
    doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(20).text(f.nombre || '', x, y + 25, { align: 'center' })
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...GRIS).text(f.cargo || f.tipo || '', x, y + 29, { align: 'center' })
  })
  return y + 34
}

function datosEstudiante(doc, c, y) {
  const e = c.estudiante
  const filas = [
    ['Estudiante', e.nombre, 'Documento', e.documento || '—'],
    ['Grado / Grupo', `${e.grado ?? ''} ${e.grupo ?? ''}`.trim() || '—', 'Jornada', e.jornada || '—'],
    ['Año escolar', String(c.anio ?? ''), 'Periodo', c.periodo || '—']
  ]
  autoTable(doc, {
    startY: y, body: filas, theme: 'plain', styles: { fontSize: 9, cellPadding: 1.4 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 30 }, 2: { fontStyle: 'bold', cellWidth: 26 } },
    margin: { left: c.foto ? 44 : 14, right: 14 }
  })
  if (c.foto) doc.addImage(c.foto, tipoImg(c.foto), 14, y, 26, 32)
  return Math.max(doc.lastAutoTable.finalY, c.foto ? y + 34 : 0) + 4
}

function pieDePagina(doc, c) {
  const n = doc.getNumberOfPages(), W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight()
  for (let p = 1; p <= n; p++) {
    doc.setPage(p).setFontSize(7.5).setTextColor(...GRIS)
    doc.text(`${c.institucion.nombre || ''} — Generado el ${new Date().toLocaleDateString('es-CO')}`, 14, H - 8)
    doc.text(`Página ${p} de ${n}`, W - 14, H - 8, { align: 'right' })
  }
}

function paginaBoletin(doc, c) {
  const cfg = c.config
  let y = encabezado(doc, c, `BOLETÍN DE CALIFICACIONES — ${(c.periodo || '').toUpperCase()}`)
  y = datosEstudiante(doc, c, y)
  const body = []
  const porArea = {}
  c.asignaturas.forEach((a) => { (porArea[a.area || 'General'] ||= []).push(a) })
  Object.entries(porArea).forEach(([area, items]) => {
    body.push([{ content: area, colSpan: 5, styles: { fillColor: [226, 232, 240], fontStyle: 'bold' } }])
    items.forEach((a) => body.push([a.nombre, a.ih ?? '', formatear(a.nota, cfg), desempeno(a.nota, cfg), a.observacion || '']))
  })
  autoTable(doc, {
    startY: y, head: [['Asignatura', 'I.H.', 'Nota', 'Desempeño', 'Observaciones']], body,
    headStyles: { fillColor: AZUL, fontSize: 9 }, styles: { fontSize: 8.5, cellPadding: 1.8 },
    columnStyles: { 1: { cellWidth: 12, halign: 'center' }, 2: { cellWidth: 16, halign: 'center' }, 3: { cellWidth: 26 } }
  })
  y = doc.lastAutoTable.finalY + 6
  const notas = c.asignaturas.map((a) => a.nota).filter((n) => n != null)
  if (notas.length) {
    const prom = notas.reduce((a, b) => a + b, 0) / notas.length
    doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(20)
    doc.text(`Promedio del periodo: ${formatear(prom, cfg)}  (${desempeno(prom, cfg)})`, 14, y)
    y += 6
  }
  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...GRIS)
  doc.text('Escala: ' + cfg.rangos.map((r) => `${r.nombre} ${Number(r.desde).toFixed(cfg.escala.decimales)}–${Number(r.hasta).toFixed(cfg.escala.decimales)}`).join('  |  '), 14, y)
  y += 6
  if (c.observaciones) {
    doc.setTextColor(20).setFont('helvetica', 'bold').setFontSize(9).text('Observaciones generales', 14, y + 2)
    doc.setFont('helvetica', 'normal')
    const t = doc.splitTextToSize(c.observaciones, doc.internal.pageSize.getWidth() - 28)
    doc.text(t, 14, y + 7)
    y += 9 + t.length * 4
  }
  bloqueFirmas(doc, c, Math.max(y + 10, 232), 'boletin')
}

const TEXTOS = {
  certificado: (c) => [`El suscrito rector de ${c.institucion.nombre}, con reconocimiento oficial, certifica que ${c.estudiante.nombre}, identificado(a) con documento No. ${c.estudiante.documento || '________'}, cursó y aprobó el grado ${c.estudiante.grado ?? ''} durante el año escolar ${c.anio}.`, 'Se expide a solicitud del interesado.'],
  constancia: (c) => [`${c.institucion.nombre} hace constar que ${c.estudiante.nombre}, identificado(a) con documento No. ${c.estudiante.documento || '________'}, se encuentra matriculado(a) en el grado ${c.estudiante.grado ?? ''} ${c.estudiante.grupo ?? ''}, jornada ${c.estudiante.jornada || ''}, durante el año escolar ${c.anio}.`, 'La presente constancia se expide a solicitud del interesado.'],
  acta: (c) => [`En ${c.institucion.municipio || '________'}, a los ${new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}, se levanta la presente acta referente a ${c.estudiante?.nombre || 'el asunto tratado'}.`, c.observaciones || 'Se deja constancia de lo tratado y acordado por los asistentes.']
}
const TITULOS = { certificado: 'CERTIFICADO DE ESTUDIOS', constancia: 'CONSTANCIA DE MATRÍCULA', acta: 'ACTA' }

function paginaTexto(doc, c, tipo) {
  let y = encabezado(doc, c, TITULOS[tipo])
  doc.setFont('helvetica', 'normal').setFontSize(11).setTextColor(20)
  TEXTOS[tipo](c).forEach((p) => {
    const t = doc.splitTextToSize(p, doc.internal.pageSize.getWidth() - 40)
    doc.text(t, 20, y + 12, { lineHeightFactor: 1.6 })
    y += 12 + t.length * 8
  })
  bloqueFirmas(doc, c, Math.max(y + 30, 200), tipo)
}

// ctx: { tipo, institucion, firmas, config, anio, periodo, estudiante:{nombre,documento,grado,grupo,jornada,fotoUrl}, asignaturas, observaciones }
export async function generarPDF(ctxs, tipo = 'boletin') {
  const lista = Array.isArray(ctxs) ? ctxs : [ctxs]
  const doc = new jsPDF({ unit: 'mm', format: 'letter' })
  let primero = null
  for (let k = 0; k < lista.length; k++) {
    const c = await prepararContexto(lista[k])
    primero ||= c
    if (k) doc.addPage()
    tipo === 'boletin' ? paginaBoletin(doc, c) : paginaTexto(doc, c, tipo)
  }
  if (primero) pieDePagina(doc, primero)
  return doc
}
export const descargarPDF = (doc, nombre) => doc.save(`${nombre}.pdf`)
export const urlPreview = (doc) => URL.createObjectURL(doc.output('blob'))

export const datosDemo = () => ({
  anio: new Date().getFullYear(), periodo: 'Periodo 1',
  estudiante: { nombre: 'Estudiante de Ejemplo', documento: '1.234.567.890', grado: '6°', grupo: '6A', jornada: 'Mañana' },
  observaciones: 'Muestra un buen desempeño general. Se recomienda reforzar hábitos de estudio en casa.',
  asignaturas: [
    { area: 'Ciencias Sociales', nombre: 'Historia', ih: 2, nota: 4.3, observacion: '' },
    { area: 'Ciencias Sociales', nombre: 'Geografía', ih: 2, nota: 3.8, observacion: '' },
    { area: 'Matemáticas', nombre: 'Matemáticas', ih: 5, nota: 2.6, observacion: 'Requiere nivelación' },
    { area: 'Humanidades', nombre: 'Lengua Castellana', ih: 4, nota: 4.8, observacion: '' }
  ]
})
