"use client"

import { useEffect, useState } from "react"
import { Mail, Phone, User } from "lucide-react"

interface Cliente {
  _id: string
  nombre: string
  email: string
  telefono: string
  mensaje?: string
  departamentoInteres?: string
  fecha?: string
  createdAt?: string
}

export default function AdminClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/clientes")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setClientes(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const formatDate = (d?: string) => {
    if (!d) return "-"
    try {
      return new Date(d).toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    }
    return "-"
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-slate-500">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-2xl font-bold text-slate-800 mb-8">
        Clientes / Consultas
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                  Nombre
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                  Email
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                  Teléfono
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                  Departamento
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      {c.nombre}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`mailto:${c.email}`}
                      className="flex items-center gap-2 text-tita-primary hover:underline"
                    >
                      <Mail className="w-4 h-4" />
                      {c.email}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`tel:${c.telefono}`}
                      className="flex items-center gap-2 text-slate-600"
                    >
                      <Phone className="w-4 h-4" />
                      {c.telefono}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {c.departamentoInteres || "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-sm">
                    {formatDate(c.fecha || c.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {clientes.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            No hay consultas de clientes aún.
          </div>
        )}
      </div>
    </div>
  )
}
