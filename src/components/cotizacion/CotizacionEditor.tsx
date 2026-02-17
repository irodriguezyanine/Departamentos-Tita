"use client"

import { useState, useEffect } from "react"
import { Save, ArrowLeft, Printer, FileDown, Share2, Pencil, Plus, Check, X, Trash2 } from "lucide-react"
import type { CotizacionArriendo } from "@/types/cotizacion"
import { DATOS_DEPOSITO } from "@/types/cotizacion"
import { descargarPDFCotizacion, imprimirPDFCotizacion, compartirPDFWhatsApp, UBICACION_SITIO } from "@/lib/cotizacion-pdf"
import type { DatosDepositoPreset } from "@/types/cotizacion"
import { formatPrecioCLP, formatPrecioConUsd } from "@/lib/precios"
import { getEstacionamientos, getTodosEstacionamientosOpciones, COSTO_ESTACIONAMIENTO_DIARIO } from "@/data/estacionamientos"
import { CODIGOS_PAIS, parseTelefonoConCodigo } from "@/data/codigos-pais"

interface EstacionamientoOpcion {
  value: string
  label: string
}
import { parsePrecioInput } from "@/lib/precios"

import { TORRES } from "@/data/departamentos"
const DEPARTAMENTOS = ["4 C", "13 D", "17 C", "16 C", "18 C"]

interface Props {
  cotizacion: CotizacionArriendo | null
  onSave: (data: CotizacionArriendo) => Promise<void>
  onBack: () => void
  isNew?: boolean
}

