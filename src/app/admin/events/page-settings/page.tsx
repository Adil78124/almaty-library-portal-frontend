import { SimplePageCmsEditor } from "@/components/admin/cms/simple-page-cms-editor"
import { getSimpleSectionsRaw } from "@/lib/cms/simple-page/public"

export default async function AdminEventsPageSettingsPage() {
  const sections = await getSimpleSectionsRaw("events")
  return (
    <div className="space-y-6">
      <SimplePageCmsEditor pageSlug="events" initialSections={sections} />
    </div>
  )
}

