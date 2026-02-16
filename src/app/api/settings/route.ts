import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/db"

export const dynamic = "force-dynamic"

const DEFAULT_SETTINGS = { mostrarPrecio: true }

export async function GET() {
  try {
    const db = await getDb()
    const doc = await db.collection("settings").findOne({ _id: "site" } as never)
    const settings = doc
      ? { mostrarPrecio: doc.mostrarPrecio ?? true }
      : DEFAULT_SETTINGS
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error al obtener settings:", error)
    return NextResponse.json(DEFAULT_SETTINGS)
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const mostrarPrecio = body.mostrarPrecio ?? true

    const db = await getDb()
    await db.collection("settings").updateOne(
      { _id: "site" } as never,
      { $set: { mostrarPrecio, updatedAt: new Date() } },
      { upsert: true }
    )

    return NextResponse.json({ mostrarPrecio })
  } catch (error) {
    console.error("Error al actualizar settings:", error)
    return NextResponse.json(
      { error: "Error al guardar configuración" },
      { status: 500 }
    )
  }
}
