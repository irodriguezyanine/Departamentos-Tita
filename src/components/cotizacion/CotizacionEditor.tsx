"use client"

import { useState, useEffect } from "react"
import { Save, ArrowLeft, Printer, FileDown } from "lucide-react"
import type { CotizacionArriendo } from "@/types/cotizacion"
import { DATOS_DEPOSITO } from "@/types/cotizacion"
import { descargarPDFCotizacion, imprimirPDFCotizacion } from "@/lib/cotizacion-pdf"

const TORRES = ["Galápagos", "Cabo de Hornos", "Isla Grande", "Juan Fernández"]
const DEPARTAMENTOS = ["4 C", "13 D", "17 C", "16 C", "18 C"]

interface Props {
  cotizacion: CotizacionArriendo | null
  onSave: (data: CotizacionArriendo) => Promise<void>
  onBack: () => void
  isNew?: boolean
}

export function CotizacionEditor({ cotizacion, onSave, onBack, isNew }: Props) {
  const [form, setForm] = useState<CotizacionArriendo>({
    nombreArrendatario: "",
    departamento: "",
    torre: "",
    estacionamiento: "",
    checkIn: "",
    checkOut: "",
    totalNoches: 0,
    valorNoche: 90000,
    subtotalNoches: 0,
    aseo: 40000,
    estacionamientoMonto: 0,
    adicionalNoche31: 0,
    subtotalAdicionales: 40000,
    subtotal: 0,
    comisionPorcentaje: 10,
    comision: 0,
    valorTotal: 0,
    abonoReserva: 0,
    fechaAbonoReserva: "",
    saldo: 0,
    fechaPagoSaldo: "",
    observaciones: "",
  })

  useEffect(() => {
    if (cotizacion) {
      setForm({
        nombreArrendatario: cotizacion.nombreArrendatario || "",
        departamento: cotizacion.departamento || "",
        torre: cotizacion.torre || "",
        estacionamiento: cotizacion.estacionamiento || "",
        checkIn: cotizacion.checkIn || "",
        checkOut: cotizacion.checkOut || "",
        totalNoches: cotizacion.totalNoches || 0,
        valorNoche: cotizacion.valorNoche || 90000,
        subtotalNoches: cotizacion.subtotalNoches || 0,
        aseo: cotizacion.aseo ?? 40000,
        estacionamientoMonto: cotizacion.estacionamientoMonto ?? 0,
        adicionalNoche31: cotizacion.adicionalNoche31 ?? 0,
        subtotalAdicionales: cotizacion.subtotalAdicionales ?? 0,
        subtotal: cotizacion.subtotal || 0,
        comisionPorcentaje: cotizacion.comisionPorcentaje ?? 10,
        comision: cotizacion.comision || 0,
        valorTotal: cotizacion.valorTotal || 0,
        abonoReserva: cotizacion.abonoReserva ?? 0,
        fechaAbonoReserva: cotizacion.fechaAbonoReserva || "",
        saldo: cotizacion.saldo ?? 0,
        fechaPagoSaldo: cotizacion.fechaPagoSaldo || "",
        observaciones: cotizacion.observaciones || "",
      })
    }
  }, [cotizacion])

  useEffect(() => {
    if (form.checkIn && form.checkOut) {
      const start = new Date(form.checkIn)
      const end = new Date(form.checkOut)
      const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      const noches = Math.max(0, diff)
      const subtotalNoches = noches * form.valorNoche
      const adicionales = (form.aseo ?? 0) + (form.estacionamientoMonto ?? 0) + (form.adicionalNoche31 ?? 0)
      const subtotal = subtotalNoches + adicionales
      const comision = Math.round(subtotal * (form.comisionPorcentaje / 100))
      const valorTotal = subtotal + comision
      const saldo = valorTotal - (form.abonoReserva ?? 0)

      setForm((f) => ({
        ...f,
        totalNoches: noches,
        subtotalNoches,
        subtotalAdicionales: adicionales,
        subtotal,
        comision,
        valorTotal,
        saldo: Math.max(0, saldo),
      }))
    }
  }, [
    form.checkIn,
    form.checkOut,
    form.valorNoche,
    form.aseo,
    form.estacionamientoMonto,
    form.adicionalNoche31,
    form.comisionPorcentaje,
    form.abonoReserva,
  ])

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("es-CL").format(n || 0)

  const inputClass =
    "w-full px-3 py-2 rounded-lg border-2 border-slate-200 focus:border-tita-oro focus:ring-0 focus:outline-none"

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-tita-verde mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>

      <h1 className="font-display text-2xl font-bold text-slate-800 mb-8">
        {isNew ? "Nueva cotización" : `Cotización ${cotizacion?.numero || ""}`}
      </h1>

      <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
        <div className="p-6 space-y-6">
          <section>
            <h2 className="font-semibold text-tita-verde mb-4 border-b-2 border-tita-oro pb-2">
              Datos del arriendo
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre arrendatario</label>
                <input
                  type="text"
                  value={form.nombreArrendatario}
                  onChange={(e) => setForm({ ...form, nombreArrendatario: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Departamento</label>
                <select
                  value={form.departamento}
                  onChange={(e) => setForm({ ...form, departamento: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Seleccionar</option>
                  {DEPARTAMENTOS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Torre</label>
                <select
                  value={form.torre}
                  onChange={(e) => setForm({ ...form, torre: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Seleccionar</option>
                  {TORRES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">N.º Estacionamiento</label>
                <input
                  type="text"
                  value={form.estacionamiento}
                  onChange={(e) => setForm({ ...form, estacionamiento: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Check In</label>
                <input
                  type="date"
                  value={form.checkIn}
                  onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Check Out</label>
                <input
                  type="date"
                  value={form.checkOut}
                  onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-semibold text-tita-verde mb-4 border-b-2 border-tita-oro pb-2">
              Costos
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Total noches</label>
                <input
                  type="text"
                  value={`${form.totalNoches} noches`}
                  readOnly
                  className={`${inputClass} bg-slate-50`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor x noche</label>
                <input
                  type="number"
                  value={form.valorNoche}
                  onChange={(e) => setForm({ ...form, valorNoche: parseInt(e.target.value) || 0 })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subtotal noches</label>
                <input
                  type="text"
                  value={`$${formatPrice(form.subtotalNoches)}`}
                  readOnly
                  className={`${inputClass} bg-slate-50`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Aseo</label>
                <input
                  type="number"
                  value={form.aseo}
                  onChange={(e) => setForm({ ...form, aseo: parseInt(e.target.value) || 0 })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estacionamiento</label>
                <input
                  type="number"
                  value={form.estacionamientoMonto}
                  onChange={(e) => setForm({ ...form, estacionamientoMonto: parseInt(e.target.value) || 0 })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Adicional noche 31</label>
                <input
                  type="number"
                  value={form.adicionalNoche31}
                  onChange={(e) => setForm({ ...form, adicionalNoche31: parseInt(e.target.value) || 0 })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subtotal Adicionales</label>
                <input
                  type="text"
                  value={`$${formatPrice(form.subtotalAdicionales)}`}
                  readOnly
                  className={`${inputClass} bg-slate-50`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subtotal</label>
                <input
                  type="text"
                  value={`$${formatPrice(form.subtotal)}`}
                  readOnly
                  className={`${inputClass} bg-slate-50`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Comisión (%)</label>
                <input
                  type="number"
                  value={form.comisionPorcentaje}
                  onChange={(e) => setForm({ ...form, comisionPorcentaje: parseInt(e.target.value) || 0 })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Comisión</label>
                <input
                  type="text"
                  value={`$${formatPrice(form.comision)}`}
                  readOnly
                  className={`${inputClass} bg-slate-50`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor total</label>
                <input
                  type="text"
                  value={`$${formatPrice(form.valorTotal)}`}
                  readOnly
                  className={`${inputClass} bg-tita-verde/10 font-bold text-tita-verde`}
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-semibold text-tita-verde mb-4 border-b-2 border-tita-oro pb-2">
              Pagos
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Abono reserva</label>
                <input
                  type="number"
                  value={form.abonoReserva}
                  onChange={(e) => setForm({ ...form, abonoReserva: parseInt(e.target.value) || 0 })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha abono reserva</label>
                <input
                  type="date"
                  value={form.fechaAbonoReserva}
                  onChange={(e) => setForm({ ...form, fechaAbonoReserva: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Saldo</label>
                <input
                  type="text"
                  value={`$${formatPrice(form.saldo)}`}
                  readOnly
                  className={`${inputClass} bg-slate-50 font-semibold`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha pago saldo</label>
                <input
                  type="date"
                  value={form.fechaPagoSaldo}
                  onChange={(e) => setForm({ ...form, fechaPagoSaldo: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-semibold text-tita-verde mb-4 border-b-2 border-tita-oro pb-2">
              Datos para depósito
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="font-medium text-slate-800 mb-2">Envíos nacionales</h3>
                <p className="text-sm text-slate-600">{DATOS_DEPOSITO.nacional.nombre}</p>
                <p className="text-sm text-slate-600">Rut {DATOS_DEPOSITO.nacional.rut}</p>
                <p className="text-sm text-slate-600">{DATOS_DEPOSITO.nacional.banco}</p>
                <p className="text-sm text-slate-600">Cuenta {DATOS_DEPOSITO.nacional.cuenta}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="font-medium text-slate-800 mb-2">Western Union</h3>
                <p className="text-sm text-slate-600">{DATOS_DEPOSITO.westernUnion.nombre}</p>
                <p className="text-sm text-slate-600">RUT {DATOS_DEPOSITO.westernUnion.rut}</p>
                <p className="text-sm text-slate-600">{DATOS_DEPOSITO.westernUnion.domicilio}</p>
                <p className="text-sm text-slate-600">Celular {DATOS_DEPOSITO.westernUnion.celular}</p>
              </div>
            </div>
          </section>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
            <textarea
              value={form.observaciones}
              onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
              rows={3}
              className={inputClass}
            />
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t-2 border-slate-200 flex flex-wrap gap-4">
          <button
            onClick={() => onSave(form)}
            className="flex items-center gap-2 px-6 py-3 bg-tita-verde-oscuro text-tita-beige rounded-lg border-2 border-tita-oro hover:bg-tita-verde-medio font-semibold"
          >
            <Save className="w-4 h-4" />
            Guardar
          </button>
          <button
            onClick={() => descargarPDFCotizacion(form)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
          >
            <FileDown className="w-4 h-4" />
            Descargar PDF
          </button>
          <button
            onClick={() => imprimirPDFCotizacion(form)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
          >
            <Printer className="w-4 h-4" />
            Imprimir PDF
          </button>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 print:hidden"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
