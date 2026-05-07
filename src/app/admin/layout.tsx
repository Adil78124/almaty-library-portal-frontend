import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { AdminShell } from "@/components/admin/admin-shell"
import {
  getAdminSession,
  sessionIsSuperAdmin,
} from "@/lib/auth/require-admin"

export const metadata: Metadata = {
  title: "Админка — библиотека",
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getAdminSession()
  if (!session) {
    redirect("/login")
  }
  const role =
    session.kind === "legacy" ? "SUPER_ADMIN" : session.user.role
  const branchId =
    session.kind === "legacy" ? null : session.user.branchId
  const displayName =
    session.kind === "legacy" ? "Главный администратор" : session.user.name
  const isSuper = sessionIsSuperAdmin(session)

  return (
    <AdminShell
      role={role}
      branchId={branchId}
      displayName={displayName}
      isSuperAdmin={isSuper}
    >
      {children}
    </AdminShell>
  )
}
