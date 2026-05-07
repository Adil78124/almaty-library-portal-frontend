import type { AfishaItemManual, NewsItemManual } from "@/lib/cms/home/types"
import { eventToAfishaCard } from "@/lib/events/home-afisha-card"
import { NEWS_COVER_FALLBACK } from "@/lib/news/cover-fallback"
import { newsArticlePublicPath } from "@/lib/news/public-path"
import { formatNewsListDate } from "@/lib/news/repository"
import { splitBodyParagraphs } from "@/lib/news/split-body"

/** Ответ GET /api/news (публичная лента, поля уже с учётом ?lang=). */
export type ApiNewsRow = {
  id: string
  slug: string
  title: string
  description: string
  coverImageUrl: string | null
  publishedAt: string | null
}

/** Ответ GET /api/events?limit=… (публичная афиша). */
export type ApiEventRow = {
  id: string
  slug: string
  title: string
  description: string
  posterUrl: string | null
  startsAt: string | null
  timeDisplay: string | null
  timeDisplayKz?: string | null
  format?: string | null
  formatKz?: string | null
  category?: string | null
  categoryKz?: string | null
  location?: string | null
  locationKz?: string | null
  ctaLabel: string | null
  ctaLabelKz?: string | null
  ctaHref: string | null
}

export function mapNewsApiRowsToManual(rows: ApiNewsRow[]): NewsItemManual[] {
  return rows.map((a) => {
    const r = a as ApiNewsRow & {
      titleRu?: string
      titleKz?: string | null
      descriptionRu?: string
      descriptionKz?: string | null
    }
    /** Публичный API отдаёт `title`/`description`; админский сырой ряд — `titleRu` и т.д. */
    const mergedTitle = typeof r.title === "string" ? r.title.trim() : ""
    const titleRu =
      typeof r.titleRu === "string" ? r.titleRu.trim() : ""
    const title = mergedTitle || titleRu
    const titleKz =
      mergedTitle || !r.titleKz || typeof r.titleKz !== "string"
        ? null
        : r.titleKz.trim() || null

    let descRu =
      typeof r.description === "string" ? r.description.trim() : ""
    if (!descRu && typeof r.descriptionRu === "string") {
      descRu = r.descriptionRu
    }
    const descKz =
      typeof r.descriptionKz === "string" && r.descriptionKz.trim()
        ? r.descriptionKz.trim()
        : ""

    const excerpt =
      splitBodyParagraphs(descRu)[0]?.trim() ?? descRu.trim()
    const excerptKz =
      mergedTitle || !descKz
        ? null
        : splitBodyParagraphs(descKz)[0]?.trim() ?? descKz

    return {
      coverUrl:
        (typeof a.coverImageUrl === "string" ? a.coverImageUrl.trim() : "") ||
        NEWS_COVER_FALLBACK,
      dateLabel: formatNewsListDate(
        a.publishedAt ? new Date(a.publishedAt) : null
      ),
      title,
      titleKz,
      excerpt,
      excerptKz,
      href: newsArticlePublicPath({ slug: a.slug, id: a.id }),
    }
  })
}

export function mapEventApiRowsToAfisha(rows: ApiEventRow[]): AfishaItemManual[] {
  return rows.map((e) => {
    const r = e as ApiEventRow & {
      titleRu?: string
      titleKz?: string | null
      descriptionRu?: string
      descriptionKz?: string | null
    }
    const mergedTitle = typeof r.title === "string" ? r.title.trim() : ""
    const titleRu =
      typeof r.titleRu === "string" ? r.titleRu.trim() : ""
    const title = mergedTitle || titleRu
    const titleKz =
      mergedTitle || !r.titleKz || typeof r.titleKz !== "string"
        ? null
        : r.titleKz.trim() || null

    const rawDesc = (e as { description?: unknown; excerpt?: unknown }).description
    const rawExcerpt = (e as { excerpt?: unknown }).excerpt
    let descRu =
      (typeof rawDesc === "string" ? rawDesc.trim() : "") ||
      (typeof rawExcerpt === "string" ? rawExcerpt.trim() : "")
    if (!descRu && typeof r.descriptionRu === "string") {
      descRu = r.descriptionRu
    }
    const descKz =
      typeof r.descriptionKz === "string" && r.descriptionKz.trim()
        ? r.descriptionKz.trim()
        : ""

    let lead =
      splitBodyParagraphs(descRu)[0]?.trim() ?? descRu.trim()
    if (!lead && descKz) {
      lead =
        splitBodyParagraphs(descKz)[0]?.trim() ?? descKz.trim()
    }
    const leadKz =
      mergedTitle || !descKz
        ? null
        : splitBodyParagraphs(descKz)[0]?.trim() ?? descKz

    if (!lead) {
      const parts = [
        typeof e.category === "string" ? e.category.trim() : "",
        typeof e.format === "string" ? e.format.trim() : "",
        typeof e.location === "string" ? e.location.trim() : "",
      ].filter(Boolean)
      lead = parts.join(" · ")
    }

    return eventToAfishaCard({
      id: e.id,
      slug: e.slug,
      posterUrl: e.posterUrl,
      startsAt: e.startsAt,
      timeDisplay: e.timeDisplay,
      timeDisplayKz: e.timeDisplayKz ?? null,
      title,
      titleKz,
      excerpt: lead,
      excerptKz: leadKz,
      ctaLabel: e.ctaLabel,
      ctaLabelKz: e.ctaLabelKz ?? null,
      ctaHref: e.ctaHref,
    })
  })
}
