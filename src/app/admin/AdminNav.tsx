"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  LogOut,
  Home,
  Menu,
  X,
  ParkingCircle,
} from "lucide-react"
import { useState } from "react"
import { clsx } from "clsx"

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/departamentos", label: "Departamentos", icon: Building2 },
  { href: "/admin/estacionamientos", label: "Estacionamientos", icon: ParkingCircle },
  { href: "/admin/cotizaciones", label: "Cotizaciones", icon: FileText },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
]

export function AdminNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link href="/" className="font-display font-semibold text-tita-primary hover:text-tita-verde transition-colors" title="Volver al inicio">
              Arriendos Puerto Pacífico
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                    ? "text-tita-primary bg-tita-sand/50"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              title="Ver sitio"
            >
              <Home className="w-4 h-4" />
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden py-4 border-t border-slate-200 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium",
                  pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                    ? "text-tita-primary bg-tita-sand/50"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
