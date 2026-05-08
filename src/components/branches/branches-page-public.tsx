"use client"

import Link from "next/link"

import { useLocale } from "@/components/i18n/locale-provider"
import type { SimpleHeroData } from "@/lib/cms/simple-page/types"
import type { BranchesNetworkData } from "@/lib/cms/branches-network/types"
import type { BranchRow } from "@/lib/branch-row"
import { L, pickDbField, pickLocalized } from "@/lib/i18n/app-locale"

const FALLBACK_CARD_IMG =
  "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=80"

type Props = {
  hero: SimpleHeroData
  branches: BranchRow[]
  network: BranchesNetworkData
}

export function BranchesPagePublic({ hero, branches, network }: Props) {
  const { locale } = useLocale()
  const t = (v: Parameters<typeof pickLocalized>[0]) => pickLocalized(v, locale)

  const networkTitle = pickDbField(
    network.titleRu,
    network.titleKz ?? null,
    locale
  )
  const networkLead = pickDbField(network.leadRu, network.leadKz ?? null, locale)
  const networkBody = pickDbField(network.bodyRu, network.bodyKz ?? null, locale)

  const lines = networkBody.split(/\r?\n/).map((l) => l.trim())
  const paragraphs: string[] = []
  const bullets: string[] = []
  for (const line of lines) {
    if (!line) continue
    if (line.startsWith("*")) {
      bullets.push(line.replace(/^\*\s*/, ""))
      continue
    }
    paragraphs.push(line)
  }

  return (
    <>
      <main className="pt-20 overflow-x-hidden min-w-0">
        <section className="relative flex min-h-[280px] sm:min-h-[340px] md:h-[400px] w-full max-w-full items-center overflow-hidden py-10 md:py-0">
          <div className="absolute inset-0 z-0">
            <img
              alt={pickDbField(
                hero.backgroundImageAlt,
                hero.backgroundImageAltKz ?? null,
                locale
              )}
              className="h-full w-full object-cover"
              src={hero.backgroundImageUrl}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/70 to-transparent" />
          </div>
          <div className="relative z-20 mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 text-white min-w-0">
            <nav className="mb-6 flex flex-wrap items-center gap-y-1 space-x-2 text-sm font-medium opacity-90">
              <Link className="hover:underline" href="/">
                {t(L("Главная", "Басты бет"))}
              </Link>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span>
                {pickDbField(
                  hero.breadcrumbLabel,
                  hero.breadcrumbLabelKz ?? null,
                  locale
                )}
              </span>
            </nav>
            <h1 className="mb-3 sm:mb-4 max-w-3xl text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tighter break-words">
              {pickDbField(hero.title, hero.titleKz ?? null, locale)}
            </h1>
            <p className="max-w-2xl text-base sm:text-lg font-light leading-relaxed text-primary-fixed md:text-xl break-words">
              {pickDbField(hero.lead, hero.leadKz ?? null, locale)}
            </p>
          </div>
        </section>

        <section className="bg-surface px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 pt-10 sm:pt-12">
          <div className="mx-auto max-w-screen-2xl min-w-0">
            {branches.length === 0 ? (
              <p className="text-on-surface-variant rounded-xl border border-dashed p-10 text-center">
                {t(
                  L(
                    "Список филиалов пока пуст. Загляните позже.",
                    "Филиалдар тізімі әлі бос. Кейінірек кіріңіз."
                  )
                )}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 xl:grid-cols-3">
                {branches.map((b) => {
                  const name = pickDbField(b.titleRu, b.titleKz ?? null, locale)
                  const city = pickDbField(
                    b.cityLabel ?? "",
                    b.cityLabelKz ?? null,
                    locale
                  )
                  const addr = pickDbField(
                    b.address ?? "",
                    b.addressKz ?? null,
                    locale
                  )
                  return (
                    <div
                      key={b.id}
                      className="group flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm transition-all duration-300 hover:shadow-xl"
                    >
                      <div className="relative h-56 overflow-hidden">
                        <img
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          src={b.cardImageUrl?.trim() || FALLBACK_CARD_IMG}
                        />
                        {b.isMainBranch && (
                          <div className="absolute left-4 top-4">
                            <span className="rounded-full bg-tertiary-fixed px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-tertiary-fixed">
                              {t(L("Главный филиал", "Басты филиал"))}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-grow flex-col p-8">
                        <h3 className="mb-2 text-xl font-bold leading-tight text-primary transition-colors group-hover:text-secondary">
                          {name}
                        </h3>
                        {(b.cityLabel || b.cityLabelKz) && (
                          <div className="mb-4 flex items-center text-sm font-semibold text-secondary">
                            <span className="material-symbols-outlined mr-1 text-sm">
                              location_on
                            </span>
                            {city}
                          </div>
                        )}
                        <div className="mb-8 space-y-3 text-sm text-on-surface-variant">
                          {(b.address?.trim() || b.addressKz?.trim()) && (
                            <div className="flex items-start">
                              <span className="material-symbols-outlined mr-3 text-base text-outline-variant">
                                map
                              </span>
                              <span>{addr}</span>
                            </div>
                          )}
                          {b.phone && (
                            <div className="flex items-start">
                              <span className="material-symbols-outlined mr-3 text-base text-outline-variant">
                                call
                              </span>
                              <span>{b.phone}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-auto">
                          <Link
                            className="block w-full rounded-md border border-primary py-3 text-center font-bold text-primary transition-all hover:bg-primary hover:text-on-primary active:scale-95"
                            href={`/branches/${b.id}`}
                          >
                            {t(L("Подробнее", "Толығырақ"))}
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

        <section className="bg-surface-container-low px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 overflow-x-hidden">
          <div className="mx-auto grid max-w-screen-2xl grid-cols-1 items-center gap-12 lg:gap-20 lg:grid-cols-2 min-w-0">
            <div className="min-w-0">
              <h2 className="mb-6 sm:mb-8 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-primary break-words">
                {networkTitle}
              </h2>
              <p className="mb-8 sm:mb-12 text-base sm:text-lg leading-relaxed text-on-surface-variant break-words">
                {networkLead}
              </p>
              <div className="space-y-4 text-on-surface-variant">
                {paragraphs.map((p, idx) => (
                  <p key={idx} className="text-base leading-relaxed">
                    {p}
                  </p>
                ))}
                {bullets.length ? (
                  <ul className="list-disc space-y-2 pl-6 text-base leading-relaxed">
                    {bullets.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <div className="rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface-variant">
                {t(
                  L(
                    "Актуальный список филиалов — в блоке выше; тексты этой секции можно править в админке: Контент сайта → Филиалы: «Сеть библиотек».",
                    "Филиалдардың тізімі — жоғарыдағы блокта; осы бөлім мәтіндерін әкімшіліктен өзгертуге болады."
                  )
                )}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 -rotate-3 rounded-2xl bg-blue-900/5" />
              <img
                alt={pickDbField(
                  network.imageAltRu ?? "",
                  network.imageAltKz ?? null,
                  locale
                )}
                className="relative z-10 w-full rotate-3 rounded-2xl shadow-2xl"
                src={
                  network.imageUrl?.trim() ||
                  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=900&q=80"
                }
              />
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
