"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Menu, X, Building2, LogIn, LogOut } from "lucide-react"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { clsx } from "clsx"

const NAV_ITEMS = [
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-tita-verde-oscuro backdrop-blur-md border-b-2 border-tita-oro shadow-oro-glow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link
            href="/"
            className="text-xl md:text-2xl font-display font-semibold text-tita-beige tracking-tight hover:text-tita-oro-claro transition-colors"
            title="Volver al inicio"
          >
            Condominio Puerto Pacífico
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all border-2",
                  pathname === item.href
                    ? "text-tita-beige bg-tita-verde-medio border-tita-oro shadow-oro-glow"
                    : "text-tita-beige border-transparent hover:border-tita-oro/70 hover:text-tita-oro-claro"
                )}
              >
                {item.label}
              </Link>
            ))}
            {status === "authenticated" ? (
              <>
                <Link
                  href="/admin"
                  className="px-4 py-2 rounded-full text-sm font-medium text-tita-beige border-2 border-transparent hover:border-tita-oro/70 hover:text-tita-oro-claro flex items-center gap-1 transition-all"
                >
                  <Building2 className="w-4 h-4" />
                  Admin
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-4 py-2 rounded-full text-sm font-medium text-tita-beige/80 hover:text-red-300 border-2 border-transparent hover:border-red-400/50 flex items-center gap-1 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Salir
                </button>
              </>
            ) : (
              <Link
                href="/admin/login"
                className="px-4 py-2 rounded-full text-sm font-medium text-tita-beige border-2 border-transparent hover:border-tita-oro/70 hover:text-tita-oro-claro flex items-center gap-1 transition-all"
              >
                <LogIn className="w-4 h-4" />
                Admin
              </Link>
            )}
          </nav>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-full text-tita-beige hover:bg-tita-verde-medio border-2 border-tita-oro/50"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {open && (
          <nav className="md:hidden py-4 border-t border-tita-oro/40 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "block px-4 py-3 rounded-full text-sm font-medium border-2 mx-2",
                  pathname === item.href
                    ? "text-tita-beige bg-tita-verde-medio border-tita-oro"
                    : "text-tita-beige border-transparent hover:border-tita-oro/70"
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
                  className="flex items-center gap-2 px-4 py-3 rounded-full text-sm font-medium text-tita-beige border-2 border-transparent mx-2 hover:border-tita-oro/70"
                >
                  <Building2 className="w-4 h-4" />
                  Admin
                </Link>
                <button
                  onClick={() => {
                    signOut({ callbackUrl: "/" })
                    setOpen(false)
                  }}
                  className="flex items-center gap-2 w-full px-4 py-3 rounded-full text-sm font-medium text-tita-beige/80 hover:text-red-300 mx-2"
                >
                  <LogOut className="w-4 h-4" />
                  Salir
                </button>
              </>
            ) : (
              <Link
                href="/admin/login"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-full text-sm font-medium text-tita-beige mx-2"
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
