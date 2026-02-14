"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/admin"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await signIn("credentials", {
      username: username.trim(),
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError("Usuario o contraseña incorrectos")
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tita-primary/5 via-white to-tita-ocean/5 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-tita-primary">
              Admin Departamentos Tita
            </h1>
            <p className="text-slate-600 mt-2 text-sm">
              Inicia sesión para gestionar los departamentos
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-tita-primary focus:border-tita-primary"
                placeholder=""
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-tita-primary focus:border-tita-primary"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-tita-primary text-white font-semibold rounded-lg hover:bg-tita-primary-light transition-colors disabled:opacity-50"
            >
              {loading ? "Espera..." : "Iniciar sesión"}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-center">
            <Link
              href="/"
              className="block text-sm text-slate-500 hover:text-tita-primary"
            >
              ← Volver al inicio
            </Link>
            <p className="text-xs text-slate-400">
              ¿No puedes entrar?{" "}
              <a
                href="/api/ensure-admin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-tita-primary hover:underline"
              >
                Crear/restablecer usuario admin
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tita-primary/5 via-white to-tita-ocean/5">
        <p className="text-slate-500">Cargando...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
