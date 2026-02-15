/**
 * Estacionamientos por departamento - Inventario
 * Costo por defecto: $20.000 diarios
 */

export const COSTO_ESTACIONAMIENTO_DIARIO = 20_000

export interface Estacionamiento {
  nivel: string
  numero: string
}

/** Mapeo código departamento (ej: "4 C", "13 D") → estacionamientos */
export const ESTACIONAMIENTOS_POR_DEPARTAMENTO: Record<string, Estacionamiento[]> = {
  "4 C": [{ nivel: "-3", numero: "24" }],
  "13 D": [{ nivel: "-1", numero: "329" }],
  "15 D": [{ nivel: "-1", numero: "01" }],
  "16 C": [{ nivel: "-1", numero: "110" }],
  "16 D": [
    { nivel: "-1", numero: "140" },
    { nivel: "-1", numero: "148" },
  ],
  "17 C": [{ nivel: "-2", numero: "170" }],
  "18 C": [], // Sin datos proporcionados
}

/** Extrae el código del departamento (ej: "4 C") desde el nombre completo */
export function getCodigoDepartamento(name: string): string {
  const match = name.match(/^(\d+\s*[A-Z])/)
  return match ? match[1].trim() : ""
}

export function getEstacionamientos(name: string): Estacionamiento[] {
  const codigo = getCodigoDepartamento(name)
  return ESTACIONAMIENTOS_POR_DEPARTAMENTO[codigo] ?? []
}

export function formatEstacionamientos(estacionamientos: Estacionamiento[]): string {
  if (!estacionamientos.length) return "—"
  return estacionamientos
    .map((e) => `Nivel ${e.nivel}, ${e.numero}`)
    .join(" · ")
}

/** Lista de TODOS los estacionamientos de todos los departamentos para selector */
export interface EstacionamientoOpcion {
  value: string
  label: string
}

export function getTodosEstacionamientosOpciones(): EstacionamientoOpcion[] {
  const opciones: EstacionamientoOpcion[] = []
  for (const [depto, estacs] of Object.entries(ESTACIONAMIENTOS_POR_DEPARTAMENTO)) {
    for (const e of estacs) {
      const value = `${depto} - Nivel ${e.nivel}, ${e.numero}`
      opciones.push({ value, label: value })
    }
  }
  return opciones
}
