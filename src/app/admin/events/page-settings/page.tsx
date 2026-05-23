import { redirect } from "next/navigation"

import { SimplePageCmsEditor } from "@/components/admin/cms/simple-page-cms-editor"
import { getAdminSession, sessionIsSuperAdmin } from "@/lib/auth/require-admin"
import { getSimpleSectionsRaw } from "@/lib/cms/simple-page/public"

export default async function AdminEventsPageSettingsPage() {
  const session = await getAdminSession()
  if (!session || !sessionIsSuperAdmin(session)) {
    redirect("/admin")
  }

  const sections = await getSimpleSectionsRaw("events")
  return (
    <div className="space-y-6">
      <SimplePageCmsEditor pageSlug="events" initialSections={sections} />
    </div>
  )
}

