import Link from "next/link"
import { MapPin, Phone, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-display font-semibold text-lg mb-4">
              Departamentos Tita
            </h3>
            <p className="text-sm leading-relaxed">
              Más de 20 años ofreciendo un servicio excepcional en el corazón de Viña del Mar.
              Condominio Puerto Pacífico — tu hogar frente al mar.
            </p>
          </div>
          <div>
            <h3 className="text-white font-display font-semibold text-lg mb-4">
              Ubicación
            </h3>
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-5 h-5 text-tita-accent flex-shrink-0 mt-0.5" />
              <p>
                Condominio Puerto Pacífico
                <br />
                Viña del Mar, Región de Valparaíso
                <br />
                Frente a playa Las Salinas
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-white font-display font-semibold text-lg mb-4">
              Contacto
            </h3>
            <div className="space-y-2 text-sm">
              <a
                href="mailto:dalal@vtr.net"
                className="flex items-center gap-2 hover:text-tita-accent transition-colors"
              >
                <Mail className="w-4 h-4" />
                dalal@vtr.net
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-700 text-center text-sm">
          <p>© {new Date().getFullYear()} Departamentos Tita. Dalal Saleme & Enrique Yanine.</p>
        </div>
      </div>
    </footer>
  )
}
