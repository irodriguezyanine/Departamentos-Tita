import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/db"
import { ESTACIONAMIENTOS_POR_DEPARTAMENTO } from "@/data/estacionamientos"

export const dynamic = "force-dynamic"

interface EstacionamientoDoc {
  nivel: string
  numero: string
  codigoDepartamento?: string
}

/** GET: retorna estáticos + los de MongoDB */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const db = await getDb()
    const fromDb = await db
      .collection("estacionamientos")
      .find({})
      .sort({ codigoDepartamento: 1, nivel: 1, numero: 1 })
      .toArray()

    const staticList: EstacionamientoDoc[] = []
    for (const [codigo, estacs] of Object.entries(ESTACIONAMIENTOS_POR_DEPARTAMENTO)) {
      for (const e of estacs) {
        staticList.push({
          nivel: e.nivel,
          numero: e.numero,
          codigoDepartamento: codigo,
        })
      }
    }

    const dbList = fromDb.map((d) => ({
      _id: (d as { _id?: unknown })._id?.toString(),
      nivel: (d as EstacionamientoDoc).nivel,
      numero: (d as EstacionamientoDoc).numero,
      codigoDepartamento: (d as EstacionamientoDoc).codigoDepartamento ?? "",
    }))

    const merged = [...staticList.map((s) => ({ ...s, _id: undefined, source: "static" })), ...dbList.map((d) => ({ ...d, source: "db" }))]

    return NextResponse.json(merged)
  } catch (error) {
    console.error("Error al obtener estacionamientos:", error)
    return NextResponse.json(
      { error: "Error al cargar estacionamientos" },
      { status: 500 }
    )
  }
}

/** POST: crear nuevo estacionamiento (puede no tener departamento asignado) */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { nivel, numero, codigoDepartamento } = body

    if (!nivel?.trim() || !numero?.trim()) {
      return NextResponse.json(
        { error: "Nivel y número son requeridos" },
        { status: 400 }
      )
    }

    const db = await getDb()
    const doc = {
      nivel: String(nivel).trim(),
      numero: String(numero).trim(),
      codigoDepartamento: codigoDepartamento?.trim() || "",
      createdAt: new Date(),
    }

    const result = await db.collection("estacionamientos").insertOne(doc)

    return NextResponse.json({
      success: true,
      _id: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Error al crear estacionamiento:", error)
    return NextResponse.json(
      { error: "Error al crear estacionamiento" },
      { status: 500 }
    )
  }
}
