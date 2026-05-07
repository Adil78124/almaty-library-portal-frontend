import { AboutCmsEditor } from "@/components/admin/cms/about-cms-editor"
import { getAboutSectionsRaw } from "@/lib/cms/about/public"

export default async function AdminAboutContentPage() {
  const sections = await getAboutSectionsRaw()
  return <AboutCmsEditor initialSections={sections} />
}
