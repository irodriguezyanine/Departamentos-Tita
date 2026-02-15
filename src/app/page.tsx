"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Waves,
  MapPin,
  Droplets,
  Dumbbell,
  Car,
  ShieldCheck,
  Building2,
  Shirt,
  Bed,
  Bath,
} from "lucide-react"
import Image from "next/image"
import { getDepartamentoBySlug } from "@/data/departamentos-static"

interface DeptFromApi {
  slug: string
  name: string
  precio?: number
  dormitorios?: number
  banos?: number
  imagenes?: { url: string; orden?: number }[]
}

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

export default function HomePage() {
  const [deptsFromApi, setDeptsFromApi] = useState<DeptFromApi[]>([])

  useEffect(() => {
    fetch("/api/departamentos")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDeptsFromApi(data)
      })
      .catch(() => {})
  }, [])

  const DEPARTAMENTOS = [
    { slug: "4c-torre-galapagos", name: "4 C Torre Galápagos" },
    { slug: "13d-torre-cabo-hornos", name: "13 D Torre Cabo de Hornos" },
    { slug: "17c-torre-isla-grande", name: "17 C Torre Isla Grande" },
    { slug: "16c-torre-juan-fernandez", name: "16 C Torre Juan Fernández" },
    { slug: "18c-torre-juan-fernandez", name: "18 C Torre Juan Fernández" },
  ]

  const getThumbUrl = (slug: string) => {
    const fromApi = deptsFromApi.find((d) => d.slug === slug)
    if (fromApi?.imagenes?.length) {
      const sorted = [...fromApi.imagenes].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
      return sorted[0].url
    }
    const staticDept = getDepartamentoBySlug(slug)
    return staticDept?.imagenes?.[0]?.url
  }

  const getDeptData = (slug: string) => {
    const fromApi = deptsFromApi.find((d) => d.slug === slug)
    const staticDept = getDepartamentoBySlug(slug)
    return {
      precio: fromApi?.precio ?? staticDept?.precio ?? 90000,
      dormitorios: fromApi?.dormitorios ?? staticDept?.dormitorios ?? 4,
      banos: fromApi?.banos ?? staticDept?.banos ?? 3,
    }
  }

  const formatPrecio = (n: number) =>
    new Intl.NumberFormat("es-CL", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)

  return (
    <div>
      {/* Hero - Estilo Colliers: imagen de fondo con overlay rectangular verde oscuro */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Imagen de fondo - Vista panorámica Puerto Pacífico (cubre toda la sección) */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-tita-verde-oscuro"
          style={{ backgroundImage: "url('/assets/hero-portada.png')" }}
          role="img"
          aria-label="Condominio Puerto Pacífico, Viña del Mar"
        />
        {/* Overlay verde oscuro cubriendo toda la pantalla sobre la imagen */}
        <div className="absolute inset-0 bg-tita-verde-oscuro/75" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 lg:px-16 py-16 text-left text-tita-beige">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-sm uppercase tracking-widest text-tita-beige/80 mb-3"
          >
            Puerto Pacífico · Viña del Mar
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-tita-beige"
          >
            Departamentos Tita
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-tita-beige/90 mb-8 max-w-xl"
          >
            Más de 20 años de servicio excepcional en el corazón de Viña del Mar
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              href="#departamentos"
              className="px-8 py-4 bg-tita-verde-oscuro text-tita-beige font-semibold rounded-full border-2 border-tita-oro hover:bg-tita-verde-medio hover:shadow-oro-glow transition-all"
            >
              Ver departamentos
            </Link>
            <Link
              href="#condominio"
              className="px-8 py-4 bg-tita-verde-oscuro text-tita-beige font-semibold rounded-full border-2 border-tita-oro hover:bg-tita-verde-medio hover:shadow-oro-glow transition-all"
            >
              Conocer el condominio
            </Link>
          </motion.div>
          <motion.a
            href="mailto:dalal@vtr.net"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="inline-block mt-8 text-tita-beige hover:text-tita-oro-claro transition-colors text-sm"
          >
            — Contáctanos —
          </motion.a>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Nuestra historia */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                initial: { opacity: 0, x: -40 },
                animate: { opacity: 1, x: 0 },
              }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/assets/dalal-enrique.png"
                  alt="Dalal Saleme y Enrique Yanine - Dueños de Departamentos Tita"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-tita-accent/20 rounded-2xl -z-10" />
            </motion.div>
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                initial: { opacity: 0, x: 40 },
                animate: { opacity: 1, x: 0 },
              }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold text-tita-verde mb-6">
                Nuestra historia
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Con más de <strong>20 años de experiencia</strong>, Dalal Saleme y Enrique Yanine
                ofrecen un <strong>servicio excepcional</strong> en el corazón de Viña del Mar.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Cada departamento es cuidado con dedicación para que tu estadía sea inolvidable.
                Conocemos cada rincón del condominio y estamos comprometidos con tu comodidad y
                satisfacción.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Condominio */}
      <section id="condominio" className="py-20 md:py-28 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-tita-verde mb-4">
              Condominio Puerto Pacífico
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Emplazado en una de las mejores zonas de Viña del Mar, con comodidad y confort
              excepcionales.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {[
              { icon: Droplets, title: "4 Piscinas", desc: "Dos para adultos y dos para niños" },
              { icon: Dumbbell, title: "Gimnasio", desc: "Equipado para tu rutina" },
              { icon: Car, title: "Estacionamiento", desc: "Para visitas y residentes" },
              { icon: ShieldCheck, title: "Conserjería 24 hrs", desc: "Seguridad y atención permanente" },
              { icon: Waves, title: "Sala de usos múltiples", desc: "Espacios compartidos" },
              { icon: Shirt, title: "Lavandería", desc: "Comodidad total" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border-2 border-slate-100 hover:border-tita-oro/50"
              >
                <item.icon className="w-10 h-10 text-tita-verde mb-3" />
                <h3 className="font-semibold text-slate-800 mb-1">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border-2 border-slate-100"
          >
            <p className="text-slate-600 leading-relaxed text-lg mb-6">
              Además, el condominio cuenta con <strong>dos mesas de billar</strong>,{" "}
              <strong>mesa de ping pong</strong> y <strong>juegos para niños</strong>. La
              ubicación es ideal para caminar por Viña, practicar deportes, y disfrutar frente a
              la playa y la recta Las Salinas.
            </p>
            <p className="text-slate-600 leading-relaxed text-lg mb-6">
              A pasos del centro comercial Marina Arauco, bancos, farmacias, supermercados,
              restaurantes y bares. Podrás disfrutar de los <strong>fuegos artificiales en Año
              Nuevo</strong> y contemplar los <strong>mágicos atardeceres</strong> que Viña del
              Mar tiene para ofrecer.
            </p>
            <div className="flex items-center gap-3 text-tita-verde">
              <MapPin className="w-6 h-6 flex-shrink-0" />
              <p className="font-medium">
                Av. Jorge Montt 1598, Viña del Mar, Valparaíso · Frente a playa Las Salinas
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Departamentos */}
      <section id="departamentos" className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-tita-verde mb-4">
              Nuestros departamentos
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Cada uno con su propia personalidad. Desde $90.000 la noche.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {DEPARTAMENTOS.map((dept, i) => {
              const thumbUrl = getThumbUrl(dept.slug)
              const { precio, dormitorios, banos } = getDeptData(dept.slug)
              return (
              <motion.div
                key={dept.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={`/departamentos/${dept.slug}`}
                  className="block group"
                >
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 mb-4 relative border-2 border-slate-200 group-hover:border-tita-oro transition-colors">
                    {thumbUrl ? (
                      <Image
                        src={thumbUrl}
                        alt={dept.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-tita-verde/20 to-tita-verde-medio/20 flex items-center justify-center">
                        <Building2 className="w-16 h-16 text-tita-verde/50" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-display text-xl font-semibold text-slate-800 group-hover:text-tita-verde transition-colors">
                    {dept.name}
                  </h3>
                  <div className="flex items-center justify-between gap-3 mt-1 flex-wrap">
                    <p className="text-tita-verde font-medium">Desde ${formatPrecio(precio)} / noche</p>
                    <div className="flex items-center gap-4 text-slate-500 text-sm">
                      <span className="flex items-center gap-1.5">
                        <Bed className="w-4 h-4" />
                        {dormitorios} piezas
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Bath className="w-4 h-4" />
                        {banos} baños
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )})}
          </div>
        </div>
      </section>

      {/* Mapa - Cómo llegar */}
      <section id="ubicacion" className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-tita-verde mb-4">
              Cómo llegar
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto mb-2">
              Condominio Puerto Pacífico
            </p>
            <p className="text-tita-verde font-medium flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5" />
              Av. Jorge Montt 1598, Viña del Mar, Valparaíso
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden shadow-xl border-2 border-slate-200 h-[400px] md:h-[450px]"
          >
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=-71.555%2C-33.012%2C-71.542%2C-33.002&layer=mapnik&marker=-33.0066%2C-71.5500"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              title="Ubicación Condominio Puerto Pacífico - Av. Jorge Montt 1598, Viña del Mar"
            />
          </motion.div>
          <div className="text-center mt-4">
            <p className="text-slate-500 text-sm">
              Frente a playa Las Salinas · A pasos de Marina Arauco
            </p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Av.+Jorge+Montt+1598,+Viña+del+Mar,+Chile"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-tita-verde hover:text-tita-verde-medio font-medium text-sm"
            >
              Abrir en Google Maps →
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-tita-verde-oscuro border-t-2 border-tita-oro">
        <div className="max-w-4xl mx-auto px-4 text-center text-tita-beige">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl font-bold mb-6"
          >
            ¿Listo para tu próxima estadía?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl text-tita-beige/90 mb-10"
          >
            Contáctanos y reserva tu departamento en Puerto Pacífico
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <a
              href="mailto:dalal@vtr.net"
              className="inline-block px-10 py-4 bg-tita-verde-oscuro text-tita-beige font-semibold rounded-full border-2 border-tita-oro hover:bg-tita-verde-medio hover:shadow-oro-glow transition-all"
            >
              Contactar
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
