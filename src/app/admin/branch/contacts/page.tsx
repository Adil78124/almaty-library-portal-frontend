import { redirect } from "next/navigation"

import { BranchContactsForm } from "@/components/admin/branches/branch-contacts-form"
import {
  getAdminSession,
  sessionIsSuperAdmin,
} from "@/lib/auth/require-admin"

export default async function AdminBranchContactsPage() {
  const session = await getAdminSession()
  if (!session) redirect("/login")
  if (sessionIsSuperAdmin(session)) {
    redirect("/admin/branches")
  }
  if (session.kind !== "user" || session.user.role !== "ADMIN") {
    redirect("/admin")
  }
  if (!session.user.branchId) {
    redirect("/admin")
  }

  return <BranchContactsForm branchId={session.user.branchId} />
}
