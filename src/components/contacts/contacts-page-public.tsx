"use client"

import Link from "next/link"
import type { SocialLink } from "@prisma/client"
import { useMemo } from "react"

import { SocialLinksRow } from "@/components/social/social-links-row"
import { useLocale } from "@/components/i18n/locale-provider"
import { L, pickDbField, pickLocalized } from "@/lib/i18n/app-locale"
import { SITE_CONTACT_FALLBACK, telHref } from "@/lib/site-contact-fallbacks"
import { formatWorkingHoursGrouped } from "@/lib/working-hours"

/**
 * Здание АОУБ: г. Алматы, ул. С. Татибекова, 27 (Nominatim / OpenStreetMap).
 * Используется для встраиваемой карты с фиксированным маркером.
 */
const LIBRARY_MAP = {
  lat: 43.280988,
  lon: 76.971145,
} as const

function openStreetMapEmbedSrc(): string {
  const { lat, lon } = LIBRARY_MAP
  const dLon = 0.0048
  const dLat = 0.0032
  const bbox = `${lon - dLon},${lat - dLat},${lon + dLon},${lat + dLat}`
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`
}

export type ContactsPagePayload = {
  address: string
  addressKz: string | null
  phone: string
  phoneSecondary: string | null
  email: string
  workingHoursRaw: unknown | null
  sanitaryRu: string | null
  sanitaryKz: string | null
  socialLinks: SocialLink[]
}

export function ContactsPagePublic({ data }: { data: ContactsPagePayload }) {
  const { locale } = useLocale()
  const t = (v: Parameters<typeof pickLocalized>[0]) => pickLocalized(v, locale)
  const hourLines = useMemo(
    () => formatWorkingHoursGrouped(data.workingHoursRaw, locale),
    [data.workingHoursRaw, locale]
  )
  const addressLine = pickDbField(data.address, data.addressKz, locale)
  const mapSearchQuery = (
    addressLine ||
    pickDbField(
      SITE_CONTACT_FALLBACK.address,
      SITE_CONTACT_FALLBACK.addressKz,
      locale
    )
  ).trim()
  const sanitary = pickDbField(
    data.sanitaryRu ?? "",
    data.sanitaryKz,
    locale
  )

  return (
    <main className="min-h-screen pt-24 overflow-x-hidden">
      <section className="relative flex min-h-[280px] sm:min-h-[340px] md:h-[400px] w-full max-w-full items-center overflow-hidden py-10 md:py-0">
        <div className="absolute inset-0 z-0">
          <img
            className="h-full w-full object-cover"
            alt=""
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0F-QAuY80q4IMjFS3IJXjtddfXnSpbs4-bAW8alc6lnhKHLFQAWyO4p7OMfGi2StyZrfuJdBymIAWeSiTTT-TTjI66u9RBuYbOuqXbwfVg59L95rq1vUAtfMBTjFURXtlorzBUvQG-J-uB8rm2rak6CGYJrREhmfUFoxVGMcFGeR_QZvNQy37blqr2Wrt_XzI5d-iiYfXdMHY37TpbZwWYjsXLfHhPHygjNuliHGMpGaG9-ApbtglX0iOkneBn9KsMDMiXF7xhNR8"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/70 to-transparent" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-10 text-white min-w-0">
          <nav className="mb-4 sm:mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-blue-100/80">
            <Link className="transition-colors hover:text-white" href="/">
              {t(L("Главная", "Басты бет"))}
            </Link>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span>{t(L("Контакты", "Байланыс"))}</span>
          </nav>
          <h1 className="mb-3 sm:mb-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter break-words">
            {t(L("Контакты", "Байланыс"))}
          </h1>
          <p className="max-w-2xl text-base sm:text-lg md:text-xl leading-relaxed text-blue-50/90 break-words">
            {t(
              L(
                "Свяжитесь с библиотекой для получения информации и консультаций по любым вопросам использования наших ресурсов.",
                "Ресурстарды пайдалану бойынша ақпарат пен кеңес алу үшін кітапханаға хабарласыңыз."
              )
            )}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10 py-16 sm:py-20 md:py-24 min-w-0 overflow-x-hidden">
        <div className="grid grid-cols-1 gap-10 sm:gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-14">
          <div className="min-w-0 lg:col-span-5">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-1">
              <div className="group flex min-w-0 items-start gap-4 sm:gap-5">
                <div className="shrink-0 rounded-xl bg-primary-fixed p-3.5 text-primary transition-all group-hover:bg-primary group-hover:text-white sm:p-4">
                  <span className="material-symbols-outlined text-2xl">
                    location_on
                  </span>
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-400">
                    {t(L("Наш адрес", "Біздің мекенжай"))}
                  </span>
                  <span className="block text-base font-semibold text-on-surface break-words sm:text-lg md:text-xl">
                    {addressLine}
                  </span>
                </div>
              </div>
              <div className="group flex min-w-0 items-start gap-4 sm:gap-5">
                <div className="shrink-0 rounded-xl bg-primary-fixed p-3.5 text-primary transition-all group-hover:bg-primary group-hover:text-white sm:p-4">
                  <span className="material-symbols-outlined text-2xl">call</span>
                </div>
                <div className="min-w-0 flex-1 overflow-hidden flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    {t(L("Телефон для справок", "Анықтама телефоны"))}
                  </span>
                  <a
                    className="w-fit max-w-full break-words text-lg font-semibold text-on-surface transition-colors hover:text-primary sm:text-xl"
                    href={telHref(data.phone)}
                  >
                    {data.phone}
                  </a>
                  {data.phoneSecondary ? (
                    <>
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        {t(L("Дополнительный телефон", "Қосымша телефон"))}
                      </span>
                      <a
                        className="w-fit max-w-full break-words text-base font-semibold text-on-surface transition-colors hover:text-primary sm:text-lg"
                        href={telHref(data.phoneSecondary)}
                      >
                        {data.phoneSecondary}
                      </a>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="group flex min-w-0 items-start gap-4 sm:gap-5">
                <div className="shrink-0 rounded-xl bg-primary-fixed p-3.5 text-primary transition-all group-hover:bg-primary group-hover:text-white sm:p-4">
                  <span className="material-symbols-outlined text-2xl">mail</span>
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-400">
                    {t(L("Электронная почта", "Электрондық пошта"))}
                  </span>
                  <a
                    className="block w-fit max-w-full break-all text-base font-semibold text-on-surface underline-offset-2 transition-colors hover:text-primary hover:underline sm:text-lg md:text-xl"
                    href={`mailto:${data.email}`}
                  >
                    {data.email}
                  </a>
                </div>
              </div>
              <div className="group flex min-w-0 items-start gap-4 sm:gap-5 sm:col-span-2 lg:col-span-1">
                <div className="shrink-0 rounded-xl bg-primary-fixed p-3.5 text-primary transition-all group-hover:bg-primary group-hover:text-white sm:p-4">
                  <span className="material-symbols-outlined text-2xl">
                    schedule
                  </span>
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-400">
                    {t(L("Режим работы", "Жұмыс режимі"))}
                  </span>
                  <div className="space-y-2.5">
                    {hourLines.map((line, idx) => (
                      <div
                        key={`${line.rangeLabel}-${line.timeLabel}-${idx}`}
                        className="flex flex-col gap-0.5 border-b border-slate-100/90 pb-2 last:border-b-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-3"
                      >
                        <span className="min-w-0 shrink-0 font-semibold text-on-surface break-words sm:max-w-[46%]">
                          {line.rangeLabel}
                        </span>
                        <span
                          className={[
                            "min-w-0 font-medium break-words sm:max-w-[52%] sm:text-right",
                            line.timeLabel === t(L("выходной", "демалыс"))
                              ? "text-slate-500"
                              : "text-on-surface",
                          ].join(" ")}
                        >
                          {line.timeLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                  {sanitary.trim() ? (
                    <div className="mt-4 space-y-2 border-t border-slate-200/80 pt-4 text-sm text-slate-600">
                      <p className="break-words">
                        <span className="font-semibold text-on-surface">
                          {t(L("Санитарный день:", "Санитарлық күн:"))}{" "}
                        </span>
                        {sanitary}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {data.socialLinks.length > 0 ? (
              <div className="mt-10 space-y-4 border-t border-slate-200/60 pt-8 min-w-0 sm:col-span-2 lg:col-span-1">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  {t(L("Мы в соцсетях", "Әлеуметтік желілерде"))}
                </h2>
                <div className="min-w-0">
                  <SocialLinksRow items={data.socialLinks} variant="contacts" />
                </div>
              </div>
            ) : null}
          </div>

          <div className="min-w-0 lg:col-span-7">
            <div className="flex flex-col gap-3">
              <div
                className={[
                  "relative w-full max-w-full overflow-hidden rounded-xl border border-slate-200/50 bg-surface-container shadow-sm",
                  /* Мобила — ниже, планшет/ноут — среднее, десктоп — выше; без конфликта aspect + max-height */
                  "aspect-[5/7] min-h-[200px]",
                  "sm:aspect-video sm:min-h-[220px]",
                  "md:aspect-[16/10] md:min-h-[280px]",
                  "lg:aspect-auto lg:h-[min(72vh,560px)] lg:min-h-[400px]",
                ].join(" ")}
              >
                <iframe
                  title={t(
                    L(
                      "Карта: Алматинская областная универсальная библиотека",
                      "Карта: Алматы облыстық әмбебап кітапханасы"
                    )
                  )}
                  className="absolute inset-0 h-full w-full border-0"
                  src={openStreetMapEmbedSrc()}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-xs text-slate-600 sm:text-sm">
                <a
                  className="font-semibold text-primary underline-offset-2 hover:underline break-words"
                  href={`https://www.openstreetmap.org/?mlat=${LIBRARY_MAP.lat}&mlon=${LIBRARY_MAP.lon}#map=17/${LIBRARY_MAP.lat}/${LIBRARY_MAP.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  OpenStreetMap
                </a>
                <span className="text-slate-300" aria-hidden>
                  ·
                </span>
                <a
                  className="font-semibold text-primary underline-offset-2 hover:underline break-words"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapSearchQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200/30 bg-surface-container-low py-16 sm:py-20 md:py-24 overflow-x-hidden">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10 text-center min-w-0">
          <div className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary break-words px-2">
              {t(L("Возникли вопросы?", "Сұрақтарыңыз бар ма?"))}
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-slate-600 break-words px-2">
              {t(
                L(
                  "Наши специалисты готовы ответить на ваши вопросы и помочь в работе с библиотечными ресурсами, подборе литературы или регистрации в электронной базе.",
                  "Мамандарымыз сұрақтарыңызға жауап беріп, кітапханалық ресурстармен жұмыста, әдебиет таңдауда немесе электрондық базаға тіркелуде көмектесуге дайын."
                )
              )}
            </p>
            <div className="flex justify-center pt-4 px-2">
              <a
                className="inline-flex items-center justify-center gap-3 rounded-md bg-primary px-6 sm:px-10 py-3 sm:py-4 font-bold text-white transition-all hover:bg-primary-container hover:shadow-lg max-w-full text-center"
                href={`mailto:${data.email}`}
              >
                <span className="material-symbols-outlined">send</span>
                {t(L("Написать на email", "Email жазу"))}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
