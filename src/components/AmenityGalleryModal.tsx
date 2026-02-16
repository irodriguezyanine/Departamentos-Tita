"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

function buildImageSrc(url: string): string {
  if (!url?.startsWith("http")) {
    return typeof window !== "undefined" ? window.location.origin + (url?.startsWith("/") ? url : `/${url || ""}`) : url || ""
  }
  return url
}

interface AmenityGalleryModalProps {
  isOpen: boolean
  onClose: () => void
  titulo: string
  descripcion: string
  fotos: { url: string }[]
}

export function AmenityGalleryModal({
  isOpen,
  onClose,
  titulo,
  descripcion,
  fotos,
}: AmenityGalleryModalProps) {
  const [index, setIndex] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const isExitingRef = useRef(false)
  const hasCalledOnCloseRef = useRef(false)

  useEffect(() => {
    if (isOpen) {
      setIndex(0)
      setIsExiting(false)
      hasCalledOnCloseRef.current = false
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const handleClose = () => {
    isExitingRef.current = true
    setIsExiting(true)
  }

  const handleAnimationComplete = () => {
    if (isExitingRef.current && !hasCalledOnCloseRef.current) {
      hasCalledOnCloseRef.current = true
      onClose()
    }
  }

  const prev = () => setIndex((i) => (i - 1 + fotos.length) % fotos.length)
  const next = () => setIndex((i) => (i + 1) % fotos.length)

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={handleClose}
      onAnimationComplete={handleAnimationComplete}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: isExiting ? 0.96 : 1, opacity: isExiting ? 0 : 1 }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onAnimationComplete={handleAnimationComplete}
      >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-slate-800 shadow-lg transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 pb-4">
            <h3 className="font-display text-xl font-bold text-tita-verde mb-1">{titulo}</h3>
            {descripcion && <p className="text-slate-600 text-sm mb-4">{descripcion}</p>}
          </div>

          {fotos.length > 0 ? (
            <div className="relative px-6 pb-6">
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    src={buildImageSrc(fotos[index].url)}
                    alt={`${titulo} - Foto ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
              </div>

              {fotos.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-8 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg text-slate-600 hover:text-slate-800 transition-colors"
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-8 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg text-slate-600 hover:text-slate-800 transition-colors"
                    aria-label="Siguiente"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="flex justify-center gap-1.5 mt-3">
                    {fotos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          i === index ? "bg-tita-verde w-4" : "bg-slate-300 hover:bg-slate-400"
                        }`}
                        aria-label={`Ir a foto ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="px-6 pb-6">
              <div className="aspect-[4/3] rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                Sin fotos aún
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
  )
}
