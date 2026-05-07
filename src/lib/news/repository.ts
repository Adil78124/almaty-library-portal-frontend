import type { NewsArticle, Prisma, PublishStatus } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { safeDecodePathSegment } from "@/lib/url/safe-decode-path-segment"

export {
  formatNewsCardDateUpper,
  formatNewsListCardDate,
  formatNewsListDate,
} from "@/lib/news/format-dates"
export { splitBodyParagraphs } from "@/lib/news/split-body"

const publishedWhere: Prisma.NewsArticleWhereInput = {
  status: "PUBLISHED",
  publishedAt: { not: null },
}

/** Только глобальные материалы (главный сайт, /news). */
export async function listPublishedNews(): Promise<NewsArticle[]> {
  const where: Prisma.NewsArticleWhereInput = {
    ...publishedWhere,
    branchId: null,
  }
  return prisma.newsArticle.findMany({
    where,
    orderBy: { publishedAt: "desc" },
  })
}

/**
 * Публичная выборка: глобальные (branchId null) или конкретный филиал.
 * По умолчанию — только глобальные.
 */
export async function listPublishedNewsPublic(options?: {
  limit?: number
  /** true — по дате создания (новые сверху); false — по publishedAt */
  orderByCreatedAt?: boolean
  /** Не задано → глобальные. Иначе id филиала. */
  branchId?: string | null
}): Promise<NewsArticle[]> {
  const orderByCreated = options?.orderByCreatedAt ?? false
  const branchId =
    options?.branchId === undefined ? null : options.branchId
  const where: Prisma.NewsArticleWhereInput = {
    ...publishedWhere,
    branchId,
  }
  return prisma.newsArticle.findMany({
    where,
    orderBy: orderByCreated
      ? { createdAt: "desc" }
      : { publishedAt: "desc" },
    take: options?.limit,
  })
}

export async function listNewsForAdmin(
  status?: PublishStatus
): Promise<NewsArticle[]> {
  return prisma.newsArticle.findMany({
    where: status ? { status } : {},
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
  })
}

export async function findNewsById(id: string): Promise<NewsArticle | null> {
  return prisma.newsArticle.findUnique({ where: { id } })
}

export async function findNewsBySlug(slug: string): Promise<NewsArticle | null> {
  return prisma.newsArticle.findUnique({ where: { slug } })
}

export async function findPublishedBySlug(
  slug: string
): Promise<NewsArticle | null> {
  return prisma.newsArticle.findFirst({
    where: { ...publishedWhere, slug },
  })
}

/**
 * Детальная страница: сегмент URL может быть slug или id (cuid).
 * Сначала ищем по slug, затем по id — старые ссылки и кодирование остаются рабочими.
 */
export async function findPublishedByPublicRef(
  ref: string
): Promise<NewsArticle | null> {
  const key = safeDecodePathSegment(ref)
  if (!key) return null

  const bySlug = await prisma.newsArticle.findFirst({
    where: { ...publishedWhere, slug: key },
  })
  if (bySlug) return bySlug

  return prisma.newsArticle.findFirst({
    where: { ...publishedWhere, id: key },
  })
}

export async function findOtherPublishedNews(
  excludeId: string,
  take = 4,
  /** Тот же scope, что и у текущей статьи (глобальная или филиал). */
  branchId: string | null = null
): Promise<NewsArticle[]> {
  const where: Prisma.NewsArticleWhereInput = {
    ...publishedWhere,
    id: { not: excludeId },
    branchId,
  }
  return prisma.newsArticle.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    take,
  })
}
