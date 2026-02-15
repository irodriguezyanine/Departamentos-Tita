/**
 * Generación de PDF profesional para cotizaciones - Departamentos Tita
 * Diseño tipo tarjetas con bordes redondeados y columnas alineadas
 */

import { jsPDF } from "jspdf"
import type { CotizacionArriendo } from "@/types/cotizacion"
import { DATOS_DEPOSITO } from "@/types/cotizacion"
import { formatPrecioCLP } from "@/lib/precios"

// Colores de la marca
const VERDE = [10, 46, 27] as [number, number, number] // #0a2e1b
const ORO = [212, 175, 55] as [number, number, number] // #d4af37
const BEIGE = [232, 220, 196] as [number, number, number] // #e8dcc4
const BEIGE_CLARO = [245, 240, 230] as [number, number, number] // #f5f0e6
const SLATE = [71, 85, 105] as [number, number, number] // #475569
const SLATE_LIGHT = [148, 163, 184] as [number, number, number] // #94a3b8
const BORDE = [203, 213, 225] as [number, number, number] // #cbd5e1

const MARGIN = 18
const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const CARD_PADDING = 6
const CARD_GAP = 10
const RADIUS = 3 // Bordes levemente redondeados

// Columnas alineadas: etiquetas a la izquierda, valores alineados a la derecha
const VALUE_RIGHT = MARGIN + CONTENT_WIDTH - 8
const LABEL_LEFT = MARGIN + CARD_PADDING + 3

/** Dirección del condominio */
export const UBICACION_SITIO = "Av. Jorge Montt 1598, Viña del Mar, Valparaíso"

function formatDate(s: string): string {
  if (!s) return "-"
  const d = new Date(s)
  return d.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

/**
 * Genera el nombre del archivo: YYMMDD_departamento_cliente.pdf
 */
export function nombreArchivoCotizacion(cot: CotizacionArriendo): string {
  const hoy = new Date()
  const yy = String(hoy.getFullYear()).slice(-2)
  const mm = String(hoy.getMonth() + 1).padStart(2, "0")
  const dd = String(hoy.getDate()).padStart(2, "0")
  const fecha = `${yy}${mm}${dd}`
  const depto = (cot.departamento || "sin-depto").replace(/\s/g, "")
  const cliente = (cot.nombreArrendatario || "sin-nombre")
    .trim()
    .replace(/\s+/g, "_")
  return `${fecha}_${depto}_${cliente}.pdf`
}

function drawHeader(doc: jsPDF, cot: CotizacionArriendo): number {
  doc.setFillColor(...VERDE)
  doc.rect(0, 0, PAGE_WIDTH, 42, "F")

  // Izquierda: marca
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  doc.text("Departamentos Tita", MARGIN, 18)

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...BEIGE)
  doc.text("Condominio Puerto Pacífico · Viña del Mar", MARGIN, 25)
  doc.text(UBICACION_SITIO, MARGIN, 31)

  // Derecha: datos del cliente (caja destacada)
  const clienteBoxW = 88
  const clienteBoxH = 32
  const clienteBoxX = PAGE_WIDTH - MARGIN - clienteBoxW
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(...BORDE)
  doc.setLineWidth(0.3)
  doc.roundedRect(clienteBoxX, 8, clienteBoxW, clienteBoxH, 2, 2, "FD")

  let clientY = 14
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...VERDE)
  doc.text("CLIENTE", clienteBoxX + 4, clientY)
  clientY += 7
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...SLATE)
  doc.setFontSize(10)
  const nombreLines = doc.splitTextToSize(cot.nombreArrendatario || "-", clienteBoxW - 8)
  doc.text(nombreLines, clienteBoxX + 4, clientY)
  clientY += nombreLines.length * 5 + 2
  doc.setFontSize(8)
  if (cot.emailArrendatario && cot.emailArrendatario !== "sin-email@cotizacion.local") {
    doc.text(cot.emailArrendatario, clienteBoxX + 4, clientY)
    clientY += 5
  }
  if (cot.telefonoArrendatario?.trim()) {
    doc.text(cot.telefonoArrendatario, clienteBoxX + 4, clientY)
  }

  // Número de cotización (si existe) - esquina superior derecha, sobre el cliente
  if (cot.numero) {
    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...BEIGE)
    doc.text(`Cotización Nº ${cot.numero}`, PAGE_WIDTH - MARGIN, 6, { align: "right" })
  }

  doc.setFillColor(...ORO)
  doc.rect(0, 42, PAGE_WIDTH, 3, "F")

  return 52
}

