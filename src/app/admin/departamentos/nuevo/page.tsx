"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Upload, Loader2 } from "lucide-react"
import { parsePrecioInput } from "@/lib/precios"
import { TORRES } from "@/data/departamentos"

export default function NuevoDepartamentoPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imagenes, setImagenes] = useState<{ url: string; orden: number }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    name: "",
    torre: "",
    precioInput: "90000",
    descripcion: "",
    disponible: true,
  })

  const precioNum = parsePrecioInput(form.precioInput)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    try {
      const slugTemp =
        form.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9-]/g, "") || `nuevo-${Date.now()}`
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData()
        formData.append("file", files[i])
        formData.append("folder", slugTemp)
        const res = await fetch("/api/upload", { method: "POST", body: formData })
        const data = await res.json()
        if (data.url) {
          setImagenes((prev) => [...prev, { url: data.url, orden: prev.length }])
        }
      }
    } catch (err) {
      console.error(err)
    }
    setUploading(false)
    e.target.value = ""
  }

  const removeImage = (index: number) => {
    setImagenes((prev) => prev.filter((_, i) => i !== index).map((img, i) => ({ ...img, orden: i })))
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/admin/departamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          torre: form.torre.trim(),
          precio: precioNum || 90000,
          descripcion: form.descripcion.trim(),
          disponible: form.disponible,
          imagenes,
        }),
      })
      const data = await res.json()
      if (data._id) router.push(`/admin/departamentos/${data._id}/editar`)
    } catch (e) {
      console.error(e)
    }
    setSaving(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/admin/departamentos"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-tita-primary mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </Link>

      <h1 className="font-display text-2xl font-bold text-slate-800 mb-8">
        Nuevo departamento
      </h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ej: 4 C Torre Galápagos"
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-tita-primary"
          />
          <p className="text-xs text-slate-500 mt-1">
            La URL se genera automáticamente a partir del nombre.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Torre</label>
          <select
            value={form.torre}
            onChange={(e) => setForm({ ...form, torre: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-tita-primary"
          >
            <option value="">Seleccionar torre</option>
            {TORRES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Precio por noche (CLP)</label>
          <input
            type="text"
            value={form.precioInput}
            onChange={(e) => setForm({ ...form, precioInput: e.target.value })}
            placeholder="90000 o 90.000"
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-tita-primary"
          />
          <p className="text-xs text-slate-500 mt-1">
            Escribe el número sin espacios. Puedes usar puntos: 90.000
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Fotos</label>
          <p className="text-xs text-slate-500 mb-2">
            Puedes subir varias imágenes a la vez (móvil y computador).
          </p>
          <div className="flex flex-wrap gap-3 mb-2">
            {imagenes.map((img, i) => (
              <div key={i} className="relative group">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-200">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
            <label className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-tita-primary hover:bg-tita-primary/5 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleUpload}
                className="hidden"
              />
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              ) : (
                <Upload className="w-6 h-6 text-slate-400" />
              )}
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
          <textarea
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-tita-primary"
          />
        </div>
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.disponible}
              onChange={(e) => setForm({ ...form, disponible: e.target.checked })}
              className="rounded border-slate-300"
            />
            Disponible para arriendo
          </label>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !form.name.trim()}
        className="mt-8 flex items-center gap-2 px-6 py-3 bg-tita-primary text-white rounded-lg hover:bg-tita-primary/90 disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        {saving ? "Guardando..." : "Crear departamento"}
      </button>
    </div>
  )
}
