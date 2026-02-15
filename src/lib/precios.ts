/**
 * Formato de precios CLP con separador de miles (.)
 * y conversión a USD
 */

/** Formato chileno: $90.000 (punto como separador de miles) */
export function formatPrecioCLP(n: number): string {
  return new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n || 0)
}

/** Convierte CLP a USD usando la tasa dada */
export function clpToUsd(clp: number, usdPerClp: number): number {
  return (clp || 0) * usdPerClp
}

/** Formato USD: US$104 */
export function formatUsd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n || 0)
}

/** Parsea un string de precio (ej: "90.000", "$1.440.000") a número */
export function parsePrecioInput(str: string): number {
  const digits = (str || "").replace(/\D/g, "")
  return parseInt(digits, 10) || 0
}

/** Precio completo: $90.000 (≈ US$100) */
export function formatPrecioConUsd(
  clp: number,
  usdPerClp: number | null
): string {
  const clpStr = `$${formatPrecioCLP(clp)}`
  if (usdPerClp == null) return clpStr
  const usd = clpToUsd(clp, usdPerClp)
  return `${clpStr} (≈ ${formatUsd(usd)})`
}
