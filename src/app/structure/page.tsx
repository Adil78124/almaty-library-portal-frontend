import Link from "next/link"

import SiteFooter from "@/components/SiteFooter"
import { BranchesNetworkBlock } from "@/components/structure/branches-network-block"
import { StaffGrid, type StaffApiItem } from "@/components/structure/staff-grid"
import { getBranchesNetworkPublic } from "@/lib/cms/branches-network/public"
import { getSimplePagePublic } from "@/lib/cms/simple-page/public"

async function getStaffPublic(): Promise<StaffApiItem[]> {
  const backend = process.env.BACKEND_URL || "http://127.0.0.1:4000"
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
    <div className="antialiased">
      <main className="pt-20">
        <section className="relative flex h-[450px] items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              alt={hero.backgroundImageAlt}
              className="h-full w-full object-cover"
              src={hero.backgroundImageUrl}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#00236f]/90 to-[#1e3a8a]/40" />
          </div>
          <div className="relative z-10 mx-auto w-full max-w-7xl px-8">
            <nav className="mb-6 flex text-sm font-label tracking-wide uppercase text-white/70">
              <Link className="hover:text-white" href="/">
                Главная
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white">{hero.breadcrumbLabel}</span>
            </nav>
            <h1 className="mb-4 max-w-2xl text-5xl font-bold leading-[1.1] text-white tracking-tight md:text-6xl">
              {hero.title}
            </h1>
            <p className="max-w-xl text-xl font-light text-white/80">
              {hero.lead}
            </p>
          </div>
        </section>

        <section className="bg-surface px-8 py-20">
          <div className="mx-auto max-w-7xl space-y-12">
            <BranchesNetworkBlock network={network} />
            <StaffGrid staff={staff} />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

