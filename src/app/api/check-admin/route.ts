import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export const dynamic = "force-dynamic"

/**
 * Diagnóstico: verifica si MongoDB está conectado y si el usuario admin existe.
 * Visita: https://departamentostita.vercel.app/api/check-admin
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
    return NextResponse.json(
      {
        ok: false,
        mongo: "Error de conexión: " + msg,
        hint: "Revisa MONGODB_URI en Vercel. En MongoDB Atlas: Network Access → Add IP → 0.0.0.0/0",
      },
      { status: 500 }
    )
  }
}
