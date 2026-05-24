"use client"

import type { SocialLink } from "@prisma/client"
import Link from "next/link"
import { useMemo } from "react"

import { FooterSocialIcons } from "@/components/FooterSocialIcons"
import { FooterVisitCounter } from "@/components/analytics/footer-visit-counter"
import { useLocale } from "@/components/i18n/locale-provider"
import { HEADER_NAV_LINKS } from "@/lib/i18n/header-nav"
import { L, pickLocalized } from "@/lib/i18n/app-locale"
import type { SiteFooterPayload } from "@/lib/site/footer-payload"
import { telHref } from "@/lib/site-contact-fallbacks"
import { formatWorkingHoursGrouped } from "@/lib/working-hours"
import { isExternalHref } from "@/lib/digital-library-url"

const SECTIONS = L("Разделы", "Бөлімдер")
const HOURS = L("Часы работы", "Жұмыс уақыты")
const CONTACTS = L("Контакты", "Байланыс")
const SAN_LABEL = L("Санитарный день:", "Санитарлық күн:")
const PRIVACY = L("Политика конфиденциальности", "Құпиялылық саясаты")
const TERMS = L("Правила пользования", "Пайдалану ережелері")

type Props = {
  data: SiteFooterPayload
  socialLinks: SocialLink[]
}

export function SiteFooterClient({ data, socialLinks }: Props) {
  const { locale } = useLocale()
  const t = (v: Parameters<typeof pickLocalized>[0]) => pickLocalized(v, locale)
  const hourLines = useMemo(
    () => formatWorkingHoursGrouped(data.workingHoursRaw, locale),
    [data.workingHoursRaw, locale]
  )

  return (
    <footer className="bg-[#00236f] text-white py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-[1440px] mx-auto min-w-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 mb-12 sm:mb-16">
          <div className="flex flex-col gap-6 min-w-0 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-start gap-3 sm:gap-4 min-w-0">
              <div className="w-10 h-10 bg-white flex items-center justify-center rounded-md text-primary flex-none shrink-0">
                <img
                  alt={t(L("Логотип библиотеки", "Кітапхананың елтаңбасы"))}
                  className="w-full h-full object-contain"
                  src="/images/logo.png"
                />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <span className="text-sm font-black tracking-tighter uppercase leading-snug break-words">
                  {t(data.orgShort)}
                </span>
                <span className="text-[9px] font-bold leading-snug mt-0.5 opacity-80 break-words">
                  {t(data.orgLong)}
                </span>
              </div>
            </Link>
            <p className="text-white/70 text-sm leading-relaxed">{t(data.tagline)}</p>
          </div>

          <div>
            <h4 className="font-black text-lg mb-8 uppercase tracking-widest">
              {t(SECTIONS)}
            </h4>
            <ul className="space-y-4 text-white/70 text-sm">
              {HEADER_NAV_LINKS.map((item) => (
                <li key={item.href}>
                  {item.href === "#" || isExternalHref(item.href) ? (
                    <a
                      className="hover:text-white transition-colors"
                      href={item.href}
                      {...(isExternalHref(item.href)
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {t(item.label)}
                    </a>
                  ) : (
                    <Link
                      className="hover:text-white transition-colors"
                      href={item.href}
                    >
                      {t(item.label)}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black text-lg mb-8 uppercase tracking-widest">
              {t(HOURS)}
            </h4>
            <ul className="space-y-4 text-white/70 text-sm">
              {hourLines.map((line, idx) => (
                <li
                  key={`${line.rangeLabel}-${line.timeLabel}-${idx}`}
                  className="flex justify-between gap-4"
                >
                  <span className="shrink-0">{line.rangeLabel}</span>
                  <span className="text-right font-bold text-white break-words sm:whitespace-nowrap sm:text-right max-w-[55%] sm:max-w-none">
                    {line.timeLabel}
                  </span>
                </li>
              ))}
            </ul>
            {(t(data.sanitary).trim() || data.sanitary.ru || data.sanitary.kz) && (
              <div className="mt-6 space-y-2 border-t border-white/10 pt-4 text-xs leading-relaxed text-white/60">
                <p>
                  <span className="font-bold text-white/80">{t(SAN_LABEL)} </span>
                  {t(data.sanitary)}
                </p>
              </div>
            )}
          </div>

          <div>
            <h4 className="font-black text-lg mb-8 uppercase tracking-widest">
              {t(CONTACTS)}
            </h4>
            <ul className="space-y-4 text-white/70 text-sm mb-8">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-white">
                  location_on
                </span>{" "}
                <span className="block">{t(data.address)}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-white">call</span>{" "}
                <span className="flex flex-col gap-1">
                  <a className="hover:text-white" href={telHref(data.phone)}>
                    {data.phone}
                  </a>
                  {data.phoneSecondary ? (
                    <a
                      className="hover:text-white text-sm"
                      href={telHref(data.phoneSecondary)}
                    >
                      {data.phoneSecondary}
                    </a>
                  ) : null}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-white">mail</span>{" "}
                <a className="hover:text-white" href={`mailto:${data.email}`}>
                  {data.email}
                </a>
              </li>
            </ul>
            <FooterSocialIcons items={socialLinks} />
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 text-white/50 text-xs text-center md:text-left">
          <span className="break-words max-w-full">{t(data.copyright)}</span>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 sm:gap-8">
            <a className="hover:text-white" href={data.privacyUrl || "#"}>
              {t(PRIVACY)}
            </a>
            <a className="hover:text-white" href={data.termsUrl || "#"}>
              {t(TERMS)}
            </a>
          </div>
        </div>
        <div className="pt-8">
          <FooterVisitCounter />
        </div>
      </div>
    </footer>
  )
}
