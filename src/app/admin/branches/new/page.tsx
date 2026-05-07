import { redirect } from "next/navigation"

import { BranchAdminForm } from "@/components/admin/branches/branch-admin-form"
import {
  getAdminSession,
  sessionIsSuperAdmin,
} from "@/lib/auth/require-admin"

export default async function AdminBranchNewPage() {
  const session = await getAdminSession()
  if (!session || !sessionIsSuperAdmin(session)) {
    redirect("/admin")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Новый филиал</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          После сохранения страница будет доступна по адресу{" "}
          <code className="text-xs bg-muted px-1 rounded">/branches/…</code> с
          уникальным id.
        </p>
      </div>
      <BranchAdminForm mode="create" />
    </div>
  )
}
