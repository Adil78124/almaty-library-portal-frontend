"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import { useLocale } from "@/components/i18n/locale-provider"
import type { SimpleHeroData } from "@/lib/cms/simple-page/types"
import { EVENT_POSTER_FALLBACK } from "@/lib/events/poster-fallback"
import { eventPublicPath } from "@/lib/events/public-path"
import type { AppLocale } from "@/lib/i18n/app-locale"
import { L, pickDbField, pickLocalized } from "@/lib/i18n/app-locale"

export type SerializedEventCard = {
  id: string
  slug: string
  title: string
  titleKz: string | null
  excerpt: string
  excerptKz: string | null
  posterUrl: string | null
  startsAt: string | null
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
}

export type NewsTeaser = {
  id: string
  title: string
  titleKz: string | null
  href: string
  publishedAt: string | null
}

function toLocalYMD(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function formatLongFromYMD(ymd: string, lang: AppLocale): string {
  const [y, m, d] = ymd.split("-").map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.toLocaleDateString(lang === "kz" ? "kk-KZ" : "ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/** Пн = 0 … Вс = 6 */
function mondayIndex(d: Date): number {
  const dow = d.getDay()
  return dow === 0 ? 6 : dow - 1
}

function buildCalendarCells(year: number, monthIndex: number): (number | null)[] {
  const first = new Date(year, monthIndex, 1)
  const lead = mondayIndex(first)
  const lastDay = new Date(year, monthIndex + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < lead; i++) cells.push(null)
  for (let d = 1; d <= lastDay; d++) cells.push(d)
  return cells
}

type Props = {
  hero: SimpleHeroData
  events: SerializedEventCard[]
  newsTeasers: NewsTeaser[]
}

export default function EventsPageClient({ hero, events, newsTeasers }: Props) {
  const { locale } = useLocale()
  const t = (v: Parameters<typeof pickLocalized>[0]) => pickLocalized(v, locale)
  const intlLocale = locale === "kz" ? "kk-KZ" : "ru-RU"
  const now = useMemo(() => new Date(), [])
  const [viewMonth, setViewMonth] = useState(() => ({
    y: now.getFullYear(),
    m: now.getMonth(),
  }))
  const [selectedYmd, setSelectedYmd] = useState<string | null>(null)
  const [visible, setVisible] = useState(6)
  const [archiveOpen, setArchiveOpen] = useState(false)

  const upcoming = useMemo(() => {
    return events
      .filter((e) => {
        if (!e.startsAt) return true
        return new Date(e.startsAt) >= now
      })
      .sort((a, b) => {
        if (!a.startsAt && !b.startsAt) return 0
        if (!a.startsAt) return 1
        if (!b.startsAt) return -1
        return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
      })
  }, [events, now])

  const archive = useMemo(() => {
    return events
      .filter((e) => e.startsAt && new Date(e.startsAt) < now)
      .sort((a, b) => {
        const ta = new Date(a.startsAt!).getTime()
        const tb = new Date(b.startsAt!).getTime()
        return tb - ta
      })
  }, [events, now])

  const datesWithEvents = useMemo(() => {
    const s = new Set<string>()
    for (const e of events) {
      const ymd = toLocalYMD(e.startsAt)
      if (ymd) s.add(ymd)
    }
    return s
  }, [events])

  const nearest = useMemo(() => {
    return events
      .filter((e) => e.startsAt && new Date(e.startsAt) >= now)
      .sort(
        (a, b) =>
          new Date(a.startsAt!).getTime() - new Date(b.startsAt!).getTime()
      )
      .slice(0, 5)
  }, [events, now])

  const filteredList = useMemo(() => {
    if (!selectedYmd) return upcoming
    return events
      .filter((e) => toLocalYMD(e.startsAt) === selectedYmd)
      .sort((a, b) => {
        if (!a.startsAt && !b.startsAt) return 0
        if (!a.startsAt) return 1
        if (!b.startsAt) return -1
        return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
      })
  }, [events, upcoming, selectedYmd])

  const cells = buildCalendarCells(viewMonth.y, viewMonth.m)
  const monthTitle = useMemo(() => {
    const d = new Date(viewMonth.y, viewMonth.m, 1)
    return d.toLocaleDateString(intlLocale, {
      month: "long",
      year: "numeric",
    })
  }, [viewMonth.y, viewMonth.m, intlLocale])

  const wkShortLabels = useMemo(() => {
    return [0, 1, 2, 3, 4, 5, 6].map((i) => {
      const d = new Date(2024, 0, 1 + i)
      return d.toLocaleDateString(intlLocale, { weekday: "short" })
    })
  }, [intlLocale])

  function shiftMonth(delta: number) {
    setViewMonth(({ y, m }) => {
      const d = new Date(y, m + delta, 1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })
  }

  function onDayClick(day: number) {
    const ymd = `${viewMonth.y}-${String(viewMonth.m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    setSelectedYmd((prev) => (prev === ymd ? null : ymd))
    setVisible(6)
  }

  const shown = filteredList.slice(0, visible)
  const listHeading = selectedYmd
    ? `${t(L("События на", "Іс-шаралар"))} ${formatLongFromYMD(selectedYmd, locale)}`
    : t(L("Предстоящие события", "Алдағы іс-шаралар"))

  function renderEventCard(e: SerializedEventCard) {
    const cardTitle = pickDbField(e.title, e.titleKz, locale)
    const cardExcerpt = pickDbField(e.excerpt, e.excerptKz, locale)
    const rawCat = (e.category || e.format || "").trim()
    const rawCatKz = (e.categoryKz || e.formatKz || "").trim()
    const cat = rawCat
      ? pickDbField(rawCat, rawCatKz || null, locale)
      : t(L("Событие", "Іс-шара"))
    const dateLabel = e.startsAt
      ? new Date(e.startsAt).toLocaleDateString(intlLocale, {
          day: "numeric",
          month: "long",
        })
      : ""
    const timeLabel = pickDbField(
      (e.timeDisplay || "").trim(),
      (e.timeDisplayKz || "").trim() || null,
      locale
    )
    const when = [dateLabel, timeLabel].filter(Boolean).join(", ")
    return (
      <div
        key={e.id}
        className="group bg-surface-container-lowest rounded-xl overflow-hidden hover:shadow-xl transition-all duration-500 flex flex-col"
      >
        <div className="relative h-64 overflow-hidden">
          <img
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            alt=""
            src={e.posterUrl?.trim() || EVENT_POSTER_FALLBACK}
          />
          <div className="absolute top-4 left-4 bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {cat}
          </div>
        </div>
        <div className="p-8 flex-1 flex flex-col">
          <div className="flex items-center text-secondary text-sm font-semibold mb-3">
            <span className="material-symbols-outlined text-sm mr-2">
              calendar_today
            </span>
            <span>{when || t(L("—", "—"))}</span>
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-4 group-hover:text-primary transition-colors leading-tight">
            {cardTitle}
          </h3>
          <p className="text-on-surface-variant text-sm leading-relaxed mb-6 flex-1">
            {cardExcerpt}
          </p>
          <Link
            className="w-full py-3 border border-outline-variant text-primary font-bold rounded-lg hover:bg-primary hover:text-on-primary transition-all text-center"
            href={eventPublicPath(e)}
          >
            {t(L("Подробнее", "Толығырақ"))}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <section className="relative left-1/2 right-1/2 mb-10 flex h-[360px] w-screen -ml-[50vw] -mr-[50vw] items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover"
            alt={pickDbField(
              hero.backgroundImageAlt,
              hero.backgroundImageAltKz ?? null,
              locale
            )}
            src={hero.backgroundImageUrl}
          />
          <div className="absolute inset-0 bg-primary/80 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-transparent opacity-90"></div>
        </div>
        <div className="relative z-10 max-w-screen-2xl mx-auto px-8 w-full">
          <nav className="flex items-center space-x-2 text-on-primary/70 text-sm mb-6 uppercase tracking-widest font-medium">
            <Link className="hover:text-on-primary" href="/">
              {t(L("Главная", "Басты бет"))}
            </Link>
            <span className="material-symbols-outlined text-[10px]">
              chevron_right
            </span>
            <span className="text-on-primary">
              {pickDbField(
                hero.breadcrumbLabel,
                hero.breadcrumbLabelKz ?? null,
                locale
              )}
            </span>
          </nav>
          <h1 className="text-5xl md:text-6xl font-bold text-on-primary tracking-tighter mb-4 max-w-3xl">
            {pickDbField(hero.title, hero.titleKz ?? null, locale)}
          </h1>
          <p className="text-xl text-on-primary/80 max-w-2xl font-light leading-relaxed">
            {pickDbField(hero.lead, hero.leadKz ?? null, locale)}
          </p>
        </div>
      </section>

      <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-surface-container-low rounded-xl p-8">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <h2 className="text-2xl font-bold tracking-tight text-primary">
                {t(L("Календарь", "Күнтізбе"))}
              </h2>
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  className="p-2 hover:bg-surface-container rounded-full transition-colors"
                  aria-label={t(L("Предыдущий месяц", "Алдыңғы ай"))}
                  onClick={() => shiftMonth(-1)}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="text-lg font-bold px-2 min-w-[10rem] text-center">
                  {monthTitle}
                </span>
                <button
                  type="button"
                  className="p-2 hover:bg-surface-container rounded-full transition-colors"
                  aria-label={t(L("Следующий месяц", "Келесі ай"))}
                  onClick={() => shiftMonth(1)}
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              {wkShortLabels.map((d, i) => (
                <div
                  key={`cal-wd-${i}`}
                  className="text-outline-variant text-xs font-bold uppercase pb-2"
                >
                  {d}
                </div>
              ))}
              {cells.map((day, i) => {
                if (day === null) {
                  return (
                    <div
                      key={`e-${i}`}
                      className="h-11 rounded-lg bg-surface-container-lowest/40"
                    />
                  )
                }
                const ymd = `${viewMonth.y}-${String(viewMonth.m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                const hasEvent = datesWithEvents.has(ymd)
                const selected = selectedYmd === ymd
                return (
                  <button
                    key={ymd}
                    type="button"
                    onClick={() => onDayClick(day)}
                    className={[
                      "h-11 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-colors",
                      selected
                        ? "bg-primary text-on-primary font-bold ring-2 ring-primary/40"
                        : "bg-surface-container-lowest hover:bg-surface-container font-medium",
                    ].join(" ")}
                  >
                    <span>{day}</span>
                    {hasEvent ? (
                      <span className="w-4 h-1 rounded-full bg-primary/80 block" />
                    ) : (
                      <span className="h-1 block" aria-hidden />
                    )}
                  </button>
                )
              })}
            </div>
            {selectedYmd ? (
              <button
                type="button"
                className="mt-4 text-sm font-semibold text-primary hover:underline"
                onClick={() => setSelectedYmd(null)}
              >
                {t(L("Показать все предстоящие", "Барлық алдағыны көрсету"))}
              </button>
            ) : null}
          </div>

          <div>
            <h2 className="text-3xl font-bold tracking-tight text-primary mb-8">
              {listHeading}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {shown.map(renderEventCard)}
            </div>
            {shown.length === 0 ? (
              <p className="text-on-surface-variant mt-6">
                {t(L("На эту дату мероприятий нет.", "Бұл күнге іс-шара жоқ."))}
              </p>
            ) : null}
            {visible < filteredList.length ? (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  className="px-8 py-3 rounded-lg font-bold border border-outline-variant text-primary hover:bg-primary hover:text-on-primary transition-colors"
                  onClick={() => setVisible((v) => v + 6)}
                >
                  {t(L("Показать ещё", "Тағы көрсету"))}
                </button>
              </div>
            ) : null}
          </div>

          <div className="pt-4">
            <button
              type="button"
              className="w-full sm:w-auto px-8 py-4 rounded-lg font-bold bg-surface-container-high text-on-surface-variant hover:bg-surface-variant transition-colors flex items-center justify-center gap-2 mx-auto sm:mx-0"
              onClick={() => setArchiveOpen(true)}
            >
              <span className="material-symbols-outlined text-xl">archive</span>
              {t(L("Архив мероприятий", "Іс-шаралар мұрағаты"))}
            </button>
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-10">
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-outline uppercase tracking-wider">
              {t(L("Ближайшие события", "Жақын іс-шаралар"))}
            </h4>
            <div className="space-y-4">
              {nearest.length === 0 ? (
                <p className="text-on-surface-variant text-sm">
                  {t(L("Нет запланированных дат.", "Жоспарланған күндер жоқ."))}
                </p>
              ) : (
                nearest.map((e) => {
                  const line = e.startsAt
                    ? new Date(e.startsAt).toLocaleDateString(intlLocale, {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""
                  return (
                    <Link
                      key={e.id}
                      className="block p-4 rounded-lg hover:bg-surface-container-high transition-colors group"
                      href={eventPublicPath(e)}
                    >
                      <div className="text-secondary text-xs font-bold mb-1">
                        {line}
                      </div>
                      <div className="text-on-surface font-semibold group-hover:text-primary">
                        {pickDbField(e.title, e.titleKz, locale)}
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          </div>

          {newsTeasers.length > 0 ? (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-outline uppercase tracking-wider">
                {t(L("Последние новости", "Соңғы жаңалықтар"))}
              </h4>
              <ul className="space-y-3">
                {newsTeasers.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={n.href}
                      className="block p-3 rounded-lg hover:bg-surface-container-high transition-colors group"
                    >
                      {n.publishedAt ? (
                        <div className="text-secondary text-xs font-bold mb-1">
                          {new Date(n.publishedAt).toLocaleDateString(intlLocale)}
                        </div>
                      ) : null}
                      <div className="text-on-surface text-sm font-semibold group-hover:text-primary leading-snug">
                        {pickDbField(n.title, n.titleKz, locale)}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="bg-primary p-8 rounded-xl text-on-primary">
            <h4 className="text-xl font-bold mb-4">
              {t(L("Вход свободный", "Кіру еркін"))}
            </h4>
            <p className="text-on-primary/80 text-sm leading-relaxed">
              {t(
                L(
                  "Большинство наших мероприятий бесплатны для посещения при наличии читательского билета.",
                  "Біздің іс-шараларымыздың көпшілігі оқу билеті болғанда тегін өтеді."
                )
              )}
            </p>
          </div>
        </aside>
      </div>

      {archiveOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="archive-title"
          onClick={() => setArchiveOpen(false)}
        >
          <div
            className="bg-surface-container-lowest rounded-xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col shadow-xl"
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-outline-variant/30">
              <h2
                id="archive-title"
                className="text-lg font-bold text-on-surface"
              >
                {t(L("Архив мероприятий", "Іс-шаралар мұрағаты"))}
              </h2>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-surface-container"
                aria-label={t(L("Закрыть", "Жабу"))}
                onClick={() => setArchiveOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-3">
              {archive.length === 0 ? (
                <p className="text-on-surface-variant text-sm">
                  {t(L("Пока нет прошедших мероприятий.", "Өткен іс-шаралар әлі жоқ."))}
                </p>
              ) : (
                archive.map((e) => {
                  const dl = e.startsAt
                    ? new Date(e.startsAt).toLocaleDateString(intlLocale, {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : t(L("—", "—"))
                  return (
                    <Link
                      key={e.id}
                      href={eventPublicPath(e)}
                      className="block py-2 border-b border-outline-variant/20 last:border-0 hover:text-primary"
                      onClick={() => setArchiveOpen(false)}
                    >
                      <div className="text-xs text-outline mb-0.5">{dl}</div>
                      <div className="font-medium text-on-surface">
                        {pickDbField(e.title, e.titleKz, locale)}
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
