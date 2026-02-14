import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getDb } from "@/lib/db"

export const dynamic = "force-dynamic"

const ADMIN_USER = "dalal@vtr.net"
const ADMIN_PASSWORD = "Ignacio"
const ADMIN_DISPLAY_NAME = "Dalal Saleme"

/**
 * Crea o actualiza el usuario administrador.
 * Visita: https://tudominio.vercel.app/api/ensure-admin
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

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12)
    const existingAdmin = await usersCollection.findOne({ username: ADMIN_USER })

    if (!existingAdmin) {
      await usersCollection.insertOne({
        username: ADMIN_USER,
        password: hashedPassword,
        displayName: ADMIN_DISPLAY_NAME,
        role: "admin",
        createdAt: new Date(),
      })
      return NextResponse.json({
        success: true,
        action: "created",
        message: "Usuario administrador creado. Ya puedes iniciar sesión con dalal@vtr.net / Ignacio",
      })
    }

    await usersCollection.updateOne(
      { username: ADMIN_USER },
      { $set: { password: hashedPassword, displayName: ADMIN_DISPLAY_NAME } }
    )

    return NextResponse.json({
      success: true,
      action: "updated",
      message: "Contraseña del administrador actualizada. Intenta iniciar sesión de nuevo.",
    })
  } catch (error) {
    console.error("Error ensure-admin:", error)
    const msg = error instanceof Error ? error.message : "Error desconocido"
    return NextResponse.json(
      {
        success: false,
        error: "No se pudo crear/actualizar el admin",
        detail: msg,
        hint: "Verifica MONGODB_URI en Vercel y que MongoDB Atlas permita conexiones (Network Access → 0.0.0.0/0)",
      },
      { status: 500 }
    )
  }
}
