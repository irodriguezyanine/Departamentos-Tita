import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/db"

export const dynamic = "force-dynamic"

const DEFAULT_NUESTRA_HISTORIA = {
  imagenUrl: "/assets/TITA Foto perfil.jpeg",
  titulo: "Nuestra historia",
  texto1:
    "Con más de **20 años de experiencia**, Dalal Saleme y Enrique Yanine ofrecen un **servicio excepcional** en el corazón de Viña del Mar.",
  texto2:
    "Cada departamento es cuidado con dedicación para que tu estadía sea inolvidable. Conocemos cada rincón del condominio y estamos comprometidos con tu comodidad y satisfacción.",
}

const DEFAULT_OG = {
  ogImage: "/og-image.png",
  ogTitle: "Condominio Puerto Pacífico | Arriendo en Viña del Mar, Dalal Saleme",
  ogDescription: "5 departamentos en arriendo primera línea de playa. Entra y reserva.",
}

export async function GET() {
  try {
    const db = await getDb()
    const doc = await db.collection("settings").findOne({ _id: "site" } as never)
    const settings = doc
      ? {
          mostrarPrecio: doc.mostrarPrecio ?? true,
          nuestraHistoria: {
            imagenUrl: doc.nuestraHistoria?.imagenUrl ?? DEFAULT_NUESTRA_HISTORIA.imagenUrl,
            titulo: doc.nuestraHistoria?.titulo ?? DEFAULT_NUESTRA_HISTORIA.titulo,
            texto1: doc.nuestraHistoria?.texto1 ?? DEFAULT_NUESTRA_HISTORIA.texto1,
            texto2: doc.nuestraHistoria?.texto2 ?? DEFAULT_NUESTRA_HISTORIA.texto2,
          },
          ogImage: doc.ogImage ?? DEFAULT_OG.ogImage,
          ogTitle: doc.ogTitle ?? DEFAULT_OG.ogTitle,
          ogDescription: doc.ogDescription ?? DEFAULT_OG.ogDescription,
        }
      : {
          mostrarPrecio: true,
          nuestraHistoria: DEFAULT_NUESTRA_HISTORIA,
          ...DEFAULT_OG,
        }
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error al obtener settings:", error)
    return NextResponse.json({
      mostrarPrecio: true,
      nuestraHistoria: DEFAULT_NUESTRA_HISTORIA,
      ...DEFAULT_OG,
    })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const updates: Record<string, unknown> = { updatedAt: new Date() }

    if (typeof body.mostrarPrecio === "boolean") updates.mostrarPrecio = body.mostrarPrecio
    if (body.nuestraHistoria) {
      updates.nuestraHistoria = {
        imagenUrl: body.nuestraHistoria.imagenUrl ?? "",
        titulo: body.nuestraHistoria.titulo ?? "",
        texto1: body.nuestraHistoria.texto1 ?? "",
        texto2: body.nuestraHistoria.texto2 ?? "",
      }
    }
    if (body.ogImage !== undefined) updates.ogImage = body.ogImage
    if (body.ogTitle !== undefined) updates.ogTitle = body.ogTitle
    if (body.ogDescription !== undefined) updates.ogDescription = body.ogDescription

    const db = await getDb()
    await db.collection("settings").updateOne(
      { _id: "site" } as never,
      { $set: updates },
      { upsert: true }
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error al actualizar settings:", error)
    return NextResponse.json(
      { error: "Error al guardar configuración" },
      { status: 500 }
    )
  }
}
