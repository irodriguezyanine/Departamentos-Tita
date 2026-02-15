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
    const user = await db.collection("users").findOne({ username: "dalal@vtr.net" })

    return NextResponse.json({
      ok: true,
      mongo: "Conectado",
      adminExiste: !!user,
      nextAuth: hasNextAuthSecret ? "OK" : "Falta NEXTAUTH_SECRET",
      nextAuthUrl,
      pasos: !user
        ? "Visita /api/ensure-admin para crear el usuario admin, luego intenta iniciar sesión con dalal@vtr.net / Ignacio"
        : "El usuario admin existe. Si no puedes entrar, visita /api/ensure-admin para restablecer la contraseña.",
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
