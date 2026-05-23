import { redirect } from "next/navigation"

import { EventsHomeSectionForm } from "@/components/admin/events/events-home-section-form"
import { getAdminSession, sessionIsSuperAdmin } from "@/lib/auth/require-admin"
import { getHomeSectionsRaw } from "@/lib/cms/home/public"

export default async function AdminEventsHomeSectionPage() {
  const session = await getAdminSession()
  if (!session || !sessionIsSuperAdmin(session)) {
    redirect("/admin")
  }

  const sections = await getHomeSectionsRaw()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Главная секция</h1>
        <p className="text-muted-foreground mt-1 text-sm max-w-xl leading-relaxed">
          Здесь настраиваются только заголовки секции «Афиша» на главной странице.
          Сами мероприятия редактируются в «Все мероприятия».
        </p>
      </div>
      <EventsHomeSectionForm initialSections={sections} />
    </div>
  )
}

