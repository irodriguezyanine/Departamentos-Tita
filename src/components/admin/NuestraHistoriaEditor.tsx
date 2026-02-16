"use client"

import { useEffect, useState, useRef } from "react"
import { ImageIcon, Share2, Loader2, Save, ChevronDown, ChevronUp, Upload } from "lucide-react"
import { GaleriasAmenidadesEditor } from "./GaleriasAmenidadesEditor"

interface NuestraHistoria {
  imagenUrl: string
  titulo: string
  texto1: string
  texto2: string
}

interface OgSettings {
  ogImage: string
  ogTitle: string
  ogDescription: string
}

const DEFAULT_NUESTRA_HISTORIA: NuestraHistoria = {
  imagenUrl: "/assets/TITA Foto perfil.jpeg",
  titulo: "Nuestra historia",
  texto1:
    "Con más de **20 años de experiencia**, Dalal Saleme y Enrique Yanine ofrecen un **servicio excepcional** en el corazón de Viña del Mar.",
  texto2:
    "Cada departamento es cuidado con dedicación para que tu estadía sea inolvidable. Conocemos cada rincón del condominio y estamos comprometidos con tu comodidad y satisfacción.",
}

const DEFAULT_OG: OgSettings = {
  ogImage: "/og-image.png",
  ogTitle: "Condominio Puerto Pacífico | Arriendo en Viña del Mar, Dalal Saleme",
  ogDescription: "5 departamentos en arriendo primera línea de playa. Entra y reserva.",
}

function buildImageSrc(url: string): string {
  if (!url) return ""
  if (url.startsWith("http")) return url
  if (typeof window !== "undefined") {
    const base = window.location.origin
    const path = url.startsWith("/") ? url : `/${url}`
    return base + encodeURI(path)
  }
  return url
}

