/**
 * Datos estáticos de departamentos para fallback cuando MongoDB no está disponible.
 * Incluye imágenes locales y descripciones profesionales estilo Colliers.
 */

export interface DepartamentoStatic {
  slug: string
  name: string
  torre: string
  precio: number
  descripcion: string
  descripcionLarga: string
  dormitorios: number
  banos: number
  terraza: boolean
  logia: boolean
  orientacion: string
  notaEspecial?: string
  imagenes: { url: string; orden: number; alt?: string }[]
}

const BASE = "/assets/departamentos"

export const DEPARTAMENTOS_STATIC: DepartamentoStatic[] = [
  {
    slug: "4c-torre-galapagos",
    name: "4 C Torre Galápagos",
    torre: "Galápagos",
    precio: 90000,
    descripcion:
      "Exclusivo departamento de cuatro dormitorios y tres baños con orientación Reñaca. Terraza privada y logia para disfrutar de vistas panorámicas al océano y al condominio.",
    descripcionLarga: `Descubra el refinamiento y la comodidad en este distinguido departamento de la Torre Galápagos. Con cuatro amplios dormitorios y tres baños de diseño, este inmueble ofrece una experiencia de vida costera de primer nivel.

El salón-comedor de concepto abierto presenta un sofá seccional de cuero, mesa de centro de cristal y una elegante zona de comedor con mesa de seis puestos. La cocina equipada con electrodomésticos de acero inoxidable, barra de desayuno y abundante luz natural complementa el espacio.

Los dormitorios principales cuentan con amplios ventanales que capturan la orientación Reñaca, con vistas a la laguna, palmeras y el horizonte marino. La terraza privada con mobiliario de exterior invita al esparcimiento al aire libre, mientras que la logia ofrece un refugio adicional para disfrutar del clima costero.

Ubicado en el exclusivo Condominio Puerto Pacífico, frente a playa Las Salinas y a pasos de Marina Arauco, este departamento representa la cumbre del confort y la ubicación privilegiada en Viña del Mar.`,
    dormitorios: 4,
    banos: 3,
    terraza: true,
    logia: true,
    orientacion: "Reñaca",
    imagenes: [
      { url: `${BASE}/4c-torre-galapagos/foto-5.png`, orden: 0, alt: "Vista panorámica del condominio y océano" },
      { url: `${BASE}/4c-torre-galapagos/foto-1.png`, orden: 1, alt: "Salón-comedor de concepto abierto" },
      { url: `${BASE}/4c-torre-galapagos/foto-2.png`, orden: 2, alt: "Living con sofás y mesa de centro" },
      { url: `${BASE}/4c-torre-galapagos/foto-3.png`, orden: 3, alt: "Dormitorio principal con vista" },
      { url: `${BASE}/4c-torre-galapagos/foto-4.png`, orden: 4, alt: "Cocina equipada con barra de desayuno" },
      { url: `${BASE}/4c-torre-galapagos/foto-6.png`, orden: 5, alt: "Terraza privada con mobiliario" },
      { url: `${BASE}/4c-torre-galapagos/foto-7.png`, orden: 6, alt: "Comedor y living" },
      { url: `${BASE}/4c-torre-galapagos/foto-8.png`, orden: 7, alt: "Baño principal" },
      { url: `${BASE}/4c-torre-galapagos/foto-9.png`, orden: 8, alt: "Dormitorio con literas" },
      { url: `${BASE}/4c-torre-galapagos/foto-10.png`, orden: 9, alt: "Dormitorio con luz natural" },
    ],
  },
  {
    slug: "13d-torre-cabo-hornos",
    name: "13 D Torre Cabo de Hornos",
    torre: "Cabo de Hornos",
    precio: 90000,
    descripcion:
      "Amplio departamento con excelente vista hacia Valparaíso. Dos dormitorios unidos para mayor amplitud. Terraza y logia para disfrutar de los atardeceres.",
    descripcionLarga: `Este distinguido departamento de la Torre Cabo de Hornos ofrece una perspectiva única hacia el puerto de Valparaíso, con atardeceres memorables desde su terraza y logia.

Con cuatro dormitorios y tres baños, destaca la configuración de dos dormitorios unidos que amplían el espacio y ofrecen versatilidad para familias o grupos. La orientación Valparaíso garantiza vistas privilegiadas al puerto histórico.

Ubicado en el Condominio Puerto Pacífico, combina la tranquilidad residencial con la proximidad a Marina Arauco, playa Las Salinas y todos los servicios. Un refugio de confort y elegancia en Viña del Mar.`,
    dormitorios: 4,
    banos: 3,
    terraza: true,
    logia: true,
    orientacion: "Valparaíso",
    notaEspecial: "Dos dormitorios unidos",
    imagenes: [],
  },
  {
    slug: "17c-torre-isla-grande",
    name: "17 C Torre Isla Grande",
    torre: "Isla Grande",
    precio: 90000,
    descripcion:
      "Departamento luminoso con todas las comodidades. Ubicación privilegiada frente a la playa, orientación Reñaca. Terraza y logia para disfrutar del clima costero.",
    descripcionLarga: `El departamento 17 C de la Torre Isla Grande representa la excelencia en vida costera. Con cuatro dormitorios, tres baños, terraza y logia, ofrece un espacio generoso bañado por luz natural gracias a su orientación Reñaca.

Emplazado frente a playa Las Salinas, disfrute de piscinas, gimnasio, conserjería 24 horas y todas las amenidades del Condominio Puerto Pacífico. Ideal para familias que buscan confort, seguridad y una ubicación inmejorable en Viña del Mar.`,
    dormitorios: 4,
    banos: 3,
    terraza: true,
    logia: true,
    orientacion: "Reñaca",
    imagenes: [],
  },
  {
    slug: "16c-torre-juan-fernandez",
    name: "16 C Torre Juan Fernández",
    torre: "Juan Fernández",
    precio: 90000,
    descripcion:
      "Espacioso departamento con vista panorámica hacia Reñaca. Cerca de Marina Arauco y todos los servicios. Terraza y logia para disfrutar del entorno.",
    descripcionLarga: `Ubicado en la Torre Juan Fernández, este departamento de cuatro dormitorios y tres baños ofrece vistas panorámicas hacia Reñaca y el océano Pacífico.

Con terraza y logia, el espacio se extiende al aire libre para disfrutar del clima costero. A pasos de Marina Arauco, supermercados, restaurantes y la playa, combina la tranquilidad residencial con la conveniencia urbana en el corazón de Viña del Mar.`,
    dormitorios: 4,
    banos: 3,
    terraza: true,
    logia: true,
    orientacion: "Reñaca",
    imagenes: [],
  },
  {
    slug: "18c-torre-juan-fernandez",
    name: "18 C Torre Juan Fernández",
    torre: "Juan Fernández",
    precio: 90000,
    descripcion:
      "Departamento de lujo con las mejores vistas. Dos dormitorios unidos para mayor espacio. Ideal para una estadía inolvidable en Puerto Pacífico.",
    descripcionLarga: `El departamento 18 C de la Torre Juan Fernández ofrece una experiencia de vida premium. Con cuatro dormitorios, tres baños y la configuración exclusiva de dos dormitorios unidos, maximiza el espacio y la versatilidad.

Orientación Reñaca, terraza y logia completan un perfil residencial de primer nivel. En el Condominio Puerto Pacífico, frente a playa Las Salinas, este inmueble representa la cumbre del confort y la ubicación privilegiada.`,
    dormitorios: 4,
    banos: 3,
    terraza: true,
    logia: true,
    orientacion: "Reñaca",
    notaEspecial: "Dos dormitorios unidos",
    imagenes: [],
  },
]

export function getDepartamentoBySlug(slug: string): DepartamentoStatic | undefined {
  return DEPARTAMENTOS_STATIC.find((d) => d.slug === slug)
}