export function CotizacionEditor({ cotizacion, onSave, onBack, isNew }: Props) {
  const [usdPerClp, setUsdPerClp] = useState<number | null>(null)
  const [focusedPrice, setFocusedPrice] = useState<string | null>(null)
  const [opcionesEstacionamientoApi, setOpcionesEstacionamientoApi] = useState<EstacionamientoOpcion[]>([])
  const [codigoPais, setCodigoPais] = useState("+56")
  const [numeroTelefono, setNumeroTelefono] = useState("")
  const [compartiendo, setCompartiendo] = useState(false)
  const [presetsDeposito, setPresetsDeposito] = useState<DatosDepositoPreset[]>([])
  const [activeDepositoId, setActiveDepositoId] = useState<string | null>(null)
  const [editDeposito, setEditDeposito] = useState<DatosDepositoPreset | null>(null)
  const [editDepositoMode, setEditDepositoMode] = useState(false)
  const [savingDeposito, setSavingDeposito] = useState(false)
  const [form, setForm] = useState<CotizacionArriendo>({
    nombreArrendatario: "",
    apellidoArrendatario: "",
    emailArrendatario: "",
    telefonoArrendatario: "",
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
      const { codigo, numero } = parseTelefonoConCodigo(cotizacion.telefonoArrendatario || "")
      setCodigoPais(codigo)
      setNumeroTelefono(numero)
      setForm({
        nombreArrendatario: cotizacion.nombreArrendatario || "",
        apellidoArrendatario: cotizacion.apellidoArrendatario || "",
        emailArrendatario: cotizacion.emailArrendatario || "",
        telefonoArrendatario: cotizacion.telefonoArrendatario || "",
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
    } else {
      setCodigoPais("+56")
      setNumeroTelefono("")
    }
  }, [cotizacion])

  useEffect(() => {
    fetch("/api/admin/estacionamientos")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const opts = data.map((e: { nivel: string; numero: string; codigoDepartamento?: string }) => {
            const depto = e.codigoDepartamento?.trim() || "Sin asignar"
            const value = `${depto} - Nivel ${e.nivel}, ${e.numero}`
            return { value, label: value }
          })
          setOpcionesEstacionamientoApi(opts)
        }
      })
      .catch(() => {})
  }, [])

  const opcionesBase = opcionesEstacionamientoApi.length > 0 ? opcionesEstacionamientoApi : getTodosEstacionamientosOpciones()
  const opcionesEstacionamiento =
    form.estacionamiento &&
    !opcionesBase.some((o) => o.value === form.estacionamiento)
      ? [{ value: form.estacionamiento, label: form.estacionamiento }, ...opcionesBase]
      : opcionesBase

  useEffect(() => {
    if (form.checkIn && form.checkOut) {
      const start = new Date(form.checkIn)
      const end = new Date(form.checkOut)
      const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      const noches = Math.max(0, diff)
      const tieneEstacionamiento = !!form.estacionamiento?.trim()
      const estMonto =
        (form.estacionamientoMonto ?? 0) > 0
          ? (form.estacionamientoMonto ?? 0)
          : tieneEstacionamiento
            ? noches * COSTO_ESTACIONAMIENTO_DIARIO
            : 0
      const subtotalNoches = noches * form.valorNoche
      const adicionales = (form.aseo ?? 0) + estMonto + (form.adicionalNoche31 ?? 0)
      const subtotal = subtotalNoches + adicionales
      const comision = Math.round(subtotal * (form.comisionPorcentaje / 100))
      const valorTotal = subtotal + comision
      const saldo = valorTotal - (form.abonoReserva ?? 0)

      setForm((f) => ({
        ...f,
        totalNoches: noches,
        estacionamientoMonto: estMonto,
        subtotalAdicionales: adicionales,
        subtotalNoches,
        subtotal,
        comision,
        valorTotal,
        saldo: Math.max(0, saldo),
      }))
    }
  }, [
    form.checkIn,
    form.checkOut,
    form.departamento,
    form.valorNoche,
    form.aseo,
    form.estacionamientoMonto,
    form.adicionalNoche31,
    form.comisionPorcentaje,
    form.abonoReserva,
  ])

  useEffect(() => {
    fetch("/api/tipo-cambio")
      .then((res) => res.json())
      .then((data) => setUsdPerClp(data?.usdPerClp ?? null))
      .catch(() => setUsdPerClp(null))
  }, [])

  useEffect(() => {
    fetch("/api/admin/datos-deposito")
      .then((res) => res.json())
      .then((data) => {
        if (data.presets) setPresetsDeposito(data.presets)
        if (data.activeId) setActiveDepositoId(data.activeId)
      })
      .catch(() => {})
  }, [])

  const datosDepositoActivo = activeDepositoId
    ? presetsDeposito.find((p) => p._id === activeDepositoId)
    : presetsDeposito[0]
  const datosParaPDF = datosDepositoActivo
    ? {
        nacional: datosDepositoActivo.nacional,
        westernUnion: datosDepositoActivo.westernUnion,
      }
    : DATOS_DEPOSITO

  const handleSetActiveDeposito = async (id: string) => {
    try {
      const res = await fetch("/api/admin/datos-deposito/active", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeId: id }),
      })
      if (res.ok) setActiveDepositoId(id)
    } catch (e) {
      console.error(e)
    }
  }

  const handleSaveDeposito = async (asNew = false) => {
    if (!editDeposito) return
    setSavingDeposito(true)
    try {
      if (asNew) {
        const { _id, ...payload } = editDeposito
        const res = await fetch("/api/admin/datos-deposito", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, nombre: payload.nombre || "Nuevo" }),
        })
        const data = await res.json()
        if (data.preset) {
          setPresetsDeposito((prev) => [data.preset, ...prev])
          setActiveDepositoId(data.preset._id)
          setEditDepositoMode(false)
          setEditDeposito(null)
        }
      } else if (editDeposito._id) {
        const res = await fetch(`/api/admin/datos-deposito/${editDeposito._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editDeposito),
        })
        if (res.ok) {
          setPresetsDeposito((prev) =>
            prev.map((p) => (p._id === editDeposito._id ? { ...editDeposito } : p))
          )
          setEditDepositoMode(false)
          setEditDeposito(null)
        }
      }
    } catch (e) {
      console.error(e)
    }
    setSavingDeposito(false)
  }

  const startEditDeposito = (p: DatosDepositoPreset) => {
    setEditDeposito({ ...p })
    setEditDepositoMode(true)
  }

  const handleDeleteDeposito = async () => {
    if (!editDeposito?._id || editDeposito._id === activeDepositoId) return
    if (!confirm("¿Eliminar este conjunto de datos? No se puede deshacer.")) return
    setSavingDeposito(true)
    try {
      const res = await fetch(`/api/admin/datos-deposito/${editDeposito._id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setPresetsDeposito((prev) => prev.filter((p) => p._id !== editDeposito._id))
        setEditDepositoMode(false)
        setEditDeposito(null)
      } else {
        const data = await res.json()
        alert(data.error || "Error al eliminar")
      }
    } catch (e) {
      console.error(e)
    }
    setSavingDeposito(false)
  }

  const formatPrice = (n: number) => formatPrecioCLP(n)

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

      <h1 className="font-display text-2xl font-bold text-slate-800 mb-4">
        {isNew ? "Nueva cotización" : `Cotización ${cotizacion?.numero || ""}`}
      </h1>

      <div className="mb-6 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600">
        <span className="font-medium text-tita-verde">Ubicación del sitio:</span> {UBICACION_SITIO}
      </div>

      <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
        <div className="p-6 space-y-6">
          <section className="min-w-0 overflow-x-auto">
            <h2 className="font-semibold text-tita-verde mb-4 border-b-2 border-tita-oro pb-2">
              Datos del arriendo
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 min-w-0">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre arrendatario</label>
                <input
                  type="text"
                  value={form.nombreArrendatario}
                  onChange={(e) => setForm({ ...form, nombreArrendatario: e.target.value })}
                  className={inputClass}
                  placeholder="Nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Apellido arrendatario</label>
                <input
                  type="text"
                  value={form.apellidoArrendatario || ""}
                  onChange={(e) => setForm({ ...form, apellidoArrendatario: e.target.value })}
                  className={inputClass}
                  placeholder="Apellido"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email arrendatario</label>
                <input
                  type="email"
                  value={form.emailArrendatario || ""}
                  onChange={(e) => setForm({ ...form, emailArrendatario: e.target.value })}
                  className={inputClass}
                  placeholder="cliente@ejemplo.com"
                />
              </div>
              <div className="sm:col-span-2 w-full min-w-0">
                <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono arrendatario</label>
                <div className="flex gap-1.5 w-full min-w-0">
                  <select
                    value={codigoPais}
                    onChange={(e) => {
                      setCodigoPais(e.target.value)
                      setForm({ ...form, telefonoArrendatario: e.target.value + numeroTelefono.replace(/\D/g, "") })
                    }}
                    className={`${inputClass} !w-[5.5rem] shrink-0 text-sm`}
                    title={CODIGOS_PAIS.find((p) => p.codigo === codigoPais)?.pais}
                  >
                    {CODIGOS_PAIS.map((p) => (
                      <option key={`${p.codigo}-${p.pais}`} value={p.codigo}>
                        {p.codigo} {p.pais}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={numeroTelefono}
                    onChange={(e) => {
                      const num = e.target.value.replace(/\D/g, "")
                      setNumeroTelefono(e.target.value)
                      setForm({ ...form, telefonoArrendatario: codigoPais + num })
                    }}
                    className={`${inputClass} flex-1 min-w-[8rem]`}
                    placeholder="9 1234 5678"
                  />
                </div>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  N.º Estacionamiento
                  <span className="block text-xs font-normal text-slate-500 mt-0.5">
                    Todos los departamentos (a veces se arriendan estacionamientos de otros)
                  </span>
                </label>
                <select
                  value={form.estacionamiento}
                  onChange={(e) => setForm({ ...form, estacionamiento: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Seleccionar</option>
                  {opcionesEstacionamiento.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
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
                  type="text"
                  inputMode="numeric"
                  value={focusedPrice === "valorNoche" ? String(form.valorNoche) : `$${formatPrice(form.valorNoche)}`}
                  onFocus={() => setFocusedPrice("valorNoche")}
                  onBlur={() => setFocusedPrice(null)}
                  onChange={(e) => setForm({ ...form, valorNoche: parsePrecioInput(e.target.value) })}
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
                  type="text"
                  inputMode="numeric"
                  value={focusedPrice === "aseo" ? String(form.aseo ?? 0) : `$${formatPrice(form.aseo ?? 0)}`}
                  onFocus={() => setFocusedPrice("aseo")}
                  onBlur={() => setFocusedPrice(null)}
                  onChange={(e) => setForm({ ...form, aseo: parsePrecioInput(e.target.value) })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Estacionamiento
                  {form.estacionamiento && (
                    <span className="block text-xs font-normal text-slate-500 mt-0.5">
                      ${formatPrecioCLP(COSTO_ESTACIONAMIENTO_DIARIO)}/día por defecto
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={focusedPrice === "estacionamientoMonto" ? String(form.estacionamientoMonto ?? 0) : `$${formatPrice(form.estacionamientoMonto ?? 0)}`}
                  onFocus={() => setFocusedPrice("estacionamientoMonto")}
                  onBlur={() => setFocusedPrice(null)}
                  onChange={(e) => setForm({ ...form, estacionamientoMonto: parsePrecioInput(e.target.value) })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Adicional noche 31</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={focusedPrice === "adicionalNoche31" ? String(form.adicionalNoche31 ?? 0) : `$${formatPrice(form.adicionalNoche31 ?? 0)}`}
                  onFocus={() => setFocusedPrice("adicionalNoche31")}
                  onBlur={() => setFocusedPrice(null)}
                  onChange={(e) => setForm({ ...form, adicionalNoche31: parsePrecioInput(e.target.value) })}
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Administración (%)</label>
                <input
                  type="number"
                  value={form.comisionPorcentaje}
                  onChange={(e) => setForm({ ...form, comisionPorcentaje: parseInt(e.target.value) || 0 })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Administración</label>
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
                  value={formatPrecioConUsd(form.valorTotal, usdPerClp)}
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
                  type="text"
                  inputMode="numeric"
                  value={focusedPrice === "abonoReserva" ? String(form.abonoReserva ?? 0) : `$${formatPrice(form.abonoReserva ?? 0)}`}
                  onFocus={() => setFocusedPrice("abonoReserva")}
                  onBlur={() => setFocusedPrice(null)}
                  onChange={(e) => setForm({ ...form, abonoReserva: parsePrecioInput(e.target.value) })}
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
                  value={formatPrecioConUsd(form.saldo, usdPerClp)}
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
            <p className="text-sm text-slate-600 mb-3">
              Como las firmas de Outlook: guarda varios conjuntos y selecciona cuál usar en las cotizaciones.
            </p>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <select
                value={activeDepositoId || ""}
                onChange={(e) => {
                  const id = e.target.value
                  if (id) handleSetActiveDeposito(id)
                }}
                className={`${inputClass} max-w-xs`}
              >
                {presetsDeposito.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() =>
                  startEditDeposito(
                    datosDepositoActivo || {
                      _id: "",
                      nombre: "Nuevo",
                      nacional: DATOS_DEPOSITO.nacional,
                      westernUnion: DATOS_DEPOSITO.westernUnion,
                    }
                  )
                }
                className="flex items-center gap-2 px-3 py-2 bg-tita-verde text-white rounded-lg hover:bg-tita-verde-medio text-sm"
              >
                <Pencil className="w-4 h-4" />
                Editar
              </button>
              <button
                type="button"
                onClick={() =>
                  startEditDeposito({
                    _id: "",
                    nombre: "Nuevo",
                    nacional: (datosDepositoActivo?.nacional ?? DATOS_DEPOSITO.nacional) as { nombre: string; rut: string; banco: string; cuenta: string },
                    westernUnion: (datosDepositoActivo?.westernUnion ?? DATOS_DEPOSITO.westernUnion) as { nombre: string; rut: string; domicilio: string; celular: string },
                  })
                }
                className="flex items-center gap-2 px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 text-sm"
              >
                <Plus className="w-4 h-4" />
                Guardar como nuevo
              </button>
            </div>

            {editDepositoMode && editDeposito ? (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-slate-800">Editar datos</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editDeposito.nombre}
                      onChange={(e) =>
                        setEditDeposito({ ...editDeposito, nombre: e.target.value })
                      }
                      placeholder="Nombre del preset"
                      className={`${inputClass} max-w-[200px]`}
                    />
                    <button
                      onClick={() => handleSaveDeposito(false)}
                      disabled={savingDeposito || !editDeposito._id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-tita-verde text-white rounded-lg text-sm disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      Guardar
                    </button>
                    {!editDeposito._id && (
                      <button
                        onClick={() => handleSaveDeposito(true)}
                        disabled={savingDeposito}
                        className="flex items-center gap-1 px-3 py-1.5 bg-tita-oro text-slate-800 rounded-lg text-sm font-medium"
                      >
                        Crear nuevo
                      </button>
                    )}
                    {editDeposito._id && editDeposito._id !== activeDepositoId && (
                      <button
                        onClick={handleDeleteDeposito}
                        disabled={savingDeposito}
                        className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                        title="Eliminar (solo si no está en uso)"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditDepositoMode(false)
                        setEditDeposito(null)
                      }}
                      className="p-1.5 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-medium text-slate-700">Envíos nacionales</h4>
                    <input
                      type="text"
                      value={editDeposito.nacional.nombre}
                      onChange={(e) =>
                        setEditDeposito({
                          ...editDeposito,
                          nacional: { ...editDeposito.nacional, nombre: e.target.value },
                        })
                      }
                      placeholder="Nombre"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={editDeposito.nacional.rut}
                      onChange={(e) =>
                        setEditDeposito({
                          ...editDeposito,
                          nacional: { ...editDeposito.nacional, rut: e.target.value },
                        })
                      }
                      placeholder="RUT"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={editDeposito.nacional.banco}
                      onChange={(e) =>
                        setEditDeposito({
                          ...editDeposito,
                          nacional: { ...editDeposito.nacional, banco: e.target.value },
                        })
                      }
                      placeholder="Banco"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={editDeposito.nacional.cuenta}
                      onChange={(e) =>
                        setEditDeposito({
                          ...editDeposito,
                          nacional: { ...editDeposito.nacional, cuenta: e.target.value },
                        })
                      }
                      placeholder="Número de cuenta"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-slate-700">Western Union</h4>
                    <input
                      type="text"
                      value={editDeposito.westernUnion.nombre}
                      onChange={(e) =>
                        setEditDeposito({
                          ...editDeposito,
                          westernUnion: { ...editDeposito.westernUnion, nombre: e.target.value },
                        })
                      }
                      placeholder="Nombre"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={editDeposito.westernUnion.rut}
                      onChange={(e) =>
                        setEditDeposito({
                          ...editDeposito,
                          westernUnion: { ...editDeposito.westernUnion, rut: e.target.value },
                        })
                      }
                      placeholder="RUT"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={editDeposito.westernUnion.domicilio}
                      onChange={(e) =>
                        setEditDeposito({
                          ...editDeposito,
                          westernUnion: { ...editDeposito.westernUnion, domicilio: e.target.value },
                        })
                      }
                      placeholder="Dirección"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={editDeposito.westernUnion.celular}
                      onChange={(e) =>
                        setEditDeposito({
                          ...editDeposito,
                          westernUnion: { ...editDeposito.westernUnion, celular: e.target.value },
                        })
                      }
                      placeholder="Celular"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="font-medium text-slate-800 mb-2">Envíos nacionales</h3>
                  <p className="text-sm text-slate-600">{datosParaPDF.nacional.nombre}</p>
                  <p className="text-sm text-slate-600">Rut {datosParaPDF.nacional.rut}</p>
                  <p className="text-sm text-slate-600">{datosParaPDF.nacional.banco}</p>
                  <p className="text-sm text-slate-600">Cuenta {datosParaPDF.nacional.cuenta}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="font-medium text-slate-800 mb-2">Western Union</h3>
                  <p className="text-sm text-slate-600">{datosParaPDF.westernUnion.nombre}</p>
                  <p className="text-sm text-slate-600">RUT {datosParaPDF.westernUnion.rut}</p>
                  <p className="text-sm text-slate-600">{datosParaPDF.westernUnion.domicilio}</p>
                  <p className="text-sm text-slate-600">Celular {datosParaPDF.westernUnion.celular}</p>
                </div>
              </div>
            )}
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
            onClick={async () => {
              setCompartiendo(true)
              try {
                await compartirPDFWhatsApp(form, datosParaPDF)
              } finally {
                setCompartiendo(false)
              }
            }}
            disabled={compartiendo}
            className="flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-lg hover:bg-[#20bd5a] font-medium border-2 border-[#128C7E] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Share2 className="w-4 h-4" />
            {compartiendo ? "Compartiendo..." : "Compartir por WhatsApp"}
          </button>
          <button
            onClick={() => descargarPDFCotizacion(form, datosParaPDF)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
          >
            <FileDown className="w-4 h-4" />
            Descargar PDF
          </button>
          <button
            onClick={() => imprimirPDFCotizacion(form, datosParaPDF)}
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
