import { NewArrivalsDisplaySettingsForm } from "@/components/admin/new-arrivals-display-settings-form"
import { getHomeSectionsRaw } from "@/lib/cms/home/public"

export default async function AdminNewArrivalsDisplaySettingsPage() {
  const sections = await getHomeSectionsRaw()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Настройки отображения
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
          Настройки вывода блока “Новые поступления” на сайте. Создание и
          редактирование книг выполняется в разделе “Новые поступления”.
        </p>
      </div>

      <NewArrivalsDisplaySettingsForm initialSections={sections} />
    </div>
  )
}
