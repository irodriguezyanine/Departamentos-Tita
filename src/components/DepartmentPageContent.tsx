"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { formatPrecioConUsd } from "@/lib/precios"
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Sun,
  Compass,
  Home,
  Camera,
} from "lucide-react"

export interface DeptForPage {
  slug: string
  name: string
  torre: string
  precio: number
  descripcion: string
  descripcionLarga?: string
  dormitorios?: number
  banos?: number
  terraza?: boolean
  logia?: boolean
  orientacion?: string
  notaEspecial?: string
  imagenes: { url: string; orden?: number; alt?: string }[]
}

const ESPACIOS_FOTOS = 12

function CarruselGalería({
  imagenes,
  nombreDept,
}: {
  imagenes: { url: string; orden?: number; alt?: string }[]
  nombreDept: string
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  return (
    <section className="py-12 md:py-16 bg-slate-100">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="font-display text-2xl font-bold text-slate-800 mb-4">
          Galería completa
        </h2>
        <p className="text-slate-600 mb-6 max-w-2xl text-sm">
          Desliza hacia la izquierda o derecha para ver todas las fotos. En móvil, toca una foto para hacer zoom.
        </p>
        <div
          className="overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide flex flex-nowrap gap-3 pb-4 -mx-4 px-4 overscroll-x-contain w-full"
          style={{
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-x",
            scrollBehavior: "smooth",
            minHeight: 0,
          }}
        >
          {imagenes.map((img, i) =>
            !img?.url?.trim() ? null : (
              <div
                key={img.url + String(i)}
                role="button"
                tabIndex={0}
                onClick={() => setLightboxIndex(i)}
                onKeyDown={(e) => e.key === "Enter" && setLightboxIndex(i)}
                className="relative flex-shrink-0 w-[70vw] sm:w-[320px] aspect-[4/3] rounded-xl overflow-hidden snap-center bg-slate-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-tita-oro cursor-pointer select-none touch-pan-x"
              >
                <img
                  src={img.url}
                  alt={img.alt || `${nombreDept} - Foto ${i + 1}`}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />
              </div>
            )
          )}
        </div>
      </div>

      {/* Lightbox con zoom en móvil */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl z-10"
              aria-label="Cerrar"
            >
              ×
            </button>
            <div
              className="relative w-full h-full flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={imagenes[lightboxIndex].url}
                alt={imagenes[lightboxIndex].alt || `${nombreDept} - Foto ${lightboxIndex + 1}`}
                className="max-w-full max-h-[85vh] w-auto h-auto object-contain"
                style={{ touchAction: "pinch-zoom" }}
                draggable={false}
              />
              <p className="absolute bottom-16 left-0 right-0 text-center text-white/50 text-xs sm:hidden">
                Pellizca para hacer zoom
              </p>
            </div>
            {imagenes.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightboxIndex((lightboxIndex - 1 + imagenes.length) % imagenes.length)
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-4xl p-2"
                  aria-label="Anterior"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightboxIndex((lightboxIndex + 1) % imagenes.length)
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-4xl p-2"
                  aria-label="Siguiente"
                >
                  ›
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

interface Props {
  dept: DeptForPage
  editable?: boolean
  onChange?: (updates: Partial<DeptForPage>) => void
  backHref?: string
  backLabel?: string
}

export function DepartmentPageContent({
  dept,
  editable = false,
  onChange,
  backHref = "/#departamentos",
  backLabel = "Volver a departamentos",
}: Props) {
  const [usdPerClp, setUsdPerClp] = useState<number | null>(null)
  const imagenes = dept.imagenes?.length
    ? [...dept.imagenes].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    : []

  useEffect(() => {
    fetch("/api/tipo-cambio")
      .then((res) => res.json())
      .then((data) => setUsdPerClp(data?.usdPerClp ?? null))
      .catch(() => setUsdPerClp(null))
  }, [])

  const formatPrice = (n: number) =>
    formatPrecioConUsd(n, usdPerClp) + " / noche"

  const specs = [
    { key: "dormitorios" as const, icon: Bed, label: "Dormitorios", value: dept.dormitorios ?? 4 },
    { key: "banos" as const, icon: Bath, label: "Baños", value: dept.banos ?? 3 },
    { key: "terraza" as const, icon: Sun, label: "Terraza", value: dept.terraza !== false ? "Sí" : "No" },
    { key: "logia" as const, icon: Home, label: "Logia", value: dept.logia !== false ? "Sí" : "No" },
    { key: "orientacion" as const, icon: Compass, label: "Orientación", value: dept.orientacion || "—" },
  ]

  const EditableText = ({
    value,
    field,
    className,
    multiline,
  }: {
    value: string
    field: keyof DeptForPage
    className?: string
    multiline?: boolean
  }) => {
    if (!editable || !onChange) {
      return <span className={className}>{value}</span>
    }
    if (multiline) {
      return (
        <textarea
          value={value}
          onChange={(e) => onChange({ [field]: e.target.value })}
          className={`${className} w-full min-h-[120px] p-3 rounded border-2 border-dashed border-tita-oro/50 bg-slate-50 focus:border-tita-oro focus:outline-none resize-y`}
          rows={6}
        />
      )
    }
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange({ [field]: e.target.value })}
        className={`${className} px-2 py-1 rounded border-2 border-dashed border-tita-oro/50 focus:border-tita-oro focus:outline-none bg-transparent`}
      />
    )
  }

  const EditableNumber = ({
    value,
    field,
    className,
  }: {
    value: number
    field: keyof DeptForPage
    className?: string
  }) => {
    if (!editable || !onChange) {
      return <span className={className}>{value}</span>
    }
    return (
      <input
        type="number"
        value={value}
        onChange={(e) => onChange({ [field]: parseInt(e.target.value) || 0 })}
        className={`${className} w-20 px-2 py-1 rounded border-2 border-dashed border-tita-oro/50 bg-white/10 focus:border-tita-oro focus:outline-none`}
      />
    )
  }

  const EditableBool = ({
    value,
    field,
    label,
    className,
  }: {
    value: boolean
    field: "terraza" | "logia"
    label: string
    className?: string
  }) => {
    if (!editable || !onChange) {
      return <span className={className}>{value ? "Sí" : "No"}</span>
    }
    return (
      <select
        value={value ? "Sí" : "No"}
        onChange={(e) => onChange({ [field]: e.target.value === "Sí" })}
        className={`${className} px-2 py-1 rounded border-2 border-dashed border-tita-oro/50 bg-white focus:border-tita-oro focus:outline-none`}
      >
        <option value="Sí">Sí</option>
        <option value="No">No</option>
      </select>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-end">
        <div className="absolute inset-0">
          {imagenes[0] ? (
            <Image
              src={imagenes[0].url}
              alt={imagenes[0].alt || dept.name}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-tita-verde-oscuro to-tita-verde flex items-center justify-center">
              <div className="text-center text-white/60">
                <Camera className="w-16 h-16 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Foto principal</p>
                <p className="text-xs mt-1">Se sube desde el panel de administrador</p>
              </div>
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 pb-12 pt-24">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </Link>
          {editable && onChange ? (
            <EditableText
              value={dept.name}
              field="name"
              className="font-display text-3xl md:text-5xl font-bold text-white drop-shadow-lg block bg-transparent placeholder-white/60"
            />
          ) : (
            <h1 className="font-display text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
              {dept.name}
            </h1>
          )}
          {editable && onChange ? (
            <EditableText
              value={dept.torre}
              field="torre"
              className="text-white/90 mt-2 text-lg block bg-transparent placeholder-white/60"
            />
          ) : (
            <p className="text-white/90 mt-2 text-lg">{dept.torre}</p>
          )}
          <div className="flex flex-wrap items-center gap-6 mt-6">
            <span className="flex items-center gap-2 text-white font-semibold text-lg">
              <DollarSign className="w-5 h-5" />
              {editable && onChange ? (
                <>
                  <EditableNumber value={dept.precio} field="precio" className="bg-transparent text-white w-28" />
                  <span> / noche</span>
                </>
              ) : (
                formatPrice(dept.precio)
              )}
            </span>
            <span className="flex items-center gap-2 text-white/90">
              <MapPin className="w-4 h-4" />
              Puerto Pacífico, Viña del Mar
            </span>
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="py-12 md:py-16 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-display text-xl font-semibold text-slate-800 mb-8">
            Características
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {specs.map((spec, i) => (
              <motion.div
                key={spec.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col items-center p-4 rounded-xl bg-slate-50 border-2 border-slate-100 hover:border-tita-oro/40 transition-colors"
              >
                <spec.icon className="w-8 h-8 text-tita-verde mb-2" />
                <span className="text-xs text-slate-500 uppercase tracking-wide">
                  {spec.label}
                </span>
                {spec.key === "dormitorios" || spec.key === "banos" ? (
                  <EditableNumber
                    value={dept[spec.key] ?? 4}
                    field={spec.key}
                    className="font-semibold text-slate-800 mt-1 text-center"
                  />
                ) : spec.key === "terraza" || spec.key === "logia" ? (
                  <EditableBool
                    value={dept[spec.key] !== false}
                    field={spec.key}
                    label={spec.label}
                    className="font-semibold text-slate-800 mt-1"
                  />
                ) : (
                  <EditableText
                    value={dept.orientacion || "—"}
                    field="orientacion"
                    className="font-semibold text-slate-800 mt-1 block text-center"
                  />
                )}
              </motion.div>
            ))}
          </div>
          {(dept.notaEspecial || editable) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl"
            >
              <p className="text-amber-800 text-sm">
                <strong>Nota:</strong>{" "}
                {editable && onChange ? (
                  <EditableText
                    value={dept.notaEspecial || ""}
                    field="notaEspecial"
                    className="inline-block w-full max-w-md"
                  />
                ) : (
                  dept.notaEspecial
                )}
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Galería */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-display text-2xl font-bold text-slate-800 mb-4">
            Galería
          </h2>
          <p className="text-slate-600 mb-12 max-w-2xl">
            {imagenes.length > 0
              ? "Recorra cada espacio de este departamento a través de nuestra galería."
              : "Las fotos se gestionan desde el panel de administrador."}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: Math.max(ESPACIOS_FOTOS, imagenes.length) }).map((_, i) => {
              const displayImg = imagenes[i]
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ delay: (i % 6) * 0.05 }}
                  className={`relative overflow-hidden rounded-xl ${
                    i === 0 ? "sm:col-span-2 sm:row-span-2" : ""
                  }`}
                >
                  <div
                    className={`relative bg-slate-200 ${
                      i === 0 ? "aspect-[16/10] sm:aspect-[4/3]" : "aspect-[4/3]"
                    }`}
                  >
                    {displayImg ? (
                      <Image
                        src={displayImg.url}
                        alt={displayImg.alt || `${dept.name} - Foto ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-4">
                        <Camera className="w-10 h-10 mb-2 opacity-40" />
                        <span className="text-xs text-center">Espacio {i + 1}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Descripción */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-display text-2xl font-bold text-slate-800 mb-6">
            Sobre este departamento
          </h2>
          <div className="prose prose-lg max-w-none text-slate-600">
            {dept.descripcionLarga ? (
              editable && onChange ? (
                <EditableText
                  value={dept.descripcionLarga}
                  field="descripcionLarga"
                  className="block"
                  multiline
                />
              ) : (
                dept.descripcionLarga.split("\n\n").map((p, i) => (
                  <p key={i} className={i > 0 ? "mt-4 leading-relaxed" : "leading-relaxed"}>
                    {p}
                  </p>
                ))
              )
            ) : editable && onChange ? (
              <EditableText
                value={dept.descripcion}
                field="descripcion"
                className="block"
                multiline
              />
            ) : (
              <>
                <p className="leading-relaxed">
                  {dept.descripcion ||
                    "Departamento acogedor en el exclusivo Condominio Puerto Pacífico."}
                </p>
                <p className="mt-4 leading-relaxed">
                  Ubicado frente a playa Las Salinas, a pasos de Marina Arauco, con piscinas,
                  gimnasio, conserjería 24 horas y todas las amenidades del condominio.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Carrusel */}
      {imagenes.length > 0 && (
        <CarruselGalería
          imagenes={imagenes}
          nombreDept={dept.name}
        />
      )}

      {/* CTA */}
      <section className="py-16 md:py-24 bg-tita-verde-oscuro border-t-2 border-tita-oro">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-tita-beige mb-4">
            ¿Te interesa {dept.name}?
          </h2>
          <p className="text-tita-beige/90 mb-8">
            Contáctanos para consultar disponibilidad y reservar tu estadía.
          </p>
          <a
            href="mailto:dalal@vtr.net"
            className="inline-block px-10 py-4 bg-tita-verde-oscuro text-tita-beige font-semibold rounded-full border-2 border-tita-oro hover:bg-tita-verde-medio hover:shadow-oro-glow transition-all"
          >
            Contactar
          </a>
        </div>
      </section>
    </div>
  )
}
