import { notFound } from "next/navigation"
import type { HomePublishStatus, Prisma } from "@prisma/client"

import {
  HomePublicationRequestsClient,
  type HomePublicationRequest,
  type HomePublicationRequestFilter,
} from "@/components/admin/home-publication-requests-client"
import {
  getAdminSession,
  sessionIsSuperAdmin,
} from "@/lib/auth/require-admin"
import { prisma } from "@/lib/prisma"

function excerpt(text: string): string {
  return (
    text
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean)[0]
      ?.slice(0, 220) ?? ""
  )
}

function parseFilter(value: unknown): HomePublicationRequestFilter {
  const raw = Array.isArray(value) ? value[0] : value
  if (raw === "all" || raw === "approved" || raw === "rejected") return raw
  return "pending"
}

function statusForFilter(
  filter: HomePublicationRequestFilter
): HomePublishStatus | undefined {
  if (filter === "pending") return "PENDING"
  if (filter === "approved") return "APPROVED"
  if (filter === "rejected") return "REJECTED"
  return undefined
}

export default async function HomePublicationRequestsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await getAdminSession()
  if (!session || !sessionIsSuperAdmin(session)) {
    notFound()
  }

  const sp = (await searchParams) ?? {}
  const activeFilter = parseFilter(sp.status)
  const filteredStatus = statusForFilter(activeFilter)
  const newsWhere: Prisma.NewsArticleWhereInput = {
    branchId: { not: null },
    homePublishStatus: filteredStatus ?? { not: null },
  }
  const eventsWhere: Prisma.EventWhereInput = {
    branchId: { not: null },
    homePublishStatus: filteredStatus ?? { not: null },
  }

  const [newsRows, eventRows] = await Promise.all([
    prisma.newsArticle.findMany({
      where: newsWhere,
      include: { branch: true },
      orderBy: [{ homePublishRequestedAt: "desc" }, { updatedAt: "desc" }],
    }),
    prisma.event.findMany({
      where: eventsWhere,
      include: { branch: true },
      orderBy: [{ homePublishRequestedAt: "desc" }, { updatedAt: "desc" }],
    }),
  ])

  const items: HomePublicationRequest[] = [
    ...newsRows.map((row): HomePublicationRequest => ({
      id: row.id,
      kind: "news",
      title: row.titleRu,
      branchTitle: row.branch?.titleRu ?? "Филиал",
      createdAt: row.createdAt.toISOString(),
      updatedAt: (row.homePublishRequestedAt ?? row.updatedAt).toISOString(),
      status: row.homePublishStatus ?? "PENDING",
      rejectReason: row.homePublishRejectReason,
      excerpt: excerpt(row.descriptionRu),
      imageUrl: row.coverImageUrl,
      href: `/admin/news/${row.id}/edit`,
    })),
    ...eventRows.map((row): HomePublicationRequest => ({
      id: row.id,
      kind: "event",
      title: row.titleRu,
      branchTitle: row.branch?.titleRu ?? "Филиал",
      createdAt: row.createdAt.toISOString(),
      updatedAt: (row.homePublishRequestedAt ?? row.updatedAt).toISOString(),
      status: row.homePublishStatus ?? "PENDING",
      rejectReason: row.homePublishRejectReason,
      excerpt: excerpt(row.descriptionRu),
      imageUrl: row.posterUrl,
      href: `/admin/events/${row.id}/edit`,
    })),
  ].sort((a, b) => {
    if (a.status === "PENDING" && b.status !== "PENDING") return -1
    if (a.status !== "PENDING" && b.status === "PENDING") return 1
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Заявки на главную
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
          Новости и мероприятия филиалов появляются на главной странице только
          после одобрения. Отклонение не удаляет материал и не скрывает его со
          страницы филиала.
        </p>
      </div>
      <HomePublicationRequestsClient
        items={items}
        activeFilter={activeFilter}
      />
    </div>
  )
}
