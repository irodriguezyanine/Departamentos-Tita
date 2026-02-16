import Link from "next/link"
import { Building2, Users, FileText } from "lucide-react"
import { getDb } from "@/lib/db"
import { DepartamentosEditorMenu } from "@/components/admin/DepartamentosEditorMenu"
import { NuestraHistoriaEditor } from "@/components/admin/NuestraHistoriaEditor"

export default async function AdminDashboardPage() {
  let departamentosCount = 0
  let clientesCount = 0
  let cotizacionesCount = 0
  try {
    const db = await getDb()
    ;[departamentosCount, clientesCount, cotizacionesCount] = await Promise.all([
      db.collection("departamentos").countDocuments(),
      db.collection("clientes").countDocuments(),
      db.collection("cotizaciones").countDocuments(),
    ])
  } catch {
    // DB might not be ready
  }

  const cards = [
    {
      title: "Departamentos",
      value: departamentosCount,
      href: "/admin/departamentos",
      icon: Building2,
      color: "tita-primary",
    },
    {
      title: "Cotizaciones",
      value: cotizacionesCount,
      href: "/admin/cotizaciones",
      icon: FileText,
      color: "tita-verde",
    },
    {
      title: "Clientes / Consultas",
      value: clientesCount,
      href: "/admin/clientes",
      icon: Users,
      color: "tita-ocean",
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-2xl font-bold text-slate-800 mb-8">
        Panel de administración
      </h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-tita-primary/20 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">{card.title}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{card.value}</p>
              </div>
              <div className="p-3 rounded-lg bg-tita-primary/10">
                <card.icon className="w-6 h-6 text-tita-primary" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <DepartamentosEditorMenu />

      <NuestraHistoriaEditor />

      <div className="mt-12 p-6 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-sm text-amber-800">
          <strong>Si no puedes iniciar sesión:</strong> Visita <code className="bg-amber-100 px-1 rounded">/api/ensure-admin</code> para crear o restablecer el usuario administrador.
        </p>
      </div>
    </div>
  )
}
