"use client"

import type { SocialLink } from "@prisma/client"
import Link from "next/link"
import { useMemo } from "react"

import { FooterSocialIcons } from "@/components/FooterSocialIcons"
import { useLocale } from "@/components/i18n/locale-provider"
import { HEADER_NAV_LINKS } from "@/lib/i18n/header-nav"
import { L, pickLocalized } from "@/lib/i18n/app-locale"
import type { SiteFooterPayload } from "@/lib/site/footer-payload"
import { telHref } from "@/lib/site-contact-fallbacks"
import { formatWorkingHoursGrouped } from "@/lib/working-hours"

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
    <footer className="bg-[#00236f] text-white py-20 px-8">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white flex items-center justify-center rounded-md text-primary flex-none">
                <img
                  alt={t(L("Логотип библиотеки", "Кітапхананың елтаңбасы"))}
                  className="w-full h-full object-contain"
                  src="/images/logo.png"
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-sm font-black tracking-tighter uppercase leading-none">
                  {t(data.orgShort)}
                </span>
                <span className="text-[9px] font-bold leading-tight mt-0.5 opacity-80">
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
                  {item.href === "#" ? (
                    <a className="hover:text-white transition-colors" href="#">
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
                  <span className="text-right font-bold text-white whitespace-nowrap">
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

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-white/50 text-xs">
          <span>{t(data.copyright)}</span>
          <div className="flex gap-8">
            <a className="hover:text-white" href={data.privacyUrl || "#"}>
              {t(PRIVACY)}
            </a>
            <a className="hover:text-white" href={data.termsUrl || "#"}>
              {t(TERMS)}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
