"use client"

import Link from "next/link"
import type { Event, NewsArticle } from "@prisma/client"

import { BranchLocalFeed } from "@/components/branches/branch-local-feed"
import { useLocale } from "@/components/i18n/locale-provider"
import type { BranchDetailViewModel } from "@/lib/branch-row"
import type { BranchSocialLink } from "@/lib/branch-social-links"
import { L, pickDbField, pickLocalized } from "@/lib/i18n/app-locale"
import { SocialIcon } from "@/lib/social-icons"
import { splitBodyParagraphs } from "@/lib/news/split-body"

type Props = {
  branch: BranchDetailViewModel
  branchNews: NewsArticle[]
  branchEvents: Event[]
  branchSocial: BranchSocialLink[]
  heroImg: string
  buildingImg: string
}

export function BranchDetailPageClient({
  branch,
  branchNews,
  branchEvents,
  branchSocial,
  heroImg,
  buildingImg,
}: Props) {
  const { locale } = useLocale()
  const t = (v: Parameters<typeof pickLocalized>[0]) => pickLocalized(v, locale)

  const name = pickDbField(branch.titleRu, branch.titleKz, locale)
  const subtitle = pickDbField(
    branch.subtitle ?? "",
    branch.subtitleKz,
    locale
  )
  const desc = pickDbField(
    branch.descriptionRu ?? "",
    branch.descriptionKz ?? null,
    locale
  )
  const paras = splitBodyParagraphs(desc)
  const intro = paras[0]?.trim() ?? desc.trim()
  const address = pickDbField(branch.address ?? "", branch.addressKz, locale)
  const aboutParagraphs = paras.slice(1).map((p) => p.trim()).filter(Boolean)

  return (
    <div className="bg-surface font-body text-on-surface antialiased">
      <main>
        <section className="relative flex min-h-[400px] items-center overflow-hidden bg-primary">
          <div className="absolute inset-0 opacity-40 mix-blend-overlay">
            <img alt="" className="h-full w-full object-cover" src={heroImg} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-container/60" />
          <div className="relative z-10 mx-auto w-full max-w-[1440px] px-8 py-20">
            <nav className="mb-8 flex flex-wrap gap-y-1 text-sm font-medium tracking-wide text-on-primary-container/80">
              <Link className="transition-colors hover:text-white" href="/">
                {t(L("Главная", "Басты бет"))}
              </Link>
              <span className="mx-3 opacity-50">/</span>
              <Link className="transition-colors hover:text-white" href="/branches">
                {t(L("Филиалы", "Филиалдар"))}
              </Link>
              <span className="mx-3 opacity-50">/</span>
              <span className="text-white">{name}</span>
            </nav>
            <h1 className="mb-6 max-w-4xl text-5xl font-extrabold tracking-tighter text-white md:text-6xl">
              {name}
            </h1>
            {subtitle.trim() ? (
              <p className="max-w-2xl text-xl font-light leading-relaxed text-on-primary-container md:text-2xl">
                {subtitle}
              </p>
            ) : null}
          </div>
        </section>

        <section className="bg-surface py-20">
          <div className="mx-auto max-w-[1440px] px-8">
            <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
              <div className="space-y-8 lg:col-span-8">
                <div className="group relative">
                  <div className="absolute -inset-4 rounded-xl bg-primary/5 transition-all duration-500 group-hover:scale-105" />
                  <img
                    alt=""
                    className="relative aspect-[16/9] w-full rounded object-cover shadow-lg"
                    src={buildingImg}
                  />
                </div>
                {intro.trim() ? (
                  <div className="prose prose-lg max-w-none text-on-surface/80">
                    <p className="text-lg leading-relaxed">{intro}</p>
                  </div>
                ) : null}
              </div>
              <div className="sticky top-28 lg:col-span-4">
                <div className="space-y-8 rounded-xl bg-surface-container-lowest p-8 shadow-[0_10px_30px_-5px_rgba(25,28,30,0.06)]">
                  <h3 className="text-xl font-bold tracking-tight text-primary">
                    {t(L("Контактная информация", "Байланыс ақпараты"))}
                  </h3>
                  <div className="space-y-6">
                    {branch.address?.trim() ? (
                      <div className="flex gap-4">
                        <span className="material-symbols-outlined text-secondary">
                          location_on
                        </span>
                        <div>
                          <div className="mb-1 text-xs font-bold uppercase tracking-widest text-outline">
                            {t(L("Адрес", "Мекенжай"))}
                          </div>
                          <div className="font-medium text-on-surface">
                            {address}
                          </div>
                        </div>
                      </div>
                    ) : null}
                    {branch.phone && (
                      <div className="flex gap-4">
                        <span className="material-symbols-outlined text-secondary">
                          call
                        </span>
                        <div>
                          <div className="mb-1 text-xs font-bold uppercase tracking-widest text-outline">
                            {t(L("Телефон", "Телефон"))}
                          </div>
                          <div className="font-medium text-on-surface">
                            {branch.phone}
                          </div>
                        </div>
                      </div>
                    )}
                    {branch.email && (
                      <div className="flex gap-4">
                        <span className="material-symbols-outlined text-secondary">
                          mail
                        </span>
                        <div>
                          <div className="mb-1 text-xs font-bold uppercase tracking-widest text-outline">
                            {t(L("Email", "Email"))}
                          </div>
                          <div className="font-medium text-on-surface">
                            {branch.email}
                          </div>
                        </div>
                      </div>
                    )}
                    {branch.hours && (
                      <div className="flex gap-4">
                        <span className="material-symbols-outlined text-secondary">
                          schedule
                        </span>
                        <div>
                          <div className="mb-1 text-xs font-bold uppercase tracking-widest text-outline">
                            {t(L("Часы работы", "Жұмыс уақыты"))}
                          </div>
                          <div className="whitespace-pre-line font-medium text-on-surface">
                            {pickDbField(branch.hours, null, locale)}
                          </div>
                        </div>
                      </div>
                    )}
                    {branchSocial.length > 0 && (
                      <div className="flex gap-4">
                        <span className="material-symbols-outlined text-secondary shrink-0">
                          link
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 text-xs font-bold uppercase tracking-widest text-outline">
                            {t(L("Соцсети и ссылки", "Әлеуметтік желілер мен сілтемелер"))}
                          </div>
                          <ul className="space-y-2">
                            {branchSocial.map((s) => (
                              <li key={`${s.url}-${s.label}`}>
                                <a
                                  className="inline-flex items-center gap-2 font-medium text-primary underline-offset-2 hover:underline"
                                  href={s.url}
                                  rel="noopener noreferrer"
                                  target="_blank"
                                >
                                  <SocialIcon
                                    icon={s.icon ?? "link"}
                                    className="size-4 shrink-0 text-secondary"
                                  />
                                  {pickDbField(
                                    s.label,
                                    s.labelKz ?? null,
                                    locale
                                  )}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                  <Link
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-4 font-semibold text-on-primary transition-all hover:bg-primary-container"
                    href="/contacts"
                  >
                    <span className="material-symbols-outlined">calendar_month</span>
                    {t(L("Связаться", "Байланысу"))}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <BranchLocalFeed
          branch={branch}
          newsRows={branchNews}
          eventRows={branchEvents}
        />

        {aboutParagraphs.length > 0 ? (
          <section className="bg-surface-container-low py-24">
            <div className="mx-auto max-w-[1440px] px-8">
              <div className="max-w-4xl">
                <h2 className="mb-8 text-3xl font-bold tracking-tight text-primary">
                  {t(L("О филиале", "Филиал туралы"))}
                </h2>
                <div className="space-y-6 text-lg leading-relaxed text-on-surface/90">
                  {aboutParagraphs.map((p: string, i: number) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  )
}
