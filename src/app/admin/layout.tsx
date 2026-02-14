import { AdminNav } from "./AdminNav"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      <div className="pt-16">{children}</div>
    </div>
  )
}
