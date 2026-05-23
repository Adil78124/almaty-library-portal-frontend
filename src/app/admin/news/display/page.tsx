import { BranchDisplaySettingsForm } from "@/components/admin/branch-display-settings-form"
import { NewsHomeSettingsForm } from "@/components/admin/news/news-home-settings-form"
import { getBranchDisplaySettings } from "@/lib/branch-display-settings"
import {
  getAdminSession,
  sessionIsSuperAdmin,
} from "@/lib/auth/require-admin"
import { prisma } from "@/lib/prisma"

export default async function AdminNewsDisplaySettingsPage() {
  const session = await getAdminSession()
  const isSuper = session ? sessionIsSuperAdmin(session) : false

  if (
    session &&
    session.kind === "user" &&
    session.user.role === "ADMIN" &&
    session.user.branchId
  ) {
    const settings = await getBranchDisplaySettings("news", session.user.branchId)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Настройка отображения новостей филиала
          </h1>
          <p className="text-muted-foreground mt-1 text-sm max-w-xl leading-relaxed">
            Управление блоком новостей на странице филиала. Эти настройки
            применяются только к текущему филиалу.
          </p>
        </div>
        <BranchDisplaySettingsForm
          kind="news"
          branchId={session.user.branchId}
          initial={settings}
        />
      </div>
    )
  }

  const site = isSuper
    ? await prisma.siteSettings.findUnique({ where: { id: "default" } })
    : null

  const homeNewsLimit = site?.homeNewsLimit ?? 4
  const homeNewsAutoRefresh = site?.homeNewsAutoRefresh ?? true
  const homeNewsPollSeconds = site?.homeNewsPollSeconds ?? null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Настройки отображения
        </h1>
        <p className="text-muted-foreground mt-1 text-sm max-w-xl leading-relaxed">
          Настройки вывода новостей на главной странице сайта. Создание и
          редактирование материалов — в «Все новости».
        </p>
      </div>

      {isSuper ? (
        <NewsHomeSettingsForm
          initial={{
            homeNewsLimit,
            homeNewsAutoRefresh,
            homeNewsPollSeconds,
          }}
        />
      ) : (
        <p className="text-muted-foreground text-sm">
          У учётной записи не задан филиал.
        </p>
      )}
    </div>
  )
}

