"use client"

import Link from "next/link"

import { useLocale } from "@/components/i18n/locale-provider"
import type { SimpleHeroData } from "@/lib/cms/simple-page/types"
import { L, pickDbField, pickLocalized } from "@/lib/i18n/app-locale"

export function StructureHero({ hero }: { hero: SimpleHeroData }) {
  const { locale } = useLocale()
  const t = (value: Parameters<typeof pickLocalized>[0]) =>
    pickLocalized(value, locale)

  return (
    <section className="relative flex min-h-[300px] sm:min-h-[380px] md:h-[450px] items-center overflow-hidden py-12 md:py-0">
      <div className="absolute inset-0 z-0">
        <img
          alt={pickDbField(
            hero.backgroundImageAlt,
            hero.backgroundImageAltKz,
            locale
          )}
          className="h-full w-full object-cover"
          src={hero.backgroundImageUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#00236f]/90 to-[#1e3a8a]/40" />
      </div>
      <div className="relative z-10 mx-auto w-full max-w-7xl min-w-0 px-4 sm:px-6 lg:px-8">
        <nav className="mb-4 flex flex-wrap gap-x-2 gap-y-1 text-sm font-label uppercase tracking-wide text-white/70 sm:mb-6">
          <Link className="hover:text-white" href="/">
            {t(L("Главная", "Басты бет"))}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-white">
            {pickDbField(
              hero.breadcrumbLabel,
              hero.breadcrumbLabelKz,
              locale
            )}
          </span>
        </nav>
        <h1 className="mb-3 max-w-2xl break-words text-3xl font-bold leading-[1.1] tracking-tight text-white sm:mb-4 sm:text-4xl md:text-5xl lg:text-6xl">
          {pickDbField(hero.title, hero.titleKz, locale)}
        </h1>
        <p className="max-w-xl break-words text-base font-light text-white/80 sm:text-lg md:text-xl">
          {pickDbField(hero.lead, hero.leadKz, locale)}
        </p>
      </div>
    </section>
  )
}