/**
 * Dibuja una tarjeta con borde redondeado y título
 */
function drawCard(
  doc: jsPDF,
  title: string,
  startY: number,
  contentHeight: number
): { contentY: number; endY: number } {
  const headerH = 10
  const totalH = headerH + contentHeight + CARD_PADDING * 2

  // Borde de la tarjeta con esquinas redondeadas
  doc.setDrawColor(...BORDE)
  doc.setLineWidth(0.4)
  doc.roundedRect(MARGIN, startY, CONTENT_WIDTH, totalH, RADIUS, RADIUS, "S")

  // Header con acento dorado a la izquierda
  doc.setFillColor(...VERDE)
  doc.rect(MARGIN, startY, 3, headerH, "F")
  doc.setFillColor(...BEIGE_CLARO)
  doc.rect(MARGIN + 3, startY, CONTENT_WIDTH - 3, headerH, "F")

  doc.setTextColor(...VERDE)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text(title, LABEL_LEFT, startY + 6.5)

  const contentY = startY + headerH + CARD_PADDING
  return { contentY, endY: startY + totalH }
}

/**
 * Fila con etiqueta a la izquierda y valor alineado a la derecha
 */
function drawCardRow(
  doc: jsPDF,
  label: string,
  value: string,
  y: number,
  highlight = false
): number {
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...SLATE)
  doc.text(label, LABEL_LEFT, y)
  doc.setFont("helvetica", highlight ? "bold" : "normal")
  doc.setTextColor(...(highlight ? VERDE : SLATE))
  doc.text(value, VALUE_RIGHT, y, { align: "right" })
  return y + 6
}

/**
 * Caja destacada para totales
 */
function drawHighlightBox(
  doc: jsPDF,
  label: string,
  value: string,
  y: number
): number {
  const boxH = 12
  const boxW = CONTENT_WIDTH - CARD_PADDING * 2 - 6
  const boxX = LABEL_LEFT
  doc.setFillColor(...BEIGE_CLARO)
  doc.setDrawColor(...ORO)
  doc.setLineWidth(0.5)
  doc.roundedRect(boxX, y - 4, boxW, boxH, RADIUS, RADIUS, "FD")
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...VERDE)
  doc.text(label, boxX + 4, y + 2)
  doc.text(value, boxX + boxW - 4, y + 2, { align: "right" })
  return y + boxH + 4
}

/**
 * Verifica si hay espacio y añade nueva página si es necesario
 */
function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_HEIGHT - 35) {
    doc.addPage()
    return 20
  }
  return y
}

