"use client"

import { useState, useMemo } from "react"
import { Search } from "lucide-react"

export interface ColumnConfig<T> {
  key: string
  label: string
  getValue: (row: T) => string
  filterable?: boolean
}

export function useTableFilters<T>(
  data: T[],
  columns: ColumnConfig<T>[],
  getSearchText: (row: T) => string
) {
  const [search, setSearch] = useState("")
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})

  const filteredData = useMemo(() => {
    let result = data

    // Búsqueda global en todas las columnas
    if (search.trim()) {
      const terms = search
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
      result = result.filter((row) => {
        const text = getSearchText(row).toLowerCase()
        return terms.every((term) => text.includes(term))
      })
    }

    // Filtros por columna
    for (const col of columns) {
      if (!col.filterable) continue
      const filterVal = columnFilters[col.key]
      if (!filterVal) continue
      result = result.filter((row) => {
        const val = col.getValue(row).toLowerCase().trim()
        const f = filterVal.toLowerCase().trim()
        return val === f || (f === "-" && !val)
      })
    }

    return result
  }, [data, search, columnFilters, columns, getSearchText])

  const uniqueValues = useMemo(() => {
    const map: Record<string, Set<string>> = {}
    for (const col of columns) {
      if (!col.filterable) continue
      map[col.key] = new Set<string>()
      for (const row of data) {
        const v = col.getValue(row).trim() || "-"
        map[col.key].add(v)
      }
    }
    return map
  }, [data, columns])

  const setColumnFilter = (key: string, value: string) => {
    setColumnFilters((prev) => {
      const next = { ...prev }
      if (value === "") delete next[key]
      else next[key] = value
      return next
    })
  }

  const clearFilters = () => {
    setSearch("")
    setColumnFilters({})
  }

  const hasActiveFilters = search.trim() !== "" || Object.keys(columnFilters).length > 0

  return {
    filteredData,
    search,
    setSearch,
    columnFilters,
    setColumnFilter,
    uniqueValues,
    clearFilters,
    hasActiveFilters,
  }
}

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  resultCount?: number
  totalCount?: number
  onClear?: () => void
  hasActiveFilters?: boolean
}

export function TableSearchBar({
  value,
  onChange,
  placeholder = "Buscar en todas las columnas...",
  resultCount,
  totalCount,
  onClear,
  hasActiveFilters,
}: SearchBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 border-b border-slate-200 bg-slate-50/50">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:border-tita-oro focus:ring-1 focus:ring-tita-oro/30 text-sm"
        />
      </div>
      {resultCount !== undefined && totalCount !== undefined && (
        <span className="text-sm text-slate-500">
          {resultCount} de {totalCount} registros
        </span>
      )}
      {hasActiveFilters && onClear && (
        <button
          onClick={onClear}
          className="text-sm text-tita-verde hover:underline font-medium"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )
}

interface FilterHeaderProps<T> {
  columns: ColumnConfig<T>[]
  columnFilters: Record<string, string>
  uniqueValues: Record<string, Set<string>>
  onFilterChange: (key: string, value: string) => void
  renderExtraHeaders?: () => React.ReactNode
}

export function TableFilterHeader<T>({
  columns,
  columnFilters,
  uniqueValues,
  onFilterChange,
  renderExtraHeaders,
}: FilterHeaderProps<T>) {
  return (
    <thead className="bg-slate-50 border-b-2 border-slate-200">
      <tr>
        {columns.map((col) => (
          <th key={col.key} className="text-left px-4 py-2 text-sm font-semibold text-slate-700">
            <div className="flex flex-col gap-1">
              <span>{col.label}</span>
              {col.filterable && (
                <select
                  value={columnFilters[col.key] ?? ""}
                  onChange={(e) => onFilterChange(col.key, e.target.value)}
                  className="text-xs py-1.5 px-2 rounded border border-slate-200 bg-white focus:border-tita-oro focus:ring-0 focus:outline-none min-w-0 max-w-full"
                  title={`Filtrar por ${col.label}`}
                >
                  <option value="">Todos</option>
                  {Array.from(uniqueValues[col.key] || [])
                    .sort((a, b) => a.localeCompare(b, "es"))
                    .map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                </select>
              )}
            </div>
          </th>
        ))}
        {renderExtraHeaders?.()}
      </tr>
    </thead>
  )
}
