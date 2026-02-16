import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/db"

export const dynamic = "force-dynamic"

const AMENIDADES = [
  { id: "piscinas", titulo: "4 Piscinas", descripcion: "Dos para adultos y dos para niños" },
  { id: "gimnasio", titulo: "Gimnasio", descripcion: "Equipado para tu rutina" },
  { id: "estacionamiento", titulo: "Estacionamiento", descripcion: "Para visitas y residentes" },
  { id: "conserjeria", titulo: "Conserjería 24 hrs", descripcion: "Seguridad y atención permanente" },
  { id: "sala_usos_multiples", titulo: "Sala de usos múltiples", descripcion: "Espacios compartidos" },
  { id: "lavanderia", titulo: "Lavandería", descripcion: "Comodidad total" },
] as const

export type AmenidadId = (typeof AMENIDADES)[number]["id"]

export async function GET() {
  try {
    const db = await getDb()
    const docs = (await db.collection("galerias_amenidades").find({}).toArray()) as unknown as { _id: string; titulo?: string; descripcion?: string; fotos?: { url: string }[] }[]
    const map = new Map(docs.map((d) => [d._id, d]))
    const result = AMENIDADES.map((a) => {
      const doc = map.get(a.id) as { titulo?: string; descripcion?: string; fotos?: { url: string }[] } | undefined
      return {
        id: a.id,
        titulo: doc?.titulo ?? a.titulo,
        descripcion: doc?.descripcion ?? a.descripcion,
        fotos: doc?.fotos ?? [],
      }
    })
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error al obtener galerías:", error)
    return NextResponse.json(
      AMENIDADES.map((a) => ({ id: a.id, titulo: a.titulo, descripcion: a.descripcion, fotos: [] }))
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { id, titulo, descripcion, fotos } = body
    if (!id || !AMENIDADES.some((a) => a.id === id)) {
      return NextResponse.json({ error: "Amenidad no válida" }, { status: 400 })
    }

    const fotosLimitadas = (Array.isArray(fotos) ? fotos : []).slice(0, 6).map((f: { url?: string }) => ({ url: f?.url ?? "" }))

    const db = await getDb()
    await db.collection("galerias_amenidades").updateOne(
      { _id: id } as never,
      {
        $set: {
          titulo: titulo ?? "",
          descripcion: descripcion ?? "",
          fotos: fotosLimitadas,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error al guardar galería:", error)
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 })
  }
}
