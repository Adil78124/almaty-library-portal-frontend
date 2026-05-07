import type { AfishaItemManual } from "@/lib/cms/home/types"
import { EVENT_POSTER_FALLBACK } from "@/lib/events/poster-fallback"
import { eventPublicPath } from "@/lib/events/public-path"
import type { AppLocale } from "@/lib/i18n/app-locale"
import { L, pickLocalized } from "@/lib/i18n/app-locale"

function toDate(v: Date | string | null | undefined): Date | null {
  if (v == null) return null
  const d = v instanceof Date ? v : new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}

/** Строка даты/времени в карточке афиши с учётом языка. */
export function formatAfishaTimeLine(
  rawTimeDisplay: string | null | undefined,
  startsAtIso: string | null | undefined,
  lang: AppLocale,
  rawTimeDisplayKz?: string | null
): string {
  const ru = (rawTimeDisplay ?? "").trim()
  const kz = (rawTimeDisplayKz ?? "").trim()
  const td = lang === "kz" && kz ? kz : ru
  if (td) return td
  const iso = (startsAtIso ?? "").trim()
  const starts = iso ? toDate(iso) : null
  const loc = lang === "kz" ? "kk-KZ" : "ru-RU"
  if (starts) {
    return `${starts.toLocaleDateString(loc, { month: "long" }).toUpperCase()} | ${starts.toLocaleTimeString(loc, { hour: "2-digit", minute: "2-digit" })}`
  }
  return pickLocalized(L("Дата уточняется", "Күні нақтылануда"), lang)
}

/** Карточка афиши на главной из записи Event (БД или JSON API). */
export function eventToAfishaCard(e: {
  id: string
  slug: string
  posterUrl: string | null
  startsAt: Date | string | null
  timeDisplay: string | null
  timeDisplayKz?: string | null
  /** Заголовок (для БД: titleRu; для API: уже локализованный title). */
  title: string
  titleKz?: string | null
  /** Краткий текст (для БД: descriptionRu; для API: description). */
  excerpt: string
  excerptKz?: string | null
  ctaLabel: string | null
  ctaLabelKz?: string | null
  ctaHref: string | null
}): AfishaItemManual {
  const starts = toDate(e.startsAt)
  const dayNum = starts ? String(starts.getDate()).padStart(2, "0") : "—"
  const rawTimeDisplay = (e.timeDisplay ?? "").trim() || null
  const startsAtIso = starts ? starts.toISOString() : null
  const timeLine = formatAfishaTimeLine(
    rawTimeDisplay,
    startsAtIso,
    "ru",
    e.timeDisplayKz
  )
  const defaultReadMore = L("Подробнее", "Толығырақ")
  const ruCta = (e.ctaLabel ?? "").trim()
  const kzCtaRaw = (e.ctaLabelKz ?? "").trim()
  return {
    posterUrl: e.posterUrl?.trim() || EVENT_POSTER_FALLBACK,
    dayNum,
    timeLine,
    startsAtIso,
    rawTimeDisplay: e.timeDisplay,
    rawTimeDisplayKz: e.timeDisplayKz ?? null,
    title: e.title,
    titleKz: e.titleKz ?? null,
    excerpt: e.excerpt,
    excerptKz: e.excerptKz ?? null,
    ctaLabel: ruCta || defaultReadMore.ru,
    ctaLabelKz: kzCtaRaw || (!ruCta ? defaultReadMore.kz : null),
    ctaHref:
      (e.ctaHref ?? "").trim() || eventPublicPath({ slug: e.slug, id: e.id }),
  }
}
