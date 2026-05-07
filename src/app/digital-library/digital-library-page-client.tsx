"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { useLocale } from "@/components/i18n/locale-provider"
import { pickLocalized } from "@/lib/i18n/app-locale"
import type { ResolvedDigitalLibraryPage } from "@/lib/cms/digital-library/types"
import { fetchDigitalBooks, fetchPopularBooks } from "@/services/api"

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

type PopularBookRow = {
  id: string
  titleRu: string
  titleKz: string
  authorRu: string
  authorKz: string
  imageUrl: string | null
  externalUrl: string
  isActive: boolean
  order: number
}

const BOOK_IMG_PLACEHOLDER =
  "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=80"

type Props = {
  cms: ResolvedDigitalLibraryPage
}

function toneClasses(tone: ResolvedDigitalLibraryPage["bento"]["cards"][number]["tone"]) {
  if (tone === "secondaryFixed") {
    return {
      iconWrap: "bg-secondary-fixed text-primary",
    }
  }
  if (tone === "tertiaryFixed") {
    return {
      iconWrap: "bg-tertiary-fixed text-tertiary",
    }
  }
  if (tone === "primaryFixed") {
    return {
      iconWrap: "bg-primary-fixed text-primary",
    }
  }
  return {
    iconWrap: "bg-secondary-container/10 text-secondary",
  }
}

