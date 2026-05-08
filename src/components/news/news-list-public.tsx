"use client"

import Link from "next/link"

import { useLocale } from "@/components/i18n/locale-provider"
import type { SimpleHeroData } from "@/lib/cms/simple-page/types"
import { L, pickDbField, pickLocalized } from "@/lib/i18n/app-locale"
import { NEWS_COVER_FALLBACK } from "@/lib/news/cover-fallback"
import { formatNewsListDate } from "@/lib/news/format-dates"
import type { NewsArticlePublicPayload } from "@/lib/news/public-payload"
import { newsArticlePublicPath } from "@/lib/news/public-path"
import { splitBodyParagraphs } from "@/lib/news/split-body"

type Props = {
  hero: SimpleHeroData
  items: NewsArticlePublicPayload[]
}

export function NewsListPublic({ hero, items }: Props) {
  const { locale } = useLocale()
  const home = pickLocalized(L("Главная", "Басты бет"), locale)
  const readMore = pickLocalized(L("Подробнее", "Толығырақ"), locale)
  const empty = pickLocalized(
    L("Пока нет опубликованных материалов.", "Әзірге жарияланған материалдар жоқ."),
    locale
  )
  const breadcrumb = pickDbField(
    hero.breadcrumbLabel,
    hero.breadcrumbLabelKz ?? null,
    locale
  )
  const title = pickDbField(hero.title, hero.titleKz ?? null, locale)
  const lead = pickDbField(hero.lead, hero.leadKz ?? null, locale)

  return (
    <>
      <section className="relative flex min-h-[260px] sm:min-h-[300px] md:h-[360px] w-full max-w-full items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            className="h-full w-full object-cover"
            alt={pickDbField(
              hero.backgroundImageAlt,
              hero.backgroundImageAltKz ?? null,
              locale
            )}
            src={hero.backgroundImageUrl}
          />
          {/* Один слой градиента (как на других страницах), чтобы не “забивать” картинку сплошным цветом */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/70 to-transparent" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-4 sm:mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium uppercase tracking-widest text-on-primary/70">
            <Link className="hover:text-on-primary" href="/">
              {home}
            </Link>
            <span className="material-symbols-outlined text-[10px]">
              chevron_right
            </span>
            <span className="text-on-primary">{breadcrumb}</span>
          </nav>
          <h1 className="mb-4 max-w-3xl text-3xl font-black tracking-tight text-on-primary sm:text-4xl md:text-5xl lg:text-6xl break-words">
            {title}
          </h1>
          <p className="max-w-2xl text-base sm:text-lg font-light leading-relaxed text-on-primary/80 md:text-xl break-words">
            {lead}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 pt-8 sm:pt-12 min-w-0">
        {items.length === 0 ? (
          <p className="text-on-surface-variant">{empty}</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((a) => {
              const cardTitle = a.title
              const cardExcerpt =
                splitBodyParagraphs(a.description)[0]?.trim() ?? ""
              return (
                <div
                  key={a.id}
                  className="group flex flex-col overflow-hidden rounded-md bg-surface-container-lowest transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      alt={cardTitle}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src={a.coverImageUrl ?? NEWS_COVER_FALLBACK}
                    />
                  </div>
                  <div className="flex flex-grow flex-col p-6">
                    <span className="mb-3 text-xs font-bold text-secondary">
                      {formatNewsListDate(a.publishedAt, locale).toUpperCase()}
                    </span>
                    <h3 className="mb-3 text-xl font-bold leading-tight transition-colors group-hover:text-primary break-words">
                      {cardTitle}
                    </h3>
                    {cardExcerpt ? (
                      <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-on-surface-variant">
                        {cardExcerpt}
                      </p>
                    ) : null}
                    <div className="mt-auto">
                      <Link
                        className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary transition-all hover:gap-3"
                        href={newsArticlePublicPath(a)}
                      >
                        {readMore}{" "}
                        <span className="material-symbols-outlined text-sm">
                          east
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
