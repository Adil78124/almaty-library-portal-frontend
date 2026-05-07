import { notFound } from "next/navigation"

import { EventsHomeSettingsForm } from "@/components/admin/events/events-home-settings-form"
import {
  getAdminSession,
  sessionIsSuperAdmin,
} from "@/lib/auth/require-admin"
import { prisma } from "@/lib/prisma"

export default async function AdminEventsDisplaySettingsPage() {
  const session = await getAdminSession()
  const isSuper = session ? sessionIsSuperAdmin(session) : false
  if (!isSuper) notFound()

  const site = await prisma.siteSettings.findUnique({ where: { id: "default" } })
  const homeEventsLimit = site?.homeEventsLimit ?? 4
  const homeEventsAutoRefresh = site?.homeEventsAutoRefresh ?? true
  const homeEventsPollSeconds = site?.homeEventsPollSeconds ?? null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Настройки отображения
        </h1>
        <p className="text-muted-foreground mt-1 text-sm max-w-xl leading-relaxed">
          Настройки вывода мероприятий на сайте (включая блок «Афиша» на главной).
          Создание и редактирование материалов — в «Все мероприятия».
        </p>
      </div>

      <EventsHomeSettingsForm
        initial={{
          homeEventsLimit,
          homeEventsAutoRefresh,
          homeEventsPollSeconds,
        }}
      />
    </div>
  )
}

