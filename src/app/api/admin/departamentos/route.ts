import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/db"
import { ObjectId } from "mongodb"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const db = await getDb()
    const departamentos = await db
      .collection("departamentos")
      .find({})
      .sort({ name: 1 })
      .toArray()

    const serialized = departamentos.map((d) => ({
      ...d,
      _id: d._id.toString(),
    }))

    return NextResponse.json(serialized)
  } catch (error) {
    console.error("Error al obtener departamentos:", error)
    return NextResponse.json(
      { error: "Error al cargar departamentos" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const db = await getDb()

    const doc = {
      ...body,
      disponible: body.disponible ?? true,
      imagenes: body.imagenes || [],
      layout: body.layout || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("departamentos").insertOne(doc)

    return NextResponse.json({
      success: true,
      _id: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Error al crear departamento:", error)
    return NextResponse.json(
      { error: "Error al crear departamento" },
      { status: 500 }
    )
  }
}
