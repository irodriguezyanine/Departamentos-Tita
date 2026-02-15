/**
 * Generación de PDF profesional para cotizaciones - Condominio Puerto Pacífico
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

const MARGIN = 14
const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const CARD_PADDING = 4
const CARD_GAP = 6
const RADIUS = 2
const ROW_H = 5 // Altura por fila (compacto para 2 páginas)

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
  const nombreCompleto = [cot.nombreArrendatario, cot.apellidoArrendatario].filter(Boolean).join(" ") || "sin-nombre"
  const cliente = nombreCompleto
    .trim()
    .replace(/\s+/g, "_")
  return `${fecha}_${depto}_${cliente}.pdf`
}

function drawHeader(doc: jsPDF, cot: CotizacionArriendo): number {
  const headerH = 36
  doc.setFillColor(...VERDE)
  doc.rect(0, 0, PAGE_WIDTH, headerH, "F")

  doc.setDrawColor(...BEIGE)
  doc.setLineWidth(0.2)
  doc.line(105, 6, 105, 32)

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("Condominio Puerto Pacífico", MARGIN, 14)

  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...BEIGE)
  doc.text("Condominio Puerto Pacífico", MARGIN, 20)
  doc.text(UBICACION_SITIO, MARGIN, 26)

  const clienteX = PAGE_WIDTH - MARGIN
  let clientY = 10
  if (cot.numero) {
    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...BEIGE)
    doc.text(`Cotización Nº ${cot.numero}`, clienteX, clientY, { align: "right" })
    clientY += 5
  }
  doc.setFontSize(8)
  doc.text("Cliente", clienteX, clientY, { align: "right" })
  clientY += 5
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  const nombreLines = doc.splitTextToSize([cot.nombreArrendatario, cot.apellidoArrendatario].filter(Boolean).join(" ") || "-", 75)
  doc.text(nombreLines, clienteX, clientY, { align: "right" })
  clientY += nombreLines.length * 4 + 1
  doc.setFontSize(8)
  if (cot.emailArrendatario && cot.emailArrendatario !== "sin-email@cotizacion.local") {
    doc.text(cot.emailArrendatario, clienteX, clientY, { align: "right" })
    clientY += 4
  }
  if (cot.telefonoArrendatario?.trim()) {
    doc.text(cot.telefonoArrendatario, clienteX, clientY, { align: "right" })
  }

  return 42
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
  const headerH = 8
  const totalH = headerH + contentHeight + CARD_PADDING * 2

  doc.setDrawColor(...BORDE)
  doc.setLineWidth(0.3)
  doc.roundedRect(MARGIN, startY, CONTENT_WIDTH, totalH, RADIUS, RADIUS, "S")

  doc.setFillColor(...VERDE)
  doc.rect(MARGIN, startY, 2, headerH, "F")
  doc.setFillColor(...BEIGE_CLARO)
  doc.rect(MARGIN + 2, startY, CONTENT_WIDTH - 2, headerH, "F")

  doc.setTextColor(...VERDE)
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text(title, LABEL_LEFT, startY + 5.5)

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
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...SLATE)
  doc.text(label, LABEL_LEFT, y)
  doc.setFont("helvetica", highlight ? "bold" : "normal")
  doc.setTextColor(...(highlight ? VERDE : SLATE))
  doc.text(value, VALUE_RIGHT, y, { align: "right" })
  return y + ROW_H
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
  const boxH = 9
  const boxW = CONTENT_WIDTH - CARD_PADDING * 2 - 6
  const boxX = LABEL_LEFT
  doc.setFillColor(...BEIGE_CLARO)
  doc.setDrawColor(...ORO)
  doc.setLineWidth(0.4)
  doc.roundedRect(boxX, y - 3, boxW, boxH, RADIUS, RADIUS, "FD")
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...VERDE)
  doc.text(label, boxX + 3, y + 1.5)
  doc.text(value, boxX + boxW - 3, y + 1.5, { align: "right" })
  return y + boxH + 2
}

/**
 * Verifica si hay espacio y añade nueva página si es necesario
 */
const FOOTER_RESERVED = 28

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_HEIGHT - FOOTER_RESERVED) {
    doc.addPage()
    return MARGIN
  }
  return y
}

