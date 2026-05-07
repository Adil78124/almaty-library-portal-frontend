import { HomeCmsEditor } from "@/components/admin/cms/home-cms-editor"
import { getHomeSectionsRaw } from "@/lib/cms/home/public"

export default async function AdminHomeContentPage() {
  const sections = await getHomeSectionsRaw()
  return <HomeCmsEditor initialSections={sections} />
}
