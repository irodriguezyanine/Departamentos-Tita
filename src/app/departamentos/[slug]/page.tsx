"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"
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
import { getDepartamentoBySlug } from "@/data/departamentos-static"

interface Departamento {
  _id?: string
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
  imagenes: { url: string; orden: number; width?: number; height?: number; alt?: string }[]
  layout?: unknown[]
}

const ESPACIOS_FOTOS = 12

export default function DepartamentoPage() {
  const params = useParams()
  const slug = params.slug as string
  const [dept, setDept] = useState<Departamento | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/departamentos/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setDept(data)
        } else {
          const fallback = getDepartamentoBySlug(slug)
          if (fallback) {
            setDept({
              ...fallback,
              imagenes: fallback.imagenes.map((img) => ({
                url: img.url,
                orden: img.orden,
                alt: img.alt,
              })),
            })
          }
        }
        setLoading(false)
      })
      .catch(() => {
        const fallback = getDepartamentoBySlug(slug)
        if (fallback) {
          setDept({
            ...fallback,
            imagenes: fallback.imagenes.map((img) => ({
              url: img.url,
              orden: img.orden,
              alt: img.alt,
            })),
          })
        }
        setLoading(false)
      })
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400">Cargando...</div>
      </div>
    )
  }

  if (!dept) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
        <p className="text-slate-600">Departamento no encontrado</p>
        <Link href="/" className="text-tita-verde font-medium hover:underline px-4 py-2 rounded-full border-2 border-tita-oro bg-tita-verde-oscuro text-tita-beige hover:bg-tita-verde-medio transition-colors">
          Volver al inicio
        </Link>
      </div>
    )
  }

  const imagenes = dept.imagenes?.length
    ? [...dept.imagenes].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    : []

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("es-CL").format(n) + " / noche"

  const specs = [
    { icon: Bed, label: "Dormitorios", value: dept.dormitorios ?? 4 },
    { icon: Bath, label: "Baños", value: dept.banos ?? 3 },
    { icon: Sun, label: "Terraza", value: dept.terraza !== false ? "Sí" : "No" },
    { icon: Home, label: "Logia", value: dept.logia !== false ? "Sí" : "No" },
    { icon: Compass, label: "Orientación", value: dept.orientacion || "—" },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero con imagen principal */}
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
            href="/#departamentos"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a departamentos
          </Link>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
            {dept.name}
          </h1>
          <p className="text-white/90 mt-2 text-lg">{dept.torre}</p>
          <div className="flex flex-wrap items-center gap-6 mt-6">
            <span className="flex items-center gap-2 text-white font-semibold text-lg">
              <DollarSign className="w-5 h-5" />
              {formatPrice(dept.precio)}
            </span>
            <span className="flex items-center gap-2 text-white/90">
              <MapPin className="w-4 h-4" />
              Puerto Pacífico, Viña del Mar
            </span>
          </div>
        </div>
      </section>

      {/* Especificaciones */}
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
                <span className="font-semibold text-slate-800 mt-1">{spec.value}</span>
              </motion.div>
            ))}
          </div>
          {dept.notaEspecial && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl"
            >
              <p className="text-amber-800 text-sm">
                <strong>Nota:</strong> {dept.notaEspecial}
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Galería de fotos */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-display text-2xl font-bold text-slate-800 mb-4">
            Galería
          </h2>
          <p className="text-slate-600 mb-12 max-w-2xl">
            {imagenes.length > 0
              ? "Recorra cada espacio de este departamento a través de nuestra galería."
              : "Las fotos se gestionan desde el panel de administrador. Cada espacio está listo para que Dalal suba las imágenes de cada departamento."}
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
                        <span className="text-xs text-center">
                          Espacio {i + 1}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1">
                          Subir desde admin
                        </span>
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
            {(dept as { descripcionLarga?: string }).descripcionLarga ? (
              (dept as { descripcionLarga?: string }).descripcionLarga!.split("\n\n").map((p, i) => (
                <p key={i} className={i > 0 ? "mt-4 leading-relaxed" : "leading-relaxed"}>
                  {p}
                </p>
              ))
            ) : (
              <>
                <p className="leading-relaxed">
                  {dept.descripcion ||
                    "Departamento acogedor en el exclusivo Condominio Puerto Pacífico, con todas las comodidades para una estadía inolvidable en Viña del Mar."}
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

      {/* Carrusel de fotos - al final de la página */}
      {imagenes.length > 0 && (
        <section className="py-16 md:py-24 bg-slate-100">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-slate-800 mb-4">
              Galería completa
            </h2>
            <p className="text-slate-600 mb-8 max-w-2xl">
              Desliza para ver todas las fotos de {dept.name}. Compatible con gestos táctiles en móvil.
            </p>
            <div className="relative -mx-4 md:mx-0">
              <div className="overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide flex gap-4 pb-4 px-4 md:px-0">
                {imagenes.map((img, i) => (
                  <div
                    key={i}
                    className="relative flex-shrink-0 w-[85vw] md:w-[600px] aspect-[4/3] rounded-xl overflow-hidden snap-center bg-slate-200 shadow-lg"
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || `${dept.name} - Foto ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 85vw, 600px"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Contacto */}
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
