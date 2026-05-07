import type { NewsArticle } from "@prisma/client"

import type { AppLocale } from "@/lib/i18n/app-locale"
import { pickDbField } from "@/lib/i18n/app-locale"

/** Поля новости для клиентского UI (даты — ISO-строки после сериализации RSC). */
export type NewsArticlePublicPayload = {
  id: string
  slug: string
  title: string
  description: string
  coverImageUrl: string | null
  publishedAt: string | null
  location: string
  curator: string
  branchId: string | null
}

export function toNewsArticlePublicPayload(
  a: NewsArticle,
  locale: AppLocale
): NewsArticlePublicPayload {
  return {
    id: a.id,
    slug: a.slug,
    title: pickDbField(a.titleRu, a.titleKz ?? null, locale),
    description: pickDbField(a.descriptionRu, a.descriptionKz ?? null, locale),
    coverImageUrl: a.coverImageUrl ?? null,
    publishedAt: a.publishedAt?.toISOString() ?? null,
    location: pickDbField(
      a.location ?? "",
      a.locationKz ?? null,
      locale
    ),
    curator: pickDbField(
      a.curator ?? "",
      a.curatorKz ?? null,
      locale
    ),
    branchId: a.branchId ?? null,
  }
}
