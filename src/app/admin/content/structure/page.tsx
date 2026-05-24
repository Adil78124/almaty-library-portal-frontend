import { SimplePageCmsEditor } from "@/components/admin/cms/simple-page-cms-editor"
import { StaffAdmin } from "@/components/admin/staff-admin"
import { getSimpleSectionsRaw } from "@/lib/cms/simple-page/public"

export default async function AdminStructurePageContentPage() {
  const sections = await getSimpleSectionsRaw("structure")
  return (
    <div className="space-y-6">
      <SimplePageCmsEditor pageSlug="structure" initialSections={sections} />
      <StaffAdmin />
    </div>
  )
}

