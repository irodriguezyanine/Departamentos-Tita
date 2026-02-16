"use client"

import { useEffect, useState, useRef } from "react"
import { ChevronDown, ChevronUp, Loader2, Save, Upload, ImageIcon, X } from "lucide-react"
import { Droplets, Dumbbell, Car, ShieldCheck, Waves, Shirt } from "lucide-react"
import type { AmenidadId } from "@/app/api/galerias-amenidades/route"

interface GaleriaItem {
  id: AmenidadId
  titulo: string
  descripcion: string
  fotos: { url: string }[]
}

const AMENIDADES_CONFIG: { id: AmenidadId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "piscinas", label: "Piscinas", icon: Droplets },
  { id: "gimnasio", label: "Gimnasio", icon: Dumbbell },
  { id: "estacionamiento", label: "Estacionamiento", icon: Car },
  { id: "conserjeria", label: "Conserjería", icon: ShieldCheck },
  { id: "sala_usos_multiples", label: "Sala de usos múltiples", icon: Waves },
  { id: "lavanderia", label: "Lavandería", icon: Shirt },
]

function buildImageSrc(url: string): string {
  if (!url?.startsWith("http")) {
    return typeof window !== "undefined" ? window.location.origin + (url?.startsWith("/") ? url : `/${url || ""}`) : url || ""
  }
  return url
}

export function GaleriasAmenidadesEditor() {
  const [galerias, setGalerias] = useState<GaleriaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [openMain, setOpenMain] = useState(false)
  const [openId, setOpenId] = useState<AmenidadId | null>(null)
  const [uploading, setUploading] = useState<AmenidadId | null>(null)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    fetch("/api/galerias-amenidades")
      .then((res) => res.json())
      .then((data) => {
        const items = Array.isArray(data) ? data : []
        const merged = AMENIDADES_CONFIG.map((c) => {
          const found = items.find((i: GaleriaItem) => i.id === c.id)
          return found ?? { id: c.id, titulo: c.label, descripcion: "", fotos: [] }
        })
        setGalerias(merged)
      })
      .catch(() =>
        setGalerias(
          AMENIDADES_CONFIG.map((c) => ({ id: c.id, titulo: c.label, descripcion: "", fotos: [] }))
        )
      )
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (id: AmenidadId) => {
    const item = galerias.find((g) => g.id === id)
    if (!item) return
    setSaving(id)
    try {
      await fetch("/api/galerias-amenidades", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          titulo: item.titulo,
          descripcion: item.descripcion,
          fotos: item.fotos,
        }),
      })
    } catch (e) {
      console.error(e)
    }
    setSaving(null)
  }

  const handleUpload = async (id: AmenidadId, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const item = galerias.find((g) => g.id === id)
    if (!item || item.fotos.length >= 6) return

    setUploading(id)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", `amenidades_${id}`)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (data.url) {
        setGalerias((prev) =>
          prev.map((g) =>
            g.id === id ? { ...g, fotos: [...g.fotos, { url: data.url }] } : g
          )
        )
      }
    } catch (err) {
      console.error(err)
    }
    setUploading(null)
    e.target.value = ""
  }

  const removePhoto = (id: AmenidadId, index: number) => {
    setGalerias((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, fotos: g.fotos.filter((_, i) => i !== index) } : g
      )
    )
  }

  const getOrCreate = (id: AmenidadId): GaleriaItem => {
    const existing = galerias.find((g) => g.id === id)
    if (existing) return existing
    const config = AMENIDADES_CONFIG.find((c) => c.id === id)
    return {
      id,
      titulo: config?.label ?? id,
      descripcion: "",
      fotos: [],
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-500 py-4">
        <Loader2 className="w-5 h-5 animate-spin" />
        Cargando galerías...
      </div>
    )
  }

  return (
    <div className="mt-8 border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setOpenMain(!openMain)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <h2 className="font-display text-xl font-semibold text-slate-800">
          Galerías de amenidades (Piscinas, Gimnasio, etc.)
        </h2>
        {openMain ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
      </button>
      {openMain && (
        <div className="px-6 pb-6 pt-0 border-t border-slate-100">
          <p className="text-slate-600 text-sm mb-6 mt-4">
            Edita fotos, título y texto de cada amenidad. Al hacer clic en las tarjetas del sitio, se abre una galería (máx. 6 fotos).
          </p>

          <div className="space-y-4">
            {AMENIDADES_CONFIG.map((config) => {
              const item = getOrCreate(config.id)
              const isOpen = openId === config.id
              return (
                <div key={config.id} className="border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : config.id)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <config.icon className="w-5 h-5 text-tita-verde" />
                      <span className="font-medium text-slate-800">{config.label}</span>
                      {item.fotos.length > 0 && (
                        <span className="text-xs text-slate-500">({item.fotos.length} fotos)</span>
                      )}
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {isOpen && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                        <input
                          type="text"
                          value={item.titulo}
                          onChange={(e) =>
                            setGalerias((prev) =>
                              prev.map((g) =>
                                g.id === config.id ? { ...g, titulo: e.target.value } : g
                              )
                            )
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                        <textarea
                          value={item.descripcion}
                          onChange={(e) =>
                            setGalerias((prev) =>
                              prev.map((g) =>
                                g.id === config.id ? { ...g, descripcion: e.target.value } : g
                              )
                            )
                          }
                          rows={2}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Fotos (máx. 6)</label>
                        <div className="flex flex-wrap gap-3">
                          {item.fotos.map((foto, i) => (
                            <div key={i} className="relative group">
                              <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-200">
                                <img
                                  src={buildImageSrc(foto.url)}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={(ev) => {
                                    ;(ev.target as HTMLImageElement).src =
                                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23e2e8f0' width='80' height='80'/%3E%3C/svg%3E"
                                  }}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removePhoto(config.id, i)}
                                className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          {item.fotos.length < 6 && (
                            <label className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-tita-primary hover:bg-tita-primary/5 transition-colors">
                              <input
                                ref={(el) => { fileInputRefs.current[config.id] = el }}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={(e) => handleUpload(config.id, e)}
                                className="hidden"
                              />
                              {uploading === config.id ? (
                                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                              ) : (
                                <Upload className="w-6 h-6 text-slate-400" />
                              )}
                            </label>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleSave(config.id)}
                        disabled={saving === config.id}
                        className="flex items-center gap-2 px-4 py-2 bg-tita-primary text-white rounded-lg hover:bg-tita-primary/90 disabled:opacity-50 text-sm"
                      >
                        {saving === config.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Guardar {config.label}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