export function NuestraHistoriaEditor() {
  const [nuestraHistoria, setNuestraHistoria] = useState<NuestraHistoria>(DEFAULT_NUESTRA_HISTORIA)
  const [og, setOg] = useState<OgSettings>(DEFAULT_OG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [openNuestraHistoria, setOpenNuestraHistoria] = useState(false)
  const [openOg, setOpenOg] = useState(false)
  const [uploadingNuestraHistoria, setUploadingNuestraHistoria] = useState(false)
  const [uploadingOg, setUploadingOg] = useState(false)
  const fileInputNuestraHistoria = useRef<HTMLInputElement>(null)
  const fileInputOg = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.nuestraHistoria) setNuestraHistoria(data.nuestraHistoria)
        if (data.ogImage !== undefined) setOg((prev) => ({ ...prev, ogImage: data.ogImage }))
        if (data.ogTitle !== undefined) setOg((prev) => ({ ...prev, ogTitle: data.ogTitle }))
        if (data.ogDescription !== undefined)
          setOg((prev) => ({ ...prev, ogDescription: data.ogDescription }))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSaveNuestraHistoria = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nuestraHistoria }),
      })
      if (res.ok) setSaved(true)
    } catch (e) {
      console.error(e)
    }
    setSaving(false)
  }

  const handleSaveOg = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ogImage: og.ogImage,
          ogTitle: og.ogTitle,
          ogDescription: og.ogDescription,
        }),
      })
      if (res.ok) setSaved(true)
    } catch (e) {
      console.error(e)
    }
    setSaving(false)
  }

  const handleUploadNuestraHistoria = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingNuestraHistoria(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "nuestra_historia")
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (data.url) setNuestraHistoria((prev) => ({ ...prev, imagenUrl: data.url }))
    } catch (err) {
      console.error(err)
    }
    setUploadingNuestraHistoria(false)
    e.target.value = ""
  }

  const handleUploadOg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingOg(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "og_image")
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (data.url) setOg((prev) => ({ ...prev, ogImage: data.url }))
    } catch (err) {
      console.error(err)
    }
    setUploadingOg(false)
    e.target.value = ""
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-500 py-4">
        <Loader2 className="w-5 h-5 animate-spin" />
        Cargando...
      </div>
    )
  }

  return (
    <div className="mt-12 space-y-4">
      {/* Editar Nuestra historia - colapsable */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => setOpenNuestraHistoria(!openNuestraHistoria)}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
        >
          <h2 className="font-display text-xl font-semibold text-slate-800">
            Editar &quot;Nuestra historia&quot;
          </h2>
          {openNuestraHistoria ? (
            <ChevronUp className="w-5 h-5 text-slate-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-500" />
          )}
        </button>
        {openNuestraHistoria && (
          <div className="px-6 pb-6 pt-0 border-t border-slate-100">
            <p className="text-slate-600 text-sm mb-6 mt-4">
              Foto y texto de la sección &quot;Nuestra historia&quot; en la página principal. Sube una
              foto con Cloudinary o pega una URL.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Foto</label>
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-200 mb-3 max-w-xs">
                  {nuestraHistoria.imagenUrl ? (
                    <img
                      src={buildImageSrc(nuestraHistoria.imagenUrl)}
                      alt="Vista previa"
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23e2e8f0' width='200' height='200'/%3E%3Ctext fill='%2394a3b8' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='14'%3EImagen no disponible%3C/text%3E%3C/svg%3E"
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    ref={fileInputNuestraHistoria}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleUploadNuestraHistoria}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputNuestraHistoria.current?.click()}
                    disabled={uploadingNuestraHistoria}
                    className="flex items-center gap-2 px-4 py-2 bg-tita-primary text-white rounded-lg hover:bg-tita-primary/90 disabled:opacity-50 text-sm"
                  >
                    {uploadingNuestraHistoria ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {uploadingNuestraHistoria ? "Subiendo..." : "Subir con Cloudinary"}
                  </button>
                </div>
                <input
                  type="url"
                  value={nuestraHistoria.imagenUrl}
                  onChange={(e) =>
                    setNuestraHistoria((prev) => ({ ...prev, imagenUrl: e.target.value }))
                  }
                  placeholder="https://... o /assets/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-tita-primary focus:border-tita-primary"
                />
              </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
              <input
                type="text"
                value={nuestraHistoria.titulo}
                onChange={(e) =>
                  setNuestraHistoria((prev) => ({ ...prev, titulo: e.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-tita-primary focus:border-tita-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Párrafo 1 (usa **texto** para negrita)
              </label>
              <textarea
                value={nuestraHistoria.texto1}
                onChange={(e) =>
                  setNuestraHistoria((prev) => ({ ...prev, texto1: e.target.value }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-tita-primary focus:border-tita-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Párrafo 2</label>
              <textarea
                value={nuestraHistoria.texto2}
                onChange={(e) =>
                  setNuestraHistoria((prev) => ({ ...prev, texto2: e.target.value }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-tita-primary focus:border-tita-primary"
              />
            </div>
          </div>
        </div>
        <button
          onClick={handleSaveNuestraHistoria}
          disabled={saving}
          className="mt-4 px-4 py-2 bg-tita-primary text-white rounded-lg hover:bg-tita-primary/90 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar Nuestra historia
        </button>
          </div>
        )}
      </div>

      <GaleriasAmenidadesEditor />

      {/* Link para compartir - colapsable */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => setOpenOg(!openOg)}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
        >
          <h2 className="font-display text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Foto y texto del link para compartir (WhatsApp, redes)
          </h2>
          {openOg ? (
            <ChevronUp className="w-5 h-5 text-slate-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-500" />
          )}
        </button>
        {openOg && (
          <div className="px-6 pb-6 pt-0 border-t border-slate-100">
            <p className="text-slate-600 text-sm mb-6 mt-4">
              Imagen y texto que aparecen cuando alguien comparte el enlace. Sube una foto con
              Cloudinary o pega una URL.
            </p>

            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Imagen del preview
                </label>
                <div className="flex gap-4 items-start">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                    {og.ogImage ? (
                      <img
                        src={buildImageSrc(og.ogImage)}
                        alt="OG preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Crect fill='%23e2e8f0' width='96' height='96'/%3E%3C/svg%3E"
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <input
                        ref={fileInputOg}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleUploadOg}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputOg.current?.click()}
                        disabled={uploadingOg}
                        className="flex items-center gap-2 px-4 py-2 bg-tita-verde text-white rounded-lg hover:bg-tita-verde/90 disabled:opacity-50 text-sm"
                      >
                        {uploadingOg ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        {uploadingOg ? "Subiendo..." : "Subir con Cloudinary"}
                      </button>
                    </div>
                    <input
                      type="url"
                      value={og.ogImage}
                      onChange={(e) => setOg((prev) => ({ ...prev, ogImage: e.target.value }))}
                      placeholder="https://... o /og-image.png"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-tita-primary focus:border-tita-primary"
                    />
                  </div>
                </div>
              </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
            <input
              type="text"
              value={og.ogTitle}
              onChange={(e) => setOg((prev) => ({ ...prev, ogTitle: e.target.value }))}
              placeholder="Condominio Puerto Pacífico | ..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-tita-primary focus:border-tita-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
            <textarea
              value={og.ogDescription}
              onChange={(e) => setOg((prev) => ({ ...prev, ogDescription: e.target.value }))}
              rows={2}
              placeholder="5 departamentos en arriendo..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-tita-primary focus:border-tita-primary"
            />
          </div>
        </div>
        <button
          onClick={handleSaveOg}
          disabled={saving}
          className="mt-4 px-4 py-2 bg-tita-verde text-white rounded-lg hover:bg-tita-verde/90 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar link para compartir
        </button>
          </div>
        )}
      </div>

      {saved && (
        <p className="text-green-600 text-sm font-medium">Guardado correctamente.</p>
      )}
    </div>
  )
}
