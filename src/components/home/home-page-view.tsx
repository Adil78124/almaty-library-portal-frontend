"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { useLocale } from "@/components/i18n/locale-provider"
import type { ELibraryBook, ResolvedHome } from "@/lib/cms/home/types"
import { L, pickDbField, pickLocalized } from "@/lib/i18n/app-locale"
import { localHistoryPublicPath } from "@/lib/local-history/public-path"
import { HomeCountersScript } from "@/app/home-counters-script"
import { HomeEventsBlock } from "@/components/home/home-events-block"
import { HomeLatestNewsBlock } from "@/components/home/home-latest-news-block"
import { fetchDigitalBooks } from "@/services/api"
import {
  parseYoutubeVideoId,
  youtubeThumbnailHq,
  youtubeWatchUrl,
} from "@/lib/youtube"

type Props = {
  data: ResolvedHome
}

type DigitalBookRow = {
  id: string
  titleRu: string
  titleKz: string
  authorRu: string
  authorKz: string
  imageUrl: string | null
  fileUrl: string | null
  externalUrl: string | null
  isActive: boolean
  order: number
}

/** Сброс клиентского состояния блоков при обновлении данных главной (SSR). */
function homeBlockListKey(prefix: string, items: unknown): string {
  return prefix + ":" + JSON.stringify(items)
}

/** Absolute http(s) links and same-origin paths stay as-is; bare hosts get https:// */
function outboundHref(href: string): string {
  const h = href.trim()
  if (!h) return "#"
  if (
    /^https?:\/\//i.test(h) ||
    h.startsWith("/") ||
    h.startsWith("#") ||
    h.startsWith("mailto:")
  ) {
    return h
  }
  if (h.startsWith("//")) return `https:${h}`
  return `https://${h}`
}

