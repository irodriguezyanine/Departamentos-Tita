import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/db"
import { ObjectId } from "mongodb"

export const dynamic = "force-dynamic"

/** PUT: actualizar estacionamiento */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { nivel, numero, codigoDepartamento } = body

    if (!nivel?.trim() || !numero?.trim()) {
      return NextResponse.json(
        { error: "Nivel y número son requeridos" },
        { status: 400 }
      )
    }

    const db = await getDb()
    const result = await db.collection("estacionamientos").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          nivel: String(nivel).trim(),
          numero: String(numero).trim(),
          codigoDepartamento: (codigoDepartamento || "").trim(),
          updatedAt: new Date(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Estacionamiento no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al actualizar estacionamiento:", error)
    return NextResponse.json(
      { error: "Error al actualizar estacionamiento" },
      { status: 500 }
    )
  }
}

/** DELETE: eliminar estacionamiento */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const db = await getDb()

    const result = await db.collection("estacionamientos").deleteOne({
      _id: new ObjectId(id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Estacionamiento no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar estacionamiento:", error)
    return NextResponse.json(
      { error: "Error al eliminar estacionamiento" },
      { status: 500 }
    )
  }
}
