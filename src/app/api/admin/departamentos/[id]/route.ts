import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/db"
import { ObjectId } from "mongodb"
import { getDepartamentoBySlug } from "@/data/departamentos-static"

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

    const dept = await db.collection("departamentos").findOne({
      _id: new ObjectId(id),
    })

    if (!dept) {
      return NextResponse.json({ error: "Departamento no encontrado" }, { status: 404 })
    }

    let imagenes = dept.imagenes || []

    if (imagenes.length === 0 && dept.slug) {
      const staticDept = getDepartamentoBySlug(dept.slug)
      if (staticDept?.imagenes?.length) {
        imagenes = staticDept.imagenes.map((img) => ({
          url: img.url,
          orden: img.orden,
          alt: img.alt,
        }))
      }
    }

    return NextResponse.json({
      ...dept,
      _id: dept._id.toString(),
      imagenes,
    })
  } catch (error) {
    console.error("Error al obtener departamento:", error)
    return NextResponse.json(
      { error: "Error al cargar departamento" },
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

    await db.collection("departamentos").updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al actualizar departamento:", error)
    return NextResponse.json(
      { error: "Error al actualizar departamento" },
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

    await db.collection("departamentos").deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar departamento:", error)
    return NextResponse.json(
      { error: "Error al eliminar departamento" },
      { status: 500 }
    )
  }
}
