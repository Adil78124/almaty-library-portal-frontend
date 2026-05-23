import { BranchDisplaySettingsForm } from "@/components/admin/branch-display-settings-form"
import { EventsHomeSettingsForm } from "@/components/admin/events/events-home-settings-form"
import { getBranchDisplaySettings } from "@/lib/branch-display-settings"
import {
  getAdminSession,
  sessionIsSuperAdmin,
} from "@/lib/auth/require-admin"
import { prisma } from "@/lib/prisma"

export default async function AdminEventsDisplaySettingsPage() {
  const session = await getAdminSession()
  const isSuper = session ? sessionIsSuperAdmin(session) : false
  if (
    session &&
    session.kind === "user" &&
    session.user.role === "ADMIN" &&
    session.user.branchId
  ) {
    const settings = await getBranchDisplaySettings("events", session.user.branchId)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Настройка отображения мероприятий филиала
          </h1>
          <p className="text-muted-foreground mt-1 text-sm max-w-xl leading-relaxed">
            Управление блоком мероприятий на странице филиала. Эти настройки
            применяются только к текущему филиалу.
          </p>
        </div>
        <BranchDisplaySettingsForm
          kind="events"
          branchId={session.user.branchId}
          initial={settings}
        />
      </div>
    )
  }

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
          Настройки вывода блока «Афиша» на главной странице сайта.
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

