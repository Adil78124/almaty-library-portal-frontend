import { DigitalLibraryHomeSectionForm } from "@/components/admin/digital-library/digital-library-home-section-form"
import { getHomeSectionsRaw } from "@/lib/cms/home/public"

export default async function AdminDigitalLibraryHomeSectionPage() {
  const sections = await getHomeSectionsRaw()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Главная секция</h1>
        <p className="text-muted-foreground mt-1 text-sm max-w-xl leading-relaxed">
          Настройки секции «Электронная библиотека» на главной странице. Главная
          не должна быть вторым местом редактирования электронной библиотеки — всё
          управление секцией перенесено сюда.
        </p>
      </div>
      <DigitalLibraryHomeSectionForm initialSections={sections} />
    </div>
  )
}

