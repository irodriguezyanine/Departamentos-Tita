/**
 * Códigos de país para teléfono
 * Orden: Chile, Argentina, Brasil primero, luego resto de Latinoamérica, luego resto del mundo
 */

export interface CodigoPais {
  codigo: string
  pais: string
}

export const CODIGOS_PAIS: CodigoPais[] = [
  // Primeros 3: Chile, Argentina, Brasil
  { codigo: "+56", pais: "Chile" },
  { codigo: "+54", pais: "Argentina" },
  { codigo: "+55", pais: "Brasil" },
  // Resto de Latinoamérica
  { codigo: "+52", pais: "México" },
  { codigo: "+57", pais: "Colombia" },
  { codigo: "+51", pais: "Perú" },
  { codigo: "+593", pais: "Ecuador" },
  { codigo: "+58", pais: "Venezuela" },
  { codigo: "+591", pais: "Bolivia" },
  { codigo: "+595", pais: "Paraguay" },
  { codigo: "+598", pais: "Uruguay" },
  { codigo: "+502", pais: "Guatemala" },
  { codigo: "+503", pais: "El Salvador" },
  { codigo: "+504", pais: "Honduras" },
  { codigo: "+505", pais: "Nicaragua" },
  { codigo: "+506", pais: "Costa Rica" },
  { codigo: "+507", pais: "Panamá" },
  { codigo: "+53", pais: "Cuba" },
  { codigo: "+1809", pais: "Rep. Dominicana" },
  { codigo: "+592", pais: "Guyana" },
  { codigo: "+597", pais: "Surinam" },
  // Resto del mundo
  { codigo: "+34", pais: "España" },
  { codigo: "+1", pais: "Estados Unidos / Canadá" },
  { codigo: "+44", pais: "Reino Unido" },
  { codigo: "+49", pais: "Alemania" },
  { codigo: "+33", pais: "Francia" },
  { codigo: "+39", pais: "Italia" },
  { codigo: "+81", pais: "Japón" },
  { codigo: "+86", pais: "China" },
  { codigo: "+91", pais: "India" },
  { codigo: "+61", pais: "Australia" },
  { codigo: "+27", pais: "Sudáfrica" },
  { codigo: "+7", pais: "Rusia" },
]

/** Parsea un número con código de país y devuelve { codigo, numero } */
export function parseTelefonoConCodigo(full: string): { codigo: string; numero: string } {
  const trimmed = (full || "").trim()
  if (!trimmed) return { codigo: "+56", numero: "" }
  const sinEspacios = trimmed.replace(/\s/g, "")
  if (!sinEspacios.startsWith("+")) {
    if (sinEspacios.match(/^56/)) return { codigo: "+56", numero: sinEspacios.replace(/^56/, "") }
    return { codigo: "+56", numero: sinEspacios }
  }
  const ordenados = [...CODIGOS_PAIS].sort((a, b) => b.codigo.length - a.codigo.length)
  for (const p of ordenados) {
    if (sinEspacios.startsWith(p.codigo)) {
      return {
        codigo: p.codigo,
        numero: sinEspacios.slice(p.codigo.length),
      }
    }
  }
  return { codigo: "+56", numero: sinEspacios.slice(1) }
}
