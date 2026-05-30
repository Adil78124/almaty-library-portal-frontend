import type { Event } from "@prisma/client"
import { cookies } from "next/headers"

import SiteFooter from "@/components/SiteFooter"
import { getHomeSectionsRaw } from "@/lib/cms/home/public"
import { DEFAULT_AFISHA_INFO } from "@/lib/cms/home/types"
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

export const dynamic = "force-dynamic"

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
  const [homeSections, rawEvents, newsArticles] = await Promise.all([
    getHomeSectionsRaw(),
    listAllPublishedEvents(),
    listPublishedNewsPublic({ limit: 3, orderByCreatedAt: true }),
  ])
  const afishaSettings = homeSections.find((s) => s.type === "afisha")
  const infoBox =
    afishaSettings?.type === "afisha"
      ? {
          title:
            afishaSettings.data.infoTitle?.trim() || DEFAULT_AFISHA_INFO.title,
          titleKz:
            afishaSettings.data.infoTitleKz?.trim() ||
            DEFAULT_AFISHA_INFO.titleKz,
          description:
            afishaSettings.data.infoDescription?.trim() ||
            DEFAULT_AFISHA_INFO.description,
          descriptionKz:
            afishaSettings.data.infoDescriptionKz?.trim() ||
            DEFAULT_AFISHA_INFO.descriptionKz,
        }
      : {
          title: DEFAULT_AFISHA_INFO.title,
          titleKz: DEFAULT_AFISHA_INFO.titleKz,
          description: DEFAULT_AFISHA_INFO.description,
          descriptionKz: DEFAULT_AFISHA_INFO.descriptionKz,
        }
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
      <main className="pt-16 pb-12 sm:pb-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 min-w-0">
          <EventsPageClient
            hero={hero}
            events={events}
            infoBox={infoBox}
            newsTeasers={newsTeasers}
          />
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
