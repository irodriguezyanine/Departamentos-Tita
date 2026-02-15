import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/db"

const PLACEHOLDER_EMAIL = "sin-email@cotizacion.local"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const db = await getDb()
    const clientes = await db
      .collection("clientes")
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    const serialized = clientes.map((c) => ({
      ...c,
      _id: c._id.toString(),
    }))

    return NextResponse.json(serialized)
  } catch (error) {
    console.error("Error al obtener clientes:", error)
    return NextResponse.json(
      { error: "Error al cargar clientes" },
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
    const { nombre, apellido, email, telefono, mensaje, departamentoInteres, estacionamiento } = body

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
    await db.collection("clientes").insertOne({
      nombre: nombreVal,
      apellido: apellidoVal,
      email: (email || "").trim() || PLACEHOLDER_EMAIL,
      telefono: (telefono || "").trim(),
      mensaje: mensaje || "",
      departamentoInteres: departamentoInteres || "",
      estacionamiento: estacionamiento || "",
      fecha: new Date().toISOString(),
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al guardar cliente:", error)
    return NextResponse.json(
      { error: "Error al enviar consulta" },
      { status: 500 }
    )
  }
}
