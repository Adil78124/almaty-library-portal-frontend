"use client"

import Link from "next/link"

import { useLocale } from "@/components/i18n/locale-provider"
import { L, pickDbField, pickLocalized } from "@/lib/i18n/app-locale"
import { NEWS_COVER_FALLBACK } from "@/lib/news/cover-fallback"
import { formatNewsListDate } from "@/lib/news/format-dates"
import type { NewsArticlePublicPayload } from "@/lib/news/public-payload"
import { newsArticlePublicPath } from "@/lib/news/public-path"
import { splitBodyParagraphs } from "@/lib/news/split-body"

type Props = {
  article: NewsArticlePublicPayload
  others: NewsArticlePublicPayload[]
}

export function NewsArticlePublic({ article, others }: Props) {
  const { locale } = useLocale()
  const t = (v: Parameters<typeof pickLocalized>[0]) => pickLocalized(v, locale)
  const home = pickLocalized(L("Главная", "Басты бет"), locale)
  const newsList = pickLocalized(L("Новости", "Жаңалықтар"), locale)
  const readMore = pickLocalized(L("Подробнее", "Толығырақ"), locale)
  const detailsTitle = pickLocalized(
    L("Детали события", "Іс-шара мәліметтері"),
    locale
  )
  const placeLabel = pickLocalized(L("Место", "Орын"), locale)
  const curatorLabel = pickLocalized(
    L("Куратор / контакт", "Куратор / байланыс"),
    locale
  )
  const otherTitle = pickLocalized(L("Другие новости", "Басқа жаңалықтар"), locale)
  const allNews = pickLocalized(L("Все новости", "Барлық жаңалықтар"), locale)

  const title = article.title
  const descParas = splitBodyParagraphs(article.description)
  const excerpt = descParas.length > 1 ? descParas[0] : ""
  const paragraphs =
    descParas.length > 1 ? descParas.slice(1) : descParas
  const dateLabel = formatNewsListDate(article.publishedAt, locale)

  return (
    <>
      <section className="max-w-5xl mx-auto px-8 pt-24 pb-4">
        <nav className="flex items-center gap-2 text-on-surface-variant text-sm font-label tracking-wide flex-wrap">
          <Link className="hover:text-primary transition-colors" href="/">
            {home}
          </Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link className="hover:text-primary transition-colors" href="/news">
            {newsList}
          </Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-on-surface font-medium truncate max-w-[min(100%,280px)] sm:max-w-xl">
            {title}
          </span>
        </nav>
      </section>

      <article className="max-w-5xl mx-auto px-8 mb-16">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-on-surface leading-tight mb-4">
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-on-surface-variant text-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">
                calendar_today
              </span>
              <span>{dateLabel}</span>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          <div className="relative aspect-[16/9] overflow-hidden rounded-md shadow-[0_20px_50px_rgba(0,35,111,0.1)]">
            <img
              alt={title}
              className="w-full h-full object-cover"
              src={article.coverImageUrl ?? NEWS_COVER_FALLBACK}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_250px] gap-12 items-start">
            <div className="space-y-6 text-on-surface leading-relaxed text-lg font-body">
              {excerpt ? (
                <p className="font-medium text-xl text-on-surface-variant">
                  {excerpt}
                </p>
              ) : null}
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {article.location || article.curator ? (
              <aside className="sticky top-24 space-y-8">
                <div className="p-6 bg-surface-container-low rounded-md">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">
                    {detailsTitle}
                  </h3>
                  <div className="space-y-4">
                    {article.location ? (
                      <div>
                        <span className="text-xs text-on-surface-variant block mb-1">
                          {placeLabel}
                        </span>
                        <span className="text-sm font-medium">
                          {article.location}
                        </span>
                      </div>
                    ) : null}
                    {article.curator ? (
                      <div>
                        <span className="text-xs text-on-surface-variant block mb-1">
                          {curatorLabel}
                        </span>
                        <span className="text-sm font-medium">
                          {article.curator}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </aside>
            ) : null}
          </div>
        </div>
      </article>

      <section className="bg-surface-container-low py-16">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-end mb-10 gap-4 flex-wrap">
            <h2 className="text-3xl font-bold text-on-surface">{otherTitle}</h2>
            <Link
              className="text-primary font-semibold flex items-center gap-2 hover:translate-x-1 transition-transform"
              href="/news"
            >
              {allNews}{" "}
              <span className="material-symbols-outlined">arrow_right_alt</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {others.map((rec) => {
              const recTitle = rec.title
              return (
                <div
                  key={rec.id}
                  className="group bg-surface-container-lowest rounded-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      alt={recTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={rec.coverImageUrl ?? NEWS_COVER_FALLBACK}
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <span className="text-xs font-bold text-secondary mb-3">
                      {formatNewsListDate(rec.publishedAt, locale).toUpperCase()}
                    </span>
                    <h3 className="text-xl font-bold leading-tight mb-4 group-hover:text-primary transition-colors">
                      {recTitle}
                    </h3>
                    <div className="mt-auto">
                      <Link
                        className="inline-flex items-center text-sm font-bold text-primary uppercase tracking-widest hover:gap-3 gap-2 transition-all"
                        href={newsArticlePublicPath(rec)}
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
        </div>
      </section>
    </>
  )
}