export function HomePageView({ data }: Props) {
  const { locale } = useLocale()
  const t = (v: Parameters<typeof pickLocalized>[0]) => pickLocalized(v, locale)

  // Подключаем витрину главной к данным из админки (/api/digital-books).
  // Если в БД пусто — используем содержимое CMS (data.eLibrary.books).
  const [dbELibBooks, setDbELibBooks] = useState<DigitalBookRow[] | null>(null)
  const [elibSettings, setElibSettings] = useState<{
    homeLimit: number
    homeAutoRefresh: boolean
    homePollSeconds: number | null
  } | null>(null)
  const [openVideoId, setOpenVideoId] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const [booksRes, settingsRes] = await Promise.allSettled([
        fetchDigitalBooks(true),
        fetch("/api/digital-library/display", { cache: "no-store" }),
      ])
      const booksR =
        booksRes.status === "fulfilled" ? booksRes.value : null
      const settingsR =
        settingsRes.status === "fulfilled" ? settingsRes.value : null
      const items = booksR && booksR.ok ? await booksR.json().catch(() => []) : []
      const settings =
        settingsR && settingsR.ok
          ? await settingsR
              .json()
              .catch(() => ({ homeLimit: 12, homeAutoRefresh: false, homePollSeconds: 60 }))
          : { homeLimit: 12, homeAutoRefresh: false, homePollSeconds: 60 }
      if (cancelled) return
      setDbELibBooks(Array.isArray(items) ? (items as DigitalBookRow[]) : [])
      setElibSettings(settings)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!elibSettings?.homeAutoRefresh) return
    const sec = Math.max(
      10,
      Math.min(3600, elibSettings.homePollSeconds ?? 60)
    )
    const id = window.setInterval(() => {
      fetchDigitalBooks(true)
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => [])
        .then((items) => {
          setDbELibBooks(Array.isArray(items) ? (items as DigitalBookRow[]) : [])
        })
    }, sec * 1000)
    return () => window.clearInterval(id)
  }, [elibSettings])

  const tickerLine = useMemo(() => {
    const sep = " • "
    const parts = data.ticker.items.map((item) =>
      pickDbField(item.text, item.textKz ?? null, locale)
    )
    return parts.join(sep) + (parts.length ? sep : "")
  }, [data.ticker.items, locale])
  const hasTicker = data.ticker.items.length > 0
  const hasStats = data.statistics.cards.length > 0
  const hasELib = (dbELibBooks?.length ?? 0) > 0 || data.eLibrary.books.length > 0
  const hasArrivals = data.newArrivals.books.length > 0
  const hasLocalHistory = data.localHistory.cards.length > 0
  const localHistoryDescription = (data.localHistory.description ?? "").trim()

  const eLibShowcaseBooks = useMemo(() => {
    if (dbELibBooks && dbELibBooks.length > 0) {
      const lim = Math.min(30, Math.max(1, elibSettings?.homeLimit ?? 12))
      return dbELibBooks
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .slice(0, lim)
        .map((b) => {
          const href = (b.externalUrl || b.fileUrl || "").trim()
          return {
            coverUrl: b.imageUrl ?? "",
            title: b.titleRu,
            titleKz: b.titleKz,
            author: b.authorRu,
            authorKz: b.authorKz,
            href,
          }
        })
    }
    return data.eLibrary.books.map((b: ELibraryBook) => ({
      ...b,
      href: "",
    }))
  }, [data.eLibrary.books, dbELibBooks, elibSettings])

  const galleryByPos = useMemo(() => {
    const out = new Map<number, { id: string; thumb: string; href: string }>()
    const items = Array.isArray(data.mediaGallery.videos)
      ? data.mediaGallery.videos
      : []
    for (const v of items) {
      const id = parseYoutubeVideoId(v.youtubeUrl)
      if (!id) continue
      out.set(v.position, {
        id,
        thumb: youtubeThumbnailHq(id),
        href: youtubeWatchUrl(id),
      })
    }
    return out
  }, [data.mediaGallery.videos])

  const mainVideo = galleryByPos.get(1) ?? null
  const sideVideos = [2, 3, 4, 5]
    .map((p) => galleryByPos.get(p) ?? null)
    .filter(Boolean) as { id: string; thumb: string; href: string }[]

  const hasGallery = Boolean(mainVideo) || sideVideos.length > 0
  const hasUsefulLinks = data.usefulLinks.links.length > 0
  const hasQuote =
    Boolean((data.quote.text ?? "").trim()) ||
    Boolean((data.quote.textKz ?? "").trim()) ||
    Boolean((data.quote.author ?? "").trim()) ||
    Boolean((data.quote.authorKz ?? "").trim())

  return (
    <div className="bg-surface text-on-surface flex flex-col min-h-screen overflow-x-hidden">
      <main className="pt-16">
        <section className="relative min-h-[min(100vh,620px)] sm:min-h-[520px] md:min-h-[580px] lg:min-h-[600px] flex items-start pt-20 sm:pt-24 md:pt-28 pb-16 sm:pb-20 md:pb-24 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00236f]/90 to-[#0058be]/40 z-10"></div>
            <img
              alt={pickDbField(
                data.hero.backgroundAlt,
                data.hero.backgroundAltKz ?? null,
                locale
              )}
              className="w-full h-full object-cover"
              src={data.hero.backgroundImageUrl}
            />
          </div>

          <div className="relative z-20 w-full flex flex-col text-white">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0">
              <div className="max-w-3xl min-w-0">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 sm:mb-6 leading-tight break-words whitespace-normal">
                  {pickDbField(
                    data.hero.titleLine1,
                    data.hero.titleLine1Kz ?? null,
                    locale
                  )}{" "}
                  <br />
                  <span className="break-words md:whitespace-normal lg:whitespace-nowrap">
                    {pickDbField(
                      data.hero.titleLine2,
                      data.hero.titleLine2Kz ?? null,
                      locale
                    )}
                  </span>
                </h1>

                {data.hero.subtitle ? (
                  <p className="text-base sm:text-lg text-white/90 font-medium mb-4 max-w-2xl leading-relaxed break-words whitespace-normal">
                    {pickDbField(
                      data.hero.subtitle ?? "",
                      data.hero.subtitleKz ?? null,
                      locale
                    )}
                  </p>
                ) : null}

                {hasQuote ? (
                  <p className="text-base sm:text-lg md:text-xl text-white/80 font-light mb-8 sm:mb-10 leading-relaxed break-words whitespace-normal">
                    {pickDbField(
                      data.quote.text ?? "",
                      data.quote.textKz ?? null,
                      locale
                    )}
                    {data.quote.author?.trim()
                      ? ` — ${pickDbField(
                          data.quote.author,
                          data.quote.authorKz ?? null,
                          locale
                        )}`
                      : ""}
                  </p>
                ) : null}
              </div>
            </div>

            {hasTicker ? (
              <div className="relative z-20 w-full max-w-full overflow-hidden border-y border-white/20 py-3 sm:py-4 mt-8 sm:mt-12">
                <div className="flex w-max animate-marquee gap-12">
                  <span className="text-sm font-medium tracking-widest uppercase whitespace-nowrap">
                    {tickerLine}
                  </span>
                  <span className="text-sm font-medium tracking-widest uppercase whitespace-nowrap">
                    {tickerLine}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {hasStats ? (
          <section className="relative -mt-12 sm:-mt-16 z-30 px-4 sm:px-6 lg:px-8">
            <div className="max-w-[1440px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 min-w-0">
              {data.statistics.cards.map((card, i) => (
                <div
                  key={`${card.label}-${i}`}
                  className="bg-surface-container-lowest p-5 sm:p-6 md:p-8 rounded-md shadow-[0_10px_30px_-5px_rgba(25,28,30,0.08)] group hover:bg-primary transition-all duration-300 min-w-0"
                >
                  <span className="material-symbols-outlined text-3xl sm:text-4xl text-primary mb-3 sm:mb-4 group-hover:text-white transition-colors">
                    {card.iconName}
                  </span>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-black text-on-surface mb-1 group-hover:text-white break-words">
                    {pickDbField(
                      card.valueText,
                      card.valueTextKz ?? null,
                      locale
                    )}
                  </div>
                  <div className="text-sm text-outline-variant font-medium group-hover:text-white/70 break-words whitespace-normal">
                    {pickDbField(card.label, card.labelKz ?? null, locale)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <HomeEventsBlock
          key={homeBlockListKey("afisha", data.afisha.items)}
          clientRefresh={data.afisha.clientRefresh}
          hasStatsAbove={hasStats}
          initialItems={data.afisha.items}
          kicker={data.afisha.kicker}
          kickerKz={data.afisha.kickerKz}
          title={data.afisha.title}
          titleKz={data.afisha.titleKz}
        />

        {hasELib ? (
        <section className="py-16 sm:py-20 md:py-24 bg-white relative overflow-x-hidden">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 min-w-0">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-on-surface tracking-tight mb-3 sm:mb-4 break-words whitespace-normal">
                {pickDbField(
                  data.eLibrary.title,
                  data.eLibrary.titleKz ?? null,
                  locale
                )}
              </h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto break-words whitespace-normal">
                {pickDbField(
                  data.eLibrary.description,
                  data.eLibrary.descriptionKz ?? null,
                  locale
                )}
              </p>
            </div>
            <div className="relative">
              <div className="scroll-smooth flex flex-nowrap gap-4 sm:gap-8 overflow-x-auto overflow-y-hidden pb-12 px-1 sm:px-4 no-scrollbar max-w-full">
                {eLibShowcaseBooks.map((book, i) => {
                  const title = pickDbField(book.title, book.titleKz ?? null, locale)
                  const author = pickDbField(book.author, book.authorKz ?? null, locale)
                  const href = (book.href ?? "").trim()
                  const outbound = /^https?:\/\//i.test(href) || href.startsWith("//")
                  const card = (
                    <div>
                      <div className="relative mb-6 transform group-hover:-translate-y-4 transition-transform duration-500">
                        <img
                          alt={title}
                          className="w-full aspect-[2/3] object-cover rounded-sm shadow-xl"
                          src={book.coverUrl}
                        />
                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-4xl">
                            menu_book
                          </span>
                        </div>
                      </div>
                      <h5 className="font-bold text-sm text-center line-clamp-2 break-words whitespace-normal">
                        {title}
                      </h5>
                      <p className="text-[10px] text-outline text-center uppercase tracking-widest mt-1 line-clamp-2 break-words whitespace-normal">
                        {author}
                      </p>
                    </div>
                  )

                  return href ? (
                    <a
                      key={`${book.title}-${i}`}
                      className="w-[min(11rem,calc(100vw-3rem))] sm:w-44 md:w-48 shrink-0 flex-none group cursor-pointer"
                      href={outboundHref(href)}
                      {...(outbound
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {card}
                    </a>
                  ) : (
                    <div
                      key={`${book.title}-${i}`}
                      className="w-[min(11rem,calc(100vw-3rem))] sm:w-44 md:w-48 shrink-0 flex-none group"
                    >
                      {card}
                    </div>
                  )
                })}
              </div>
              <div className="h-1 w-full bg-primary-fixed-dim absolute bottom-8 left-0 opacity-20"></div>
            </div>
            <div className="mt-8 sm:mt-12 text-center px-2">
              <Link
                className="inline-flex justify-center bg-primary text-white px-6 sm:px-10 py-4 sm:py-5 rounded-md font-black uppercase tracking-tighter text-xs sm:text-sm hover:bg-primary-container active:scale-95 transition-all max-w-full text-center"
                href={data.eLibrary.buttonHref}
              >
                {pickDbField(
                  data.eLibrary.buttonLabel,
                  data.eLibrary.buttonLabelKz ?? null,
                  locale
                )}
              </Link>
            </div>
          </div>
        </section>
        ) : null}

        <HomeLatestNewsBlock
          key={homeBlockListKey("news", data.latestNews.items)}
          clientRefresh={data.latestNews.clientRefresh}
          initialItems={data.latestNews.items}
          kicker={data.latestNews.kicker}
          kickerKz={data.latestNews.kickerKz}
          title={data.latestNews.title}
          titleKz={data.latestNews.titleKz}
        />

        {hasArrivals ? (
        <section className="py-16 sm:py-20 md:py-24 bg-surface-container-low overflow-x-hidden">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 min-w-0">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-on-surface tracking-tight mb-3 sm:mb-4 uppercase break-words whitespace-normal">
                {pickDbField(
                  data.newArrivals.title,
                  data.newArrivals.titleKz ?? null,
                  locale
                )}
              </h2>
              <p className="text-on-surface-variant mx-auto max-w-2xl break-words whitespace-normal line-clamp-6">
                {pickDbField(
                  data.newArrivals.subtitle,
                  data.newArrivals.subtitleKz ?? null,
                  locale
                )}
              </p>
            </div>
            <div className="scroll-smooth flex flex-nowrap gap-4 sm:gap-8 overflow-x-auto overflow-y-hidden pb-4 [-webkit-overflow-scrolling:touch] max-w-full -mx-1 px-1">
              {data.newArrivals.books.map((book, i) => {
                const href = book.detailHref?.trim() || "#"
                const resolvedHref = outboundHref(href)
                const external = /^https?:\/\//i.test(resolvedHref)
                return (
                  <a
                    key={`${book.title}-${i}`}
                    className="group flex w-40 shrink-0 flex-col items-center flex-none sm:w-44"
                    href={resolvedHref}
                    {...(external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    <div className="relative mb-4 aspect-[2/3] w-full transform overflow-hidden rounded-sm shadow-xl transition-transform duration-500 group-hover:-translate-y-4">
                      <img
                        alt=""
                        className="h-full w-full object-cover"
                        src={book.coverUrl}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/20 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="material-symbols-outlined text-4xl text-white">
                          menu_book
                        </span>
                      </div>
                    </div>
                    <h5 className="line-clamp-2 w-full break-words text-center text-sm font-bold whitespace-normal">
                      {pickDbField(book.title, book.titleKz ?? null, locale)}
                    </h5>
                    <p className="mt-1 line-clamp-2 w-full break-words text-center text-[10px] uppercase tracking-widest text-outline whitespace-normal">
                      {pickDbField(book.author, book.authorKz ?? null, locale)}
                    </p>
                  </a>
                )
              })}
            </div>
          </div>
        </section>
        ) : null}

        {hasLocalHistory ? (
        <section
          id="local-history"
          className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-surface-container scroll-mt-20 overflow-x-hidden"
        >
          <div className="max-w-[1440px] mx-auto min-w-0">
            <div className="mb-10 sm:mb-16 text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-on-surface break-words whitespace-normal">
                {pickDbField(
                  data.localHistory.title,
                  data.localHistory.titleKz ?? null,
                  locale
                )}
              </h2>
              {localHistoryDescription ? (
                <p className="text-on-surface-variant mx-auto mt-4 max-w-3xl text-sm leading-relaxed break-words whitespace-normal md:text-base">
                  {pickDbField(
                    localHistoryDescription,
                    data.localHistory.descriptionKz ?? null,
                    locale
                  )}
                </p>
              ) : null}
            </div>

            <div className="scroll-smooth flex flex-nowrap gap-4 sm:gap-8 overflow-x-auto overflow-y-hidden pb-4 [-webkit-overflow-scrolling:touch] max-w-full -mx-1 px-1">
              {data.localHistory.cards.map((c, i) => (
                <div
                  key={c.id ?? `${c.name}-${i}`}
                  className="flex min-h-[320px] sm:min-h-[380px] w-[min(100%,calc(100vw-2.5rem))] max-w-[280px] shrink-0 flex-none flex-col rounded-md border-b-4 border-transparent bg-surface-container-lowest p-5 sm:p-6 text-center transition-all group hover:border-primary"
                >
                  <div
                    className={`w-32 h-32 mx-auto rounded-full overflow-hidden mb-6 grayscale group-hover:grayscale-0 transition-all duration-500 ring-4 ring-surface ring-offset-2 shrink-0 ${!c.portraitUrl ? "bg-surface-container" : ""}`}
                  >
                    {c.portraitUrl ? (
                      <img
                        alt={pickDbField(c.name, c.nameKz ?? null, locale)}
                        className="w-full h-full object-cover"
                        src={c.portraitUrl}
                      />
                    ) : null}
                  </div>
                  <h4 className="mb-2 text-lg font-black break-words whitespace-normal line-clamp-3 shrink-0">
                    {pickDbField(c.name, c.nameKz ?? null, locale)}
                  </h4>
                  <p className="min-h-0 flex-1 text-sm leading-relaxed text-on-surface-variant break-words whitespace-normal line-clamp-4">
                    {pickDbField(c.excerpt, c.excerptKz ?? null, locale)}
                  </p>
                  {c.slug ? (
                    <div className="mt-auto flex w-full shrink-0 justify-center pt-4">
                      <Link
                        href={localHistoryPublicPath(c.slug)}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#00236f] px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#001a54]"
                      >
                        {t(L("Подробнее", "Толығырақ"))}
                        <span className="material-symbols-outlined text-[18px]">
                          east
                        </span>
                      </Link>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>
        ) : null}

        {hasGallery ? (
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
          <div className="max-w-[1440px] mx-auto min-w-0">
            <div className="mb-8 sm:mb-10 flex flex-col items-center justify-center gap-3 text-center">
              <h2 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight uppercase break-words whitespace-normal">
                {pickDbField(
                  data.mediaGallery.title,
                  data.mediaGallery.titleKz ?? null,
                  locale
                )}
              </h2>
            </div>
            <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
              {/* Left (1) */}
              <div className="w-full lg:w-[min(100%,420px)] xl:w-[min(100%,520px)] lg:shrink-0 flex items-center justify-center mx-auto lg:mx-0">
                {mainVideo ? (
                  <div className="relative w-full overflow-hidden rounded-md shadow-lg">
                    <button
                      type="button"
                      onClick={() => setOpenVideoId(mainVideo.id)}
                      className="group relative block w-full aspect-square outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <img
                        alt=""
                        className="block h-full w-full object-cover"
                        src={mainVideo.thumb}
                      />
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25">
                        <span className="material-symbols-outlined text-6xl text-white opacity-90 group-hover:opacity-100 transition-opacity">
                          play_circle
                        </span>
                      </div>
                    </button>
                    <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-surface-container-lowest">
                      <button
                        type="button"
                        className="text-sm font-bold text-primary hover:underline"
                        onClick={() => setOpenVideoId(mainVideo.id)}
                      >
                        {t(L("Смотреть на сайте", "Сайтта көру"))}
                      </button>
                      <a
                        className="text-sm font-bold text-on-surface-variant hover:underline"
                        href={mainVideo.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t(L("Смотреть на YouTube", "YouTube-та көру"))}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="w-full rounded-md border border-outline-variant/30 bg-surface-container-lowest p-6 text-sm text-on-surface-variant">
                    {t(L("Видео (позиция 1) не задано", "Бейне (1-позиция) жоқ"))}
                  </div>
                )}
              </div>

              {/* Right grid (2-5) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 flex-1 min-w-0">
                {([2, 3, 4, 5] as const).map((pos) => {
                  const v = galleryByPos.get(pos) ?? null
                  return v ? (
                    <div
                      key={`pos-${pos}`}
                      className="overflow-hidden rounded-md shadow-sm bg-surface-container-lowest"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenVideoId(v.id)}
                        className="group relative block w-full aspect-square outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <img
                          alt=""
                          className="block h-full w-full object-cover"
                          src={v.thumb}
                        />
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
                          <span className="material-symbols-outlined text-4xl text-white opacity-90">
                            play_circle
                          </span>
                        </div>
                      </button>
                      <div className="flex items-center justify-between gap-2 px-2 py-2">
                        <button
                          type="button"
                          className="text-xs font-bold text-primary hover:underline"
                          onClick={() => setOpenVideoId(v.id)}
                        >
                          {t(L("Смотреть", "Көру"))}
                        </button>
                        <a
                          className="text-xs font-bold text-on-surface-variant hover:underline"
                          href={v.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          YouTube
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={`pos-${pos}`}
                      className="rounded-md border border-outline-variant/30 bg-surface-container-lowest p-3 text-xs text-on-surface-variant"
                    >
                      {t(L("Не задано", "Жоқ"))}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
        ) : null}

        {hasUsefulLinks ? (
        <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-surface overflow-x-hidden">
          <div className="max-w-[1440px] mx-auto min-w-0">
            <div className="text-center mb-8 sm:mb-12">
              <span className="text-primary font-bold tracking-widest uppercase text-xs mb-2 block">
                {pickDbField(
                  data.usefulLinks.kicker,
                  data.usefulLinks.kickerKz ?? null,
                  locale
                )}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-on-surface tracking-tight uppercase break-words whitespace-normal">
                {pickDbField(
                  data.usefulLinks.title,
                  data.usefulLinks.titleKz ?? null,
                  locale
                )}
              </h2>
            </div>

            <div className="scroll-smooth flex flex-nowrap gap-4 sm:gap-6 overflow-x-auto overflow-y-hidden pb-2 [-webkit-overflow-scrolling:touch] max-w-full -mx-1 px-1">
              {data.usefulLinks.links.map((link, i) => (
                <a
                  key={`${link.href}-${i}`}
                  className="group flex min-h-[210px] w-[min(100%,calc(100vw-2.5rem))] max-w-[260px] shrink-0 flex-none flex-col items-center justify-center rounded-md border border-outline-variant/20 bg-surface-container-lowest p-5 sm:p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                  href={outboundHref(link.href)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.logoVariant === "round" ? (
                    <div className="w-24 h-24 mb-5 rounded-full bg-white flex items-center justify-center overflow-hidden">
                      <img
                        alt=""
                        className="w-20 h-20 object-contain"
                        src={link.logoUrl}
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-24 mb-5 bg-white flex items-center justify-center overflow-hidden rounded-md">
                      <img
                        alt=""
                        className="w-full h-full object-contain"
                        src={link.logoUrl}
                      />
                    </div>
                  )}
                  <h3 className="text-sm font-black leading-snug text-on-surface transition-colors group-hover:text-primary line-clamp-3 break-words whitespace-normal">
                    {pickDbField(
                      link.title,
                      link.titleKz ?? null,
                      locale
                    )}
                  </h3>
                </a>
              ))}
            </div>
          </div>
        </section>
        ) : null}
      </main>

      <p className="sr-only" aria-hidden>
        <span id="onlineCount">0</span>
        <span id="totalCount">0</span>
      </p>
      <HomeCountersScript />

      {openVideoId ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpenVideoId(null)
          }}
        >
          <div className="w-full max-w-4xl rounded-md bg-surface-container-lowest shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-outline-variant/30 p-3">
              <div className="text-sm font-bold text-on-surface">
                {t(L("Видео", "Бейне"))}
              </div>
              <div className="flex items-center gap-3">
                <a
                  className="text-sm font-bold text-primary hover:underline"
                  href={youtubeWatchUrl(openVideoId)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t(L("Смотреть на YouTube", "YouTube-та көру"))}
                </a>
                <button
                  type="button"
                  className="text-sm font-bold text-on-surface-variant hover:text-on-surface"
                  onClick={() => setOpenVideoId(null)}
                >
                  {t(L("Закрыть", "Жабу"))}
                </button>
              </div>
            </div>
            <div className="aspect-video bg-black">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${openVideoId}?autoplay=1&rel=0`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
