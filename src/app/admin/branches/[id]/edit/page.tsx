import { notFound, redirect } from "next/navigation"

import { BranchAdminForm } from "@/components/admin/branches/branch-admin-form"
import {
  getAdminSession,
  sessionIsSuperAdmin,
} from "@/lib/auth/require-admin"
import type { BranchRow } from "@/lib/branch-row"
import { prisma } from "@/lib/prisma"

type Props = { params: Promise<{ id: string }> }

export default async function AdminBranchEditPage({ params }: Props) {
  const session = await getAdminSession()
  if (!session || !sessionIsSuperAdmin(session)) {
    redirect("/admin")
  }

  const { id } = await params
  const branch = (await prisma.branch.findUnique({
    where: { id },
  })) as BranchRow | null
  if (!branch) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Редактирование филиала
        </h1>
        <p className="text-muted-foreground mt-1 text-sm truncate">
          {branch.titleRu}
        </p>
      </div>
      <BranchAdminForm mode="edit" branch={branch} />
    </div>
  )
}
