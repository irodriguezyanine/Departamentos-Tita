"use client"

import { useRouter } from "next/navigation"
import { CotizacionEditor } from "@/components/cotizacion/CotizacionEditor"
import type { CotizacionArriendo } from "@/types/cotizacion"

export default function NuevaCotizacionPage() {
  const router = useRouter()

  async function handleSave(data: CotizacionArriendo) {
    const res = await fetch("/api/cotizaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Error al guardar")
    }
    const saved = await res.json()
    router.push(`/admin/cotizaciones/${saved._id}`)
  }

  return (
    <CotizacionEditor
      cotizacion={null}
      onSave={handleSave}
      onBack={() => router.push("/admin/cotizaciones")}
      isNew
    />
  )
}
