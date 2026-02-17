import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/db"
import { ObjectId } from "mongodb"

export const dynamic = "force-dynamic"

/** PUT: actualizar preset */
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
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const body = await request.json()
    const nombre = (body.nombre ?? "").trim()
    const nacional = {
      nombre: (body.nacional?.nombre ?? "").trim(),
      rut: (body.nacional?.rut ?? "").trim(),
      banco: (body.nacional?.banco ?? "").trim(),
      cuenta: (body.nacional?.cuenta ?? "").trim(),
    }
    const westernUnion = {
      nombre: (body.westernUnion?.nombre ?? "").trim(),
      rut: (body.westernUnion?.rut ?? "").trim(),
      domicilio: (body.westernUnion?.domicilio ?? "").trim(),
      celular: (body.westernUnion?.celular ?? "").trim(),
    }

    const db = await getDb()
    const result = await db.collection("datosDeposito").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          nombre: nombre || "Sin nombre",
          nacional,
          westernUnion,
          updatedAt: new Date(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Preset no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al actualizar preset:", error)
    return NextResponse.json(
      { error: "Error al actualizar datos de depósito" },
      { status: 500 }
    )
  }
}

/** DELETE: eliminar preset */
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
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const db = await getDb()
    const settings = await db.collection("settings").findOne({ _id: "site" } as never)
    const activeId = settings?.datosDepositoActiveId as string | undefined

    if (activeId === id) {
      return NextResponse.json(
        { error: "No se puede eliminar el preset activo. Selecciona otro primero." },
        { status: 400 }
      )
    }

    const result = await db.collection("datosDeposito").deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Preset no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar preset:", error)
    return NextResponse.json(
      { error: "Error al eliminar datos de depósito" },
      { status: 500 }
    )
  }
}
