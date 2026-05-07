"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { LanguageSwitcher } from "@/components/i18n/language-switcher"
import { useLocale } from "@/components/i18n/locale-provider"
import { HEADER_NAV_LINKS } from "@/lib/i18n/header-nav"
import { L, pickLocalized } from "@/lib/i18n/app-locale"

type PublicContacts = {
  orgNameShort: string
  orgNameLong: string
  orgNameShortKz: string | null
  orgNameLongKz: string | null
}

export default function Header() {
  const pathname = usePathname()
  const { locale } = useLocale()
  const t = (v: Parameters<typeof pickLocalized>[0]) => pickLocalized(v, locale)
  const [contacts, setContacts] = useState<PublicContacts | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/public/contacts", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: PublicContacts) => {
        if (!cancelled) setContacts(data)
      })
      .catch(() => {
        /* ignore */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const orgShort = contacts
    ? pickLocalized(
        L(contacts.orgNameShort, contacts.orgNameShortKz ?? ""),
        locale
      )
    : t(L("АОУБ", "АООӘК"))
  const orgLong = contacts
    ? pickLocalized(
        L(contacts.orgNameLong, contacts.orgNameLongKz ?? ""),
        locale
      )
    : t(
        L(
          "Алматинская областная универсальная библиотека",
          "Алматы облыстық әмбебап кітапханасы"
        )
      )

  const baseLinkClassName =
    "text-[#191c1e] font-medium hover:text-[#0058be] transition-colors tracking-tight text-[12px] whitespace-nowrap"
  const activeLinkClassName =
    "text-[#00236f] font-bold border-b-2 border-[#00236f] pb-1 tracking-tight text-[12px] whitespace-nowrap"

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    if (href === "#") return false
    if (href === "/events") return pathname.startsWith("/events")
    if (href === "/news") return pathname.startsWith("/news")
    if (href === "/branches") return pathname.startsWith("/branches")
    if (href === "/digital-library") return pathname.startsWith("/digital-library")
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-[0_10px_30px_-5px_rgba(25,28,30,0.08)]">
      <div className="max-w-[1440px] mx-auto px-6 xl:px-8 py-4 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-md overflow-hidden flex-none">
            <img
              alt={t(L("Логотип библиотеки", "Кітапхананың елтаңбасы"))}
              className="w-full h-full object-cover"
              src="/images/logo.png"
            />
          </div>
          <div className="flex flex-col leading-none min-w-0">
            <span className="text-sm font-black tracking-tight text-[#00236f] uppercase whitespace-nowrap">
              {orgShort}
            </span>
            <span className="text-[9px] font-bold text-[#00236f] mt-1 whitespace-nowrap">
              {orgLong}
            </span>
          </div>
        </Link>
        <nav className="hidden xl:flex items-center gap-3 2xl:gap-4 flex-1 min-w-0 justify-center">
          {HEADER_NAV_LINKS.map((item) => {
            if (item.href === "#") {
              return (
                <a key={item.href} className={baseLinkClassName} href="#">
                  {t(item.label)}
                </a>
              )
            }
            return (
              <Link
                key={item.href}
                className={
                  isActive(item.href) ? activeLinkClassName : baseLinkClassName
                }
                href={item.href}
              >
                {t(item.label)}
              </Link>
            )
          })}
        </nav>
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <div className="relative hidden xl:block">
            <input
              className="bg-surface-container-low border-none rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#00236f] transition-all w-[120px]"
              placeholder={t(L("Поиск…", "Іздеу…"))}
              type="text"
            />
            <span className="material-symbols-outlined absolute right-3 top-2 text-outline text-sm">
              search
            </span>
          </div>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}
