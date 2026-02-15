import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/db"
import { upsertClienteDesdeCotizacion } from "@/lib/clientes"
import { ObjectId } from "mongodb"

export async function GET(
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

    const cot = await db.collection("cotizaciones").findOne({
      _id: new ObjectId(id),
    })

    if (!cot) {
      return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 })
    }

    return NextResponse.json({
      ...cot,
      _id: cot._id.toString(),
    })
  } catch (error) {
    console.error("Error al obtener cotización:", error)
    return NextResponse.json(
      { error: "Error al cargar cotización" },
      { status: 500 }
    )
  }
}

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
    const db = await getDb()

    const { _id: _omit, ...rest } = body as { _id?: string; [k: string]: unknown }
    const update = {
      ...rest,
      updatedAt: new Date(),
    }

    await db.collection("cotizaciones").updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    )

    await upsertClienteDesdeCotizacion({
      nombreArrendatario: (body.nombreArrendatario as string) || "",
      apellidoArrendatario: body.apellidoArrendatario as string | undefined,
      emailArrendatario: body.emailArrendatario as string | undefined,
      telefonoArrendatario: body.telefonoArrendatario as string | undefined,
      departamento: body.departamento as string | undefined,
      torre: body.torre as string | undefined,
    }).catch((e) => console.error("Error al sincronizar cliente:", e))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al actualizar cotización:", error)
    return NextResponse.json(
      { error: "Error al actualizar cotización" },
      { status: 500 }
    )
  }
}

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

    await db.collection("cotizaciones").deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar cotización:", error)
    return NextResponse.json(
      { error: "Error al eliminar cotización" },
      { status: 500 }
    )
  }
}
