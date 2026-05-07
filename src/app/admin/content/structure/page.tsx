import { SimplePageCmsEditor } from "@/components/admin/cms/simple-page-cms-editor"
import { getSimpleSectionsRaw } from "@/lib/cms/simple-page/public"

export default async function AdminStructurePageContentPage() {
  const sections = await getSimpleSectionsRaw("structure")
  return <SimplePageCmsEditor pageSlug="structure" initialSections={sections} />
}

