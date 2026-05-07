import { NewsHomeSectionForm } from "@/components/admin/news/news-home-section-form"
import { getHomeSectionsRaw } from "@/lib/cms/home/public"

export default async function AdminNewsHomeSectionPage() {
  const sections = await getHomeSectionsRaw()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Главная секция</h1>
        <p className="text-muted-foreground mt-1 text-sm max-w-xl leading-relaxed">
          Здесь настраивается только блок «Последние новости» на главной странице
          (заголовки секции). Сами новости редактируются в «Все новости».
        </p>
      </div>
      <NewsHomeSectionForm initialSections={sections} />
    </div>
  )
}

