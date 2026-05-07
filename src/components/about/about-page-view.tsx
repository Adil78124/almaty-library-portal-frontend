"use client"

import Link from "next/link"

import { useLocale } from "@/components/i18n/locale-provider"
import type { ResolvedAbout } from "@/lib/cms/about/types"
import { L, pickLocalized } from "@/lib/i18n/app-locale"

type Props = {
  data: ResolvedAbout
}

function AboutPageSections({ data }: { data: ResolvedAbout }) {
  const { locale } = useLocale()
  const t = (v: Parameters<typeof pickLocalized>[0]) => pickLocalized(v, locale)
  const { hero, roleIntro, timeline, mission, facts, space, quote, cta } = data

  return (
    <>
      <section className="relative h-[480px] w-full flex items-center overflow-hidden">
        <img
          alt={t(hero.imageAlt)}
          className="absolute inset-0 w-full h-full object-cover"
          src={hero.imageUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/70 to-transparent" />
        <div className="relative z-20 max-w-7xl mx-auto px-8 w-full">
          <nav className="flex gap-2 text-white/80 text-sm mb-6 font-medium">
            <Link className="hover:text-white transition-colors" href="/">
              {t(L("Главная", "Басты бет"))}
            </Link>
            <span>/</span>
            <span className="text-white">{t(hero.breadcrumbLabel)}</span>
          </nav>
          <h1 className="text-6xl font-extrabold text-white tracking-tight mb-6 max-w-3xl leading-tight">
            {t(hero.title)}
          </h1>
          <p className="text-xl text-blue-50/90 max-w-2xl leading-relaxed">
            {t(hero.lead)}
          </p>
        </div>
      </section>

      <section className="py-24 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="text-sm font-bold tracking-widest text-secondary uppercase mb-4 block">
                {t(roleIntro.kicker)}
              </span>
              <h2 className="text-4xl font-bold text-primary mb-8 leading-tight">
                {t(roleIntro.title)}
              </h2>
              <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                <p>{t(roleIntro.paragraphs[0])}</p>
                <p>{t(roleIntro.paragraphs[1])}</p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-tertiary-fixed rounded-xl -rotate-2 z-0"></div>
              <img
                alt={t(roleIntro.sideImageAlt)}
                className="relative z-10 rounded-lg shadow-xl w-full h-[500px] object-cover"
                src={roleIntro.sideImageUrl}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary">{t(timeline.title)}</h2>
            <div className="w-24 h-1 bg-secondary mx-auto mt-6"></div>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 h-full w-px bg-outline-variant/30"></div>
            <div className="space-y-16">
              {timeline.items.map((item, idx) => (
                <div
                  key={`${t(item.year)}-${idx}`}
                  className="flex flex-col lg:flex-row items-center gap-8 lg:gap-0"
                >
                  {item.align === "left" ? (
                    <>
                      <div className="lg:w-1/2 lg:pr-20 lg:text-right">
                        <span className="text-5xl font-black text-secondary/20 block mb-2">
                          {t(item.year)}
                        </span>
                        <h3 className="text-2xl font-bold text-primary mb-4">
                          {t(item.title)}
                        </h3>
                        <p className="text-slate-600 leading-relaxed">{t(item.body)}</p>
                      </div>
                      <div className="w-4 h-4 rounded-full bg-secondary border-4 border-white shadow-md relative z-10"></div>
                      <div className="lg:w-1/2 lg:pl-20"></div>
                    </>
                  ) : (
                    <>
                      <div className="lg:w-1/2 lg:pr-20"></div>
                      <div className="w-4 h-4 rounded-full bg-secondary border-4 border-white shadow-md relative z-10"></div>
                      <div className="lg:w-1/2 lg:pl-20">
                        <span className="text-5xl font-black text-secondary/20 block mb-2">
                          {t(item.year)}
                        </span>
                        <h3 className="text-2xl font-bold text-primary mb-4">
                          {t(item.title)}
                        </h3>
                        <p className="text-slate-600 leading-relaxed">{t(item.body)}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mission.cards.map((card, idx) => (
              <div
                key={`${idx}-${t(card.title)}`}
                className="bg-surface-container-lowest p-8 rounded-lg group hover:bg-primary transition-colors duration-500"
              >
                <span className="material-symbols-outlined text-4xl text-secondary mb-6 group-hover:text-white transition-colors">
                  {card.iconName}
                </span>
                <h4 className="text-xl font-bold text-primary mb-4 group-hover:text-white transition-colors">
                  {t(card.title)}
                </h4>
                <p className="text-slate-600 group-hover:text-blue-100 transition-colors">
                  {t(card.body)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-primary">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {facts.stats.map((s) => (
              <div
                key={t(s.label)}
                className="p-8 border border-white/10 rounded-xl backdrop-blur-sm"
              >
                <div className="text-5xl font-black text-tertiary-fixed mb-4">
                  {t(s.value)}
                </div>
                <div className="text-blue-100 font-medium tracking-wide uppercase text-sm">
                  {t(s.label)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-surface-container-lowest overflow-hidden">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl font-bold text-primary mb-4">{t(space.title)}</h2>
              <p className="text-slate-600 max-w-xl">{t(space.lead)}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {space.slides.map((slide, idx) => (
              <div
                key={`${t(slide.caption)}-${idx}`}
                className={`group relative overflow-hidden rounded-lg h-[600px] ${
                  idx === 1 ? "mt-12" : idx === 2 ? "-mt-6" : ""
                }`}
              >
                <img
                  alt={t(slide.imageAlt)}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  src={slide.imageUrl}
                />
                <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                  <h4 className="text-white text-xl font-bold">{t(slide.caption)}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-surface-container">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <span
            className="material-symbols-outlined text-6xl text-secondary/30 mb-8"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            format_quote
          </span>
          <blockquote className="text-3xl font-medium text-primary italic leading-snug mb-10">
            {t(quote.quote)}
          </blockquote>
          <div className="w-16 h-px bg-outline-variant mx-auto mb-10"></div>
          <div className="text-slate-600 text-lg leading-relaxed space-y-6">
            <p className="whitespace-pre-line">{t(quote.body)}</p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="bg-gradient-to-r from-primary to-secondary p-16 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative z-10 text-center md:text-left md:flex items-center justify-between gap-12">
              <div className="max-w-2xl mb-10 md:mb-0">
                <h2 className="text-4xl font-bold text-white mb-6">{t(cta.title)}</h2>
                <p className="text-blue-100 text-lg">{t(cta.lead)}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                <Link
                  href={cta.primaryHref}
                  className="px-8 py-4 bg-tertiary-fixed text-on-tertiary-fixed font-bold rounded-md hover:shadow-lg transition-all active:scale-95 text-center"
                >
                  {t(cta.primaryLabel)}
                </Link>
                <Link
                  href={cta.secondaryHref}
                  className="px-8 py-4 border-2 border-white/30 text-white font-bold rounded-md hover:bg-white/10 transition-all active:scale-95 text-center"
                >
                  {t(cta.secondaryLabel)}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export function AboutPageView({ data }: Props) {
  return (
    <div className="bg-surface text-on-surface flex flex-col min-h-screen">
      <main className="flex-grow pt-20">
        <AboutPageSections data={data} />
      </main>
    </div>
  )
}
