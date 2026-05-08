"use client"

import Link from "next/link"

import { useLocale } from "@/components/i18n/locale-provider"
import { L, pickDbField, pickLocalized } from "@/lib/i18n/app-locale"
import { EVENT_POSTER_FALLBACK } from "@/lib/events/poster-fallback"
import { eventPublicPath } from "@/lib/events/public-path"
import type { EventDetailPublicPayload } from "@/lib/events/event-public-payload"
import { splitBodyParagraphs } from "@/lib/news/split-body"
import { formatNewsListDate } from "@/lib/news/format-dates"

type Props = { data: EventDetailPublicPayload }

export function EventDetailPublic({ data }: Props) {
  const { locale } = useLocale()
  const t = (v: Parameters<typeof pickLocalized>[0]) => pickLocalized(v, locale)
  const dash = t(L("—", "—"))

  const title = data.title
  const excerpt = data.excerpt
  const body = data.body
  const paragraphs = splitBodyParagraphs(body)
  const dateLabel = data.startsAt
    ? formatNewsListDate(data.startsAt, locale)
    : ""
  const timeLabel = pickDbField(
    (data.timeDisplay ?? "").trim(),
    (data.timeDisplayKz ?? "").trim() || null,
    locale
  )
  const posterSrc = data.posterUrl?.trim() || EVENT_POSTER_FALLBACK

  return (
    <div className="bg-surface font-body text-on-surface antialiased overflow-x-hidden">
      <main className="flex-grow min-w-0">
        <section className="relative min-h-[min(85vh,520px)] sm:min-h-[450px] md:h-[450px] flex items-end pb-10 sm:pb-14 md:pb-16 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              alt={title}
              className="w-full h-full object-cover"
              src={posterSrc}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent"></div>
          </div>
          <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0">
            <nav className="flex mb-6 text-on-primary-container/70 text-sm font-label tracking-wide uppercase flex-wrap gap-y-1">
              <Link className="hover:text-white transition-colors" href="/">
                {t(L("Главная", "Басты бет"))}
              </Link>
              <span className="mx-2">/</span>
              <Link className="hover:text-white transition-colors" href="/events">
                {t(L("Мероприятия", "Іс-шаралар"))}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white truncate max-w-[min(100%,280px)] sm:max-w-xl">
                {title}
              </span>
            </nav>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter mb-3 sm:mb-4 max-w-4xl leading-tight break-words">
              {title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-on-primary-container max-w-2xl font-light leading-relaxed break-words">
              {excerpt}
            </p>
          </div>
        </section>

        <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-8">
              <div className="rounded-xl overflow-hidden mb-10 shadow-lg">
                <img
                  alt={title}
                  className="w-full h-auto aspect-video object-cover"
                  src={posterSrc}
                />
              </div>
              <div className="space-y-6 text-on-surface-variant text-lg leading-relaxed">
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-24 xl:top-28 bg-surface-container-lowest rounded-xl p-5 sm:p-6 md:p-8 shadow-[0_10px_30px_-5px_rgba(25,28,30,0.08)] border border-outline-variant/10 min-w-0">
                <h3 className="text-xl font-bold text-primary mb-6">
                  {t(L("Детали встречи", "Кездесу мәліметтері"))}
                </h3>
                <div className="space-y-6 mb-8">
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-secondary text-2xl">
                      calendar_today
                    </span>
                    <div>
                      <p className="text-sm font-label text-on-surface-variant uppercase tracking-wider">
                        {t(L("Дата", "Күні"))}
                      </p>
                      <p className="text-lg font-semibold">{dateLabel || dash}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-secondary text-2xl">
                      schedule
                    </span>
                    <div>
                      <p className="text-sm font-label text-on-surface-variant uppercase tracking-wider">
                        {t(L("Время", "Уақыты"))}
                      </p>
                      <p className="text-lg font-semibold">{timeLabel || dash}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-secondary text-2xl">
                      location_on
                    </span>
                    <div>
                      <p className="text-sm font-label text-on-surface-variant uppercase tracking-wider">
                        {t(L("Место проведения", "Өткізілетін орын"))}
                      </p>
                      <p className="text-lg font-semibold">
                        {data.location?.trim()
                          ? pickDbField(
                              data.location.trim(),
                              (data.locationKz ?? "").trim() || null,
                              locale
                            )
                          : dash}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-secondary text-2xl">
                      hub
                    </span>
                    <div>
                      <p className="text-sm font-label text-on-surface-variant uppercase tracking-wider">
                        {t(L("Формат", "Формат"))}
                      </p>
                      <p className="text-lg font-semibold">
                        {data.format?.trim()
                          ? pickDbField(
                              data.format.trim(),
                              (data.formatKz ?? "").trim() || null,
                              locale
                            )
                          : dash}
                      </p>
                    </div>
                  </div>
                </div>
                <Link
                  className="w-full py-4 bg-primary text-white font-bold rounded-lg hover:bg-primary-container transition-all active:scale-95 shadow-md text-center block"
                  href="/contacts"
                >
                  {t(
                    L(
                      "Связаться с организатором",
                      "Ұйымдастырушымен байланысу"
                    )
                  )}
                </Link>
                <p className="text-center mt-4 text-xs text-on-surface-variant/70">
                  {t(
                    L(
                      "Регистрация не требуется, вход свободный для владельцев читательских билетов.",
                      "Тіркелу қажет емес, оқу билеті бар оқырмандарға кіру еркін."
                    )
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-low py-20">
          <div className="max-w-screen-2xl mx-auto px-8">
            <div className="flex justify-between items-end mb-12 gap-4 flex-wrap">
              <h2 className="text-3xl font-black text-primary tracking-tight">
                {t(L("Другие мероприятия", "Басқа іс-шаралар"))}
              </h2>
              <Link
                className="text-secondary font-semibold hover:underline underline-offset-4"
                href="/events"
              >
                {t(L("Все события", "Барлық іс-шаралар"))}
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {data.others
                .filter((o) => o.id !== data.id)
                .slice(0, 3)
                .map((o) => {
                  const d = o.startsAt
                    ? formatNewsListDate(o.startsAt, locale)
                    : ""
                  const ot = o.title
                  const ox = o.excerpt
                  const otherPoster = o.posterUrl?.trim() || EVENT_POSTER_FALLBACK
                  return (
                    <Link
                      key={o.id}
                      className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow block"
                      href={eventPublicPath(o)}
                    >
                      <div className="h-48 overflow-hidden">
                        <img
                          alt={ot}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          src={otherPoster}
                        />
                      </div>
                      <div className="p-6">
                        <p className="text-secondary font-label text-xs uppercase tracking-widest mb-2">
                          {d || dash}
                        </p>
                        <h4 className="text-lg font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">
                          {ot}
                        </h4>
                        <p className="text-sm text-on-surface-variant line-clamp-2">
                          {ox}
                        </p>
                      </div>
                    </Link>
                  )
                })}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
