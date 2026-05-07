"use client"

import Link from "next/link"

import { useLocale } from "@/components/i18n/locale-provider"
import { L, pickDbField, pickLocalized } from "@/lib/i18n/app-locale"
import type { LocalHistoryCardPayload } from "@/lib/local-history/repository"
import { localHistoryPublicPath } from "@/lib/local-history/public-path"
import { splitBodyParagraphs } from "@/lib/news/split-body"

type Props = {
  current: LocalHistoryCardPayload
  others: LocalHistoryCardPayload[]
  sectionTitle: string
  sectionTitleKz: string | null
}

export function LocalHistoryArticlePublic({
  current,
  others,
  sectionTitle,
  sectionTitleKz,
}: Props) {
  const { locale } = useLocale()
  const t = (v: Parameters<typeof pickLocalized>[0]) => pickLocalized(v, locale)

  const home = pickLocalized(L("Главная", "Басты бет"), locale)
  const readMore = pickLocalized(L("Подробнее", "Толығырақ"), locale)
  const otherTitle = pickLocalized(
    L("Другие материалы", "Басқа материалдар"),
    locale
  )
  const allOnHome = pickLocalized(
    L("Все на главной", "Барлығы басты бетте"),
    locale
  )
  const aboutBlock = pickLocalized(L("О материале", "Материал туралы"), locale)
  const backToBlock = pickLocalized(
    L("К блоку на главной", "Басты беттегі блокқа"),
    locale
  )

  const title = pickDbField(current.name, current.nameKz ?? null, locale)
  const body = pickDbField(current.excerpt, current.excerptKz ?? null, locale)
  const descParas = splitBodyParagraphs(body)
  const excerpt = descParas.length > 1 ? descParas[0] : ""
  const paragraphs = descParas.length > 1 ? descParas.slice(1) : descParas

  const coverSrc = current.portraitUrl?.trim() || null

  return (
    <>
      <section className="max-w-5xl mx-auto px-8 pt-24 pb-4">
        <nav className="flex items-center gap-2 text-on-surface-variant text-sm font-label tracking-wide flex-wrap">
          <Link className="hover:text-primary transition-colors" href="/">
            {home}
          </Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link
            className="hover:text-primary transition-colors"
            href="/#local-history"
          >
            {pickDbField(sectionTitle, sectionTitleKz, locale)}
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
              <span className="material-symbols-outlined text-lg">menu_book</span>
              <span>
                {pickLocalized(
                  L("Краеведение · юбиляры 2026", "Өңіртану · 2026 мерейтойлары"),
                  locale
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          <div className="relative aspect-[16/9] overflow-hidden rounded-md shadow-[0_20px_50px_rgba(0,35,111,0.1)] bg-surface-container-low">
            {coverSrc ? (
              <img
                alt={title}
                className="w-full h-full object-cover object-top"
                src={coverSrc}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-outline">
                <span className="material-symbols-outlined text-7xl">
                  account_circle
                </span>
              </div>
            )}
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

            <aside className="sticky top-24 space-y-8">
              <div className="p-6 bg-surface-container-low rounded-md">
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">
                  {aboutBlock}
                </h3>
                <p className="text-sm font-medium text-on-surface">
                  {pickDbField(sectionTitle, sectionTitleKz, locale)}
                </p>
                <Link
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all"
                  href="/#local-history"
                >
                  {backToBlock}
                  <span className="material-symbols-outlined text-sm">north</span>
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </article>

      {others.length > 0 ? (
        <section className="bg-surface-container-low py-16">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex justify-between items-end mb-10 gap-4 flex-wrap">
              <h2 className="text-3xl font-bold text-on-surface">{otherTitle}</h2>
              <Link
                className="text-primary font-semibold flex items-center gap-2 hover:translate-x-1 transition-transform"
                href="/#local-history"
              >
                {allOnHome}{" "}
                <span className="material-symbols-outlined">arrow_right_alt</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {others.filter((rec) => rec.slug).map((rec) => {
                const recTitle = pickDbField(rec.name, rec.nameKz ?? null, locale)
                return (
                  <div
                    key={rec.id}
                    className="group bg-surface-container-lowest rounded-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col"
                  >
                    <div className="h-48 overflow-hidden bg-surface-container-low">
                      {rec.portraitUrl ? (
                        <img
                          alt={recTitle}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                          src={rec.portraitUrl}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-outline">
                          <span className="material-symbols-outlined text-5xl">
                            person
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold leading-tight mb-4 group-hover:text-primary transition-colors line-clamp-3">
                        {recTitle}
                      </h3>
                      <p className="text-sm text-on-surface-variant line-clamp-3 mb-4 flex-grow">
                        {pickDbField(rec.excerpt, rec.excerptKz ?? null, locale)}
                      </p>
                      <div className="mt-auto">
                        <Link
                          className="inline-flex items-center text-sm font-bold text-primary uppercase tracking-widest hover:gap-3 gap-2 transition-all"
                          href={localHistoryPublicPath(rec.slug!)}
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
      ) : null}
    </>
  )
}
