import type { PrismaClient } from "@prisma/client"

import { fetchAfishaItemsViaPublicApi, fetchNewsItemsViaPublicApi } from "@/lib/cms/home/api-feed"
import type { AppLocale } from "@/lib/i18n/app-locale"
import { pickDbField } from "@/lib/i18n/app-locale"
import { NEWS_COVER_FALLBACK } from "@/lib/news/cover-fallback"
import { newsArticlePublicPath } from "@/lib/news/public-path"
import { formatNewsListDate, listPublishedNewsPublic } from "@/lib/news/repository"

import type {
  AfishaItemManual,
  ArrivalBookManual,
  ELibraryBook,
  HomeSection,
  HomeTickerLine,
  LocalHistoryCardManual,
  NewsItemManual,
  ResolvedHome,
  UsefulLinkManual,
} from "./types"
import { HOME_SECTION_ORDER } from "./types"
import { getDefaultHomeSections } from "./defaults"
import {
  filterAfishaItems,
  filterArrivalBooks,
  filterELibraryBooks,
  filterGalleryVideos,
  filterLocalHistoryCards,
  filterNewsItems,
  filterStatisticsCards,
  filterTickerItems,
  filterUsefulLinks,
  normalizeHomeTickerItems,
} from "./filter-display"
import { eventToAfishaCard } from "@/lib/events/home-afisha-card"
import { listPublishedEventsPublic } from "@/lib/events/repository"
import { splitBodyParagraphs } from "@/lib/news/split-body"
import { DIGITAL_LIBRARY_URL } from "@/lib/digital-library-url"

function pickSection<T extends HomeSection["type"]>(
  sections: HomeSection[],
  type: T
): Extract<HomeSection, { type: T }> | undefined {
  return sections.find((s) => s.type === type) as
    | Extract<HomeSection, { type: T }>
    | undefined
}

