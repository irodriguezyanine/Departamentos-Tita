"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Plus, Type, Image as ImageIcon } from "lucide-react"
import Image from "next/image"

interface LayoutElement {
  id: string
  type: "image" | "text"
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  content?: string
  imageUrl?: string
  publicId?: string
  fontSize?: number
  fontWeight?: string
  color?: string
}

interface Departamento {
  _id: string
  name: string
  slug?: string
  imagenes: { url: string; publicId?: string }[]
  layout?: LayoutElement[]
}

export default function LayoutEditorPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [dept, setDept] = useState<Departamento | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/departamentos/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setDept({
            ...data,
            layout: data.layout?.length ? data.layout : [],
          })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const addElement = useCallback(
    (type: "image" | "text") => {
      if (!dept) return
      const el: LayoutElement = {
        id: crypto.randomUUID(),
        type,
        x: 50,
        y: 50,
        width: type === "text" ? 200 : 150,
        height: type === "text" ? 40 : 150,
        content: type === "text" ? "Nuevo texto" : undefined,
        fontSize: type === "text" ? 24 : undefined,
        fontWeight: type === "text" ? "bold" : undefined,
        color: type === "text" ? "#1c1917" : undefined,
      }
      setDept({
        ...dept,
        layout: [...(dept.layout || []), el],
      })
      setSelected(el.id)
    },
    [dept]
  )

  const updateElement = useCallback(
    (id: string, updates: Partial<LayoutElement>) => {
      if (!dept) return
      setDept({
        ...dept,
        layout: (dept.layout || []).map((el) =>
          el.id === id ? { ...el, ...updates } : el
        ),
      })
    },
    [dept]
  )

  const removeElement = useCallback(
    (id: string) => {
      if (!dept) return
      setDept({
        ...dept,
        layout: (dept.layout || []).filter((el) => el.id !== id),
      })
      setSelected(null)
    },
    [dept]
  )

  const handleUploadForLayout = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !dept || !selected) return
    const el = dept.layout?.find((l) => l.id === selected)
    if (!el || el.type !== "image") return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", dept.slug || "departamentos_tita")
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (data.url) {
        updateElement(selected, { imageUrl: data.url, publicId: data.publicId })
      }
    } catch (err) {
      console.error(err)
    }
    setUploading(false)
    e.target.value = ""
  }

  const handleSave = async () => {
    if (!dept) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/departamentos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layout: dept.layout, name: dept.name }),
      })
      if (res.ok) router.push(`/admin/departamentos/${id}/editar`)
    } catch (e) {
      console.error(e)
    }
    setSaving(false)
  }

  if (loading || !dept) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-slate-500">Cargando...</p>
      </div>
    )
  }

  const layout = dept.layout || []
  const selEl = layout.find((l) => l.id === selected)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={`/admin/departamentos/${id}/editar`}
        className="inline-flex items-center gap-2 text-slate-600 hover:text-tita-primary mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a editar
      </Link>

      <h1 className="font-display text-2xl font-bold text-slate-800 mb-2">
        Editor de layout — {dept.name}
      </h1>
      <p className="text-slate-600 mb-8">
        Ajusta tamaño, posición y disposición de imágenes y textos. Arrastra para mover.
      </p>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-slate-100 rounded-xl aspect-video relative overflow-hidden">
            {layout.map((el) => (
              <div
                key={el.id}
                onClick={() => setSelected(el.id)}
                className={`absolute cursor-move border-2 ${
                  selected === el.id ? "border-tita-primary" : "border-transparent"
                }`}
                style={{
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                  transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                }}
              >
                {el.type === "text" ? (
                  <span
                    style={{
                      fontSize: el.fontSize || 24,
                      fontWeight: el.fontWeight || "bold",
                      color: el.color || "#1c1917",
                    }}
                  >
                    {el.content || "Texto"}
                  </span>
                ) : el.imageUrl ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={el.imageUrl}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-slate-300 flex items-center justify-center">
                    {uploading ? "Subiendo..." : "Sin imagen"}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Agregar elemento</p>
            <div className="flex gap-2">
              <button
                onClick={() => addElement("text")}
                className="flex items-center gap-2 px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300"
              >
                <Type className="w-4 h-4" />
                Texto
              </button>
              <button
                onClick={() => addElement("image")}
                className="flex items-center gap-2 px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300"
              >
                <ImageIcon className="w-4 h-4" />
                Imagen
              </button>
            </div>
          </div>

          {selEl && (
            <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-4">
              <p className="font-medium text-slate-800">
                Editar: {selEl.type === "text" ? "Texto" : "Imagen"}
              </p>
              {selEl.type === "text" && (
                <>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Contenido</label>
                    <input
                      type="text"
                      value={selEl.content || ""}
                      onChange={(e) => updateElement(selEl.id, { content: e.target.value })}
                      className="w-full px-3 py-2 border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Tamaño (px)</label>
                    <input
                      type="number"
                      value={selEl.fontSize || 24}
                      onChange={(e) =>
                        updateElement(selEl.id, { fontSize: parseInt(e.target.value) || 24 })
                      }
                      className="w-full px-3 py-2 border rounded text-sm"
                    />
                  </div>
                </>
              )}
              {selEl.type === "image" && !selEl.imageUrl && (
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadForLayout}
                    disabled={uploading}
                    className="hidden"
                  />
                  <span className="inline-block px-4 py-2 bg-tita-primary text-white rounded cursor-pointer text-sm">
                    {uploading ? "Subiendo..." : "Subir imagen"}
                  </span>
                </label>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">X</label>
                  <input
                    type="number"
                    value={selEl.x}
                    onChange={(e) =>
                      updateElement(selEl.id, { x: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Y</label>
                  <input
                    type="number"
                    value={selEl.y}
                    onChange={(e) =>
                      updateElement(selEl.id, { y: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Ancho</label>
                  <input
                    type="number"
                    value={selEl.width}
                    onChange={(e) =>
                      updateElement(selEl.id, { width: parseInt(e.target.value) || 100 })
                    }
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Alto</label>
                  <input
                    type="number"
                    value={selEl.height}
                    onChange={(e) =>
                      updateElement(selEl.id, { height: parseInt(e.target.value) || 100 })
                    }
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                </div>
              </div>
              <button
                onClick={() => removeElement(selEl.id)}
                className="w-full py-2 text-red-600 hover:bg-red-50 rounded text-sm"
              >
                Eliminar elemento
              </button>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-tita-primary text-white rounded-lg hover:bg-tita-primary-light disabled:opacity-50 font-medium"
          >
            {saving ? "Guardando..." : "Guardar layout"}
          </button>
        </div>
      </div>
    </div>
  )
}
