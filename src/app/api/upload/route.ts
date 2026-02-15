import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { cloudinary } from "@/lib/cloudinary"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

/**
 * Las fotos se suben al destino según el departamento:
 * - Cloudinary: departamentos_tita/{slug} (ej: 4c-torre-galapagos, 13d-torre-cabo-hornos)
 * - Local (fallback): public/assets/departamentos/{slug}/
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const folder = (formData.get("folder") as string) || "departamentos_tita"

    if (!file) {
      return NextResponse.json({ error: "No se envió ningún archivo" }, { status: 400 })
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "video/mp4", "video/webm"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido. Usa JPG, PNG, WebP, GIF o MP4." },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Intentar Cloudinary primero si está configurado
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      const base64 = `data:${file.type};base64,${buffer.toString("base64")}`
      const isVideo = file.type.startsWith("video/")
      const result = await cloudinary.uploader.upload(base64, {
        folder: `departamentos_tita/${folder}`,
        resource_type: isVideo ? "video" : "image",
      })
      return NextResponse.json({
        url: result.secure_url,
        publicId: result.public_id,
      })
    }

    // Fallback: guardar en public/assets/departamentos/{slug}/ (mismo destino que las fotos estáticas)
    const ext = path.extname(file.name) || (file.type.includes("png") ? ".png" : ".jpg")
    const filename = `foto-${Date.now()}${ext}`
    const dir = path.join(process.cwd(), "public", "assets", "departamentos", folder)
    const filepath = path.join(dir, filename)

    await mkdir(dir, { recursive: true })
    await writeFile(filepath, buffer)

    const url = `/assets/departamentos/${folder}/${filename}`
    return NextResponse.json({ url, publicId: undefined })
  } catch (error) {
    console.error("Error al subir archivo:", error)
    return NextResponse.json(
      { error: "Error al subir el archivo. Verifica la configuración de Cloudinary o el sistema de archivos." },
      { status: 500 }
    )
  }
}
