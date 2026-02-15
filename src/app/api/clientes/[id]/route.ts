import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const PLACEHOLDER_EMAIL = "sin-email@cotizacion.local"
import { getDb } from "@/lib/db"
import { ObjectId } from "mongodb"

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
    const { nombre, apellido, email, telefono, mensaje, departamentoInteres } = body

    const nombreVal = (nombre || "").trim()
    const apellidoVal = (apellido || "").trim()
    const nombreCompleto = [nombreVal, apellidoVal].filter(Boolean).join(" ")

    if (!nombreCompleto) {
      return NextResponse.json(
        { error: "Nombre o apellido es requerido" },
        { status: 400 }
      )
    }

    const db = await getDb()
    const emailVal = (email || "").trim()
    const result = await db.collection("clientes").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          nombre: nombreVal,
          apellido: apellidoVal,
          email: emailVal || PLACEHOLDER_EMAIL,
          telefono: (telefono || "").trim(),
          mensaje: (mensaje || "").trim(),
          departamentoInteres: (departamentoInteres || "").trim(),
          updatedAt: new Date(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al actualizar cliente:", error)
    return NextResponse.json(
      { error: "Error al actualizar cliente" },
      { status: 500 }
    )
  }
}
