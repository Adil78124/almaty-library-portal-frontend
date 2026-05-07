import type {
  AfishaItemManual,
  ArrivalBookManual,
  ELibraryBook,
  HomeTickerLine,
  LocalHistoryCardManual,
  NewsItemManual,
  UsefulLinkManual,
} from "./types"

function t(s: string | undefined | null): string {
  return (s ?? "").trim()
}

/** Поддержка старых данных: элементы могли быть простыми строками (RU). */
export function normalizeHomeTickerItems(
  items: (string | HomeTickerLine)[] | null | undefined
): HomeTickerLine[] {
  if (!Array.isArray(items)) return []
  const out: HomeTickerLine[] = []
  for (const x of items) {
    if (typeof x === "string") {
      const text = x.trim()
      if (text) out.push({ text, textKz: null })
    } else if (x && typeof x === "object" && "text" in x) {
      const text = String((x as HomeTickerLine).text ?? "").trim()
      if (!text) continue
      const kz = (x as HomeTickerLine).textKz
      out.push({
        text,
        textKz:
          kz === undefined || kz === null ? null : String(kz).trim() || null,
      })
    }
  }
  return out
}

export function filterTickerItems(items: HomeTickerLine[]): HomeTickerLine[] {
  return items.filter((x) => t(x.text))
}

export function filterStatisticsCards(
  cards: {
    iconName: string
    valueText: string
    valueTextKz?: string | null
    label: string
    labelKz?: string | null
  }[]
) {
  return cards.filter(
    (c) =>
      t(c.label) ||
      t(c.labelKz) ||
      t(c.valueText) ||
      t(c.valueTextKz) ||
      t(c.iconName)
  )
}

export function filterAfishaItems(items: AfishaItemManual[]): AfishaItemManual[] {
  return items.filter(
    (it) =>
      t(it.title) ||
      t(it.posterUrl) ||
      t(it.excerpt) ||
      t(it.dayNum) ||
      t(it.timeLine) ||
      t(it.ctaHref)
  )
}

export function filterELibraryBooks(books: ELibraryBook[]): ELibraryBook[] {
  return books.filter((b) => t(b.title) || t(b.coverUrl) || t(b.author))
}

export function filterNewsItems(items: NewsItemManual[]): NewsItemManual[] {
  return items.filter(
    (n) => t(n.title) || t(n.href) || t(n.coverUrl) || t(n.excerpt)
  )
}

/** Best-effort sort for manual dateLabel (ISO, Date.parse, or dd.mm.yyyy). */
function newsDateScore(dateLabel: string): number {
  const s = t(dateLabel)
  if (!s) return 0
  const parsed = Date.parse(s)
  if (!Number.isNaN(parsed)) return parsed
  const m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (m) {
    const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
    const x = d.getTime()
    return Number.isNaN(x) ? 0 : x
  }
  return 0
}

export function sortNewsItemsByDateDesc(items: NewsItemManual[]): NewsItemManual[] {
  return [...items].sort(
    (a, b) => newsDateScore(b.dateLabel) - newsDateScore(a.dateLabel)
  )
}

export function filterArrivalBooks(books: ArrivalBookManual[]): ArrivalBookManual[] {
  return books.filter((b) => t(b.title) || t(b.coverUrl) || t(b.author))
}

export function filterLocalHistoryCards(
  cards: LocalHistoryCardManual[]
): LocalHistoryCardManual[] {
  return cards.filter((c) => t(c.name) || t(c.excerpt) || t(c.portraitUrl))
}

export function filterUsefulLinks(links: UsefulLinkManual[]): UsefulLinkManual[] {
  return links.filter((l) => (t(l.title) || t(l.titleKz)) && t(l.href))
}

export function filterGalleryVideos(
  videos: { position: 1 | 2 | 3 | 4 | 5; youtubeUrl: string }[]
): { position: 1 | 2 | 3 | 4 | 5; youtubeUrl: string }[] {
  const seen = new Set<number>()
  const cleaned = (Array.isArray(videos) ? videos : [])
    .map((v) => ({
      position: v.position,
      youtubeUrl: t(v.youtubeUrl),
    }))
    .filter((v) => v.youtubeUrl && v.position >= 1 && v.position <= 5)
    .filter((v) => {
      if (seen.has(v.position)) return false
      seen.add(v.position)
      return true
    })

  // фиксируем порядок 1..5
  return cleaned.sort((a, b) => a.position - b.position)
}
