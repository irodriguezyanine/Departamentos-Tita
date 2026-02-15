/**
 * Sincroniza cliente desde cotización a la base de datos central de clientes
 */

import { getDb } from "./db"

interface DatosClienteCotizacion {
  nombreArrendatario: string
  emailArrendatario?: string
  telefonoArrendatario?: string
  departamento?: string
  torre?: string
}

export async function upsertClienteDesdeCotizacion(
  datos: DatosClienteCotizacion
): Promise<void> {
  const nombre = datos.nombreArrendatario?.trim()
  if (!nombre) return

  const email = (datos.emailArrendatario || "").trim()
  const telefono = (datos.telefonoArrendatario || "").trim()
  const departamento = [datos.departamento, datos.torre].filter(Boolean).join(" ") || ""

  const db = await getDb()
  const col = db.collection("clientes")

  const doc = {
    nombre,
    email: email || "sin-email@cotizacion.local",
    telefono: telefono || "",
    departamentoInteres: departamento,
    mensaje: "",
    fecha: new Date().toISOString(),
    updatedAt: new Date(),
  }

  if (email && email !== "sin-email@cotizacion.local") {
    await col.updateOne(
      { email },
      { $set: doc },
      { upsert: true }
    )
  } else if (telefono) {
    await col.updateOne(
      { nombre, telefono },
      { $set: doc },
      { upsert: true }
    )
  } else {
    const existing = await col.findOne({
      nombre,
      $or: [{ email: "" }, { email: "sin-email@cotizacion.local" }],
    })
    if (existing) {
      await col.updateOne({ _id: existing._id }, { $set: doc })
    } else {
      await col.insertOne({ ...doc, createdAt: new Date() })
    }
  }
}
