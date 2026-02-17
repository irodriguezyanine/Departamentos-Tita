"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Pencil, Building2, Loader2 } from "lucide-react"

interface Departamento {
  _id: string
  name: string
  slug: string
  torre: string
  precio: number
  imagenes: { url: string }[]
}

export function DepartamentosEditorMenu() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  const fetchDepartamentos = () => {
    fetch("/api/admin/departamentos")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDepartamentos(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchDepartamentos()
  }, [])

  const handleInicializar = async () => {
    setSeeding(true)
    try {
      const res = await fetch("/api/seed", { method: "POST" })
      const data = await res.json()
      if (data.success) {
        fetchDepartamentos()
      }
    } catch (e) {
      console.error(e)
    }
    setSeeding(false)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-500 py-4">
        <Loader2 className="w-5 h-5 animate-spin" />
        Cargando departamentos...
      </div>
    )
  }

  const needsSeed = departamentos.length === 0

  return (
    <div className="mt-8">
      <h2 className="font-display text-xl font-semibold text-slate-800 mb-4">
        Editar departamentos
      </h2>
      <p className="text-slate-600 text-sm mb-6">
        Selecciona un departamento para editar su página completa: texto, fotos (Cloudinary) y más.
      </p>

      {needsSeed && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-amber-800 text-sm mb-3">
            No hay departamentos. Inicializa los 5 fijos o crea uno nuevo desde el menú Departamentos.
          </p>
          <button
            onClick={handleInicializar}
            disabled={seeding}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2"
          >
            {seeding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Building2 className="w-4 h-4" />
            )}
            {seeding ? "Inicializando..." : "Inicializar los 5 departamentos"}
          </button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {departamentos.map((dept) => (
          <div
            key={dept._id}
            className="rounded-xl border p-4 transition-all bg-white border-slate-200 hover:border-tita-primary hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">{dept.name}</h3>
                <p className="text-sm text-slate-500">{dept.torre}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {dept.imagenes?.length || 0} fotos
                </p>
              </div>
              <Link
                href={`/admin/departamentos/${dept._id}/editar`}
                className="flex items-center gap-2 px-3 py-2 bg-tita-primary text-white rounded-lg hover:bg-tita-primary/90 text-sm font-medium"
              >
                <Pencil className="w-4 h-4" />
                Editar
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
