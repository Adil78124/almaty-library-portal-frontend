import { notFound } from "next/navigation"

import SiteFooter from "@/components/SiteFooter"
import { LocalHistoryArticlePublic } from "@/components/local-history/local-history-article-public"
import {
  findLocalHistoryBySlugParam,
  findOtherLocalHistoryCards,
  getHomeLocalHistoryHeading,
  toLocalHistoryPayload,
} from "@/lib/local-history/repository"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ slug: string }> }

export default async function LocalHistoryDetailPage({ params }: Props) {
  const { slug } = await params
  const row = await findLocalHistoryBySlugParam(slug)
  if (!row || !row.slug) notFound()

  const [heading, otherRows] = await Promise.all([
    getHomeLocalHistoryHeading(),
    findOtherLocalHistoryCards(row.id, 6),
  ])

  const others = otherRows
    .filter((r) => r.slug)
    .slice(0, 3)
    .map(toLocalHistoryPayload)

  return (
    <div className="bg-surface font-body text-on-surface antialiased">
      <main className="flex-grow">
        <LocalHistoryArticlePublic
          current={toLocalHistoryPayload(row)}
          others={others}
          sectionTitle={heading.title}
          sectionTitleKz={heading.titleKz}
        />
      </main>
      <SiteFooter />
    </div>
  )
}
