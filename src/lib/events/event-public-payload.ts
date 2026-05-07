import type { Event } from "@prisma/client"

import type { AppLocale } from "@/lib/i18n/app-locale"
import { pickDbField } from "@/lib/i18n/app-locale"
import { splitBodyParagraphs } from "@/lib/news/split-body"

type EventRow = Event

export type EventCardPublicPayload = {
  id: string
  slug: string
  title: string
  titleKz: string | null
  excerpt: string
  excerptKz: string | null
  posterUrl: string | null
  startsAt: string | null
  timeDisplay: string | null
  timeDisplayKz: string | null
  format: string | null
  formatKz: string | null
  category: string | null
  categoryKz: string | null
  location: string | null
  locationKz: string | null
  ctaLabel: string | null
  ctaLabelKz: string | null
}

export type EventDetailPublicPayload = {
  id: string
  slug: string
  title: string
  titleKz: string | null
  excerpt: string
  excerptKz: string | null
  body: string
  bodyKz: string | null
  posterUrl: string | null
  startsAt: string | null
  timeDisplay: string | null
  timeDisplayKz: string | null
  location: string | null
  locationKz: string | null
  format: string | null
  formatKz: string | null
  category: string | null
  categoryKz: string | null
  ctaLabel: string | null
  ctaLabelKz: string | null
  branchId: string | null
  others: EventCardPublicPayload[]
}

function splitDescriptionForLayout(description: string): {
  excerpt: string
  body: string
} {
  const paras = splitBodyParagraphs(description)
  if (paras.length > 1) {
    return {
      excerpt: paras[0] ?? "",
      body: paras.slice(1).join("\n\n"),
    }
  }
  return { excerpt: "", body: description }
}

export function toEventCardPayload(
  e: EventRow,
  locale: AppLocale
): EventCardPublicPayload {
  const desc = pickDbField(e.descriptionRu, e.descriptionKz ?? null, locale)
  const lead = splitBodyParagraphs(desc)[0]?.trim() ?? desc.trim()
  return {
    id: e.id,
    slug: e.slug,
    title: pickDbField(e.titleRu, e.titleKz ?? null, locale),
    titleKz: null,
    excerpt: lead,
    excerptKz: null,
    posterUrl: e.posterUrl ?? null,
    startsAt: e.startsAt?.toISOString() ?? null,
    timeDisplay: e.timeDisplay ?? null,
    timeDisplayKz: e.timeDisplayKz ?? null,
    format: e.format ?? null,
    formatKz: e.formatKz ?? null,
    category: e.category ?? null,
    categoryKz: e.categoryKz ?? null,
    location: e.location ?? null,
    locationKz: e.locationKz ?? null,
    ctaLabel: e.ctaLabel ?? null,
    ctaLabelKz: e.ctaLabelKz ?? null,
  }
}

export function toEventDetailPayload(
  row: EventRow,
  others: EventRow[],
  locale: AppLocale
): EventDetailPublicPayload {
  const desc = pickDbField(row.descriptionRu, row.descriptionKz ?? null, locale)
  const { excerpt, body } = splitDescriptionForLayout(desc)
  return {
    id: row.id,
    slug: row.slug,
    title: pickDbField(row.titleRu, row.titleKz ?? null, locale),
    titleKz: null,
    excerpt,
    excerptKz: null,
    body,
    bodyKz: null,
    posterUrl: row.posterUrl ?? null,
    startsAt: row.startsAt?.toISOString() ?? null,
    timeDisplay: row.timeDisplay ?? null,
    timeDisplayKz: row.timeDisplayKz ?? null,
    location: row.location ?? null,
    locationKz: row.locationKz ?? null,
    format: row.format ?? null,
    formatKz: row.formatKz ?? null,
    category: row.category ?? null,
    categoryKz: row.categoryKz ?? null,
    ctaLabel: row.ctaLabel ?? null,
    ctaLabelKz: row.ctaLabelKz ?? null,
    branchId: row.branchId ?? null,
    others: others.map((o) => toEventCardPayload(o, locale)),
  }
}
