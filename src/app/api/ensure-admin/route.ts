import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getDb } from "@/lib/db"

export const dynamic = "force-dynamic"

const ADMINS = [
  { username: "dalal@vtr.net", password: "Ignacio", displayName: "Dalal Saleme" },
  { username: "irodriguezy", password: "12345", displayName: "Ignacio Rodríguez" },
]

/**
 * Crea o actualiza los usuarios administradores.
 * Visita: https://www.condominiopuertopacifico.cl/api/ensure-admin
 */
export async function GET() {
  return ensureAdmin()
}

export async function POST() {
  return ensureAdmin()
}

async function ensureAdmin() {
  try {
    const db = await getDb()
    const usersCollection = db.collection("users")
    const results: string[] = []

    for (const admin of ADMINS) {
      const hashedPassword = await bcrypt.hash(admin.password, 12)
      const existing = await usersCollection.findOne({ username: admin.username })

      if (!existing) {
        await usersCollection.insertOne({
          username: admin.username,
          password: hashedPassword,
          displayName: admin.displayName,
          role: "admin",
          createdAt: new Date(),
        })
        results.push(`Creado: ${admin.username}`)
      } else {
        await usersCollection.updateOne(
          { username: admin.username },
          { $set: { password: hashedPassword, displayName: admin.displayName } }
        )
        results.push(`Actualizado: ${admin.username}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Administradores listos. Puedes iniciar sesión con:",
      usuarios: [
        "dalal@vtr.net / Ignacio",
        "irodriguezy / 12345",
      ],
      detalles: results,
    })
  } catch (error) {
    console.error("Error ensure-admin:", error)
    const msg = error instanceof Error ? error.message : "Error desconocido"
    return NextResponse.json(
      {
        success: false,
        error: "No se pudo crear/actualizar los admins",
        detail: msg,
        hint: "Verifica MONGODB_URI en Vercel y que MongoDB Atlas permita conexiones (Network Access → 0.0.0.0/0)",
      },
      { status: 500 }
    )
  }
}
