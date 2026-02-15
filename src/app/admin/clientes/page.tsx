"use client"

import { useEffect, useState } from "react"
import { Mail, Phone, User, Pencil, Check, X, Plus } from "lucide-react"
import { useTableFilters, TableSearchBar, TableFilterHeader } from "@/components/admin/TableFilters"

interface Cliente {
  _id: string
  nombre: string
  apellido?: string
  email: string
  telefono: string
  mensaje?: string
  departamentoInteres?: string
  estacionamiento?: string
  fecha?: string
  createdAt?: string
}

const DEPARTAMENTOS_OPCIONES = [
  { value: "", label: "Seleccionar" },
  { value: "4 C Torre Galápagos", label: "4 C Torre Galápagos" },
  { value: "13 D Torre Cabo de Hornos", label: "13 D Torre Cabo de Hornos" },
  { value: "17 C Torre Isla Grande", label: "17 C Torre Isla Grande" },
  { value: "16 C Torre Juan Fernández", label: "16 C Torre Juan Fernández" },
  { value: "18 C Torre Juan Fernández", label: "18 C Torre Juan Fernández" },
]

function nombreCompleto(c: Cliente): string {
  return [c.nombre, c.apellido].filter(Boolean).join(" ") || c.nombre || "-"
}

const PLACEHOLDER_EMAIL = "sin-email@cotizacion.local"

function displayEmail(email: string) {
  return email === PLACEHOLDER_EMAIL || !email ? "-" : email
}

const CLIENTE_COLUMNS = [
  { key: "nombre", label: "Nombre", getValue: (c: Cliente) => c.nombre || "-", filterable: true },
  { key: "apellido", label: "Apellido", getValue: (c: Cliente) => c.apellido || "-", filterable: true },
  {
    key: "email",
    label: "Email",
    getValue: (c: Cliente) => (c.email === PLACEHOLDER_EMAIL || !c.email ? "-" : c.email),
    filterable: true,
  },
  { key: "telefono", label: "Teléfono", getValue: (c: Cliente) => c.telefono || "-", filterable: true },
  {
    key: "departamento",
    label: "Departamento",
    getValue: (c: Cliente) => c.departamentoInteres || "-",
    filterable: true,
  },
  {
    key: "estacionamiento",
    label: "Estacionamiento",
    getValue: (c: Cliente) => c.estacionamiento || "-",
    filterable: true,
  },
  {
    key: "fecha",
    label: "Fecha",
    getValue: (c: Cliente) => {
      const d = c.fecha || c.createdAt
      return d
        ? new Date(d).toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" })
        : "-"
    },
    filterable: true,
  },
]

function getClienteSearchText(c: Cliente): string {
  const fmt = (d?: string) =>
    d ? new Date(d).toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" }) : ""
  return [
    c.nombre || "",
    c.apellido || "",
    c.email === PLACEHOLDER_EMAIL ? "" : c.email || "",
    c.telefono || "",
    c.departamentoInteres || "",
    c.estacionamiento || "",
    fmt(c.fecha || c.createdAt),
    c.mensaje || "",
  ].join(" ")
}

