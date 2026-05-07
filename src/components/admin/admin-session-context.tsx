"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { Role } from "@prisma/client"

export type AdminShellSession = {
  role: Role
  branchId: string | null
  displayName: string
  isSuperAdmin: boolean
}

const AdminShellSessionContext = createContext<AdminShellSession | null>(null)

export function AdminShellSessionProvider({
  value,
  children,
}: {
  value: AdminShellSession
  children: ReactNode
}) {
  return (
    <AdminShellSessionContext.Provider value={value}>
      {children}
    </AdminShellSessionContext.Provider>
  )
}

export function useAdminShellSession(): AdminShellSession {
  const ctx = useContext(AdminShellSessionContext)
  if (!ctx) {
    throw new Error("useAdminShellSession must be used within AdminShell")
  }
  return ctx
}
