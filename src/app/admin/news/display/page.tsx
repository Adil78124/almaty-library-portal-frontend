import { NewsHomeSettingsForm } from "@/components/admin/news/news-home-settings-form"
import {
  getAdminSession,
  sessionIsSuperAdmin,
} from "@/lib/auth/require-admin"
import { prisma } from "@/lib/prisma"

export default async function AdminNewsDisplaySettingsPage() {
  const session = await getAdminSession()
  const isSuper = session ? sessionIsSuperAdmin(session) : false

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
          Настройки вывода новостей на сайте (включая блок на главной). Создание и
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
          Эти настройки доступны только супер-администратору.
        </p>
      )}
    </div>
  )
}

