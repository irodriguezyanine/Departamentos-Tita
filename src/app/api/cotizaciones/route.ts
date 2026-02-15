import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const db = await getDb()
    const cotizaciones = await db
      .collection("cotizaciones")
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    const serialized = cotizaciones.map((c) => ({
      ...c,
      _id: c._id.toString(),
    }))

    return NextResponse.json(serialized)
  } catch (error) {
    console.error("Error al obtener cotizaciones:", error)
    return NextResponse.json(
      { error: "Error al cargar cotizaciones" },
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

    const { _id: _omit, ...rest } = body as { _id?: string; [k: string]: unknown }
    const count = await db.collection("cotizaciones").countDocuments()
    const numero = `COT-${String(count + 1).padStart(4, "0")}`

    const doc = {
      ...rest,
      numero,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("cotizaciones").insertOne(doc)

    return NextResponse.json({
      _id: result.insertedId.toString(),
      ...doc,
    })
  } catch (error) {
    console.error("Error al crear cotización:", error)
    return NextResponse.json(
      { error: "Error al crear cotización" },
      { status: 500 }
    )
  }
}
