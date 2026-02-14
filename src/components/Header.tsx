"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Menu, X, Home, Building2, LogIn, LogOut } from "lucide-react"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { clsx } from "clsx"

const NAV_ITEMS = [
  { href: "/", label: "Inicio" },
  { href: "/departamentos/4c-torre-galapagos", label: "4 C Galápagos" },
  { href: "/departamentos/13d-torre-cabo-hornos", label: "13 D Cabo de Hornos" },
  { href: "/departamentos/17c-torre-isla-grande", label: "17 C Isla Grande" },
  { href: "/departamentos/16c-torre-juan-fernandez", label: "16 C Juan Fernández" },
  { href: "/departamentos/18c-torre-juan-fernandez", label: "18 C Juan Fernández" },
]

export function Header() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link
            href="/"
            className="text-xl md:text-2xl font-display font-semibold text-tita-primary tracking-tight"
          >
            Departamentos Tita
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "text-tita-primary bg-tita-sand/50"
                    : "text-slate-600 hover:text-tita-primary hover:bg-slate-100"
                )}
              >
                {item.label}
              </Link>
            ))}
            {status === "authenticated" ? (
              <>
                <Link
                  href="/admin"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-tita-primary hover:bg-slate-100 flex items-center gap-1"
                >
                  <Building2 className="w-4 h-4" />
                  Admin
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  Salir
                </button>
              </>
            ) : (
              <Link
                href="/admin/login"
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-tita-primary hover:bg-slate-100 flex items-center gap-1"
              >
                <LogIn className="w-4 h-4" />
                Admin
              </Link>
            )}
          </nav>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {open && (
          <nav className="md:hidden py-4 border-t border-slate-200 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "block px-4 py-3 rounded-lg text-sm font-medium",
                  pathname === item.href
                    ? "text-tita-primary bg-tita-sand/50"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {item.label}
              </Link>
            ))}
            {status === "authenticated" ? (
              <>
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  <Building2 className="w-4 h-4" />
                  Admin
                </Link>
                <button
                  onClick={() => {
                    signOut({ callbackUrl: "/" })
                    setOpen(false)
                  }}
                  className="flex items-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  Salir
                </button>
              </>
            ) : (
              <Link
                href="/admin/login"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                <LogIn className="w-4 h-4" />
                Admin
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
