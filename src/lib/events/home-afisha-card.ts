import type { AfishaItemManual } from "@/lib/cms/home/types"
import { EVENT_POSTER_FALLBACK } from "@/lib/events/poster-fallback"
import { eventPublicPath } from "@/lib/events/public-path"
import {
  formatEventMonthUpper,
  getEventDateParts,
  parseEventDate,
} from "@/lib/events/format-dates"
import type { AppLocale } from "@/lib/i18n/app-locale"
import { L, pickLocalized } from "@/lib/i18n/app-locale"

/** Строка даты/времени в карточке афиши с учётом языка. */
const TIME_WORD_RE = /\b\d{1,2}[:.]\d{2}(?:\s*[-\u2013\u2014]\s*\d{1,2}[:.]\d{2})?\b/

export type AfishaDateParts = {
  day: string
  month: string
  time: string
  metaLine: string
}

function extractAfishaTime(value: string): string {
  return value.match(TIME_WORD_RE)?.[0]?.replace(".", ":").trim() ?? ""
}

export function formatAfishaDateParts(
  rawTimeDisplay: string | null | undefined,
  startsAtIso: string | null | undefined,
  lang: AppLocale,
  rawTimeDisplayKz?: string | null
): AfishaDateParts {
  const ru = (rawTimeDisplay ?? "").trim()
  const kz = (rawTimeDisplayKz ?? "").trim()
  const td = lang === "kz" && kz ? kz : ru
  const iso = (startsAtIso ?? "").trim()
  const starts = iso ? getEventDateParts(iso) : null
  if (!starts) {
    const fallback =
      td ||
      pickLocalized(L("Дата уточняется", "Күні нақтылануда"), lang)
    return {
      day: "—",
      month: fallback,
      time: "",
      metaLine: fallback,
    }
  }

  const day = String(starts.day).padStart(2, "0")
  const month = formatEventMonthUpper(iso, lang)
  const time =
    extractAfishaTime(td) ||
    `${String(starts.hour).padStart(2, "0")}:${String(starts.minute).padStart(2, "0")}`
  const metaLine = [month, time].filter(Boolean).join(" | ")

  return { day, month, time, metaLine }
}

export function formatAfishaTimeLine(
  rawTimeDisplay: string | null | undefined,
  startsAtIso: string | null | undefined,
  lang: AppLocale,
  rawTimeDisplayKz?: string | null
): string {
  return formatAfishaDateParts(
    rawTimeDisplay,
    startsAtIso,
    lang,
    rawTimeDisplayKz
  ).metaLine
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
  sourceLabel?: string | null
  sourceLabelKz?: string | null
}): AfishaItemManual {
  const starts = parseEventDate(e.startsAt)
  const parts = getEventDateParts(e.startsAt)
  const dayNum = parts ? String(parts.day).padStart(2, "0") : "—"
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
    sourceLabel: e.sourceLabel ?? null,
    sourceLabelKz: e.sourceLabelKz ?? null,
  }
}
