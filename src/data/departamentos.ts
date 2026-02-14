import { Departamento } from "@/types"

export const DEPARTAMENTOS_INICIALES: Omit<Departamento, "_id" | "createdAt" | "updatedAt">[] = [
  {
    slug: "4c-torre-galapagos",
    name: "4 C Torre Galápagos",
    torre: "Galápagos",
    precio: 90000,
    descripcion: "Acogedor departamento con vista al mar. Ideal para familias o parejas que buscan confort y tranquilidad.",
    imagenes: [],
    disponible: true,
  },
  {
    slug: "13d-torre-cabo-hornos",
    name: "13 D Torre Cabo de Hornos",
    torre: "Cabo de Hornos",
    precio: 90000,
    descripcion: "Amplio departamento con excelente vista. Perfecto para disfrutar de los atardeceres de Viña del Mar.",
    imagenes: [],
    disponible: true,
  },
  {
    slug: "17c-torre-isla-grande",
    name: "17 C Torre Isla Grande",
    torre: "Isla Grande",
    precio: 90000,
    descripcion: "Departamento luminoso con todas las comodidades. Ubicación privilegiada frente a la playa.",
    imagenes: [],
    disponible: true,
  },
  {
    slug: "16c-torre-juan-fernandez",
    name: "16 C Torre Juan Fernández",
    torre: "Juan Fernández",
    precio: 90000,
    descripcion: "Espacioso departamento con vista panorámica. Cerca de Marina Arauco y todos los servicios.",
    imagenes: [],
    disponible: true,
  },
  {
    slug: "18c-torre-juan-fernandez",
    name: "18 C Torre Juan Fernández",
    torre: "Juan Fernández",
    precio: 90000,
    descripcion: "Departamento de lujo con las mejores vistas. Ideal para una estadía inolvidable en Viña del Mar.",
    imagenes: [],
    disponible: true,
  },
]
