"use client"

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
} from "lucide-react"
import Image from "next/image"

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Imagen de fondo - Puerto Pacífico al atardecer */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/assets/hero-portada.png')" }}
          role="img"
          aria-label="Condominio Puerto Pacífico, Viña del Mar"
        />
        {/* Overlay verde oscuro (semi-transparente para que se vea la foto) */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/55 via-emerald-900/50 to-teal-950/60" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4"
          >
            Departamentos Tita
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-white/95 mb-2"
          >
            Puerto Pacífico · Viña del Mar
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg text-white/90 mb-10"
          >
            Más de 20 años de servicio excepcional
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link
              href="#departamentos"
              className="px-8 py-4 bg-white text-emerald-900 font-semibold rounded-full hover:bg-emerald-50 transition-colors shadow-lg"
            >
              Ver departamentos
            </Link>
            <Link
              href="#condominio"
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
            >
              Conocer el condominio
            </Link>
          </motion.div>
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
              <h2 className="font-display text-3xl md:text-4xl font-bold text-tita-primary mb-6">
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
            <h2 className="font-display text-3xl md:text-4xl font-bold text-tita-primary mb-4">
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
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100"
              >
                <item.icon className="w-10 h-10 text-tita-primary mb-3" />
                <h3 className="font-semibold text-slate-800 mb-1">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-slate-100"
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
            <div className="flex items-center gap-3 text-tita-primary">
              <MapPin className="w-6 h-6 flex-shrink-0" />
              <p className="font-medium">
                Ubicación privilegiada · Frente a playa Las Salinas · Viña del Mar
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
            <h2 className="font-display text-3xl md:text-4xl font-bold text-tita-primary mb-4">
              Nuestros departamentos
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Cada uno con su propia personalidad. Desde $90.000 la noche.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { slug: "4c-torre-galapagos", name: "4 C Torre Galápagos" },
              { slug: "13d-torre-cabo-hornos", name: "13 D Torre Cabo de Hornos" },
              { slug: "17c-torre-isla-grande", name: "17 C Torre Isla Grande" },
              { slug: "16c-torre-juan-fernandez", name: "16 C Torre Juan Fernández" },
              { slug: "18c-torre-juan-fernandez", name: "18 C Torre Juan Fernández" },
            ].map((dept, i) => (
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
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 mb-4">
                    <div className="w-full h-full bg-gradient-to-br from-tita-primary/20 to-tita-ocean/20 flex items-center justify-center">
                      <Building2 className="w-16 h-16 text-tita-primary/50" />
                    </div>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-slate-800 group-hover:text-tita-primary transition-colors">
                    {dept.name}
                  </h3>
                  <p className="text-tita-primary font-medium mt-1">Desde $90.000 / noche</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-tita-primary">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
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
            className="text-xl text-white/90 mb-10"
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
              className="inline-block px-10 py-4 bg-white text-tita-primary font-semibold rounded-full hover:bg-tita-sand transition-colors"
            >
              Contactar
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