export async function resolveHomeSections(
  sections: HomeSection[] | null | undefined,
  db: PrismaClient,
  locale: AppLocale
): Promise<ResolvedHome> {
  const site = await db.siteSettings.findUnique({ where: { id: "default" } })
  const homeNewsLimit = site?.homeNewsLimit ?? 4
  const homeEventsLimit = site?.homeEventsLimit ?? 4

  const base = getDefaultHomeSections()
  const merged: HomeSection[] = HOME_SECTION_ORDER.map((type) => {
    const fromDb = sections?.find((s) => s.type === type)
    const fallback = base.find((s) => s.type === type)!
    const raw = fromDb ?? fallback
    if (raw.type === "latestNews") {
      return {
        type: "latestNews",
        data: {
          kicker: raw.data.kicker,
          kickerKz: raw.data.kickerKz,
          title: raw.data.title,
          titleKz: raw.data.titleKz,
        },
      }
    }
    if (raw.type === "afisha") {
      return {
        type: "afisha",
        data: {
          kicker: raw.data.kicker,
          kickerKz: raw.data.kickerKz,
          title: raw.data.title,
          titleKz: raw.data.titleKz,
        },
      }
    }
    return raw
  }) as HomeSection[]

  const heroS = pickSection(merged, "hero")!
  const quoteS = pickSection(merged, "quote")!
  const tickerS = pickSection(merged, "ticker")!
  const statsS = pickSection(merged, "statistics")!
  const afishaS = pickSection(merged, "afisha")!
  const elibS = pickSection(merged, "eLibrary")!
  const newsS = pickSection(merged, "latestNews")!
  const arrS = pickSection(merged, "newArrivals")!
  const lhS = pickSection(merged, "localHistory")!
  const galS = pickSection(merged, "mediaGallery")!
  const linksS = pickSection(merged, "usefulLinks")!

  let afishaItems: AfishaItemManual[] = []
  try {
    afishaItems = await fetchAfishaItemsViaPublicApi(homeEventsLimit, locale)
  } catch {
    const eventsHome = await listPublishedEventsPublic({
      limit: homeEventsLimit,
    })
    afishaItems = eventsHome.map((e) =>
      eventToAfishaCard({
        id: e.id,
        slug: e.slug,
        posterUrl: e.posterUrl,
        startsAt: e.startsAt,
        timeDisplay: e.timeDisplay,
        timeDisplayKz: e.timeDisplayKz,
        title: pickDbField(e.titleRu, e.titleKz ?? null, locale),
        titleKz: null,
        excerpt: pickDbField(e.descriptionRu, e.descriptionKz ?? null, locale),
        excerptKz: null,
        ctaLabel: e.ctaLabel,
        ctaLabelKz: e.ctaLabelKz,
        ctaHref: e.ctaHref,
      })
    )
  }

  let eBooks: ELibraryBook[] = []
  if (elibS.data.source === "manual" && elibS.data.manualBooks?.length) {
    eBooks = elibS.data.manualBooks
  } else {
    const lim = elibS.data.database?.limit ?? 6
    const where = elibS.data.database?.showOnHomeOnly
      ? { showOnHome: true }
      : {}
    const rows = await db.digitalLibraryItem.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      take: lim,
    })
    eBooks = rows.map((r) => ({
      coverUrl: r.coverUrl ?? "",
      title: pickDbField(r.titleRu, r.titleKz ?? null, locale),
      titleKz: null,
      author: pickDbField(r.author, r.authorKz ?? null, locale),
      authorKz: null,
      href: r.resourceUrl ?? DIGITAL_LIBRARY_URL,
    }))
    if (!eBooks.length && elibS.data.manualBooks?.length) {
      eBooks = elibS.data.manualBooks
    }
  }

  let newsItems: NewsItemManual[] = []
  try {
    newsItems = await fetchNewsItemsViaPublicApi(homeNewsLimit, locale)
  } catch {
    const articles = await listPublishedNewsPublic({
      limit: homeNewsLimit,
      orderByCreatedAt: true,
    })
    newsItems = articles.map((a) => {
      const desc = pickDbField(
        a.descriptionRu,
        a.descriptionKz ?? null,
        locale
      )
      const lead = splitBodyParagraphs(desc)[0]?.trim() ?? desc.trim()
      return {
        coverUrl: a.coverImageUrl?.trim() || NEWS_COVER_FALLBACK,
        dateLabel: formatNewsListDate(a.publishedAt),
        title: pickDbField(a.titleRu, a.titleKz ?? null, locale),
        titleKz: null,
        excerpt: lead,
        excerptKz: null,
        href: newsArticlePublicPath(a),
      }
    })
  }

  let arrivalBooks: ArrivalBookManual[] = []
  // Для этого блока приоритет — БД (админка), даже если в CMS секция стоит "manual".
  // Manual остаётся как фоллбек, если в БД пока пусто.
  const lim = Math.min(8, Math.max(1, arrS.data.database?.limit ?? 6))
  const rows = await db.newArrival.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    take: lim,
  })
  arrivalBooks = rows.map((r) => ({
    coverUrl: r.coverUrl ?? "",
    title: r.title,
    titleKz: r.titleKz ?? null,
    author: r.author,
    authorKz: r.authorKz ?? null,
    detailHref: r.detailUrl ?? "#",
  }))
  if (!arrivalBooks.length && arrS.data.manualBooks?.length) {
    arrivalBooks = arrS.data.manualBooks
  }

  let lhCards: LocalHistoryCardManual[] = []
  if (lhS.data.source === "manual" && lhS.data.manualCards?.length) {
    lhCards = lhS.data.manualCards
  } else {
    const lim = lhS.data.database?.limit ?? 8
    const rows = await db.localHistoryCard.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: lim,
    })
    lhCards = rows.map((r) => ({
      id: r.id,
      slug: r.slug ?? null,
      portraitUrl: r.portraitUrl ?? undefined,
      name: r.name,
      nameKz: r.nameKz ?? null,
      excerpt: r.excerpt,
      excerptKz: r.excerptKz ?? null,
    }))
    if (!lhCards.length && lhS.data.manualCards?.length) {
      lhCards = lhS.data.manualCards
    }
  }

  let usefulLinks: UsefulLinkManual[] = []
  if (
    linksS.data.source === "manual" &&
    linksS.data.manualLinks?.length
  ) {
    usefulLinks = linksS.data.manualLinks
  } else {
    const lim = Math.min(8, Math.max(1, linksS.data.database?.limit ?? 8))
    const rows = await db.partnerLink.findMany({
      // Prisma Client может быть не перегенерен сразу после изменения схемы на Windows.
      // Держим совместимость через any — после prisma generate тип станет корректным.
      where: { isActive: true } as any,
      orderBy: { sortOrder: "asc" },
      take: lim,
    })
    usefulLinks = rows.map((r) => ({
      href: r.href,
      title: r.title,
      titleKz: (r as any).titleKz ?? null,
      logoUrl: r.logoUrl ?? "/images/logo.png",
      logoVariant: "round" as const,
    }))
    if (!usefulLinks.length && linksS.data.manualLinks?.length) {
      usefulLinks = linksS.data.manualLinks
    }
  }

  const quoteText =
    quoteS.data.author && quoteS.data.text
      ? quoteS.data.text.includes("«")
        ? quoteS.data.text
        : `«${quoteS.data.text}»`
      : quoteS.data.text

  afishaItems = filterAfishaItems(afishaItems)
  eBooks = filterELibraryBooks(eBooks)
  newsItems = filterNewsItems(newsItems)
  arrivalBooks = filterArrivalBooks(arrivalBooks).slice(0, 8)
  lhCards = filterLocalHistoryCards(lhCards)
  usefulLinks = filterUsefulLinks(usefulLinks).slice(0, 8)

  const tickerItems = filterTickerItems(
    normalizeHomeTickerItems(
      tickerS.data.items as (string | HomeTickerLine)[]
    )
  )
  const statCards = filterStatisticsCards(statsS.data.cards)
  // Back-compat: раньше медиагалерея была (mainImageUrl/videoUrl/thumbUrls).
  const rawGalleryVideos =
    (galS.data as any).videos ??
    (() => {
      const legacy: string[] = []
      const legacyMain = String((galS.data as any).videoUrl ?? "").trim()
      if (legacyMain) legacy.push(legacyMain)
      const thumbs = Array.isArray((galS.data as any).thumbUrls)
        ? ((galS.data as any).thumbUrls as unknown[]).map((x) => String(x))
        : []
      legacy.push(...thumbs)
      const uniq = Array.from(new Set(legacy.map((x) => x.trim()).filter(Boolean)))
      return uniq.slice(0, 5).map((youtubeUrl, i) => ({
        position: (i + 1) as 1 | 2 | 3 | 4 | 5,
        youtubeUrl,
      }))
    })()
  const galleryVideos = filterGalleryVideos(rawGalleryVideos)

  return {
    hero: {
      backgroundImageUrl: heroS.data.backgroundImageUrl,
      backgroundAlt: heroS.data.backgroundAlt ?? "Library Background",
      backgroundAltKz:
        heroS.data.backgroundAltKz?.trim() || "Кітапхана туралы фон",
      titleLine1: heroS.data.titleLine1,
      titleLine1Kz: heroS.data.titleLine1Kz?.trim() || null,
      titleLine2: heroS.data.titleLine2,
      titleLine2Kz: heroS.data.titleLine2Kz?.trim() || null,
      ...(heroS.data.subtitle?.trim() || heroS.data.subtitleKz?.trim()
        ? {
            subtitle: heroS.data.subtitle?.trim() ?? "",
            subtitleKz: heroS.data.subtitleKz?.trim() || null,
          }
        : {}),
    },
    quote: {
      text: quoteText,
      textKz: quoteS.data.textKz?.trim() || null,
      author: quoteS.data.author ?? "",
      authorKz: quoteS.data.authorKz?.trim() || null,
    },
    ticker: { items: tickerItems },
    statistics: { cards: statCards },
    afisha: {
      kicker: afishaS.data.kicker,
      kickerKz: afishaS.data.kickerKz?.trim() || null,
      title: afishaS.data.title,
      titleKz: afishaS.data.titleKz?.trim() || null,
      items: afishaItems,
      ...(site?.homeEventsAutoRefresh !== false
        ? {
            clientRefresh: {
              enabled: true,
              intervalSec: site?.homeEventsPollSeconds ?? 60,
              limit: homeEventsLimit,
            },
          }
        : {}),
    },
    eLibrary: {
      title: elibS.data.title,
      titleKz: elibS.data.titleKz?.trim() || null,
      description: elibS.data.description,
      descriptionKz: elibS.data.descriptionKz?.trim() || null,
      buttonLabel: elibS.data.buttonLabel,
      buttonLabelKz: elibS.data.buttonLabelKz?.trim() || null,
      buttonHref: elibS.data.buttonHref?.trim() || DIGITAL_LIBRARY_URL,
      books: eBooks,
    },
    latestNews: {
      kicker: newsS.data.kicker,
      kickerKz: newsS.data.kickerKz?.trim() || null,
      title: newsS.data.title,
      titleKz: newsS.data.titleKz?.trim() || null,
      items: newsItems,
      ...(site?.homeNewsAutoRefresh !== false
        ? {
            clientRefresh: {
              enabled: true,
              intervalSec: site?.homeNewsPollSeconds ?? 60,
              limit: homeNewsLimit,
            },
          }
        : {}),
    },
    newArrivals: {
      title: arrS.data.title,
      titleKz: arrS.data.titleKz?.trim() || null,
      subtitle: arrS.data.subtitle,
      subtitleKz: arrS.data.subtitleKz?.trim() || null,
      books: arrivalBooks,
    },
    localHistory: {
      title: lhS.data.title,
      titleKz: lhS.data.titleKz?.trim() || null,
      description: lhS.data.description,
      descriptionKz: lhS.data.descriptionKz?.trim() || null,
      cards: lhCards,
    },
    mediaGallery: {
      ...galS.data,
      videos: galleryVideos,
    },
    usefulLinks: {
      kicker: linksS.data.kicker,
      kickerKz: linksS.data.kickerKz?.trim() || null,
      title: linksS.data.title,
      titleKz: linksS.data.titleKz?.trim() || null,
      links: usefulLinks,
    },
  }
}
