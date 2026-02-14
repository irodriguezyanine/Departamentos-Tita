"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react"

interface Departamento {
  _id: string
  name: string
  slug: string
  torre: string
  precio: number
  disponible: boolean
  imagenes: { url: string }[]
}

export default function AdminDepartamentosPage() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/departamentos")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDepartamentos(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("es-CL").format(n)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-slate-500">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-bold text-slate-800">
          Departamentos
        </h1>
        <Link
          href="/admin/departamentos/nuevo"
          className="flex items-center gap-2 px-4 py-2 bg-tita-primary text-white rounded-lg hover:bg-tita-primary-light transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                Departamento
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                Torre
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                Precio
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                Fotos
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                Estado
              </th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-slate-700">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {departamentos.map((d) => (
              <tr key={d._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="px-4 py-3 font-medium text-slate-800">{d.name}</td>
                <td className="px-4 py-3 text-slate-600">{d.torre}</td>
                <td className="px-4 py-3 text-slate-600">
                  ${formatPrice(d.precio)} / noche
                </td>
                <td className="px-4 py-3">
                  <span className="text-slate-600">
                    {d.imagenes?.length || 0} fotos
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      d.disponible ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {d.disponible ? "Disponible" : "No disponible"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/departamentos/${d._id}/editar`}
                      className="p-2 rounded-lg hover:bg-slate-200 text-slate-600"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {departamentos.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            No hay departamentos. Ejecuta /api/seed para crear los iniciales.
          </div>
        )}
      </div>
    </div>
  )
}
