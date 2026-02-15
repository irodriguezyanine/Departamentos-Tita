"use client"

import { MessageCircle } from "lucide-react"

export function WhatsAppButton() {
  const phone = "56912345678"
  const message = encodeURIComponent("Hola, me interesa conocer más sobre los departamentos en arriendo.")

  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-tita-verde-oscuro hover:bg-tita-verde-medio text-tita-beige border-2 border-tita-oro rounded-full flex items-center justify-center shadow-oro-glow hover:shadow-xl transition-all hover:scale-110"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  )
}
