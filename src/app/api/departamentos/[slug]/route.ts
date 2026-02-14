import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getDb } from "@/lib/db"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const db = await getDb()

    const dept = await db.collection("departamentos").findOne(
      ObjectId.isValid(slug) ? { _id: new ObjectId(slug) } : { slug }
    )

    if (!dept) {
      return NextResponse.json({ error: "Departamento no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      ...dept,
      _id: dept._id.toString(),
    })
  } catch (error) {
    console.error("Error al obtener departamento:", error)
    return NextResponse.json(
      { error: "Error al cargar departamento" },
      { status: 500 }
    )
  }
}
