import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export const dynamic = "force-dynamic"

/**
 * Diagnóstico: verifica si MongoDB está conectado y si el usuario admin existe.
 * Visita: https://www.condominiopuertopacifico.cl/api/check-admin
 */
export async function GET() {
  try {
    const hasMongoUri = !!process.env.MONGODB_URI
    const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET
    const nextAuthUrl = process.env.NEXTAUTH_URL || "(no definido)"

    if (!hasMongoUri) {
      return NextResponse.json({
        ok: false,
        mongo: "MONGODB_URI no está configurado en Vercel",
        nextAuth: hasNextAuthSecret ? "OK" : "NEXTAUTH_SECRET no configurado",
        nextAuthUrl,
      })
    }

    const db = await getDb()
    const usersCollection = db.collection("users")
    const dalal = await usersCollection.findOne({ username: "dalal@vtr.net" })
    const ignacio = await usersCollection.findOne({ username: "irodriguezy" })

    return NextResponse.json({
      ok: true,
      mongo: "Conectado",
      usuarios: {
        "dalal@vtr.net": !!dalal,
        irodriguezy: !!ignacio,
      },
      nextAuth: hasNextAuthSecret ? "OK" : "Falta NEXTAUTH_SECRET",
      nextAuthUrl,
      pasos:
        !dalal && !ignacio
          ? "Visita /api/ensure-admin para crear los usuarios admin"
          : "Usuarios listos. Si no entras: visita /api/ensure-admin para restablecer contraseñas.",
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    const isBadAuth = msg.toLowerCase().includes("auth") || msg.toLowerCase().includes("authentication")
    const hint = isBadAuth
      ? "MONGODB_URI: usuario o contraseña incorrectos. En MongoDB Atlas: Database Access → verifica el usuario. Si la contraseña tiene caracteres especiales (@ # : etc.), codifícala en URL (ej: @ → %40)."
      : "Revisa MONGODB_URI en Vercel. En MongoDB Atlas: Network Access → Add IP → 0.0.0.0/0"
    return NextResponse.json(
      {
        ok: false,
        mongo: "Error de conexión: " + msg,
        hint,
      },
      { status: 500 }
    )
  }
}
