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

function splitNombreApellido(full: string): { nombre: string; apellido: string } {
  const parts = full.trim().split(/\s+/)
  if (parts.length === 0) return { nombre: "", apellido: "" }
  if (parts.length === 1) return { nombre: parts[0], apellido: "" }
  return {
    nombre: parts[0],
    apellido: parts.slice(1).join(" "),
  }
}

export async function upsertClienteDesdeCotizacion(
  datos: DatosClienteCotizacion
): Promise<void> {
  const fullName = datos.nombreArrendatario?.trim()
  if (!fullName) return

  const { nombre, apellido } = splitNombreApellido(fullName)
  const email = (datos.emailArrendatario || "").trim()
  const telefono = (datos.telefonoArrendatario || "").trim()
  const departamento = [datos.departamento, datos.torre].filter(Boolean).join(" ") || ""

  const db = await getDb()
  const col = db.collection("clientes")

  const doc = {
    nombre,
    apellido,
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
    const existingByTel = await col.findOne({ telefono })
    if (existingByTel) {
      await col.updateOne({ _id: existingByTel._id }, { $set: doc })
    } else {
      await col.insertOne({ ...doc, createdAt: new Date() })
    }
  } else {
    const existing = await col.findOne({
      $and: [
        { $or: [{ nombre, apellido }, { nombre: fullName }] },
        { email: { $in: ["", "sin-email@cotizacion.local"] } },
      ],
    })
    if (existing) {
      await col.updateOne({ _id: existing._id }, { $set: doc })
    } else {
      await col.insertOne({ ...doc, createdAt: new Date() })
    }
  }
}
