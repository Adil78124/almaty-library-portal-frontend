export type HomeHeroData = {
  backgroundImageUrl: string
  backgroundAlt?: string
  backgroundAltKz?: string
  titleLine1: string
  titleLine1Kz?: string
  titleLine2: string
  titleLine2Kz?: string
  subtitle?: string
  subtitleKz?: string
}

export type HomeQuoteData = {
  text: string
  textKz?: string
  author?: string
  authorKz?: string
}

/** Одна строка бегущей строки: RU + опционально KZ. */
export type HomeTickerLine = { text: string; textKz?: string | null }

export type HomeTickerData = {
  items: HomeTickerLine[]
}

export type HomeStatisticsData = {
  cards: {
    iconName: string
    valueText: string
    valueTextKz?: string | null
    label: string
    labelKz?: string | null
  }[]
}

export type AfishaItemManual = {
  posterUrl: string
  dayNum: string
  timeLine: string
  /** ISO; для локализации даты на клиенте */
  startsAtIso?: string | null
  rawTimeDisplay?: string | null
  rawTimeDisplayKz?: string | null
  title: string
  titleKz?: string | null
  excerpt: string
  excerptKz?: string | null
  ctaLabel: string
  ctaLabelKz?: string | null
  ctaHref: string
}

/** Только заголовки секции; карточки — из Event (настройки лимита в SiteSettings). */
export type HomeAfishaData = {
  kicker: string
  kickerKz?: string
  title: string
  titleKz?: string
}

export type ELibraryBook = {
  coverUrl: string
  title: string
  titleKz?: string | null
  author: string
  authorKz?: string | null
}

export type HomeELibraryData = {
  title: string
  titleKz?: string
  description: string
  descriptionKz?: string
  buttonLabel: string
  buttonLabelKz?: string
  buttonHref: string
  source: "manual" | "database"
  manualBooks?: ELibraryBook[]
  database?: { limit?: number; showOnHomeOnly?: boolean }
}

export type NewsItemManual = {
  coverUrl: string
  dateLabel: string
  title: string
  titleKz?: string | null
  excerpt: string
  excerptKz?: string | null
  href: string
}

/** Только заголовки секции; список карточек всегда из NewsArticle (настройки — SiteSettings). */
export type HomeLatestNewsData = {
  kicker: string
  kickerKz?: string
  title: string
  titleKz?: string
}

export type ArrivalBookManual = {
  coverUrl: string
  title: string
  titleKz?: string | null
  author: string
  authorKz?: string | null
  detailHref: string
}

export type HomeNewArrivalsData = {
  title: string
  titleKz?: string
  subtitle: string
  subtitleKz?: string
  source: "manual" | "database"
  manualBooks?: ArrivalBookManual[]
  database?: { limit?: number }
}

export type LocalHistoryCardManual = {
  id?: string
  slug?: string | null
  portraitUrl?: string
  name: string
  nameKz?: string | null
  excerpt: string
  excerptKz?: string | null
}

export type HomeLocalHistoryData = {
  title: string
  titleKz?: string
  description?: string
  descriptionKz?: string
  source: "manual" | "database"
  manualCards?: LocalHistoryCardManual[]
  database?: { limit?: number }
}

export type HomeMediaGalleryData = {
  title: string
  titleKz?: string
  /** 5 видео: позиция 1 — главное, 2–5 — сбоку. */
  videos: {
    /** 1..5 */
    position: 1 | 2 | 3 | 4 | 5
    /** YouTube watch/shorts/youtu.be/embed или просто ID */
    youtubeUrl: string
  }[]
}

export type UsefulLinkManual = {
  href: string
  title: string
  titleKz?: string | null
  logoUrl: string
  logoVariant: "round" | "rect"
}

export type HomeUsefulLinksData = {
  kicker: string
  kickerKz?: string
  title: string
  titleKz?: string
  source: "manual" | "database"
  manualLinks?: UsefulLinkManual[]
  database?: { limit?: number }
}

export type HomeSection =
  | { type: "hero"; data: HomeHeroData }
  | { type: "quote"; data: HomeQuoteData }
  | { type: "ticker"; data: HomeTickerData }
  | { type: "statistics"; data: HomeStatisticsData }
  | { type: "afisha"; data: HomeAfishaData }
  | { type: "eLibrary"; data: HomeELibraryData }
  | { type: "latestNews"; data: HomeLatestNewsData }
  | { type: "newArrivals"; data: HomeNewArrivalsData }
  | { type: "localHistory"; data: HomeLocalHistoryData }
  | { type: "mediaGallery"; data: HomeMediaGalleryData }
  | { type: "usefulLinks"; data: HomeUsefulLinksData }

/** После резолва БД — то, что рендерит главная без изменения вёрстки. */
export type ResolvedHome = {
  hero: {
    backgroundImageUrl: string
    backgroundAlt: string
    backgroundAltKz?: string | null
    titleLine1: string
    titleLine1Kz?: string | null
    titleLine2: string
    titleLine2Kz?: string | null
    subtitle?: string
    subtitleKz?: string | null
  }
  quote: {
    text: string
    textKz?: string | null
    author: string
    authorKz?: string | null
  }
  ticker: { items: HomeTickerLine[] }
  statistics: HomeStatisticsData
  afisha: {
    kicker: string
    kickerKz?: string | null
    title: string
    titleKz?: string | null
    items: AfishaItemManual[]
    clientRefresh?: {
      enabled: boolean
      intervalSec: number
      limit: number
    }
  }
  eLibrary: {
    title: string
    titleKz?: string | null
    description: string
    descriptionKz?: string | null
    buttonLabel: string
    buttonLabelKz?: string | null
    buttonHref: string
    books: ELibraryBook[]
  }
  latestNews: {
    kicker: string
    kickerKz?: string | null
    title: string
    titleKz?: string | null
    items: NewsItemManual[]
    /** Клиентский polling к /api/news (если включено в админке). */
    clientRefresh?: {
      enabled: boolean
      intervalSec: number
      limit: number
    }
  }
  newArrivals: {
    title: string
    titleKz?: string | null
    subtitle: string
    subtitleKz?: string | null
    books: ArrivalBookManual[]
  }
  localHistory: {
    title: string
    titleKz?: string | null
    description?: string
    descriptionKz?: string | null
    cards: LocalHistoryCardManual[]
  }
  mediaGallery: HomeMediaGalleryData
  usefulLinks: {
    kicker: string
    kickerKz?: string | null
    title: string
    titleKz?: string | null
    links: UsefulLinkManual[]
  }
}

export const HOME_SECTION_ORDER = [
  "hero",
  "quote",
  "ticker",
  "statistics",
  "afisha",
  "eLibrary",
  "latestNews",
  "newArrivals",
  "localHistory",
  "mediaGallery",
  "usefulLinks",
] as const
