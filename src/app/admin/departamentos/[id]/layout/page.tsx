"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, ExternalLink } from "lucide-react"
import { DepartmentPageContent, DeptForPage } from "@/components/DepartmentPageContent"

export default function LayoutEditorPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [dept, setDept] = useState<DeptForPage & { _id: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/departamentos/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setDept({
            ...data,
            imagenes: data.imagenes || [],
          })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const handleChange = (updates: Partial<DeptForPage>) => {
    if (!dept) return
    setDept({ ...dept, ...updates })
  }

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

  return (
    <div>
      {/* Barra fija de admin (debajo del AdminNav) */}
      <div className="sticky top-16 z-40 bg-tita-verde-oscuro border-b-2 border-tita-oro px-4 py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/departamentos/${id}/editar`}
            className="inline-flex items-center gap-2 text-tita-beige hover:text-tita-oro transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a editar
          </Link>
          <span className="text-tita-beige/80 text-sm hidden sm:inline">
            Editando: {dept.name}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/departamentos/${dept.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 text-tita-beige hover:text-tita-oro border border-tita-oro/50 rounded-lg text-sm transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Ver en producción
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-tita-oro text-tita-verde-oscuro font-semibold rounded-lg hover:bg-tita-oro/90 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>

      {/* Página real en modo editable */}
      <DepartmentPageContent
        dept={dept}
        editable
        onChange={handleChange}
        backHref={`/admin/departamentos/${id}/editar`}
        backLabel="Volver a editar"
      />
    </div>
  )
}
