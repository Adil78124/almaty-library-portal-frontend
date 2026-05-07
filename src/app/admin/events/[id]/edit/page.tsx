import { notFound } from "next/navigation"
import type { PublishStatus } from "@prisma/client"

import { EventForm, type SerializedEvent } from "@/components/admin/events/event-form"
import {
  getAdminSession,
  sessionCanAccessBranchResource,
} from "@/lib/auth/require-admin"
import { prisma } from "@/lib/prisma"

type Props = { params: Promise<{ id: string }> }

/** Поля мероприятия в БД; отдельно от Prisma Client, если generate ещё не прогоняли. */
type EventDbRow = {
  id: string
  slug: string
  titleRu: string
  titleKz: string | null
  descriptionRu: string
  descriptionKz: string | null
  posterUrl: string | null
  startsAt: Date | null
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
  featuredOnHome: boolean
  status: PublishStatus
  sortOrder: number
}

function serialize(row: EventDbRow): SerializedEvent {
  return {
    id: row.id,
    slug: row.slug,
    titleRu: row.titleRu,
    titleKz: row.titleKz,
    descriptionRu: row.descriptionRu,
    descriptionKz: row.descriptionKz,
    posterUrl: row.posterUrl,
    startsAt: row.startsAt?.toISOString() ?? null,
    timeDisplay: row.timeDisplay,
    timeDisplayKz: row.timeDisplayKz,
    format: row.format,
    formatKz: row.formatKz,
    category: row.category,
    categoryKz: row.categoryKz,
    location: row.location,
    locationKz: row.locationKz,
    ctaLabel: row.ctaLabel,
    ctaLabelKz: row.ctaLabelKz,
    featuredOnHome: row.featuredOnHome,
    status: row.status,
    sortOrder: row.sortOrder,
  }
}

export default async function AdminEventEditPage({ params }: Props) {
  const session = await getAdminSession()
  if (!session) notFound()

  const { id } = await params
  const row = await prisma.event.findUnique({ where: { id } })
  if (!row) notFound()
  if (
    !sessionCanAccessBranchResource(
      session,
      (row as { branchId: string | null }).branchId ?? null
    )
  ) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Редактировать мероприятие
        </h1>
      </div>
      <EventForm mode="edit" initial={serialize(row as EventDbRow)} />
    </div>
  )
}
