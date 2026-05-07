"use client"

import Link from "next/link"
import type { SocialLink } from "@prisma/client"
import { useMemo } from "react"

import { SocialLinksRow } from "@/components/social/social-links-row"
import { useLocale } from "@/components/i18n/locale-provider"
import { L, pickDbField, pickLocalized } from "@/lib/i18n/app-locale"
import { telHref } from "@/lib/site-contact-fallbacks"
import { formatWorkingHoursGrouped } from "@/lib/working-hours"

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
  const sanitary = pickDbField(
    data.sanitaryRu ?? "",
    data.sanitaryKz,
    locale
  )

  return (
    <main className="min-h-screen pt-24">
      <section className="relative flex h-[400px] w-full items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            className="h-full w-full object-cover"
            alt=""
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0F-QAuY80q4IMjFS3IJXjtddfXnSpbs4-bAW8alc6lnhKHLFQAWyO4p7OMfGi2StyZrfuJdBymIAWeSiTTT-TTjI66u9RBuYbOuqXbwfVg59L95rq1vUAtfMBTjFURXtlorzBUvQG-J-uB8rm2rak6CGYJrREhmfUFoxVGMcFGeR_QZvNQy37blqr2Wrt_XzI5d-iiYfXdMHY37TpbZwWYjsXLfHhPHygjNuliHGMpGaG9-ApbtglX0iOkneBn9KsMDMiXF7xhNR8"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/70 to-transparent" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-screen-2xl px-12 text-white">
          <nav className="mb-6 flex items-center gap-2 text-sm font-medium text-blue-100/80">
            <Link className="transition-colors hover:text-white" href="/">
              {t(L("Главная", "Басты бет"))}
            </Link>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span>{t(L("Контакты", "Байланыс"))}</span>
          </nav>
          <h1 className="-ml-1 mb-4 text-6xl font-extrabold tracking-tighter">
            {t(L("Контакты", "Байланыс"))}
          </h1>
          <p className="max-w-2xl text-xl leading-relaxed text-blue-50/90">
            {t(
              L(
                "Свяжитесь с библиотекой для получения информации и консультаций по любым вопросам использования наших ресурсов.",
                "Ресурстарды пайдалану бойынша ақпарат пен кеңес алу үшін кітапханаға хабарласыңыз."
              )
            )}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-screen-2xl px-12 py-24">
        <div className="grid grid-cols-12 gap-16">
          <div className="col-span-12 flex flex-col gap-12 md:col-span-5">
            <div className="space-y-8">
              <div className="group flex items-start gap-6">
                <div className="rounded-xl bg-primary-fixed p-4 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                  <span className="material-symbols-outlined text-2xl">
                    location_on
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                    {t(L("Наш адрес", "Біздің мекенжай"))}
                  </span>
                  <span className="text-xl font-semibold text-on-surface">
                    {addressLine}
                  </span>
                </div>
              </div>
              <div className="group flex items-start gap-6">
                <div className="rounded-xl bg-primary-fixed p-4 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                  <span className="material-symbols-outlined text-2xl">call</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                    {t(L("Телефон для справок", "Анықтама телефоны"))}
                  </span>
                  <a
                    className="text-xl font-semibold text-on-surface transition-colors hover:text-primary"
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
                        className="text-lg font-semibold text-on-surface transition-colors hover:text-primary"
                        href={telHref(data.phoneSecondary)}
                      >
                        {data.phoneSecondary}
                      </a>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="group flex items-start gap-6">
                <div className="rounded-xl bg-primary-fixed p-4 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                  <span className="material-symbols-outlined text-2xl">mail</span>
                </div>
                <div className="flex flex-col">
                  <span className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                    {t(L("Электронная почта", "Электрондық пошта"))}
                  </span>
                  <a
                    className="text-xl font-semibold text-on-surface transition-colors hover:text-primary"
                    href={`mailto:${data.email}`}
                  >
                    {data.email}
                  </a>
                </div>
              </div>
              <div className="group flex items-start gap-6">
                <div className="rounded-xl bg-primary-fixed p-4 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                  <span className="material-symbols-outlined text-2xl">
                    schedule
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                    {t(L("Режим работы", "Жұмыс режимі"))}
                  </span>
                  <div className="space-y-2">
                    {hourLines.map((line, idx) => (
                      <div
                        key={`${line.rangeLabel}-${line.timeLabel}-${idx}`}
                        className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"
                      >
                        <span className="font-semibold text-on-surface">
                          {line.rangeLabel}
                        </span>
                        <span
                          className={
                            line.timeLabel ===
                            t(L("выходной", "демалыс"))
                              ? "text-slate-500"
                              : "font-medium text-on-surface"
                          }
                        >
                          {line.timeLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                  {sanitary.trim() ? (
                    <div className="mt-4 space-y-2 border-t border-slate-200/80 pt-4 text-sm text-slate-600">
                      <p>
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

            {data.socialLinks.length > 0 && (
              <div className="space-y-4 border-t border-slate-200/60 pt-10">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  {t(L("Мы в соцсетях", "Әлеуметтік желілерде"))}
                </h2>
                <SocialLinksRow items={data.socialLinks} variant="contacts" />
              </div>
            )}
          </div>

          <div className="col-span-12 md:col-span-7">
            <div className="relative h-[540px] w-full overflow-hidden rounded-xl border border-slate-200/50 bg-surface-container shadow-sm">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubic-grid.png')] opacity-40 grayscale" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="max-w-sm rounded-xl border border-slate-100 bg-white p-8 text-center shadow-xl">
                  <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary-container text-white">
                    <span className="material-symbols-outlined text-3xl">map</span>
                  </div>
                  <h3 className="mb-2 text-lg font-bold">
                    {t(L("Интерактивная карта", "Интерактивті карта"))}
                  </h3>
                  <p className="mb-6 text-sm text-slate-600">
                    {t(
                      L(
                        "Используйте карту для построения оптимального маршрута до библиотеки.",
                        "Кітапханаға ең қолайлы маршрутты карта арқылы құраңыз."
                      )
                    )}
                  </p>
                  <img
                    className="mb-4 h-32 w-full rounded-lg object-cover opacity-80"
                    alt=""
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-4BcLGz74mhlJ4Coth4R73SwnM4jRKc_aKMnetlecqiujk70BqPuwzzZ9FJYrkEUmfxOhpTP1NyvvyG0rEVktvAVcY5P2vHn-tQLsVe2UCwso-4xNADsaZ3nWYKeI4FVGARC4FgVAAQQUeN6YNfYnps94BgDHAXNaYsjXaa3PU176BFACnaAt160WRfre3Nw9_TPeJkZzgEzjD_YCFR5nNeKUnEgQIiyvj5xaCKu_zRPniXHQA-d0awMXgqVh1-ounklVUmsvtT5s"
                  />
                  <button
                    type="button"
                    className="w-full rounded-md bg-primary py-3 text-sm font-bold text-white"
                  >
                    {t(L("Открыть в 2ГИС", "2ГИС-те ашу"))}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200/30 bg-surface-container-low py-24">
        <div className="mx-auto max-w-screen-2xl px-12 text-center">
          <div className="mx-auto max-w-3xl space-y-8">
            <h2 className="text-3xl font-bold tracking-tight text-primary">
              {t(L("Возникли вопросы?", "Сұрақтарыңыз бар ма?"))}
            </h2>
            <p className="text-lg leading-relaxed text-slate-600">
              {t(
                L(
                  "Наши специалисты готовы ответить на ваши вопросы и помочь в работе с библиотечными ресурсами, подборе литературы или регистрации в электронной базе.",
                  "Мамандарымыз сұрақтарыңызға жауап беріп, кітапханалық ресурстармен жұмыста, әдебиет таңдауда немесе электрондық базаға тіркелуде көмектесуге дайын."
                )
              )}
            </p>
            <div className="flex justify-center pt-4">
              <a
                className="flex items-center gap-3 rounded-md bg-primary px-10 py-4 font-bold text-white transition-all hover:bg-primary-container hover:shadow-lg"
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
