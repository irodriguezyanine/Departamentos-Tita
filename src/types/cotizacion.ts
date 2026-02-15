/**
 * Cotización de arriendo - Departamentos Tita
 * Basado en formato de cotización de arriendo
 */

export interface CotizacionArriendo {
  _id?: string
  numero?: string
  nombreArrendatario: string
  emailArrendatario?: string
  telefonoArrendatario?: string
  departamento: string
  torre: string
  estacionamiento?: string
  checkIn: string
  checkOut: string
  totalNoches: number
  valorNoche: number
  subtotalNoches: number
  aseo?: number
  estacionamientoMonto?: number
  adicionalNoche31?: number
  subtotalAdicionales: number
  subtotal: number
  comisionPorcentaje: number
  comision: number
  valorTotal: number
  abonoReserva?: number
  fechaAbonoReserva?: string
  saldo: number
  fechaPagoSaldo?: string
  observaciones?: string
  createdAt?: string
  updatedAt?: string
}

export const DATOS_DEPOSITO = {
  nacional: {
    nombre: "Dalal Saleme",
    rut: "5.928.606-4",
    banco: "Banco Santander",
    cuenta: "69-02183-2",
  },
  westernUnion: {
    nombre: "Enrique Salvador Yanine Lama",
    rut: "4.098.095-4",
    domicilio: "Jorge Montt 1598 departamento 151",
    celular: "9840 22927",
  },
}
