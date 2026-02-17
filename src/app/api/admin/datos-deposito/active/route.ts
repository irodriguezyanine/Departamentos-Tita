import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/db"
import { ObjectId } from "mongodb"

export const dynamic = "force-dynamic"

/** PUT: establecer preset activo */
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const activeId = (body.activeId ?? "").trim()

    if (!activeId || !ObjectId.isValid(activeId)) {
      return NextResponse.json({ error: "ID de preset inválido" }, { status: 400 })
    }

    const db = await getDb()
    const exists = await db.collection("datosDeposito").findOne({ _id: new ObjectId(activeId) })
    if (!exists) {
      return NextResponse.json({ error: "Preset no encontrado" }, { status: 404 })
    }

    await db.collection("settings").updateOne(
      { _id: "site" } as never,
      { $set: { datosDepositoActiveId: activeId, updatedAt: new Date() } },
      { upsert: true }
    )

    return NextResponse.json({ success: true, activeId })
  } catch (error) {
    console.error("Error al establecer preset activo:", error)
    return NextResponse.json(
      { error: "Error al guardar configuración" },
      { status: 500 }
    )
  }
}
