import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getDb } from "@/lib/db"
import { DEPARTAMENTOS_INICIALES } from "@/data/departamentos"

const ADMIN_USER = "dalal@vtr.net"
const ADMIN_PASSWORD = "Ignacio"
const ADMIN_DISPLAY_NAME = "Dalal Saleme"

export async function GET() {
  return seed()
}

export async function POST() {
  return seed()
}

async function seed() {
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
    } else {
      // Actualizar contraseña por si cambió o hubo algún problema
      await usersCollection.updateOne(
        { username: ADMIN_USER },
        { $set: { password: hashedPassword, displayName: ADMIN_DISPLAY_NAME } }
      )
    }

    const departamentosCollection = db.collection("departamentos")
    const existingDepts = await departamentosCollection.countDocuments()
    if (existingDepts === 0) {
      await departamentosCollection.insertMany(
        DEPARTAMENTOS_INICIALES.map((d) => ({
          ...d,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      )
    }

    return NextResponse.json({
      success: true,
      message: "Base de datos inicializada. Usuario admin y departamentos creados.",
    })
  } catch (error) {
    console.error("Error al ejecutar seed:", error)
    const msg = error instanceof Error ? error.message : "Error desconocido"
    const hint =
      !process.env.MONGODB_URI
        ? "MONGODB_URI no está configurada."
        : msg.includes("ENOTFOUND") || msg.includes("getaddrinfo")
          ? "No se puede conectar a MongoDB. En Atlas: Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)."
          : msg.includes("auth") || msg.includes("Authentication")
            ? "Usuario o contraseña de MongoDB incorrectos. Verifica MONGODB_URI."
            : "Revisa MONGODB_URI y el acceso de red en MongoDB Atlas."
    return NextResponse.json(
      { error: "Error al inicializar la base de datos", hint, detail: msg },
      { status: 500 }
    )
  }
}
