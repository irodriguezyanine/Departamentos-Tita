"use client"

import { useEffect, useState } from "react"
import { Plus, ParkingCircle } from "lucide-react"
import { COSTO_ESTACIONAMIENTO_DIARIO } from "@/data/estacionamientos"
import { formatPrecioCLP } from "@/lib/precios"

interface EstacionamientoItem {
  _id?: string
  nivel: string
  numero: string
  codigoDepartamento?: string
  source?: string
}

const DEPARTAMENTOS_CODIGOS = ["4 C", "13 D", "15 D", "16 C", "16 D", "17 C", "18 C"]

export default function AdminEstacionamientosPage() {
  const [items, setItems] = useState<EstacionamientoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nivel: "", numero: "", codigoDepartamento: "" })

  const fetchItems = () => {
    fetch("/api/admin/estacionamientos")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleCreate = async () => {
    if (!form.nivel.trim() || !form.numero.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/admin/estacionamientos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nivel: form.nivel.trim(),
          numero: form.numero.trim(),
          codigoDepartamento: form.codigoDepartamento?.trim() || "",
        }),
      })
      const data = await res.json()
      if (data.success) {
        fetchItems()
        setForm({ nivel: "", numero: "", codigoDepartamento: "" })
        setShowForm(false)
      } else {
        alert(data.error || "Error al crear")
      }
    } catch (e) {
      console.error(e)
      alert("Error al crear estacionamiento")
    }
    setSaving(false)
  }

  const dbItems = items.filter((i) => i.source === "db")
  const staticItems = items.filter((i) => i.source === "static")

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
          Estacionamientos
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-tita-primary text-white rounded-lg hover:bg-tita-primary/90 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nuevo estacionamiento
        </button>
      </div>

      <p className="text-slate-600 text-sm mb-6">
        Los estacionamientos pueden asignarse a un departamento o quedar sin asignar. Costo por defecto: ${formatPrecioCLP(COSTO_ESTACIONAMIENTO_DIARIO)}/día.
      </p>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="font-semibold text-slate-800 mb-4">Agregar estacionamiento</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nivel</label>
              <input
                type="text"
                value={form.nivel}
                onChange={(e) => setForm({ ...form, nivel: e.target.value })}
                placeholder="Ej: -1, -2"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-tita-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Número</label>
              <input
                type="text"
                value={form.numero}
                onChange={(e) => setForm({ ...form, numero: e.target.value })}
                placeholder="Ej: 24, 329"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-tita-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Departamento (opcional)</label>
              <select
                value={form.codigoDepartamento}
                onChange={(e) => setForm({ ...form, codigoDepartamento: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-tita-primary"
              >
                <option value="">Sin asignar</option>
                {DEPARTAMENTOS_CODIGOS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleCreate}
              disabled={saving || !form.nivel.trim() || !form.numero.trim()}
              className="px-4 py-2 bg-tita-primary text-white rounded-lg hover:bg-tita-primary/90 disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Crear"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                  Nivel
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                  Número
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                  Departamento
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                  Origen
                </th>
              </tr>
            </thead>
            <tbody>
              {dbItems.map((e, i) => (
                <tr key={e._id || `db-${i}`} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-slate-800">{e.nivel}</td>
                  <td className="px-4 py-3 text-slate-800">{e.numero}</td>
                  <td className="px-4 py-3 text-slate-600">{e.codigoDepartamento || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">Base de datos</span>
                  </td>
                </tr>
              ))}
              {staticItems.map((e, i) => (
                <tr key={`static-${i}`} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-slate-800">{e.nivel}</td>
                  <td className="px-4 py-3 text-slate-800">{e.numero}</td>
                  <td className="px-4 py-3 text-slate-600">{e.codigoDepartamento || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600">Estático</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {items.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <ParkingCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            No hay estacionamientos. Agrega uno nuevo.
          </div>
        )}
      </div>
    </div>
  )
}
