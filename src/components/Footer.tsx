import Link from "next/link"
import { MapPin, Phone, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-tita-verde-oscuro border-t-2 border-tita-oro text-tita-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-tita-beige font-display font-semibold text-lg mb-4">
              Departamentos Tita
            </h3>
            <p className="text-sm leading-relaxed text-tita-beige/90">
              Más de 20 años ofreciendo un servicio excepcional en el corazón de Viña del Mar.
              Condominio Puerto Pacífico — tu hogar frente al mar.
            </p>
          </div>
          <div>
            <h3 className="text-tita-beige font-display font-semibold text-lg mb-4">
              Ubicación
            </h3>
            <div className="flex items-start gap-3 text-sm text-tita-beige/90">
              <MapPin className="w-5 h-5 text-tita-oro flex-shrink-0 mt-0.5" />
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
            <h3 className="text-tita-beige font-display font-semibold text-lg mb-4">
              Contacto
            </h3>
            <div className="space-y-2 text-sm">
              <a
                href="https://wa.me/56984022927?text=Hola%2C%20me%20interesa%20conocer%20m%C3%A1s%20sobre%20los%20departamentos%20en%20arriendo."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-tita-beige/90 hover:text-tita-oro transition-colors"
              >
                <Phone className="w-4 h-4" />
                +56 9 8402 2927
              </a>
              <a
                href="mailto:dalal@vtr.net"
                className="flex items-center gap-2 text-tita-beige/90 hover:text-tita-oro transition-colors"
              >
                <Mail className="w-4 h-4" />
                dalal@vtr.net
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-tita-oro/40 text-center text-sm text-tita-beige/80">
          <p>© {new Date().getFullYear()} Departamentos Tita. Dalal Saleme & Enrique Yanine.</p>
        </div>
      </div>
    </footer>
  )
}
