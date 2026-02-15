"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Upload, GripVertical, Star, X } from "lucide-react"
import Image from "next/image"

interface ImagenItem {
  url: string
  publicId?: string
  orden: number
  width?: number
  height?: number
}

interface Departamento {
  _id: string
  name: string
  slug: string
  torre: string
  precio: number
  descripcion: string
  dormitorios?: number
  banos?: number
  terraza?: boolean
  logia?: boolean
  orientacion?: string
  notaEspecial?: string
  disponible: boolean
  imagenes: ImagenItem[]
}

export default function EditarDepartamentoPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [dept, setDept] = useState<Departamento | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/departamentos/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setDept(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    if (!dept) return
    setSaving(true)
    try {
      const { _id, ...payload } = dept
      const res = await fetch(`/api/admin/departamentos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) router.push("/admin/departamentos")
    } catch (e) {
      console.error(e)
    }
    setSaving(false)
  }

  const MAX_FOTOS = 50

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length || !dept) return
    const current = dept.imagenes?.length || 0
    if (current >= MAX_FOTOS) return

    const toUpload = Array.from(files).slice(0, MAX_FOTOS - current)
    setUploading(true)
    try {
      let newImagenes = [...(dept.imagenes || [])]
      for (let i = 0; i < toUpload.length; i++) {
        const file = toUpload[i]
        const formData = new FormData()
        formData.append("file", file)
        formData.append("folder", dept.slug)
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
        const data = await res.json()
        if (data.url) {
          newImagenes = [
            ...newImagenes,
            { url: data.url, publicId: data.publicId, orden: newImagenes.length },
          ]
          setDept({ ...dept, imagenes: newImagenes })
        }
      }
    } catch (e) {
      console.error(e)
    }
    setUploading(false)
    e.target.value = ""
  }

  const removeImage = (index: number) => {
    if (!dept) return
    const newImgs = dept.imagenes.filter((_, i) => i !== index)
    setDept({ ...dept, imagenes: newImgs })
  }

  const setAsPortada = (index: number) => {
    if (!dept || index === 0) return
    const imgs = [...dept.imagenes]
    const [selected] = imgs.splice(index, 1)
    const newImgs = [selected, ...imgs].map((img, i) => ({ ...img, orden: i }))
    setDept({ ...dept, imagenes: newImgs })
  }

  if (loading || !dept) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-slate-500">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/admin/departamentos"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-tita-primary mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </Link>

      <h1 className="font-display text-2xl font-bold text-slate-800 mb-8">
        Editar {dept.name}
      </h1>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
          <input
            type="text"
            value={dept.name}
            onChange={(e) => setDept({ ...dept, name: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-tita-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Precio (por noche)</label>
          <input
            type="number"
            value={dept.precio}
            onChange={(e) => setDept({ ...dept, precio: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-tita-primary"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dormitorios</label>
            <input
              type="number"
              min={1}
              value={dept.dormitorios ?? 4}
              onChange={(e) => setDept({ ...dept, dormitorios: parseInt(e.target.value) || 4 })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-tita-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Baños</label>
            <input
              type="number"
              min={1}
              value={dept.banos ?? 3}
              onChange={(e) => setDept({ ...dept, banos: parseInt(e.target.value) || 3 })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-tita-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Orientación</label>
            <select
              value={dept.orientacion ?? ""}
              onChange={(e) => setDept({ ...dept, orientacion: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-tita-primary"
            >
              <option value="Reñaca">Reñaca</option>
              <option value="Valparaíso">Valparaíso</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nota especial</label>
            <input
              type="text"
              value={dept.notaEspecial ?? ""}
              onChange={(e) => setDept({ ...dept, notaEspecial: e.target.value })}
              placeholder="Ej: Dos dormitorios unidos"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-tita-primary"
            />
          </div>
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={dept.terraza !== false}
              onChange={(e) => setDept({ ...dept, terraza: e.target.checked })}
              className="rounded border-slate-300"
            />
            Terraza
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={dept.logia !== false}
              onChange={(e) => setDept({ ...dept, logia: e.target.checked })}
              className="rounded border-slate-300"
            />
            Logia
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
          <textarea
            value={dept.descripcion}
            onChange={(e) => setDept({ ...dept, descripcion: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-tita-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Disponible</label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={dept.disponible}
              onChange={(e) => setDept({ ...dept, disponible: e.target.checked })}
              className="rounded border-slate-300"
            />
            <span>Disponible para arriendo</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Fotos ({dept.imagenes?.length || 0} / {MAX_FOTOS})
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Puedes seleccionar varias fotos a la vez (ideal para iPhone). Máximo 50 por departamento.
          </p>
          <div className="flex flex-wrap gap-4">
            {(dept.imagenes || []).map((img, i) => (
              <div key={i} className="relative group">
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-slate-200">
                  <Image
                    src={img.url}
                    alt=""
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setAsPortada(i)}
                    title={i === 0 ? "Foto de portada" : "Establecer como foto de portada"}
                    className={`p-1 rounded ${
                      i === 0
                        ? "bg-tita-oro text-white"
                        : "bg-white/90 text-slate-600 hover:bg-tita-oro hover:text-white"
                    }`}
                  >
                    <Star
                      className="w-4 h-4"
                      fill={i === 0 ? "currentColor" : "none"}
                    />
                  </button>
                  <button
                    onClick={() => removeImage(i)}
                    title="Eliminar foto"
                    className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-tita-oro/90 text-white text-[10px] font-medium rounded">
                    Portada
                  </span>
                )}
              </div>
            ))}
            <label
              className={`w-32 h-32 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors ${
                (dept.imagenes?.length || 0) >= MAX_FOTOS
                  ? "border-slate-200 bg-slate-50 cursor-not-allowed opacity-60"
                  : "border-slate-300 cursor-pointer hover:border-tita-primary hover:bg-tita-primary/5"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleUpload}
                disabled={uploading || (dept.imagenes?.length || 0) >= MAX_FOTOS}
                className="hidden"
              />
              {uploading ? (
                <span className="text-slate-500 text-sm">Subiendo...</span>
              ) : (
                <Upload className="w-8 h-8 text-slate-400" />
              )}
            </label>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-tita-primary text-white rounded-lg hover:bg-tita-primary-light disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Guardando..." : "Guardar"}
        </button>
        <Link
          href={`/admin/departamentos/${id}/layout`}
          className="flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
        >
          <GripVertical className="w-4 h-4" />
          Editor de layout (Canva)
        </Link>
      </div>
    </div>
  )
}
