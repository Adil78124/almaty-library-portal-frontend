"use client"

import type { ReactNode } from "react"
import type { Role } from "@prisma/client"

import { AdminAppSidebar } from "@/components/admin/app-sidebar"
import {
  AdminShellSessionProvider,
  type AdminShellSession,
} from "@/components/admin/admin-session-context"
import { AdminTopBar } from "@/components/admin/admin-top-bar"
import { AdminToastProvider } from "@/components/admin/admin-toast"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export function AdminShell({
  children,
  role,
  branchId,
  displayName,
  isSuperAdmin,
}: {
  children: ReactNode
  role: Role
  branchId: string | null
  displayName: string
  isSuperAdmin: boolean
}) {
  const session: AdminShellSession = {
    role,
    branchId,
    displayName,
    isSuperAdmin,
  }

  return (
    <TooltipProvider delay={0}>
      <AdminShellSessionProvider value={session}>
        <AdminToastProvider>
          <SidebarProvider defaultOpen>
            <AdminAppSidebar />
            <SidebarInset>
              <AdminTopBar />
              <div className="flex flex-1 flex-col gap-6 overflow-auto p-4 md:p-6">
                {children}
              </div>
            </SidebarInset>
          </SidebarProvider>
        </AdminToastProvider>
      </AdminShellSessionProvider>
    </TooltipProvider>
  )
}
