/**
 * API de tipo de cambio USD/CLP
 * Usa MoneyConvert (actualizado cada 5 min, sin API key)
 * https://moneyconvert.net/api/
 */

import { NextResponse } from "next/server"

const MONEYCONVERT_URL = "https://cdn.moneyconvert.net/api/latest.json"

export async function GET() {
  try {
    const res = await fetch(MONEYCONVERT_URL, {
      next: { revalidate: 3600 }, // Cache 1 hora
    })
    if (!res.ok) throw new Error("Error al obtener tipo de cambio")
    const data = await res.json()
    const clpPerUsd = data?.rates?.CLP
    if (typeof clpPerUsd !== "number") throw new Error("CLP no encontrado")
    return NextResponse.json({
      clpPerUsd,
      usdPerClp: 1 / clpPerUsd,
      source: "MoneyConvert",
      ts: data?.ts,
    })
  } catch (e) {
    console.error("Tipo de cambio:", e)
    // Fallback aproximado si falla la API
    return NextResponse.json({
      clpPerUsd: 900,
      usdPerClp: 1 / 900,
      source: "fallback",
      error: e instanceof Error ? e.message : "Error desconocido",
    })
  }
}
