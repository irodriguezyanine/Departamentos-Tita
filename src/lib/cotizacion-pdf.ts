/**
 * Generación de PDF profesional para cotizaciones - Departamentos Tita
 * Diseño tipo tarjetas con bordes y jerarquía visual
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
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const CARD_PADDING = 6
const CARD_GAP = 10


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

function drawHeader(doc: jsPDF): number {
  doc.setFillColor(...VERDE)
  doc.rect(0, 0, PAGE_WIDTH, 36, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text("Departamentos Tita", MARGIN, 20)

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...BEIGE)
  doc.text("Condominio Puerto Pacífico · Viña del Mar", MARGIN, 28)

  doc.setFillColor(...ORO)
  doc.rect(0, 36, PAGE_WIDTH, 3, "F")

  return 46
}

/**
 * Dibuja una tarjeta con borde y título con acento dorado
 */
function drawCard(
  doc: jsPDF,
  title: string,
  startY: number,
  contentHeight: number
): { contentY: number; endY: number } {
  const headerH = 10
  const totalH = headerH + contentHeight + CARD_PADDING * 2

  // Borde de la tarjeta
  doc.setDrawColor(...BORDE)
  doc.setLineWidth(0.4)
  doc.rect(MARGIN, startY, CONTENT_WIDTH, totalH, "S")

  // Header con acento dorado a la izquierda
  doc.setFillColor(...VERDE)
  doc.rect(MARGIN, startY, 3, headerH, "F")
  doc.setFillColor(...BEIGE_CLARO)
  doc.rect(MARGIN + 3, startY, CONTENT_WIDTH - 3, headerH, "F")

  doc.setTextColor(...VERDE)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text(title, MARGIN + 3 + CARD_PADDING, startY + 6.5)

  const contentY = startY + headerH + CARD_PADDING
  return { contentY, endY: startY + totalH }
}

/**
 * Fila dentro de una tarjeta con separador sutil
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
  doc.text(label, MARGIN + CARD_PADDING + 3, y)
  doc.setFont("helvetica", highlight ? "bold" : "normal")
  doc.setTextColor(...(highlight ? VERDE : SLATE))
  doc.text(value, MARGIN + 95, y)
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
  doc.setFillColor(...BEIGE_CLARO)
  doc.setDrawColor(...ORO)
  doc.setLineWidth(0.5)
  doc.rect(MARGIN + CARD_PADDING + 3, y - 4, CONTENT_WIDTH - CARD_PADDING * 2 - 6, boxH, "FD")
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...VERDE)
  doc.text(label, MARGIN + CARD_PADDING + 6, y + 2)
  doc.text(value, MARGIN + CONTENT_WIDTH - CARD_PADDING - 45, y + 2)
  return y + boxH + 4
}

export function generarPDFCotizacion(cot: CotizacionArriendo): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  let y = drawHeader(doc)

  y += 6

  // ─── Tarjeta: Datos del arriendo ───
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

  // ─── Tarjeta: Datos para depósito (dos columnas) ───
  const depH = 22
  const { contentY: depY, endY: depEnd } = drawCard(doc, "Datos para depósito", y, depH)
  y = depY

  const colWidth = (CONTENT_WIDTH - CARD_PADDING * 2 - 6 - 8) / 2
  const col1X = MARGIN + CARD_PADDING + 3
  const col2X = col1X + colWidth + 8

  // Columna 1: Nacional (sub-tarjeta)
  doc.setFillColor(...BEIGE_CLARO)
  doc.setDrawColor(...BORDE)
  doc.setLineWidth(0.3)
  doc.rect(col1X, y, colWidth, 22, "FD")
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...VERDE)
  doc.text("Envíos nacionales", col1X + 4, y + 6)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...SLATE)
  doc.text(DATOS_DEPOSITO.nacional.nombre, col1X + 4, y + 11)
  doc.text(`RUT ${DATOS_DEPOSITO.nacional.rut}`, col1X + 4, y + 15)
  doc.text(`${DATOS_DEPOSITO.nacional.banco} · Cuenta ${DATOS_DEPOSITO.nacional.cuenta}`, col1X + 4, y + 19)

  // Columna 2: Western Union (sub-tarjeta)
  doc.setFillColor(...BEIGE_CLARO)
  doc.rect(col2X, y, colWidth, 22, "FD")
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...VERDE)
  doc.text("Western Union", col2X + 4, y + 6)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...SLATE)
  doc.text(DATOS_DEPOSITO.westernUnion.nombre, col2X + 4, y + 11)
  doc.text(`RUT ${DATOS_DEPOSITO.westernUnion.rut}`, col2X + 4, y + 15)
  doc.text(`${DATOS_DEPOSITO.westernUnion.domicilio} · Cel. ${DATOS_DEPOSITO.westernUnion.celular}`, col2X + 4, y + 19)

  y = depEnd + CARD_GAP

  // ─── Tarjeta: Observaciones (si hay) ───
  if (cot.observaciones?.trim()) {
    const obsLines = doc.splitTextToSize(cot.observaciones, CONTENT_WIDTH - CARD_PADDING * 2 - 12)
    const obsH = Math.max(18, obsLines.length * 5 + 8)
    const { contentY: obsY, endY: obsEnd } = drawCard(doc, "Observaciones", y, obsH)
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...SLATE)
    doc.text(obsLines, MARGIN + CARD_PADDING + 3, obsY + 4)
    y = obsEnd + CARD_GAP
  }

  // ─── Footer ───
  doc.setDrawColor(...ORO)
  doc.setLineWidth(0.5)
  doc.line(MARGIN, 282, PAGE_WIDTH - MARGIN, 282)
  doc.setFontSize(8)
  doc.setTextColor(...SLATE_LIGHT)
  doc.text(
    "Departamentos Tita · Condominio Puerto Pacífico · Viña del Mar",
    PAGE_WIDTH / 2,
    288,
    { align: "center" }
  )

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
