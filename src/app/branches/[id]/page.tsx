import type { Prisma } from "@prisma/client"
import { notFound } from "next/navigation"

import SiteFooter from "@/components/SiteFooter"
import { BranchDetailPageClient } from "@/components/branches/branch-detail-page-client"
import { getBranchDisplaySettings } from "@/lib/branch-display-settings"
import type { BranchRow } from "@/lib/branch-row"
import { parseBranchSocialLinksJson } from "@/lib/branch-social-links"
import { listPublishedEventsPublic } from "@/lib/events/repository"
import { listPublishedNewsPublic } from "@/lib/news/repository"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1600&q=80"

export default async function BranchDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const where: Prisma.BranchWhereInput = { id, published: true }
  const branch = (await prisma.branch.findFirst({
    where,
  })) as BranchRow | null
  if (!branch) notFound()

  const [newsSettings, eventsSettings] = await Promise.all([
    getBranchDisplaySettings("news", branch.id),
    getBranchDisplaySettings("events", branch.id),
  ])

  const [branchNews, branchEvents] = await Promise.all([
    newsSettings.enabled
      ? listPublishedNewsPublic({
          limit: newsSettings.limit,
          branchId: branch.id,
          orderByCreatedAt: false,
        })
      : Promise.resolve([]),
    eventsSettings.enabled
      ? listPublishedEventsPublic({ limit: eventsSettings.limit, branchId: branch.id })
      : Promise.resolve([]),
  ])

  const branchSocial = parseBranchSocialLinksJson(branch.socialLinksJson)

  const heroImg = branch.heroImageUrl?.trim() || FALLBACK_HERO
  const buildingImg = branch.cardImageUrl?.trim() || heroImg

  const { createdAt: _c, updatedAt: _u, ...branchView } = branch

  return (
    <>
      <BranchDetailPageClient
        branch={branchView}
        branchNews={JSON.parse(JSON.stringify(branchNews)) as typeof branchNews}
        branchEvents={JSON.parse(JSON.stringify(branchEvents)) as typeof branchEvents}
        branchSocial={branchSocial}
        heroImg={heroImg}
        buildingImg={buildingImg}
        showNews={newsSettings.enabled}
        showEvents={eventsSettings.enabled}
      />
      <SiteFooter />
    </>
  )
}
