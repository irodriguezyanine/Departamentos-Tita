"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"

export default function NuevoDepartamentoPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: "",
    slug: "",
    torre: "",
    precio: 90000,
    descripcion: "",
    disponible: true,
  })

  const handleNameChange = (name: string) => {
    setForm({
      ...form,
      name,
      slug: name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""),
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/departamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Ej: 4 C Torre Galápagos"
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-tita-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Slug (URL)</label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-tita-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Torre</label>
          <input
            type="text"
            value={form.torre}
            onChange={(e) => setForm({ ...form, torre: e.target.value })}
            placeholder="Ej: Galápagos"
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-tita-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Precio por noche</label>
          <input
            type="number"
            value={form.precio}
            onChange={(e) => setForm({ ...form, precio: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-tita-primary"
          />
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
        disabled={saving}
        className="mt-8 flex items-center gap-2 px-6 py-3 bg-tita-primary text-white rounded-lg hover:bg-tita-primary-light disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        {saving ? "Guardando..." : "Crear departamento"}
      </button>
    </div>
  )
}
