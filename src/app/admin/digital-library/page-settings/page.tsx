import { DigitalLibraryCmsEditor } from "@/components/admin/cms/digital-library-cms-editor"
import { getDigitalLibrarySectionsRaw } from "@/lib/cms/digital-library/public"

export default async function AdminDigitalLibraryPageSettingsPage() {
  const sections = await getDigitalLibrarySectionsRaw()
  return (
    <div className="space-y-6">
      <DigitalLibraryCmsEditor initialSections={sections} />
    </div>
  )
}

