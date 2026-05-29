import { DigitalLibraryDisplayForm } from "@/components/admin/digital-library/digital-library-display-form"
import { prisma } from "@/lib/prisma"

export default async function AdminDigitalLibraryDisplaySettingsPage() {
  const row = await prisma.pageContent.findUnique({
    where: { page: "digital-library:display" },
  })
  const raw = (row?.sections ?? {}) as any
  const initial = {
    homeLimit: typeof raw.homeLimit === "number" ? raw.homeLimit : 12,
    homeAutoRefresh:
      typeof raw.homeAutoRefresh === "boolean" ? raw.homeAutoRefresh : false,
    homePollSeconds:
      raw.homePollSeconds === null || typeof raw.homePollSeconds === "number"
        ? raw.homePollSeconds
        : 60,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Настройки отображения</h1>
        <p className="text-muted-foreground mt-1 text-sm max-w-xl leading-relaxed">
          Настройки вывода электронной библиотеки на сайте (включая блок на главной).
          Создание и редактирование ресурсов — в разделе «Электронная библиотека».
        </p>
      </div>

      <DigitalLibraryDisplayForm
        initial={initial}
      />
    </div>
  )
}

