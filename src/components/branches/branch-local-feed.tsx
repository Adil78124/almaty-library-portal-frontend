"use client"

import Link from "next/link"
import type { Event, NewsArticle } from "@prisma/client"

import { useLocale } from "@/components/i18n/locale-provider"
import type { BranchDetailViewModel } from "@/lib/branch-row"
import { eventToAfishaCard, formatAfishaTimeLine } from "@/lib/events/home-afisha-card"
import { L, pickDbField, pickLocalized } from "@/lib/i18n/app-locale"
import { NEWS_COVER_FALLBACK } from "@/lib/news/cover-fallback"
import { formatNewsListDate } from "@/lib/news/format-dates"
import { newsArticlePublicPath } from "@/lib/news/public-path"
import { splitBodyParagraphs } from "@/lib/news/split-body"

type Props = {
  branch: BranchDetailViewModel
  newsRows: NewsArticle[]
  eventRows: Event[]
}

export function BranchLocalFeed({ branch, newsRows, eventRows }: Props) {
  const { locale } = useLocale()
  const t = (v: Parameters<typeof pickLocalized>[0]) => pickLocalized(v, locale)
  const branchName = pickDbField(branch.titleRu, branch.titleKz, locale)
  const afishaItems = eventRows.map((e) => {
    const descRu = e.descriptionRu ?? ""
    const descKz = e.descriptionKz ?? null
    const leadRu = splitBodyParagraphs(descRu)[0]?.trim() ?? descRu.trim()
    const leadKz =
      descKz == null ? null : (splitBodyParagraphs(descKz)[0]?.trim() ?? descKz.trim())
    return eventToAfishaCard({
      id: e.id,
      slug: e.slug,
      posterUrl: e.posterUrl,
      startsAt: e.startsAt,
      timeDisplay: e.timeDisplay,
      timeDisplayKz: e.timeDisplayKz ?? null,
      title: e.titleRu,
      titleKz: e.titleKz ?? null,
      excerpt: leadRu,
      excerptKz: leadKz,
      ctaLabel: e.ctaLabel,
      ctaLabelKz: e.ctaLabelKz ?? null,
      ctaHref: e.ctaHref,
    })
  })

  return (
    <>
      <section className="bg-surface px-8 py-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-primary">
                {branchName}
              </span>
              <h2 className="text-3xl font-black tracking-tight text-on-surface">
                {t(L("Новости филиала", "Филиал жаңалықтары"))}
              </h2>
            </div>
            <Link
              className="flex shrink-0 items-center gap-2 font-bold text-primary hover:underline"
              href="/news"
            >
              {t(L("Все новости сети", "Желінің барлық жаңалықтары"))}
              <span className="material-symbols-outlined text-sm">arrow_right_alt</span>
            </Link>
          </div>
          {newsRows.length === 0 ? (
            <p className="text-on-surface-variant text-sm">
              {t(
                L(
                  "Пока нет опубликованных новостей этого филиала.",
                  "Бұл филиалдың әзірге жарияланған жаңалықтары жоқ."
                )
              )}
            </p>
          ) : (
            <div className="scroll-smooth flex flex-nowrap gap-8 overflow-x-auto pb-4 snap-x snap-mandatory [-webkit-overflow-scrolling:touch]">
              {newsRows.map((a) => (
                <article
                  key={a.id}
                  className="group flex w-[min(100%,320px)] shrink-0 snap-start flex-col overflow-hidden rounded-md bg-surface-container-lowest transition-shadow hover:shadow-xl"
                >
                  <div className="relative h-64 shrink-0 overflow-hidden">
                    <img
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src={a.coverImageUrl?.trim() || NEWS_COVER_FALLBACK}
                    />
                    <div className="absolute left-4 top-4 rounded bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm">
                      {formatNewsListDate(a.publishedAt, locale)}
                    </div>
                  </div>
                  <div className="flex flex-grow flex-col p-8">
                    <h3 className="mb-4 line-clamp-3 text-xl font-bold leading-tight text-on-surface transition-colors group-hover:text-primary">
                      {pickDbField(a.titleRu, a.titleKz, locale)}
                    </h3>
                    <p className="mb-6 line-clamp-4 text-sm leading-relaxed text-on-surface-variant">
                      {splitBodyParagraphs(
                        pickDbField(a.descriptionRu, a.descriptionKz ?? null, locale)
                      )[0]?.trim() ??
                        pickDbField(a.descriptionRu, a.descriptionKz ?? null, locale).trim()}
                    </p>
                    <Link
                      className="mt-auto flex items-center gap-1 text-sm font-bold text-primary transition-all group-hover:gap-2"
                      href={newsArticlePublicPath(a)}
                    >
                      {t(L("Подробнее", "Толығырақ"))}
                      <span className="material-symbols-outlined text-sm">
                        arrow_forward
                      </span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-surface-container-low px-8 py-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#00236f]">
                {branchName}
              </span>
              <h2 className="text-3xl font-black tracking-tight text-on-surface">
                {t(L("Афиша филиала", "Филиал афишасы"))}
              </h2>
            </div>
            <Link
              className="flex shrink-0 items-center gap-2 font-bold text-[#00236f] hover:underline"
              href="/events"
            >
              {t(L("Мероприятия сети", "Желінің іс-шаралары"))}
              <span className="material-symbols-outlined text-sm">arrow_right_alt</span>
            </Link>
          </div>
          {afishaItems.length === 0 ? (
            <p className="text-on-surface-variant text-sm">
              {t(
                L(
                  "Пока нет опубликованных мероприятий этого филиала (проверьте статус «Опубликовано» в админке).",
                  "Бұл филиалдың әзірге жарияланған іс-шаралары жоқ («Жарияланған» күйін админкада тексеріңіз)."
                )
              )}
            </p>
          ) : (
            <div className="scroll-smooth flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory">
              {afishaItems.map((ev, idx) => {
                const timeLineShown = formatAfishaTimeLine(
                  ev.rawTimeDisplay,
                  ev.startsAtIso,
                  locale,
                  ev.rawTimeDisplayKz
                )
                const evTitle = pickDbField(ev.title, ev.titleKz ?? null, locale)
                const evExcerpt = pickDbField(ev.excerpt, ev.excerptKz ?? null, locale)
                const ctaShown = pickDbField(
                  ev.ctaLabel,
                  ev.ctaLabelKz ?? null,
                  locale
                )
                return (
                  <div
                    key={`${ev.ctaHref}-${idx}`}
                    className="flex w-[320px] shrink-0 snap-start flex-col gap-4"
                  >
                    <div className="w-[320px] shrink-0 overflow-hidden rounded-xl shadow-2xl group">
                      <div className="relative aspect-[9/16] w-full">
                        <img
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          src={ev.posterUrl}
                        />
                      </div>
                    </div>
                    <div className="flex w-[320px] shrink-0 flex-1 flex-col rounded-xl bg-surface-container-lowest p-8 shadow-[0_10px_30px_-5px_rgba(25,28,30,0.08)]">
                      <div className="mb-4">
                        <span className="block text-4xl font-black leading-none text-on-surface">
                          {ev.dayNum}
                        </span>
                        <span className="text-sm font-bold uppercase tracking-widest text-[#00236f]">
                          {timeLineShown}
                        </span>
                      </div>
                      <h3 className="mb-3 line-clamp-2 text-2xl font-black leading-tight text-on-surface">
                        {evTitle}
                      </h3>
                      <p className="mb-6 line-clamp-2 text-sm text-on-surface-variant">
                        {evExcerpt}
                      </p>
                      <div className="mt-auto">
                        <Link
                          className="inline-block w-fit rounded-md bg-[#00236f] px-6 py-3 text-xs font-bold uppercase tracking-tighter text-white transition-all hover:bg-[#00236f]/90"
                          href={ev.ctaHref}
                        >
                          {ctaShown}
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
