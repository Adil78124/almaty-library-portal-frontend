import { BranchesNetworkCmsEditor } from "@/components/admin/cms/branches-network-cms-editor"
import { getBranchesNetworkSectionsRaw } from "@/lib/cms/branches-network/public"

export default async function AdminBranchesNetworkPage() {
  const sections = await getBranchesNetworkSectionsRaw()
  return (
    <div className="space-y-6">
      <BranchesNetworkCmsEditor initialSections={sections} />
    </div>
  )
}

