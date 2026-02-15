"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FileText, Plus, Pencil } from "lucide-react"
import { formatPrecioConUsd } from "@/lib/precios"
import { useTableFilters, TableSearchBar, TableFilterHeader } from "@/components/admin/TableFilters"

interface Cotizacion {
  _id: string
  numero?: string
  nombreArrendatario: string
  apellidoArrendatario?: string
  departamento: string
  torre: string
  checkIn: string
  checkOut: string
  valorTotal: number
  createdAt?: string
}

const COTIZACION_COLUMNS = [
  { key: "numero", label: "Nº", getValue: (c: Cotizacion) => c.numero || "-", filterable: true },
  {
    key: "arrendatario",
    label: "Arrendatario",
    getValue: (c: Cotizacion) => [c.nombreArrendatario, c.apellidoArrendatario].filter(Boolean).join(" ") || "-",
    filterable: true,
  },
  {
    key: "departamento",
    label: "Departamento",
    getValue: (c: Cotizacion) => `${c.departamento} ${c.torre}`.trim() || "-",
    filterable: true,
  },
  {
    key: "fechas",
    label: "Fechas",
    getValue: (c: Cotizacion) => {
      const fmt = (d?: string) =>
        d ? new Date(d).toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" }) : "-"
      return `${fmt(c.checkIn)} - ${fmt(c.checkOut)}`
    },
    filterable: false,
  },
  {
    key: "total",
    label: "Total",
    getValue: (c: Cotizacion) => String(c.valorTotal || 0),
    filterable: false,
  },
]

function getCotizacionSearchText(c: Cotizacion): string {
  const fmt = (d?: string) =>
    d ? new Date(d).toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" }) : ""
  return [
    c.numero || "",
    c.nombreArrendatario || "",
    c.apellidoArrendatario || "",
    c.departamento || "",
    c.torre || "",
    fmt(c.checkIn),
    fmt(c.checkOut),
    String(c.valorTotal || ""),
  ].join(" ")
}

export default function AdminCotizacionesPage() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [loading, setLoading] = useState(true)
  const [usdPerClp, setUsdPerClp] = useState<number | null>(null)

  const {
    filteredData: cotizacionesFiltradas,
    search,
    setSearch,
    columnFilters,
    setColumnFilter,
    uniqueValues,
    clearFilters,
    hasActiveFilters,
  } = useTableFilters(cotizaciones, COTIZACION_COLUMNS, getCotizacionSearchText)

  useEffect(() => {
    fetch("/api/tipo-cambio")
      .then((res) => res.json())
      .then((data) => setUsdPerClp(data?.usdPerClp ?? null))
      .catch(() => setUsdPerClp(null))
  }, [])

  useEffect(() => {
    fetch("/api/cotizaciones")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCotizaciones(data)
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
    } catch {
      return "-"
    }
  }

  const formatPrecio = (n: number) =>
    formatPrecioConUsd(n, usdPerClp)

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
          Cotizaciones
        </h1>
        <Link
          href="/admin/cotizaciones/nueva"
          className="flex items-center gap-2 px-4 py-2 bg-tita-verde-oscuro text-tita-beige rounded-lg border-2 border-tita-oro hover:bg-tita-verde-medio transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Nueva cotización
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200 overflow-hidden">
        <TableSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar en todas las columnas..."
          resultCount={cotizacionesFiltradas.length}
          totalCount={cotizaciones.length}
          onClear={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
        {cotizaciones.length > 0 && !(cotizacionesFiltradas.length === 0 && hasActiveFilters) && (
        <>
        <div className="md:hidden divide-y divide-slate-100">
          {cotizacionesFiltradas.map((c) => (
            <div key={c._id} className="p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-semibold text-slate-800">
                  {c.numero || c._id.slice(-6)}
                </h3>
                <span className="text-tita-verde font-semibold">
                  {formatPrecio(c.valorTotal)}
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-1">{[c.nombreArrendatario, c.apellidoArrendatario].filter(Boolean).join(" ") || "-"}</p>
              <p className="text-sm text-slate-500 mb-3">
                {c.departamento} {c.torre} · {formatDate(c.checkIn)} - {formatDate(c.checkOut)}
              </p>
              <Link
                href={`/admin/cotizaciones/${c._id}`}
                className="flex items-center justify-center gap-2 py-2.5 bg-tita-verde-oscuro text-tita-beige rounded-lg text-sm font-medium border-2 border-tita-oro"
              >
                <Pencil className="w-4 h-4" />
                Ver / Editar
              </Link>
            </div>
          ))}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <TableFilterHeader
              columns={COTIZACION_COLUMNS}
              columnFilters={columnFilters}
              uniqueValues={uniqueValues}
              onFilterChange={setColumnFilter}
              renderExtraHeaders={() => (
                <th className="text-right px-4 py-2 text-sm font-semibold text-slate-700">
                  Acciones
                </th>
              )}
            />
            <tbody>
              {cotizacionesFiltradas.map((c) => (
                <tr key={c._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {c.numero || "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{[c.nombreArrendatario, c.apellidoArrendatario].filter(Boolean).join(" ") || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {c.departamento} {c.torre}
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-sm">
                    {formatDate(c.checkIn)} - {formatDate(c.checkOut)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-tita-verde">
                    {formatPrecio(c.valorTotal)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/cotizaciones/${c._id}`}
                      className="flex items-center gap-2 px-3 py-2 bg-tita-verde-oscuro text-tita-beige rounded-lg hover:bg-tita-verde-medio text-sm font-medium border border-tita-oro"
                    >
                      <Pencil className="w-4 h-4" />
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
        )}

        {cotizaciones.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">
              No hay cotizaciones aún.
            </p>
            <Link
              href="/admin/cotizaciones/nueva"
              className="inline-flex items-center gap-2 px-4 py-2 bg-tita-verde-oscuro text-tita-beige rounded-lg border-2 border-tita-oro hover:bg-tita-verde-medio"
            >
              <Plus className="w-4 h-4" />
              Crear primera cotización
            </Link>
          </div>
        ) : cotizacionesFiltradas.length === 0 && hasActiveFilters ? (
          <div className="p-12 text-center">
            <p className="text-slate-500 mb-4">No hay resultados para los filtros aplicados.</p>
            <button
              onClick={clearFilters}
              className="text-tita-verde hover:underline font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
