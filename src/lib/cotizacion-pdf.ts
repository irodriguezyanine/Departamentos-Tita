/**
 * Generación de PDF profesional para cotizaciones - Departamentos Tita
 * Diseño alineado con la identidad visual (verde, oro, beige)
 */

import { jsPDF } from "jspdf"
import type { CotizacionArriendo } from "@/types/cotizacion"
import { DATOS_DEPOSITO } from "@/types/cotizacion"

// Colores de la marca
const VERDE = [10, 46, 27] as [number, number, number] // #0a2e1b
const ORO = [212, 175, 55] as [number, number, number] // #d4af37
const BEIGE = [232, 220, 196] as [number, number, number] // #e8dcc4
const SLATE = [71, 85, 105] as [number, number, number] // #475569
const SLATE_LIGHT = [148, 163, 184] as [number, number, number] // #94a3b8

const MARGIN = 20
const PAGE_WIDTH = 210
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

function formatPrice(n: number): string {
  return new Intl.NumberFormat("es-CL").format(n || 0)
}

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
 * Ejemplo: 260215_17C_Ignacio_Rodriguez.pdf
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

function drawHeader(doc: jsPDF, y: number): number {
  doc.setFillColor(...VERDE)
  doc.rect(0, 0, PAGE_WIDTH, 32, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  doc.text("Departamentos Tita", MARGIN, 18)

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...BEIGE)
  doc.text("Condominio Puerto Pacífico · Viña del Mar", MARGIN, 25)

  doc.setFillColor(...ORO)
  doc.rect(0, 32, PAGE_WIDTH, 2, "F")

  return 42
}

function drawSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(...BEIGE)
  doc.rect(MARGIN, y, CONTENT_WIDTH, 8, "F")
  doc.setTextColor(...VERDE)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text(title, MARGIN + 4, y + 5.5)
  return y + 12
}

function drawRow(
  doc: jsPDF,
  label: string,
  value: string,
  y: number,
  highlight = false
): number {
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...SLATE)
  doc.text(label, MARGIN, y)
  doc.setFont("helvetica", highlight ? "bold" : "normal")
  doc.setTextColor(...(highlight ? VERDE : SLATE))
  doc.text(value, MARGIN + 90, y)
  return y + 6
}

export function generarPDFCotizacion(cot: CotizacionArriendo): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  let y = drawHeader(doc, 0)

  y += 8

  // Datos del arriendo
  y = drawSectionTitle(doc, "Datos del arriendo", y)
  y = drawRow(doc, "Arrendatario:", cot.nombreArrendatario || "-", y)
  y = drawRow(doc, "Departamento:", cot.departamento || "-", y)
  y = drawRow(doc, "Torre:", cot.torre || "-", y)
  y = drawRow(doc, "Estacionamiento:", cot.estacionamiento || "-", y)
  y = drawRow(doc, "Check In:", formatDate(cot.checkIn), y)
  y = drawRow(doc, "Check Out:", formatDate(cot.checkOut), y)
  y += 4

  // Costos
  y = drawSectionTitle(doc, "Costos", y)
  y = drawRow(doc, "Total noches:", `${cot.totalNoches || 0} noches`, y)
  y = drawRow(doc, "Valor por noche:", `$ ${formatPrice(cot.valorNoche || 0)}`, y)
  y = drawRow(doc, "Subtotal noches:", `$ ${formatPrice(cot.subtotalNoches || 0)}`, y)
  y = drawRow(doc, "Aseo:", `$ ${formatPrice(cot.aseo ?? 0)}`, y)
  y = drawRow(doc, "Estacionamiento:", `$ ${formatPrice(cot.estacionamientoMonto ?? 0)}`, y)
  y = drawRow(doc, "Adicional noche 31:", `$ ${formatPrice(cot.adicionalNoche31 ?? 0)}`, y)
  y = drawRow(doc, "Subtotal adicionales:", `$ ${formatPrice(cot.subtotalAdicionales || 0)}`, y)
  y = drawRow(doc, "Subtotal:", `$ ${formatPrice(cot.subtotal || 0)}`, y)
  y = drawRow(doc, `Comisión (${cot.comisionPorcentaje ?? 10}%):`, `$ ${formatPrice(cot.comision || 0)}`, y)
  y = drawRow(doc, "Valor total:", `$ ${formatPrice(cot.valorTotal || 0)}`, y, true)
  y += 4

  // Pagos
  y = drawSectionTitle(doc, "Pagos", y)
  y = drawRow(doc, "Abono reserva:", `$ ${formatPrice(cot.abonoReserva ?? 0)}`, y)
  y = drawRow(doc, "Fecha abono:", formatDate(cot.fechaAbonoReserva || ""), y)
  y = drawRow(doc, "Saldo:", `$ ${formatPrice(cot.saldo ?? 0)}`, y, true)
  y = drawRow(doc, "Fecha pago saldo:", formatDate(cot.fechaPagoSaldo || ""), y)
  y += 4

  // Datos para depósito
  y = drawSectionTitle(doc, "Datos para depósito", y)
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...VERDE)
  doc.text("Envíos nacionales", MARGIN, y)
  y += 5
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...SLATE)
  doc.text(`${DATOS_DEPOSITO.nacional.nombre} · RUT ${DATOS_DEPOSITO.nacional.rut}`, MARGIN, y)
  y += 4
  doc.text(`${DATOS_DEPOSITO.nacional.banco} · Cuenta ${DATOS_DEPOSITO.nacional.cuenta}`, MARGIN, y)
  y += 8
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...VERDE)
  doc.text("Western Union", MARGIN, y)
  y += 5
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...SLATE)
  doc.text(`${DATOS_DEPOSITO.westernUnion.nombre} · RUT ${DATOS_DEPOSITO.westernUnion.rut}`, MARGIN, y)
  y += 4
  doc.text(`${DATOS_DEPOSITO.westernUnion.domicilio}`, MARGIN, y)
  y += 4
  doc.text(`Celular ${DATOS_DEPOSITO.westernUnion.celular}`, MARGIN, y)
  y += 8

  // Observaciones
  if (cot.observaciones?.trim()) {
    y = drawSectionTitle(doc, "Observaciones", y)
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...SLATE)
    const lines = doc.splitTextToSize(cot.observaciones, CONTENT_WIDTH - 8)
    doc.text(lines, MARGIN + 4, y)
    y += lines.length * 5 + 4
  }

  // Footer
  doc.setDrawColor(...ORO)
  doc.setLineWidth(0.3)
  doc.line(MARGIN, 285, PAGE_WIDTH - MARGIN, 285)
  doc.setFontSize(8)
  doc.setTextColor(...SLATE_LIGHT)
  doc.text(
    "Departamentos Tita · Condominio Puerto Pacífico · Viña del Mar",
    PAGE_WIDTH / 2,
    290,
    { align: "center" }
  )

  return doc
}

/**
 * Descarga el PDF con el nombre estándar
 */
export function descargarPDFCotizacion(cot: CotizacionArriendo): void {
  const doc = generarPDFCotizacion(cot)
  doc.save(nombreArchivoCotizacion(cot))
}

/**
 * Abre el PDF en nueva pestaña para imprimir
 */
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
    // Fallback: descargar si no se puede abrir ventana
    doc.save(nombreArchivoCotizacion(cot))
  }
}