export default function DigitalLibraryPageClient({ cms }: Props) {
  const { locale } = useLocale()
  const t = (v: Parameters<typeof pickLocalized>[0]) => pickLocalized(v, locale)

  const [books, setBooks] = useState<DigitalBookRow[] | null>(null)
  const [popular, setPopular] = useState<PopularBookRow[] | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetchDigitalBooks(true)
        .then((r) => r.json())
        .catch(() => []),
      fetchPopularBooks(true)
        .then((r) => r.json())
        .catch(() => []),
    ]).then(([b, p]) => {
      if (cancelled) return
      setBooks(Array.isArray(b) ? b : [])
      setPopular(Array.isArray(p) ? p : [])
    })
    return () => {
      cancelled = true
    }
  }, [])

  const sortedBooks = useMemo(() => {
    return (books ?? []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }, [books])
  const sortedPopular = useMemo(() => {
    return (popular ?? []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }, [popular])

  function openExternal(url: string) {
    const u = url.trim()
    if (!u) return
    window.open(u, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="bg-surface text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
      <main className="pt-[72px]">
        {/* Hero Section */}
        <section className="relative h-[360px] flex items-center bg-primary overflow-hidden">
          <div className="absolute inset-0 opacity-40">
            <img
              className="w-full h-full object-cover"
              alt={t(cms.hero.backgroundImageAlt)}
              src={cms.hero.backgroundImageUrl}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent"></div>
          <div className="relative max-w-screen-2xl mx-auto px-8 w-full">
            <nav className="mb-6 flex items-center space-x-2 text-primary-fixed-dim text-sm font-medium">
              <Link className="hover:text-white transition-colors" href="/">
                {t({ ru: "Главная", kz: "Басты бет" })}
              </Link>
              <span className="material-symbols-outlined text-[14px]">
                chevron_right
              </span>
              <Link className="text-white" href="/digital-library">
                {t(cms.hero.breadcrumbLabel)}
              </Link>
            </nav>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4 -ml-1">
              {t(cms.hero.title)}
            </h1>
            <p className="text-on-primary-container text-lg max-w-2xl leading-relaxed">
              {t(cms.hero.lead)}
            </p>
          </div>
        </section>

        {/* Search & Filter Bar */}
        <div className="max-w-screen-2xl mx-auto px-8 -mt-8 relative z-10">
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-lg shadow-on-surface/5 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-outline">
                  {t({ ru: "Название или автор", kz: "Атауы немесе автор" })}
                </label>
                <input
                  className="w-full bg-surface-container border-none rounded-md py-2.5 px-4 text-sm focus:ring-2 ring-primary/20"
                  placeholder={t({ ru: "Поиск…", kz: "Іздеу…" })}
                  type="text"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-outline">
                  {t({ ru: "Тип ресурса", kz: "Ресурс түрі" })}
                </label>
                <select className="w-full bg-surface-container border-none rounded-md py-2.5 px-4 text-sm focus:ring-2 ring-primary/20">
                  <option>{t({ ru: "Все типы", kz: "Барлық түрлер" })}</option>
                  <option>{t({ ru: "Книги", kz: "Кітаптар" })}</option>
                  <option>{t({ ru: "Статьи", kz: "Мақалалар" })}</option>
                  <option>{t({ ru: "Периодика", kz: "Периодика" })}</option>
                </select>
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-outline">
                  {t({ ru: "Жанр", kz: "Санат" })}
                </label>
                <select className="w-full bg-surface-container border-none rounded-md py-2.5 px-4 text-sm focus:ring-2 ring-primary/20">
                  <option>{t({ ru: "Любой жанр", kz: "Кез келген жанр" })}</option>
                  <option>{t({ ru: "Наука", kz: "Ғылым" })}</option>
                  <option>{t({ ru: "Классика", kz: "Классика" })}</option>
                  <option>{t({ ru: "Технологии", kz: "Технологиялар" })}</option>
                </select>
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-outline">
                  {t({ ru: "Год издания", kz: "Басылған жылы" })}
                </label>
                <select className="w-full bg-surface-container border-none rounded-md py-2.5 px-4 text-sm focus:ring-2 ring-primary/20">
                  <option>{t({ ru: "За все время", kz: "Барлық уақыт" })}</option>
                  <option>2024</option>
                  <option>2023</option>
                  <option>{t({ ru: "До 2020", kz: "2020 жылға дейін" })}</option>
                </select>
              </div>
            </div>
            <button className="bg-primary text-on-primary px-8 py-2.5 rounded-md font-bold text-sm h-[42px] hover:bg-primary-container transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">search</span>
              {t({ ru: "Найти", kz: "Табу" })}
            </button>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-3 space-y-16">
            {/* Main Sections Bento-ish Grid */}
            <section>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cms.bento.cards.map((c, idx) => {
                  const tone = toneClasses(c.tone)
                  return (
                    <div
                      key={`dl-card-${idx}`}
                      className="group bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/20 hover:border-primary/30 transition-all"
                    >
                      <div
                        className={`w-12 h-12 ${tone.iconWrap} rounded-lg flex items-center justify-center mb-6`}
                      >
                        <span className="material-symbols-outlined">{c.iconName}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-3">{t(c.title)}</h3>
                      <p className="text-on-surface-variant text-sm leading-relaxed">
                        {t(c.body)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* E-Books Showcase */}
            <section>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-3xl font-black tracking-tight mb-2">
                    {t({ ru: "Витрина электронных книг", kz: "Электронды кітаптар витринасы" })}
                  </h2>
                  <div className="h-1 w-12 bg-primary"></div>
                </div>
                <a className="text-sm font-bold text-secondary hover:underline" href="#">
                  {t({ ru: "Смотреть все", kz: "Барлығын көру" })}
                </a>
              </div>
              <div className="flex overflow-x-auto no-scrollbar gap-6 pb-2">
                {books === null ? (
                  <>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={`sk-b-${i}`} className="w-[260px] shrink-0">
                        <Skeleton className="aspect-[3/4] w-full rounded-md mb-4" />
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ))}
                  </>
                ) : sortedBooks.length === 0 ? (
                  <p className="text-on-surface-variant text-sm">
                    {t({ ru: "Пока нет книг.", kz: "Әзірге кітаптар жоқ." })}
                  </p>
                ) : (
                  sortedBooks.slice(0, 10).map((b) => {
                    const title = locale === "kz" ? b.titleKz : b.titleRu
                    const author = locale === "kz" ? b.authorKz : b.authorRu
                    const cover = b.imageUrl?.trim() || BOOK_IMG_PLACEHOLDER
                    const href = (b.externalUrl || b.fileUrl || "").trim()
                    return (
                      <div
                        key={b.id}
                        className="flex flex-col flex-shrink-0 w-[260px] cursor-pointer"
                        onClick={() => (href ? openExternal(href) : null)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="relative group mb-4">
                          <img
                            loading="lazy"
                            className="w-full aspect-[3/4] object-cover rounded-md shadow-lg group-hover:shadow-xl transition-all"
                            alt={title}
                            src={cover}
                          />
                          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-2">
                            <span className="bg-white text-primary p-3 rounded-full shadow-lg">
                              <span className="material-symbols-outlined">
                                open_in_new
                              </span>
                            </span>
                          </div>
                        </div>
                        <h4 className="font-bold text-lg mb-1 line-clamp-1">
                          {title}
                        </h4>
                        <p className="text-on-surface-variant text-sm mb-4 line-clamp-1">
                          {author}
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="flex-grow bg-primary text-on-primary py-2 rounded font-bold text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (href) openExternal(href)
                            }}
                          >
                            {t({ ru: "Читать", kz: "Оқу" })}
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </section>

            {/* Popular Section */}
            <section>
              <div className="mb-8">
                <h2 className="text-3xl font-black tracking-tight mb-2">
                  {t({ ru: "Популярно сейчас", kz: "Қазір танымал" })}
                </h2>
                <div className="h-1 w-12 bg-primary"></div>
              </div>
              <div className="flex overflow-x-auto no-scrollbar gap-6 pb-2">
                {popular === null ? (
                  <>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={`sk-p-${i}`} className="w-[220px] shrink-0">
                        <Skeleton className="aspect-[3/4] w-full rounded-lg mb-3" />
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    ))}
                  </>
                ) : sortedPopular.length === 0 ? (
                  <p className="text-on-surface-variant text-sm">
                    {t({ ru: "Пока нет популярных.", kz: "Әзірге танымал бөлім бос." })}
                  </p>
                ) : (
                  sortedPopular.slice(0, 12).map((b) => {
                    const title = locale === "kz" ? b.titleKz : b.titleRu
                    const author = locale === "kz" ? b.authorKz : b.authorRu
                    const cover = b.imageUrl?.trim() || BOOK_IMG_PLACEHOLDER
                    return (
                      <div
                        key={b.id}
                        className="relative group flex-shrink-0 w-[220px] cursor-pointer"
                        onClick={() => openExternal(b.externalUrl)}
                        role="button"
                        tabIndex={0}
                      >
                        <img
                          loading="lazy"
                          className="w-full aspect-[3/4] object-cover rounded-lg shadow-md mb-3 group-hover:shadow-lg transition-shadow"
                          alt={title}
                          src={cover}
                        />
                        <div className="absolute top-2 right-2 bg-error text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span
                            className="material-symbols-outlined text-[10px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            star
                          </span>{" "}
                          {t({ ru: "TOP", kz: "TOP" })}
                        </div>
                        <h6 className="font-bold text-sm line-clamp-1">{title}</h6>
                        <p className="text-[11px] text-on-surface-variant line-clamp-1">
                          {author}
                        </p>
                      </div>
                    )
                  })
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            <div className="bg-primary text-on-primary p-8 rounded-xl shadow-xl shadow-primary/20">
              <h4 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined">help_center</span>
                {t(cms.help.title)}
              </h4>
              <ul className="space-y-6">
                {cms.help.steps.map((s, i) => (
                  <li key={`step-${i}`} className="flex gap-4">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </div>
                    <p className="text-sm text-primary-fixed leading-snug">{t(s)}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/60 mb-2">
                  {t({ ru: "Форматы файлов", kz: "Файл форматтары" })}
                </p>
                <div className="flex flex-wrap gap-2">
                  {cms.help.formats.map((f) => (
                    <span
                      key={f}
                      className="px-2 py-1 bg-white/10 rounded text-[10px] font-mono"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-surface-container-low p-8 rounded-xl">
              <h4 className="font-bold mb-4">
                {t(cms.access.title)}
              </h4>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
                {t(cms.access.body)}
              </p>
            </div>
          </aside>
        </div>

        {/* CTA Section */}
        <section className="max-w-screen-2xl mx-auto px-8 pb-24">
          <div className="bg-surface-container-highest rounded-3xl p-12 md:p-16 flex flex-col items-center text-center">
            <h2 className="text-4xl font-black mb-6 max-w-3xl">
              {t(cms.cta.title)}
            </h2>
            <p className="text-on-surface-variant text-lg mb-10 max-w-2xl">
              {t(cms.cta.lead)}
            </p>
            <div className="flex flex-col md:flex-row gap-4">
              <Link
                className="bg-primary text-on-primary px-10 py-4 rounded-md font-bold hover:bg-primary-container transition-all"
                href={cms.cta.primaryHref}
              >
                {t(cms.cta.primaryLabel)}
              </Link>
              <Link
                className="bg-white border border-outline-variant/50 text-primary px-10 py-4 rounded-md font-bold hover:bg-surface-container-low transition-all"
                href={cms.cta.secondaryHref}
              >
                {t(cms.cta.secondaryLabel)}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