export function generarPDFCotizacion(cot: CotizacionArriendo): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  let y = drawHeader(doc, cot)

  y += 6

  // ─── Tarjeta: Ubicación del sitio ───
  const ubicacionH = 16
  const { contentY: ubY, endY: ubEnd } = drawCard(doc, "Ubicación del sitio", y, ubicacionH)
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...SLATE)
  doc.text(UBICACION_SITIO, LABEL_LEFT, ubY + 6)
  doc.setFontSize(8)
  doc.setTextColor(...SLATE_LIGHT)
  doc.text("Condominio Puerto Pacífico · Frente a playa Las Salinas", LABEL_LEFT, ubY + 12)
  y = ubEnd + CARD_GAP

  // ─── Tarjeta: Datos del arriendo ───
  y = ensureSpace(doc, y, 80)
  const datosRows = 6
  const { contentY: datosY, endY: datosEnd } = drawCard(
    doc,
    "Datos del arriendo",
    y,
    datosRows * 6 + 4
  )
  y = datosY
  y = drawCardRow(doc, "Arrendatario", cot.nombreArrendatario || "-", y)
  y = drawCardRow(doc, "Departamento", cot.departamento || "-", y)
  y = drawCardRow(doc, "Torre", cot.torre || "-", y)
  y = drawCardRow(doc, "Estacionamiento", cot.estacionamiento || "-", y)
  y = drawCardRow(doc, "Check In", formatDate(cot.checkIn), y)
  y = drawCardRow(doc, "Check Out", formatDate(cot.checkOut), y)
  y = datosEnd + CARD_GAP

  // ─── Tarjeta: Costos ───
  y = ensureSpace(doc, y, 120)
  const costosRows = 11
  const { contentY: costosY, endY: costosEnd } = drawCard(
    doc,
    "Costos",
    y,
    costosRows * 6 + 20
  )
  y = costosY
  y = drawCardRow(doc, "Total noches", `${cot.totalNoches || 0} noches`, y)
  y = drawCardRow(doc, "Valor por noche", `$ ${formatPrecioCLP(cot.valorNoche || 0)}`, y)
  y = drawCardRow(doc, "Subtotal noches", `$ ${formatPrecioCLP(cot.subtotalNoches || 0)}`, y)
  y = drawCardRow(doc, "Aseo", `$ ${formatPrecioCLP(cot.aseo ?? 0)}`, y)
  y = drawCardRow(doc, "Estacionamiento", `$ ${formatPrecioCLP(cot.estacionamientoMonto ?? 0)}`, y)
  y = drawCardRow(doc, "Adicional noche 31", `$ ${formatPrecioCLP(cot.adicionalNoche31 ?? 0)}`, y)
  y = drawCardRow(doc, "Subtotal adicionales", `$ ${formatPrecioCLP(cot.subtotalAdicionales || 0)}`, y)
  y = drawCardRow(doc, "Subtotal", `$ ${formatPrecioCLP(cot.subtotal || 0)}`, y)
  y = drawCardRow(doc, `Comisión (${cot.comisionPorcentaje ?? 10}%)`, `$ ${formatPrecioCLP(cot.comision || 0)}`, y)
  y += 2
  y = drawHighlightBox(doc, "Valor total", `$ ${formatPrecioCLP(cot.valorTotal || 0)}`, y)
  y = costosEnd + CARD_GAP

  // ─── Tarjeta: Pagos ───
  y = ensureSpace(doc, y, 80)
  const pagosRows = 4
  const { contentY: pagosY, endY: pagosEnd } = drawCard(
    doc,
    "Pagos",
    y,
    pagosRows * 6 + 20
  )
  y = pagosY
  y = drawCardRow(doc, "Abono reserva", `$ ${formatPrecioCLP(cot.abonoReserva ?? 0)}`, y)
  y = drawCardRow(doc, "Fecha abono", formatDate(cot.fechaAbonoReserva || ""), y)
  y += 2
  y = drawHighlightBox(doc, "Saldo", `$ ${formatPrecioCLP(cot.saldo ?? 0)}`, y)
  y = drawCardRow(doc, "Fecha pago saldo", formatDate(cot.fechaPagoSaldo || ""), y)
  y = pagosEnd + CARD_GAP

  // ─── Tarjeta: Datos para depósito (siempre al final, en nueva página si hace falta) ───
  const depH = 30
  y = ensureSpace(doc, y, depH + 60)
  const { contentY: depY, endY: depEnd } = drawCard(doc, "Datos para depósito", y, depH)
  y = depY

  const colWidth = (CONTENT_WIDTH - CARD_PADDING * 2 - 6 - 8) / 2
  const col1X = LABEL_LEFT
  const col2X = col1X + colWidth + 8

  // Sub-tarjetas con bordes redondeados
  doc.setFillColor(...BEIGE_CLARO)
  doc.setDrawColor(...BORDE)
  doc.setLineWidth(0.3)
  doc.roundedRect(col1X, y, colWidth, 28, RADIUS, RADIUS, "FD")
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...VERDE)
  doc.text("Envíos nacionales", col1X + 4, y + 6)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...SLATE)
  doc.text(DATOS_DEPOSITO.nacional.nombre, col1X + 4, y + 11)
  doc.text(`RUT ${DATOS_DEPOSITO.nacional.rut}`, col1X + 4, y + 15)
  doc.text(`${DATOS_DEPOSITO.nacional.banco}`, col1X + 4, y + 19)
  doc.text(`Cuenta ${DATOS_DEPOSITO.nacional.cuenta}`, col1X + 4, y + 23)

  doc.setFillColor(...BEIGE_CLARO)
  doc.roundedRect(col2X, y, colWidth, 28, RADIUS, RADIUS, "FD")
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...VERDE)
  doc.text("Western Union", col2X + 4, y + 6)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...SLATE)
  doc.text(DATOS_DEPOSITO.westernUnion.nombre, col2X + 4, y + 11)
  doc.text(`RUT ${DATOS_DEPOSITO.westernUnion.rut}`, col2X + 4, y + 15)
  doc.text(DATOS_DEPOSITO.westernUnion.domicilio, col2X + 4, y + 19)
  doc.text(`Celular ${DATOS_DEPOSITO.westernUnion.celular}`, col2X + 4, y + 23)

  y = depEnd + CARD_GAP

  // ─── Tarjeta: Observaciones (si hay) ───
  if (cot.observaciones?.trim()) {
    y = ensureSpace(doc, y, 40)
    const obsLines = doc.splitTextToSize(cot.observaciones, CONTENT_WIDTH - CARD_PADDING * 2 - 12)
    const obsH = Math.max(18, obsLines.length * 5 + 8)
    const { contentY: obsY, endY: obsEnd } = drawCard(doc, "Observaciones", y, obsH)
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...SLATE)
    doc.text(obsLines, LABEL_LEFT, obsY + 4)
    y = obsEnd + CARD_GAP
  }

  // ─── Footer (en cada página) ───
  const pageCount = doc.getNumberOfPages()
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p)
    const footerY = PAGE_HEIGHT - 12
    doc.setDrawColor(...ORO)
    doc.setLineWidth(0.5)
    doc.line(MARGIN, footerY - 8, PAGE_WIDTH - MARGIN, footerY - 8)
    doc.setFontSize(7)
    doc.setTextColor(...SLATE_LIGHT)
    doc.text(
      `Departamentos Tita · ${UBICACION_SITIO} · www.departamentostita.cl`,
      PAGE_WIDTH / 2,
      footerY - 2,
      { align: "center" }
    )
    doc.setFontSize(6)
    doc.text(
      `Documento generado el ${formatDate(new Date().toISOString())} · Página ${p} de ${pageCount}`,
      PAGE_WIDTH / 2,
      footerY + 3,
      { align: "center" }
    )
  }

  return doc
}

export function descargarPDFCotizacion(cot: CotizacionArriendo): void {
  const doc = generarPDFCotizacion(cot)
  doc.save(nombreArchivoCotizacion(cot))
}

export function imprimirPDFCotizacion(cot: CotizacionArriendo): void {
  const doc = generarPDFCotizacion(cot)
  const blob = doc.output("blob")
  const url = URL.createObjectURL(blob)
  const win = window.open(url, "_blank")
  if (win) {
    win.onload = () => {
      win.print()
      URL.revokeObjectURL(url)
    }
  } else {
    URL.revokeObjectURL(url)
    doc.save(nombreArchivoCotizacion(cot))
  }
}
