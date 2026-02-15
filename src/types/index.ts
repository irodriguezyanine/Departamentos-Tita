export interface Departamento {
  _id?: string
  slug: string
  name: string
  torre: string
  precio: number
  descripcion: string
  dormitorios: number
  banos: number
  terraza: boolean
  logia: boolean
  orientacion: string
  notaEspecial?: string
  imagenes: ImagenDepartamento[]
  layout?: LayoutElement[]
  disponible: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface ImagenDepartamento {
  url: string
  publicId?: string
  orden: number
  width?: number
  height?: number
  x?: number
  y?: number
  alt?: string
}

export interface LayoutElement {
  id: string
  type: "image" | "text"
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  content?: string
  imageUrl?: string
  publicId?: string
  fontSize?: number
  fontWeight?: string
  color?: string
}

export interface Cliente {
  _id?: string
  nombre: string
  email: string
  telefono: string
  mensaje?: string
  departamentoInteres?: string
  fecha?: string
  createdAt?: Date
}
