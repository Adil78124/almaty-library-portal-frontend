import { SimplePageCmsEditor } from "@/components/admin/cms/simple-page-cms-editor"
import { getSimpleSectionsRaw } from "@/lib/cms/simple-page/public"

export default async function AdminNewsPageSettingsPage() {
  const sections = await getSimpleSectionsRaw("news")
  return (
    <div className="space-y-6">
      <SimplePageCmsEditor pageSlug="news" initialSections={sections} />
    </div>
  )
}

