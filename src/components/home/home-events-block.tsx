"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

import { useLocale } from "@/components/i18n/locale-provider"
import type { AfishaItemManual } from "@/lib/cms/home/types"
import {
  mapEventApiRowsToAfisha,
  type ApiEventRow,
} from "@/lib/cms/home/map-from-public-api"
import { formatAfishaTimeLine } from "@/lib/events/home-afisha-card"
import { L, pickDbField, pickLocalized } from "@/lib/i18n/app-locale"
import { fetchPublishedEventsHome } from "@/services/api"

type Props = {
  kicker: string
  kickerKz?: string | null
  title: string
  titleKz?: string | null
  initialItems: AfishaItemManual[]
  hasStatsAbove: boolean
  clientRefresh?: {
    enabled: boolean
    intervalSec: number
    limit: number
  }
}

export function HomeEventsBlock({
  kicker,
  kickerKz,
  title,
  titleKz,
  initialItems,
  hasStatsAbove,
  clientRefresh,
}: Props) {
  const { locale } = useLocale()
  const t = (v: Parameters<typeof pickLocalized>[0]) => pickLocalized(v, locale)
  /**
   * SSR отдаёт `initialItems` — это базовый источник правды.
   * Клиентский polling — только улучшение и не должен очищать блок после hydration.
   */
  const [items, setItems] = useState<AfishaItemManual[] | null>(null)
  const shownItems = items ?? initialItems

  const fetchEvents = useCallback(async () => {
    if (!clientRefresh?.enabled) return
    const lim = clientRefresh.limit
    const res = await fetchPublishedEventsHome(lim, locale)
    if (!res.ok) return
    const data = (await res.json()) as ApiEventRow[]
    if (!Array.isArray(data)) return
    const mapped = mapEventApiRowsToAfisha(data)
    // Не затираем SSR-данные пустым ответом — иначе блок "мигает" и исчезает.
    if (mapped.length === 0) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[home] /api/events returned empty array; keep previous items")
      }
      return
    }
    setItems(mapped)
  }, [clientRefresh, locale])

  useEffect(() => {
    if (!clientRefresh?.enabled) return
    void fetchEvents()
  }, [clientRefresh, fetchEvents])

  useEffect(() => {
    if (!clientRefresh?.enabled) return
    const sec = Math.max(
      10,
      Math.min(3600, clientRefresh.intervalSec || 60)
    )
    const id = window.setInterval(fetchEvents, sec * 1000)
    return () => window.clearInterval(id)
  }, [clientRefresh, fetchEvents])

  if (shownItems.length === 0) return null

  return (
    <section
      className={`py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 overflow-x-hidden bg-surface-container-low ${
        hasStatsAbove ? "" : "relative -mt-16 z-30"
      }`}
    >
      <div className="max-w-[1440px] mx-auto min-w-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end mb-8 sm:mb-12">
          <div className="min-w-0">
            <span className="text-[#00236f] font-bold tracking-widest uppercase text-xs mb-2 block">
              {pickDbField(kicker, kickerKz ?? null, locale)}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-on-surface tracking-tight break-words whitespace-normal">
              {pickDbField(title, titleKz ?? null, locale)}
            </h2>
          </div>
          <Link
            className="text-[#00236f] font-bold hover:underline flex shrink-0 items-center gap-2 w-fit"
            href="/events"
          >
            {t(L("Все мероприятия", "Барлық іс-шаралар"))}{" "}
            <span className="material-symbols-outlined">arrow_right_alt</span>
          </Link>
        </div>
        <div className="scroll-smooth flex gap-4 sm:gap-6 overflow-x-auto overflow-y-hidden pb-8 snap-x snap-mandatory no-scrollbar -mx-1 px-1 max-w-full">
          {shownItems.map((ev, idx) => {
            const evTitle = pickDbField(ev.title, ev.titleKz ?? null, locale)
            const evExcerpt = pickDbField(ev.excerpt, ev.excerptKz ?? null, locale)
            const timeLineShown = formatAfishaTimeLine(
              ev.rawTimeDisplay,
              ev.startsAtIso,
              locale,
              ev.rawTimeDisplayKz
            )
            return (
            <div
              key={`${ev.ctaHref}-${idx}`}
              className="flex-none w-[min(100%,calc(100vw-2rem))] max-w-[420px] sm:max-w-[320px] shrink-0 snap-start flex flex-col"
            >
              <div className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_22px_56px_-28px_rgba(25,28,30,0.55)] sm:hidden">
                <div className="mx-3 mt-3 aspect-[4/5] overflow-hidden rounded-xl bg-surface-container">
                  <img
                    alt=""
                    className="h-full w-full object-cover"
                    src={ev.posterUrl}
                  />
                </div>
                <div className="flex min-w-0 flex-col px-5 pb-6 pt-5">
                  <div className="flex min-w-0 items-baseline gap-2 text-[#00236f]">
                    <span className="shrink-0 text-4xl font-black leading-none">
                      {ev.dayNum}
                    </span>
                    <span className="min-w-0 text-[11px] font-black uppercase leading-tight tracking-widest text-[#00236f]/80 line-clamp-1">
                      {timeLineShown}
                    </span>
                  </div>
                  <h3 className="mt-4 text-[19px] font-black leading-[1.08] text-on-surface line-clamp-2 break-words">
                    {evTitle}
                  </h3>
                  <p className="mt-3 text-[13px] leading-5 text-on-surface-variant line-clamp-1 break-words">
                    {evExcerpt}
                  </p>
                  <Link
                    className="mt-5 inline-flex max-w-full w-fit items-center justify-center rounded-md bg-[#00236f] px-4 py-2 text-center text-[11px] font-black uppercase leading-tight tracking-tight text-white transition-colors hover:bg-[#00236f]/90"
                    href={ev.ctaHref}
                  >
                    {pickDbField(
                      ev.ctaLabel,
                      ev.ctaLabelKz ?? null,
                      locale
                    )}
                  </Link>
                </div>
              </div>
              <div className="hidden w-full shrink-0 overflow-hidden rounded-xl shadow-2xl group sm:block">
                <div className="relative w-full aspect-[9/16] bg-surface-container">
                  <img
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    src={ev.posterUrl}
                  />
                </div>
              </div>
              <div className="hidden w-full shrink-0 rounded-xl bg-surface-container-lowest p-5 sm:mt-4 sm:flex sm:p-6 md:p-8 shadow-[0_10px_30px_-5px_rgba(25,28,30,0.08)] flex-col flex-1 min-w-0">
                <div className="mb-4">
                  <span className="text-3xl sm:text-4xl font-black leading-none block text-on-surface">
                    {ev.dayNum}
                  </span>
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#00236f] break-words">
                    {timeLineShown}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black mb-3 leading-tight line-clamp-2 text-on-surface break-words whitespace-normal">
                  {evTitle}
                </h3>
                <p className="text-on-surface-variant text-sm mb-6 line-clamp-2 break-words whitespace-normal">
                  {evExcerpt}
                </p>
                <div className="mt-auto">
                  <Link
                    className="bg-[#00236f] text-white py-3 px-6 rounded-md font-bold text-xs w-fit uppercase tracking-tighter hover:bg-[#00236f]/90 transition-all inline-block"
                    href={ev.ctaHref}
                  >
                    {pickDbField(
                      ev.ctaLabel,
                      ev.ctaLabelKz ?? null,
                      locale
                    )}
                  </Link>
                </div>
              </div>
            </div>
          )
          })}
        </div>
      </div>
    </section>
  )
}
