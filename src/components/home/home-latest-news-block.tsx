"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

import { useLocale } from "@/components/i18n/locale-provider"
import type { NewsItemManual } from "@/lib/cms/home/types"
import {
  mapNewsApiRowsToManual,
  type ApiNewsRow,
} from "@/lib/cms/home/map-from-public-api"
import { L, pickDbField, pickLocalized } from "@/lib/i18n/app-locale"
import { fetchPublishedNews } from "@/services/api"

type Props = {
  kicker: string
  kickerKz?: string | null
  title: string
  titleKz?: string | null
  initialItems: NewsItemManual[]
  clientRefresh?: {
    enabled: boolean
    intervalSec: number
    limit: number
  }
}

export function HomeLatestNewsBlock({
  kicker,
  kickerKz,
  title,
  titleKz,
  initialItems,
  clientRefresh,
}: Props) {
  const { locale } = useLocale()
  const t = (v: Parameters<typeof pickLocalized>[0]) => pickLocalized(v, locale)
  /**
   * SSR отдаёт `initialItems` — это базовый источник правды.
   * Клиентский polling — только улучшение: он может обновить список,
   * но никогда не должен "обнулить" блок и вызвать исчезновение после hydration.
   */
  const [items, setItems] = useState<NewsItemManual[] | null>(null)
  const shownItems = items ?? initialItems

  const fetchLatest = useCallback(async () => {
    if (!clientRefresh?.enabled) return
    const lim = clientRefresh.limit
    const res = await fetchPublishedNews(lim, "desc", locale)
    if (!res.ok) return
    const data = (await res.json()) as ApiNewsRow[]
    if (!Array.isArray(data)) return
    const mapped = mapNewsApiRowsToManual(data)
    // Не затираем SSR-данные пустым ответом — иначе блок "мигает" и исчезает.
    if (mapped.length === 0) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[home] /api/news returned empty array; keep previous items")
      }
      return
    }
    setItems(mapped)
  }, [clientRefresh, locale])

  useEffect(() => {
    if (!clientRefresh?.enabled) return
    void fetchLatest()
  }, [clientRefresh, fetchLatest])

  useEffect(() => {
    if (!clientRefresh?.enabled) return
    const sec = Math.max(
      10,
      Math.min(3600, clientRefresh.intervalSec || 60)
    )
    const id = window.setInterval(fetchLatest, sec * 1000)
    return () => window.clearInterval(id)
  }, [clientRefresh, fetchLatest])

  if (shownItems.length === 0) return null

  return (
    <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto min-w-0 overflow-x-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:justify-between sm:items-end mb-8 sm:mb-12">
        <div className="min-w-0">
          <span className="text-primary font-bold tracking-widest uppercase text-xs mb-2 block">
            {pickDbField(kicker, kickerKz ?? null, locale)}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-on-surface tracking-tight break-words whitespace-normal">
            {pickDbField(title, titleKz ?? null, locale)}
          </h2>
        </div>
        <Link
          className="text-primary font-bold hover:underline flex shrink-0 items-center gap-2 w-fit"
          href="/news"
        >
          {t(L("Все новости", "Барлық жаңалықтар"))}{" "}
          <span className="material-symbols-outlined">arrow_right_alt</span>
        </Link>
      </div>
      <div className="scroll-smooth flex flex-nowrap gap-4 sm:gap-8 overflow-x-auto overflow-y-hidden pb-4 snap-x snap-mandatory [-webkit-overflow-scrolling:touch] max-w-full -mx-1 px-1">
        {shownItems.map((article, i) => {
          const cardTitle = pickDbField(
            article.title,
            article.titleKz ?? null,
            locale
          )
          const cardExcerpt = pickDbField(
            article.excerpt,
            article.excerptKz ?? null,
            locale
          )
          return (
            <article
              key={`${article.href}-${i}`}
              className="flex w-[min(100%,calc(100vw-2.5rem))] max-w-[320px] shrink-0 snap-start flex-col overflow-hidden rounded-md bg-surface-container-lowest transition-shadow hover:shadow-xl group"
            >
              <div className="relative h-52 sm:h-64 shrink-0 overflow-hidden">
                <img
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  src={article.coverUrl}
                />
                <div className="absolute top-4 left-4 rounded bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm">
                  {article.dateLabel}
                </div>
              </div>
              <div className="flex flex-grow flex-col p-5 sm:p-6 md:p-8 min-w-0">
                <h3 className="text-xl font-bold text-on-surface mb-4 leading-tight transition-colors group-hover:text-primary line-clamp-3 break-words whitespace-normal">
                  {cardTitle}
                </h3>
                <p className="text-on-surface-variant mb-6 line-clamp-4 text-sm leading-relaxed break-words whitespace-normal">
                  {cardExcerpt}
                </p>
                <Link
                  className="mt-auto flex items-center gap-1 text-sm font-bold text-primary transition-all group-hover:gap-2"
                  href={article.href}
                >
                  {t(L("Подробнее", "Толығырақ"))}{" "}
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
