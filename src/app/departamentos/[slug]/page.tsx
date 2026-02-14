"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"
import { ArrowLeft, MapPin, DollarSign } from "lucide-react"

interface Departamento {
  _id: string
  slug: string
  name: string
  torre: string
  precio: number
  descripcion: string
  imagenes: { url: string; orden: number; width?: number; height?: number }[]
  layout?: unknown[]
}

export default function DepartamentoPage() {
  const params = useParams()
  const slug = params.slug as string
  const [dept, setDept] = useState<Departamento | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/departamentos/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setDept(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Cargando...</div>
      </div>
    )
  }

  if (!dept) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-slate-600">Departamento no encontrado</p>
        <Link href="/" className="text-tita-primary font-medium hover:underline">
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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-tita-primary text-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <Link
            href="/#departamentos"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a departamentos
          </Link>
          <h1 className="font-display text-3xl md:text-4xl font-bold">{dept.name}</h1>
          <p className="text-white/90 mt-2">{dept.torre}</p>
          <div className="flex items-center gap-4 mt-4">
            <span className="flex items-center gap-2 font-semibold">
              <DollarSign className="w-5 h-5" />
              {formatPrice(dept.precio)}
            </span>
            <span className="flex items-center gap-2 text-white/80">
              <MapPin className="w-4 h-4" />
              Puerto Pacífico, Viña del Mar
            </span>
          </div>
        </div>
      </div>

      {/* Galería artística - masonry/parallax style */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {imagenes.length > 0 ? (
          <div className="space-y-8 md:space-y-12">
            {imagenes.map((img, i) => {
              const isWide = i % 3 === 0
              const isTall = i % 4 === 1
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.7, delay: i * 0.1 }}
                  className={`relative overflow-hidden rounded-2xl ${
                    isWide ? "aspect-[21/9]" : isTall ? "aspect-[3/4] max-w-md mx-auto" : "aspect-[4/3]"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={`${dept.name} - Foto ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-xl bg-slate-200 flex items-center justify-center"
              >
                <span className="text-slate-400">Foto {i}</span>
              </div>
            ))}
          </div>
        )}

        {/* Descripción */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 md:mt-24 max-w-3xl"
        >
          <h2 className="font-display text-2xl font-bold text-tita-primary mb-4">
            Sobre este departamento
          </h2>
          <p className="text-slate-600 leading-relaxed text-lg">
            {dept.descripcion || "Departamento acogedor en el exclusivo Condominio Puerto Pacífico, con todas las comodidades para una estadía inolvidable en Viña del Mar."}
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 p-8 bg-tita-sand/30 rounded-2xl text-center"
        >
          <p className="text-xl font-semibold text-slate-800 mb-4">
            ¿Te interesa este departamento?
          </p>
          <a
            href="mailto:dalal@vtr.net"
            className="inline-block px-8 py-4 bg-tita-primary text-white font-semibold rounded-full hover:bg-tita-primary-light transition-colors"
          >
            Contactar
          </a>
        </motion.div>
      </div>
    </div>
  )
}
