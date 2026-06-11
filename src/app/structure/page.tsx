import SiteFooter from "@/components/SiteFooter"
import { BranchesNetworkBlock } from "@/components/structure/branches-network-block"
import { StaffGrid, type StaffSectionApiItem } from "@/components/structure/staff-grid"
import { StructureHero } from "@/components/structure/structure-hero"
import { getBackendBaseUrl } from "@/lib/backend"
import { getBranchesNetworkPublic } from "@/lib/cms/branches-network/public"
import { getSimplePagePublic } from "@/lib/cms/simple-page/public"

export const dynamic = "force-dynamic"

async function getStaffPublic(): Promise<StaffSectionApiItem[]> {
  const backend = getBackendBaseUrl()
  const res = await fetch(`${backend}/staff/sections?activeOnly=1`, {
    cache: "no-store",
  })
  if (!res.ok) return []
  return (await res.json()) as StaffSectionApiItem[]
}

export default async function StructurePage() {
  const [{ hero }, { network }, staff] = await Promise.all([
    getSimplePagePublic("structure"),
    getBranchesNetworkPublic(),
    getStaffPublic(),
  ])

  return (
    <div className="antialiased overflow-x-hidden">
      <main className="pt-20 min-w-0">
        <StructureHero hero={hero} />

        <section className="bg-surface px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="mx-auto max-w-7xl space-y-10 sm:space-y-12 min-w-0">
            <BranchesNetworkBlock network={network} />
            <StaffGrid sections={staff} />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
