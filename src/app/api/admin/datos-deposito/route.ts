import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/db"
import { DATOS_DEPOSITO, type DatosDepositoPreset } from "@/types/cotizacion"

export const dynamic = "force-dynamic"

/** GET: lista presets + id del activo */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const db = await getDb()
    const presets = await db
      .collection("datosDeposito")
      .find({})
      .sort({ updatedAt: -1 })
      .toArray()

    const settings = await db.collection("settings").findOne({ _id: "site" } as never)
    const activeId = (settings?.datosDepositoActiveId as string) || null

    const list: DatosDepositoPreset[] = presets.map((d: Record<string, unknown>) => ({
      _id: (d._id as { toString: () => string }).toString(),
      nombre: (d.nombre as string) || "Sin nombre",
      nacional: {
        nombre: (d.nacional as { nombre?: string })?.nombre ?? "",
        rut: (d.nacional as { rut?: string })?.rut ?? "",
        banco: (d.nacional as { banco?: string })?.banco ?? "",
        cuenta: (d.nacional as { cuenta?: string })?.cuenta ?? "",
      },
      westernUnion: {
        nombre: (d.westernUnion as { nombre?: string })?.nombre ?? "",
        rut: (d.westernUnion as { rut?: string })?.rut ?? "",
        domicilio: (d.westernUnion as { domicilio?: string })?.domicilio ?? "",
        celular: (d.westernUnion as { celular?: string })?.celular ?? "",
      },
      createdAt: (d.createdAt as Date)?.toISOString?.(),
      updatedAt: (d.updatedAt as Date)?.toISOString?.(),
    }))

    if (list.length === 0) {
      const defaultDoc = {
        nombre: "Actual",
        nacional: DATOS_DEPOSITO.nacional,
        westernUnion: DATOS_DEPOSITO.westernUnion,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const result = await db.collection("datosDeposito").insertOne(defaultDoc)
      const newId = result.insertedId.toString()
      await db.collection("settings").updateOne(
        { _id: "site" } as never,
        { $set: { datosDepositoActiveId: newId, updatedAt: new Date() } },
        { upsert: true }
      )
      return NextResponse.json({
        presets: [
          {
            _id: newId,
            nombre: defaultDoc.nombre,
            nacional: defaultDoc.nacional,
            westernUnion: defaultDoc.westernUnion,
            createdAt: defaultDoc.createdAt.toISOString(),
            updatedAt: defaultDoc.updatedAt.toISOString(),
          },
        ],
        activeId: newId,
      })
    }

    return NextResponse.json({ presets: list, activeId })
  } catch (error) {
    console.error("Error al obtener datos depósito:", error)
    return NextResponse.json(
      { error: "Error al cargar datos de depósito" },
      { status: 500 }
    )
  }
}

/** POST: crear nuevo preset */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const nombre = (body.nombre || "Nuevo").trim()
    const nacional = {
      nombre: (body.nacional?.nombre ?? "").trim(),
      rut: (body.nacional?.rut ?? "").trim(),
      banco: (body.nacional?.banco ?? "").trim(),
      cuenta: (body.nacional?.cuenta ?? "").trim(),
    }
    const westernUnion = {
      nombre: (body.westernUnion?.nombre ?? "").trim(),
      rut: (body.westernUnion?.rut ?? "").trim(),
      domicilio: (body.westernUnion?.domicilio ?? "").trim(),
      celular: (body.westernUnion?.celular ?? "").trim(),
    }

    const db = await getDb()
    const doc = {
      nombre,
      nacional,
      westernUnion,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const result = await db.collection("datosDeposito").insertOne(doc)

    return NextResponse.json({
      success: true,
      _id: result.insertedId.toString(),
      preset: {
        _id: result.insertedId.toString(),
        nombre: doc.nombre,
        nacional: doc.nacional,
        westernUnion: doc.westernUnion,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("Error al crear preset:", error)
    return NextResponse.json(
      { error: "Error al crear datos de depósito" },
      { status: 500 }
    )
  }
}
