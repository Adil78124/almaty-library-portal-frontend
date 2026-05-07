import { SimplePageCmsEditor } from "@/components/admin/cms/simple-page-cms-editor"
import { getSimpleSectionsRaw } from "@/lib/cms/simple-page/public"

export default async function AdminBranchesPageSettingsPage() {
  const sections = await getSimpleSectionsRaw("branches")
  return (
    <div className="space-y-6">
      <SimplePageCmsEditor pageSlug="branches" initialSections={sections} />
    </div>
  )
}

