import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getDb } from "@/lib/db"
import { getDepartamentoBySlug } from "@/data/departamentos-static"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const db = await getDb()

    const dept = await db.collection("departamentos").findOne(
      ObjectId.isValid(slug) ? { _id: new ObjectId(slug) } : { slug }
    )

    if (!dept) {
      return NextResponse.json({ error: "Departamento no encontrado" }, { status: 404 })
    }

    let imagenes = dept.imagenes || []
    let descripcionLarga = dept.descripcionLarga

    const staticDept = dept.slug ? getDepartamentoBySlug(dept.slug) : null
    if (staticDept) {
      if (imagenes.length === 0 && staticDept.imagenes?.length) {
        imagenes = staticDept.imagenes.map((img) => ({
          url: img.url,
          orden: img.orden,
          alt: img.alt,
        }))
      }
      if (!descripcionLarga && staticDept.descripcionLarga) {
        descripcionLarga = staticDept.descripcionLarga
      }
    }

    const sortedImagenes = [...imagenes].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))

    return NextResponse.json({
      ...dept,
      _id: dept._id.toString(),
      imagenes: sortedImagenes,
      descripcionLarga: descripcionLarga ?? dept.descripcionLarga,
    })
  } catch (error) {
    console.error("Error al obtener departamento:", error)
    return NextResponse.json(
      { error: "Error al cargar departamento" },
      { status: 500 }
    )
  }
}