export default function AdminClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Cliente>>({})
  const [saving, setSaving] = useState(false)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newForm, setNewForm] = useState({ nombre: "", apellido: "", email: "", telefono: "", departamentoInteres: "", estacionamiento: "" })
  const [opcionesEstacionamiento, setOpcionesEstacionamiento] = useState<{ value: string; label: string }[]>([])

  const {
    filteredData: clientesFiltrados,
    search,
    setSearch,
    columnFilters,
    setColumnFilter,
    uniqueValues,
    clearFilters,
    hasActiveFilters,
  } = useTableFilters(clientes, CLIENTE_COLUMNS, getClienteSearchText)

  const fetchClientes = () => {
    fetch("/api/clientes")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setClientes(data)
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetch("/api/clientes")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setClientes(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetch("/api/admin/estacionamientos")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const opts = data.map((e: { nivel: string; numero: string; codigoDepartamento?: string }) => {
            const depto = e.codigoDepartamento?.trim() || "Sin asignar"
            const value = `${depto} - Nivel ${e.nivel}, ${e.numero}`
            return { value, label: value }
          })
          setOpcionesEstacionamiento(opts)
        }
      })
      .catch(() => {})
  }, [])

  const formatDate = (d?: string) => {
    if (!d) return "-"
    try {
      return new Date(d).toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch {
      return "-"
    }
  }

  const startEdit = (c: Cliente) => {
    setEditingId(c._id)
    setEditForm({
      nombre: c.nombre,
      apellido: c.apellido || "",
      email: c.email === PLACEHOLDER_EMAIL ? "" : c.email,
      telefono: c.telefono || "",
      departamentoInteres: c.departamentoInteres || "",
      estacionamiento: c.estacionamiento || "",
    })
  }

  const handleCreate = async () => {
    const nombreCompleto = [newForm.nombre.trim(), newForm.apellido.trim()].filter(Boolean).join(" ")
    if (!nombreCompleto) {
      alert("Nombre o apellido es requerido")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: newForm.nombre.trim(),
          apellido: newForm.apellido.trim(),
          email: newForm.email.trim() || undefined,
          telefono: newForm.telefono.trim(),
          departamentoInteres: newForm.departamentoInteres.trim(),
          estacionamiento: newForm.estacionamiento.trim(),
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      fetchClientes()
      setNewForm({ nombre: "", apellido: "", email: "", telefono: "", departamentoInteres: "", estacionamiento: "" })
      setShowNewForm(false)
    } catch (e) {
      console.error(e)
      alert(e instanceof Error ? e.message : "Error al crear cliente")
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const saveEdit = async () => {
    if (!editingId) return
    setSaving(true)
    try {
      const res = await fetch(`/api/clientes/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: editForm.nombre,
          apellido: editForm.apellido,
          email: editForm.email || PLACEHOLDER_EMAIL,
          telefono: editForm.telefono,
          departamentoInteres: editForm.departamentoInteres,
          estacionamiento: editForm.estacionamiento,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Error al guardar")
      }
      fetchClientes()
      setEditingId(null)
      setEditForm({})
    } catch (e) {
      console.error(e)
      alert(e instanceof Error ? e.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    "w-full px-2 py-1.5 text-sm rounded border border-slate-200 focus:border-tita-oro focus:ring-0 focus:outline-none"

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
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800 mb-2">
            Clientes
          </h1>
          <p className="text-slate-600 text-sm">
            Base de datos central. Los clientes se guardan automáticamente al crear o editar cotizaciones.
          </p>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="flex items-center gap-2 px-4 py-2 bg-tita-primary text-white rounded-lg hover:bg-tita-primary/90 text-sm font-medium shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nuevo cliente
        </button>
      </div>

      {showNewForm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="font-semibold text-slate-800 mb-4">Agregar cliente</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input
                type="text"
                value={newForm.nombre}
                onChange={(e) => setNewForm({ ...newForm, nombre: e.target.value })}
                className={inputClass}
                placeholder="Juan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Apellido</label>
              <input
                type="text"
                value={newForm.apellido}
                onChange={(e) => setNewForm({ ...newForm, apellido: e.target.value })}
                className={inputClass}
                placeholder="Pérez"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={newForm.email}
                onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                className={inputClass}
                placeholder="cliente@ejemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
              <input
                type="tel"
                value={newForm.telefono}
                onChange={(e) => setNewForm({ ...newForm, telefono: e.target.value })}
                className={inputClass}
                placeholder="+56 9 1234 5678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Departamento</label>
              <select
                value={newForm.departamentoInteres}
                onChange={(e) => setNewForm({ ...newForm, departamentoInteres: e.target.value })}
                className={inputClass}
              >
                {DEPARTAMENTOS_OPCIONES.map((opt) => (
                  <option key={opt.value || "empty"} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estacionamiento</label>
              <select
                value={newForm.estacionamiento}
                onChange={(e) => setNewForm({ ...newForm, estacionamiento: e.target.value })}
                className={inputClass}
              >
                <option value="">Seleccionar</option>
                {opcionesEstacionamiento.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleCreate}
              disabled={saving || (!newForm.nombre.trim() && !newForm.apellido.trim())}
              className="px-4 py-2 bg-tita-primary text-white rounded-lg hover:bg-tita-primary/90 disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Crear cliente"}
            </button>
            <button
              onClick={() => setShowNewForm(false)}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <TableSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar en todas las columnas..."
          resultCount={clientesFiltrados.length}
          totalCount={clientes.length}
          onClear={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
        {clientes.length > 0 && !(clientesFiltrados.length === 0 && hasActiveFilters) && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <TableFilterHeader
              columns={CLIENTE_COLUMNS}
              columnFilters={columnFilters}
              uniqueValues={uniqueValues}
              onFilterChange={setColumnFilter}
              renderExtraHeaders={() => (
                <th className="text-right px-4 py-2 text-sm font-semibold text-slate-700 w-24">
                  Acciones
                </th>
              )}
            />
            <tbody>
              {clientesFiltrados.map((c) => (
                <tr
                  key={c._id}
                  className={`border-b border-slate-100 hover:bg-slate-50/50 ${
                    editingId === c._id ? "bg-tita-beige/20" : ""
                  }`}
                >
                  {editingId === c._id ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={editForm.nombre || ""}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, nombre: e.target.value }))
                          }
                          className={inputClass}
                          placeholder="Nombre"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={editForm.apellido || ""}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, apellido: e.target.value }))
                          }
                          className={inputClass}
                          placeholder="Apellido"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="email"
                          value={editForm.email || ""}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, email: e.target.value }))
                          }
                          className={inputClass}
                          placeholder="email@ejemplo.com"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="tel"
                          value={editForm.telefono || ""}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, telefono: e.target.value }))
                          }
                          className={inputClass}
                          placeholder="+56 9 1234 5678"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={editForm.departamentoInteres || ""}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              departamentoInteres: e.target.value,
                            }))
                          }
                          className={inputClass}
                        >
                          {DEPARTAMENTOS_OPCIONES.map((opt) => (
                            <option key={opt.value || "empty"} value={opt.value}>{opt.label}</option>
                          ))}
                          {editForm.departamentoInteres &&
                            !DEPARTAMENTOS_OPCIONES.some((o) => o.value === editForm.departamentoInteres) && (
                              <option value={editForm.departamentoInteres}>{editForm.departamentoInteres}</option>
                            )}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={editForm.estacionamiento || ""}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              estacionamiento: e.target.value,
                            }))
                          }
                          className={inputClass}
                        >
                          <option value="">Seleccionar</option>
                          {opcionesEstacionamiento.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                          {editForm.estacionamiento &&
                            !opcionesEstacionamiento.some((o) => o.value === editForm.estacionamiento) && (
                              <option value={editForm.estacionamiento}>{editForm.estacionamiento}</option>
                            )}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-sm">
                        {formatDate(c.fecha || c.createdAt)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={saveEdit}
                            disabled={saving || (!editForm.nombre?.trim() && !editForm.apellido?.trim())}
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
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400 shrink-0" />
                          {c.nombre}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {c.apellido || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {displayEmail(c.email) !== "-" ? (
                          <a
                            href={`mailto:${c.email}`}
                            className="flex items-center gap-2 text-tita-primary hover:underline"
                          >
                            <Mail className="w-4 h-4 shrink-0" />
                            {c.email}
                          </a>
                        ) : (
                          <span className="flex items-center gap-2 text-slate-400">
                            <Mail className="w-4 h-4 shrink-0" />
                            -
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {c.telefono ? (
                          <a
                            href={`tel:${c.telefono}`}
                            className="flex items-center gap-2 text-slate-600"
                          >
                            <Phone className="w-4 h-4 shrink-0" />
                            {c.telefono}
                          </a>
                        ) : (
                          <span className="flex items-center gap-2 text-slate-400">
                            <Phone className="w-4 h-4 shrink-0" />
                            -
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {c.departamentoInteres || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-sm">
                        {c.estacionamiento || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-sm">
                        {formatDate(c.fecha || c.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => startEdit(c)}
                          className="p-2 rounded-lg hover:bg-slate-200 text-slate-600"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {clientes.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No hay clientes aún. Los clientes se guardan automáticamente al crear o editar cotizaciones.
          </div>
        ) : clientesFiltrados.length === 0 && hasActiveFilters ? (
          <div className="p-12 text-center">
            <p className="text-slate-500 mb-4">No hay resultados para los filtros aplicados.</p>
            <button onClick={clearFilters} className="text-tita-verde hover:underline font-medium">
              Limpiar filtros
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
