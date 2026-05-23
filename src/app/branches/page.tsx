import SiteFooter from "@/components/SiteFooter"
import { BranchesPagePublic } from "@/components/branches/branches-page-public"
import type { BranchRow } from "@/lib/branch-row"
import { getBranchesNetworkPublic } from "@/lib/cms/branches-network/public"
import { getSimplePagePublic } from "@/lib/cms/simple-page/public"
import { fetchBackendJson } from "@/lib/backend"

export const dynamic = "force-dynamic"

export default async function BranchesPage() {
  const [{ hero }, { network }, branchesRaw] = await Promise.all([
    getSimplePagePublic("branches"),
    getBranchesNetworkPublic(),
    fetchBackendJson<BranchRow[]>("/branches?public=1", { cache: "no-store" }),
  ])
  const branches = branchesRaw as BranchRow[]

  return (
    <div className="bg-surface font-body text-on-surface antialiased">
      <BranchesPagePublic hero={hero} branches={branches} network={network} />
      <SiteFooter />
    </div>
  )
}
