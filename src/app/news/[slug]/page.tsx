import { cookies } from "next/headers"
import { notFound } from "next/navigation"

import SiteFooter from "@/components/SiteFooter"
import { NewsArticlePublic } from "@/components/news/news-article-public"
import {
  appLocaleFromRequestValue,
  LOCALE_STORAGE_KEY,
} from "@/lib/i18n/app-locale"
import {
  findOtherPublishedNews,
  findPublishedByPublicRef,
} from "@/lib/news/repository"
import { toNewsArticlePublicPayload } from "@/lib/news/public-payload"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ slug: string }> }

export default async function NewsArticlePage({ params }: Props) {
  const { slug: ref } = await params
  const article = await findPublishedByPublicRef(ref)
  if (!article) notFound()

  const jar = await cookies()
  const locale = appLocaleFromRequestValue(jar.get(LOCALE_STORAGE_KEY)?.value)

  const others = await findOtherPublishedNews(
    article.id,
    4,
    article.branchId ?? null
  )

  return (
    <div className="bg-surface font-body text-on-surface antialiased">
      <main className="flex-grow">
        <NewsArticlePublic
          article={toNewsArticlePublicPayload(article, locale)}
          others={others.map((o) => toNewsArticlePublicPayload(o, locale))}
        />
      </main>

      <SiteFooter />
    </div>
  )
}
