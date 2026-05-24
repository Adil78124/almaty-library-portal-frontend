import type { Event, Prisma, PublishStatus } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { safeDecodePathSegment } from "@/lib/url/safe-decode-path-segment"

const publishedWhere: Prisma.EventWhereInput = { status: "PUBLISHED" }

export async function listPublishedEvents(options?: {
  /** Будущие (startsAt >= now) */
  upcoming?: boolean
  /** Прошедшие (startsAt < now) */
  past?: boolean
  take?: number
  /** По умолчанию только глобальные мероприятия */
  branchId?: string | null
}): Promise<Event[]> {
  const now = new Date()
  const branchId =
    options?.branchId === undefined ? null : options.branchId
  const where: Prisma.EventWhereInput = {
    ...publishedWhere,
    branchId,
  }
  if (options?.upcoming) {
    where.startsAt = { gte: now }
  } else if (options?.past) {
    where.startsAt = { lt: now }
  }
  return prisma.event.findMany({
    where,
    orderBy: [{ startsAt: "asc" }, { updatedAt: "desc" }],
    take: options?.take,
  })
}

export async function findPublishedEventByPublicRef(
  ref: string
): Promise<Event | null> {
  const key = safeDecodePathSegment(ref)
  if (!key) return null

  const bySlug = await prisma.event.findFirst({
    where: { ...publishedWhere, slug: key },
  })
  if (bySlug) return bySlug

  return prisma.event.findFirst({
    where: { ...publishedWhere, id: key },
  })
}

export async function listEventsForAdmin(
  status?: PublishStatus
): Promise<Event[]> {
  return prisma.event.findMany({
    where: status ? { status } : {},
    orderBy: [{ startsAt: "desc" }, { updatedAt: "desc" }],
  })
}

/** Опубликованные глобальные мероприятия (страница /events главного сайта). */
export async function listAllPublishedEvents(): Promise<Event[]> {
  const where: Prisma.EventWhereInput = {
    ...publishedWhere,
    branchId: null,
  }
  return prisma.event.findMany({
    where,
    orderBy: [{ startsAt: "asc" }, { updatedAt: "desc" }],
  })
}

/**
 * Публичная выборка: глобальная афиша сети (без branchId / null) — только
 * предстоящие с датой. Для конкретного филиала — все опубликованные события
 * филиала (в т.ч. без даты или уже прошедшие), как у новостей на странице филиала.
 */
export async function listPublishedEventsPublic(options: {
  limit: number
  branchId?: string | null
}): Promise<Event[]> {
  const now = new Date()
  const branchFilter = options.branchId

  if (branchFilter === undefined || branchFilter === null) {
    const where: Prisma.EventWhereInput = {
      ...publishedWhere,
      startsAt: { not: null, gte: now },
      branchId: null,
    }
    const upcomingGlobal = await prisma.event.findMany({
      where,
      orderBy: [{ startsAt: "asc" }, { updatedAt: "desc" }],
      take: options.limit,
    })
    if (upcomingGlobal.length > 0) return upcomingGlobal

    return prisma.event.findMany({
      where: publishedWhere,
      orderBy: [{ startsAt: "desc" }, { updatedAt: "desc" }],
      take: options.limit,
    })
  }

  const where: Prisma.EventWhereInput = {
    ...publishedWhere,
    branchId: branchFilter,
  }
  return prisma.event.findMany({
    where,
    orderBy: [{ startsAt: "desc" }, { updatedAt: "desc" }],
    take: options.limit,
  })
}
