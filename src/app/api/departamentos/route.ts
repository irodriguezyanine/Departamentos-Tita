import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET() {
  try {
    const db = await getDb()
    const departamentos = await db
      .collection("departamentos")
      .find({ disponible: true })
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