export function generarPDFCotizacion(cot: CotizacionArriendo): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  let y = drawHeader(doc, cot)

  y += 4

  // ─── Tarjeta: Ubicación del sitio ───
  const ubicacionH = 10
  const { contentY: ubY, endY: ubEnd } = drawCard(doc, "Ubicación del sitio", y, ubicacionH)
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...SLATE)
  doc.text(UBICACION_SITIO, LABEL_LEFT, ubY + 5)
  doc.setFontSize(7)
  doc.setTextColor(...SLATE_LIGHT)
  doc.text("Condominio Puerto Pacífico · Frente a playa Las Salinas", LABEL_LEFT, ubY + 9)
  y = ubEnd + CARD_GAP

  // ─── Tarjeta: Datos del arriendo ───
  const datosRows = 6
  y = ensureSpace(doc, y, 55)
  const { contentY: datosY, endY: datosEnd } = drawCard(
    doc,
    "Datos del arriendo",
    y,
    datosRows * ROW_H + 2
  )
  y = datosY
  y = drawCardRow(doc, "Arrendatario", [cot.nombreArrendatario, cot.apellidoArrendatario].filter(Boolean).join(" ") || "-", y)
  y = drawCardRow(doc, "Departamento", cot.departamento || "-", y)
  y = drawCardRow(doc, "Torre", cot.torre || "-", y)
  y = drawCardRow(doc, "Estacionamiento", cot.estacionamiento || "-", y)
  y = drawCardRow(doc, "Check In", formatDate(cot.checkIn), y)
  y = drawCardRow(doc, "Check Out", formatDate(cot.checkOut), y)
  y = datosEnd + CARD_GAP

  // ─── Tarjeta: Costos ───
  const costosRows = 11
  y = ensureSpace(doc, y, costosRows * ROW_H + 18)
  const { contentY: costosY, endY: costosEnd } = drawCard(
    doc,
    "Costos",
    y,
    costosRows * ROW_H + 14
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
  y = drawCardRow(doc, `Administración (${cot.comisionPorcentaje ?? 10}%)`, `$ ${formatPrecioCLP(cot.comision || 0)}`, y)
  y += 1
  y = drawHighlightBox(doc, "Valor total", `$ ${formatPrecioCLP(cot.valorTotal || 0)}`, y)
  y = costosEnd + CARD_GAP

  // ─── Tarjeta: Pagos ───
  const pagosRows = 4
  y = ensureSpace(doc, y, pagosRows * ROW_H + 22)
  const { contentY: pagosY, endY: pagosEnd } = drawCard(
    doc,
    "Pagos",
    y,
    pagosRows * ROW_H + 14
  )
  y = pagosY
  y = drawCardRow(doc, "Abono reserva", `$ ${formatPrecioCLP(cot.abonoReserva ?? 0)}`, y)
  y = drawCardRow(doc, "Fecha abono", formatDate(cot.fechaAbonoReserva || ""), y)
  y += 1
  y = drawHighlightBox(doc, "Saldo", `$ ${formatPrecioCLP(cot.saldo ?? 0)}`, y)
  y = drawCardRow(doc, "Fecha pago saldo", formatDate(cot.fechaPagoSaldo || ""), y)
  y = pagosEnd + CARD_GAP

  // ─── Tarjeta: Datos para depósito ───
  const depH = 24
  y = ensureSpace(doc, y, depH + 40)
  const { contentY: depY, endY: depEnd } = drawCard(doc, "Datos para depósito", y, depH)
  y = depY

  const colWidth = (CONTENT_WIDTH - CARD_PADDING * 2 - 6 - 6) / 2
  const col1X = LABEL_LEFT
  const col2X = col1X + colWidth + 6

  doc.setFillColor(...BEIGE_CLARO)
  doc.setDrawColor(...BORDE)
  doc.setLineWidth(0.25)
  doc.roundedRect(col1X, y, colWidth, 22, RADIUS, RADIUS, "FD")
  doc.setFontSize(7)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...VERDE)
  doc.text("Envíos nacionales", col1X + 3, y + 5)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...SLATE)
  doc.text(DATOS_DEPOSITO.nacional.nombre, col1X + 3, y + 9)
  doc.text(`RUT ${DATOS_DEPOSITO.nacional.rut}`, col1X + 3, y + 13)
  doc.text(`${DATOS_DEPOSITO.nacional.banco}`, col1X + 3, y + 17)
  doc.text(`Cuenta ${DATOS_DEPOSITO.nacional.cuenta}`, col1X + 3, y + 21)

  doc.setFillColor(...BEIGE_CLARO)
  doc.roundedRect(col2X, y, colWidth, 22, RADIUS, RADIUS, "FD")
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...VERDE)
  doc.text("Western Union", col2X + 3, y + 5)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...SLATE)
  doc.text(DATOS_DEPOSITO.westernUnion.nombre, col2X + 3, y + 9)
  doc.text(`RUT ${DATOS_DEPOSITO.westernUnion.rut}`, col2X + 3, y + 13)
  doc.text(DATOS_DEPOSITO.westernUnion.domicilio, col2X + 3, y + 17)
  doc.text(`Celular ${DATOS_DEPOSITO.westernUnion.celular}`, col2X + 3, y + 21)

  y = depEnd + CARD_GAP

  // ─── Tarjeta: Observaciones (si hay) ───
  if (cot.observaciones?.trim()) {
    y = ensureSpace(doc, y, 30)
    const obsLines = doc.splitTextToSize(cot.observaciones, CONTENT_WIDTH - CARD_PADDING * 2 - 12)
    const obsH = Math.max(14, obsLines.length * 4 + 6)
    const { contentY: obsY, endY: obsEnd } = drawCard(doc, "Observaciones", y, obsH)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...SLATE)
    doc.text(obsLines, LABEL_LEFT, obsY + 3)
    y = obsEnd + CARD_GAP
  }

  // ─── Footer (en cada página) ───
  const pageCount = doc.getNumberOfPages()
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p)
    const footerY = PAGE_HEIGHT - 10
    doc.setDrawColor(...ORO)
    doc.setLineWidth(0.4)
    doc.line(MARGIN, footerY - 6, PAGE_WIDTH - MARGIN, footerY - 6)
    doc.setFontSize(6)
    doc.setTextColor(...SLATE_LIGHT)
    doc.text(
      `Condominio Puerto Pacífico · ${UBICACION_SITIO} · www.condominiopuertopacifico.cl`,
      PAGE_WIDTH / 2,
      footerY - 1,
      { align: "center" }
    )
    doc.setFontSize(5)
    doc.text(
      `Documento generado el ${formatDate(new Date().toISOString())} · Página ${p} de ${pageCount}`,
      PAGE_WIDTH / 2,
      footerY + 2,
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

/**
 * Comparte el PDF por WhatsApp usando la Web Share API.
 * Abre el selector nativo de compartir (incluye WhatsApp y lista de contactos).
 * Si no está disponible, descarga el PDF y abre WhatsApp con mensaje.
 */
export async function compartirPDFWhatsApp(cot: CotizacionArriendo): Promise<void> {
  const doc = generarPDFCotizacion(cot)
  const blob = doc.output("blob")
  const fileName = nombreArchivoCotizacion(cot)
  const file = new File([blob], fileName, { type: "application/pdf" })

  const nombreCliente = [cot.nombreArrendatario, cot.apellidoArrendatario].filter(Boolean).join(" ") || "Cliente"
  const mensaje = `Cotización Condominio Puerto Pacífico - ${cot.numero || ""} - ${nombreCliente}`

  const puedeCompartir =
    typeof navigator !== "undefined" &&
    "share" in navigator &&
    (navigator.canShare ? navigator.canShare({ files: [file] }) : true)

  if (puedeCompartir) {
    try {
      await navigator.share({
        title: "Cotización Condominio Puerto Pacífico",
        text: mensaje,
        files: [file],
      })
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        descargarPDFCotizacion(cot)
        window.open(
          `https://wa.me/?text=${encodeURIComponent(mensaje + ". El PDF se ha descargado en tu dispositivo.")}`,
          "_blank"
        )
      }
    }
  } else {
    descargarPDFCotizacion(cot)
    window.open(
      `https://wa.me/?text=${encodeURIComponent(mensaje + ". El PDF se ha descargado en tu dispositivo. Adjunta el archivo para compartirlo.")}`,
      "_blank"
    )
  }
}
