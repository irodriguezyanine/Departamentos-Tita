"use client"

import { useEffect, useState, useMemo } from "react"
import { Plus, ParkingCircle, Pencil, Trash2, Check, X } from "lucide-react"
import { COSTO_ESTACIONAMIENTO_DIARIO, getCodigoDepartamento, ESTACIONAMIENTOS_POR_DEPARTAMENTO } from "@/data/estacionamientos"
import { formatPrecioCLP } from "@/lib/precios"
import { useTableFilters, TableSearchBar } from "@/components/admin/TableFilters"

interface EstacionamientoItem {
  _id?: string
  nivel: string
  numero: string
  codigoDepartamento?: string
  source?: string
}

export default function AdminEstacionamientosPage() {
  const [items, setItems] = useState<EstacionamientoItem[]>([])
  const [departamentos, setDepartamentos] = useState<{ name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nivel: "", numero: "", codigoDepartamento: "" })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ nivel: "", numero: "", codigoDepartamento: "" })

  const codigosDepartamento = useMemo(() => {
    const codigos = new Set<string>()
    for (const d of departamentos) {
      const c = getCodigoDepartamento(d.name)
      if (c) codigos.add(c)
    }
    if (codigos.size > 0) return Array.from(codigos).sort()
    return Object.keys(ESTACIONAMIENTOS_POR_DEPARTAMENTO).sort()
  }, [departamentos])

  const columns = [
    { key: "nivel", label: "Nivel", getValue: (e: EstacionamientoItem) => e.nivel, filterable: true },
    { key: "numero", label: "Número", getValue: (e: EstacionamientoItem) => e.numero, filterable: true },
    { key: "departamento", label: "Departamento", getValue: (e: EstacionamientoItem) => e.codigoDepartamento?.trim() || "—", filterable: true },
  ]
  const getSearchText = (e: EstacionamientoItem) =>
    [e.nivel, e.numero, e.codigoDepartamento].filter(Boolean).join(" ")
  const {
    filteredData,
    search,
    setSearch,
    columnFilters,
    setColumnFilter,
    uniqueValues,
    clearFilters,
    hasActiveFilters,
  } = useTableFilters(items, columns, getSearchText)

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

  useEffect(() => {
    fetch("/api/admin/departamentos")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDepartamentos(data)
      })
      .catch(() => {})
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

  const startEdit = (e: EstacionamientoItem) => {
    if (!e._id || e.source !== "db") return
    setEditingId(e._id)
    setEditForm({
      nivel: e.nivel,
      numero: e.numero,
      codigoDepartamento: e.codigoDepartamento || "",
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ nivel: "", numero: "", codigoDepartamento: "" })
  }

  const handleUpdate = async () => {
    if (!editingId || !editForm.nivel.trim() || !editForm.numero.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/estacionamientos/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nivel: editForm.nivel.trim(),
          numero: editForm.numero.trim(),
          codigoDepartamento: editForm.codigoDepartamento?.trim() || "",
        }),
      })
      const data = await res.json()
      if (data.success) {
        fetchItems()
        cancelEdit()
      } else {
        alert(data.error || "Error al actualizar")
      }
    } catch (e) {
      console.error(e)
      alert("Error al actualizar estacionamiento")
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este estacionamiento?")) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/estacionamientos/${id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (data.success) {
        fetchItems()
        if (editingId === id) cancelEdit()
      } else {
        alert(data.error || "Error al eliminar")
      }
    } catch (e) {
      console.error(e)
      alert("Error al eliminar estacionamiento")
    }
    setSaving(false)
  }

  const filteredDbItems = filteredData.filter((i) => i.source === "db")
  const filteredStaticItems = filteredData.filter((i) => i.source === "static")

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
                {codigosDepartamento.map((c) => (
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
        {items.length > 0 && (
          <TableSearchBar
            value={search}
            onChange={setSearch}
            placeholder="Buscar por nivel, número, departamento..."
            resultCount={filteredData.length}
            totalCount={items.length}
            onClear={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead className="bg-slate-50 border-b-2 border-slate-200">
              <tr>
                <th className="text-left px-4 py-2 text-sm font-semibold text-slate-700">
                  <div className="flex flex-col gap-1">
                    <span>Nivel</span>
                    <select
                      value={columnFilters["nivel"] ?? ""}
                      onChange={(e) => setColumnFilter("nivel", e.target.value)}
                      className="text-xs py-1.5 px-2 rounded border border-slate-200 bg-white focus:border-tita-oro focus:ring-0 focus:outline-none min-w-0 max-w-full"
                    >
                      <option value="">Todos</option>
                      {Array.from(uniqueValues["nivel"] || []).sort().map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                </th>
                <th className="text-left px-4 py-2 text-sm font-semibold text-slate-700">
                  <div className="flex flex-col gap-1">
                    <span>Número</span>
                    <select
                      value={columnFilters["numero"] ?? ""}
                      onChange={(e) => setColumnFilter("numero", e.target.value)}
                      className="text-xs py-1.5 px-2 rounded border border-slate-200 bg-white focus:border-tita-oro focus:ring-0 focus:outline-none min-w-0 max-w-full"
                    >
                      <option value="">Todos</option>
                      {Array.from(uniqueValues["numero"] || []).sort().map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                </th>
                <th className="text-left px-4 py-2 text-sm font-semibold text-slate-700">
                  <div className="flex flex-col gap-1">
                    <span>Departamento</span>
                    <select
                      value={columnFilters["departamento"] ?? ""}
                      onChange={(e) => setColumnFilter("departamento", e.target.value)}
                      className="text-xs py-1.5 px-2 rounded border border-slate-200 bg-white focus:border-tita-oro focus:ring-0 focus:outline-none min-w-0 max-w-full"
                    >
                      <option value="">Todos</option>
                      {Array.from(uniqueValues["departamento"] || []).sort().map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                </th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-slate-700 w-24">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDbItems.map((e, i) => (
                <tr
                  key={e._id || `db-${i}`}
                  className={`border-b border-slate-100 hover:bg-slate-50/50 ${
                    editingId === e._id ? "bg-tita-beige/20" : ""
                  }`}
                >
                  {editingId === e._id ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={editForm.nivel}
                          onChange={(ev) => setEditForm((f) => ({ ...f, nivel: ev.target.value }))}
                          className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 focus:border-tita-oro focus:ring-0 focus:outline-none"
                          placeholder="Nivel"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={editForm.numero}
                          onChange={(ev) => setEditForm((f) => ({ ...f, numero: ev.target.value }))}
                          className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 focus:border-tita-oro focus:ring-0 focus:outline-none"
                          placeholder="Número"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={editForm.codigoDepartamento}
                          onChange={(ev) => setEditForm((f) => ({ ...f, codigoDepartamento: ev.target.value }))}
                          className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 focus:border-tita-oro focus:ring-0 focus:outline-none"
                        >
                          <option value="">Sin asignar</option>
                          {codigosDepartamento.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={handleUpdate}
                            disabled={saving || !editForm.nivel.trim() || !editForm.numero.trim()}
                            className="p-2 rounded-lg bg-tita-verde text-white hover:bg-tita-verde-medio disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Guardar"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={saving}
                            className="p-2 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-slate-800">{e.nivel}</td>
                      <td className="px-4 py-3 text-slate-800">{e.numero}</td>
                      <td className="px-4 py-3 text-slate-600">{e.codigoDepartamento || "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEdit(e)}
                            className="p-2 rounded-lg hover:bg-slate-200 text-slate-600"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => e._id && handleDelete(e._id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {filteredStaticItems.map((e, i) => (
                <tr key={`static-${i}`} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-slate-800">{e.nivel}</td>
                  <td className="px-4 py-3 text-slate-800">{e.numero}</td>
                  <td className="px-4 py-3 text-slate-600">{e.codigoDepartamento || "—"}</td>
                  <td className="px-4 py-3" />
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
