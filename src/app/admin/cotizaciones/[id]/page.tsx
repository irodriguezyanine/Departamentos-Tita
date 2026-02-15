"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { CotizacionEditor } from "@/components/cotizacion/CotizacionEditor"
import type { CotizacionArriendo } from "@/types/cotizacion"

export default function EditarCotizacionPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [cotizacion, setCotizacion] = useState<CotizacionArriendo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/cotizaciones/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setCotizacion(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  async function handleSave(data: CotizacionArriendo) {
    const res = await fetch(`/api/cotizaciones/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Error al guardar")
    }
    setCotizacion({ ...cotizacion!, ...data })
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-slate-500">Cargando...</p>
      </div>
    )
  }

  if (!cotizacion) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-slate-600 mb-4">Cotización no encontrada</p>
        <button
          onClick={() => router.push("/admin/cotizaciones")}
          className="text-tita-verde hover:underline"
        >
          Volver a cotizaciones
        </button>
      </div>
    )
  }

  return (
    <CotizacionEditor
      cotizacion={cotizacion}
      onSave={handleSave}
      onBack={() => router.push("/admin/cotizaciones")}
    />
  )
}
