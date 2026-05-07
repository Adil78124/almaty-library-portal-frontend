import { cookies } from "next/headers"

import SiteFooter from "@/components/SiteFooter"
import { NewsListPublic } from "@/components/news/news-list-public"
import { getSimplePagePublic } from "@/lib/cms/simple-page/public"
import {
  appLocaleFromRequestValue,
  LOCALE_STORAGE_KEY,
} from "@/lib/i18n/app-locale"
import {
  listPublishedNews,
} from "@/lib/news/repository"
import { toNewsArticlePublicPayload } from "@/lib/news/public-payload"

export const dynamic = "force-dynamic"

export default async function NewsListPage() {
  const jar = await cookies()
  const locale = appLocaleFromRequestValue(jar.get(LOCALE_STORAGE_KEY)?.value)

  const [{ hero }, items] = await Promise.all([
    getSimplePagePublic("news"),
    listPublishedNews(),
  ])

  const payload = items.map((a) => toNewsArticlePublicPayload(a, locale))

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen antialiased">
      <main className="flex-grow">
        <NewsListPublic hero={hero} items={payload} />
      </main>
      <SiteFooter />
    </div>
  )
}
