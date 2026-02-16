"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { DepartmentPageContent, DeptForPage } from "@/components/DepartmentPageContent"
import { getDepartamentoBySlug } from "@/data/departamentos-static"

export default function DepartamentoPage() {
  const params = useParams()
  const slug = params.slug as string
  const [dept, setDept] = useState<DeptForPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [mostrarPrecio, setMostrarPrecio] = useState(true)

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.mostrarPrecio === "boolean") setMostrarPrecio(data.mostrarPrecio)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch(`/api/departamentos/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setDept({
            slug: data.slug,
            name: data.name,
            torre: data.torre,
            precio: data.precio,
            descripcion: data.descripcion,
            descripcionLarga: data.descripcionLarga,
            dormitorios: data.dormitorios,
            banos: data.banos,
            terraza: data.terraza,
            logia: data.logia,
            orientacion: data.orientacion,
            notaEspecial: data.notaEspecial,
            imagenes: data.imagenes || [],
          })
        } else {
          const fallback = getDepartamentoBySlug(slug)
          if (fallback) {
            setDept({
              slug: fallback.slug,
              name: fallback.name,
              torre: fallback.torre,
              precio: fallback.precio,
              descripcion: fallback.descripcion,
              descripcionLarga: fallback.descripcionLarga,
              dormitorios: fallback.dormitorios,
              banos: fallback.banos,
              terraza: fallback.terraza,
              logia: fallback.logia,
              orientacion: fallback.orientacion,
              notaEspecial: fallback.notaEspecial,
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
            slug: fallback.slug,
            name: fallback.name,
            torre: fallback.torre,
            precio: fallback.precio,
            descripcion: fallback.descripcion,
            descripcionLarga: fallback.descripcionLarga,
            dormitorios: fallback.dormitorios,
            banos: fallback.banos,
            terraza: fallback.terraza,
            logia: fallback.logia,
            orientacion: fallback.orientacion,
            notaEspecial: fallback.notaEspecial,
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
        <Link
          href="/"
          className="text-tita-verde font-medium hover:underline px-4 py-2 rounded-full border-2 border-tita-oro bg-tita-verde-oscuro text-tita-beige hover:bg-tita-verde-medio transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    )
  }

  return (
    <DepartmentPageContent
      dept={dept}
      backHref="/#departamentos"
      backLabel="Volver a departamentos"
      mostrarPrecio={mostrarPrecio}
    />
  )
}
