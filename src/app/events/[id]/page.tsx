import { cookies } from "next/headers"
import { notFound } from "next/navigation"

import SiteFooter from "@/components/SiteFooter"
import { EventDetailPublic } from "@/components/events/event-detail-public"
import {
  toEventDetailPayload,
} from "@/lib/events/event-public-payload"
import {
  appLocaleFromRequestValue,
  LOCALE_STORAGE_KEY,
} from "@/lib/i18n/app-locale"
import {
  findPublishedEventByPublicRef,
  listPublishedEvents,
} from "@/lib/events/repository"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ id: string }> }

export default async function EventDetailsPage({ params }: Props) {
  const { id: ref } = await params
  const row = await findPublishedEventByPublicRef(ref)
  if (!row) notFound()

  const othersRaw = await listPublishedEvents({
    upcoming: true,
    take: 8,
    branchId: row.branchId ?? null,
  })
  const others = othersRaw.filter((o) => o.id !== row.id)

  const jar = await cookies()
  const locale = appLocaleFromRequestValue(jar.get(LOCALE_STORAGE_KEY)?.value)

  return (
    <>
      <EventDetailPublic data={toEventDetailPayload(row, others, locale)} />
      <SiteFooter />
    </>
  )
}
