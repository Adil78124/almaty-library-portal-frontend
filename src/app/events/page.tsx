import type { Event } from "@prisma/client"
import { cookies } from "next/headers"

import SiteFooter from "@/components/SiteFooter"
import { getSimplePagePublic } from "@/lib/cms/simple-page/public"
import { listAllPublishedEvents } from "@/lib/events/repository"
import {
  appLocaleFromRequestValue,
  LOCALE_STORAGE_KEY,
  pickDbField,
  type AppLocale,
} from "@/lib/i18n/app-locale"
import { newsArticlePublicPath } from "@/lib/news/public-path"
import { listPublishedNewsPublic } from "@/lib/news/repository"
import { splitBodyParagraphs } from "@/lib/news/split-body"
import EventsPageClient, {
  type NewsTeaser,
  type SerializedEventCard,
} from "./events-page-client"

function serializeEvent(e: Event, locale: AppLocale): SerializedEventCard {
  const desc = pickDbField(e.descriptionRu, e.descriptionKz ?? null, locale)
  const lead = splitBodyParagraphs(desc)[0]?.trim() ?? desc.trim()
  return {
    id: e.id,
    slug: e.slug,
    title: pickDbField(e.titleRu, e.titleKz ?? null, locale),
    titleKz: null,
    excerpt: lead,
    excerptKz: null,
    posterUrl: e.posterUrl,
    startsAt: e.startsAt?.toISOString() ?? null,
    timeDisplay: e.timeDisplay,
    timeDisplayKz: e.timeDisplayKz ?? null,
    format: e.format,
    formatKz: e.formatKz ?? null,
    category: e.category,
    categoryKz: e.categoryKz ?? null,
    location: e.location ?? null,
    locationKz: e.locationKz ?? null,
    ctaLabel: e.ctaLabel ?? null,
    ctaLabelKz: e.ctaLabelKz ?? null,
  }
}

export default async function EventsPage() {
  const jar = await cookies()
  const locale = appLocaleFromRequestValue(jar.get(LOCALE_STORAGE_KEY)?.value)

  const { hero } = await getSimplePagePublic("events")
  const [rawEvents, newsArticles] = await Promise.all([
    listAllPublishedEvents(),
    listPublishedNewsPublic({ limit: 3, orderByCreatedAt: true }),
  ])
  const events = rawEvents.map((e) => serializeEvent(e, locale))
  const newsTeasers: NewsTeaser[] = newsArticles.map((n) => ({
    id: n.id,
    title: pickDbField(n.titleRu, n.titleKz ?? null, locale),
    titleKz: null,
    href: newsArticlePublicPath(n),
    publishedAt: n.publishedAt?.toISOString() ?? null,
  }))

  return (
    <div className="bg-surface font-body text-on-surface antialiased">
      <main className="pt-16 pb-20">
        <div className="max-w-screen-2xl mx-auto px-8">
          <EventsPageClient hero={hero} events={events} newsTeasers={newsTeasers} />
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
