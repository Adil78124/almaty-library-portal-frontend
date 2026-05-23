import Link from "next/link"

import SiteFooter from "@/components/SiteFooter"
import { BranchesNetworkBlock } from "@/components/structure/branches-network-block"
import { StaffGrid, type StaffApiItem } from "@/components/structure/staff-grid"
import { getBackendBaseUrl } from "@/lib/backend"
import { getBranchesNetworkPublic } from "@/lib/cms/branches-network/public"
import { getSimplePagePublic } from "@/lib/cms/simple-page/public"

export const dynamic = "force-dynamic"

async function getStaffPublic(): Promise<StaffApiItem[]> {
  const backend = getBackendBaseUrl()
  const res = await fetch(`${backend}/staff?activeOnly=1`, {
    cache: "no-store",
  })
  if (!res.ok) return []
  return (await res.json()) as StaffApiItem[]
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
        <section className="relative flex min-h-[300px] sm:min-h-[380px] md:h-[450px] items-center overflow-hidden py-12 md:py-0">
          <div className="absolute inset-0 z-0">
            <img
              alt={hero.backgroundImageAlt}
              className="h-full w-full object-cover"
              src={hero.backgroundImageUrl}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#00236f]/90 to-[#1e3a8a]/40" />
          </div>
          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 min-w-0">
            <nav className="mb-4 sm:mb-6 flex flex-wrap gap-x-2 gap-y-1 text-sm font-label tracking-wide uppercase text-white/70">
              <Link className="hover:text-white" href="/">
                Главная
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white">{hero.breadcrumbLabel}</span>
            </nav>
            <h1 className="mb-3 sm:mb-4 max-w-2xl text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] text-white tracking-tight break-words">
              {hero.title}
            </h1>
            <p className="max-w-xl text-base sm:text-lg md:text-xl font-light text-white/80 break-words">
              {hero.lead}
            </p>
          </div>
        </section>

        <section className="bg-surface px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="mx-auto max-w-7xl space-y-10 sm:space-y-12 min-w-0">
            <BranchesNetworkBlock network={network} />
            <StaffGrid staff={staff} />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
