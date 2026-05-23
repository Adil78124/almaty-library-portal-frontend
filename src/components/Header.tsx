"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { LanguageSwitcher } from "@/components/i18n/language-switcher"
import { useLocale } from "@/components/i18n/locale-provider"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { HEADER_NAV_LINKS } from "@/lib/i18n/header-nav"
import { L, pickLocalized } from "@/lib/i18n/app-locale"
import { SITE_CONTACT_FALLBACK } from "@/lib/site-contact-fallbacks"
import { isExternalHref } from "@/lib/digital-library-url"

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
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

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
    : t(L(SITE_CONTACT_FALLBACK.orgNameShort, SITE_CONTACT_FALLBACK.orgNameShortKz))
  const orgLong = contacts
    ? pickLocalized(
        L(contacts.orgNameLong, contacts.orgNameLongKz ?? ""),
        locale
      )
    : t(L(SITE_CONTACT_FALLBACK.orgNameLong, SITE_CONTACT_FALLBACK.orgNameLongKz))

  const baseLinkClassName =
    "text-[#191c1e] font-medium hover:text-[#0058be] transition-colors tracking-tight text-[12px] xl:whitespace-nowrap break-words"
  const activeLinkClassName =
    "text-[#00236f] font-bold border-b-2 border-[#00236f] pb-1 tracking-tight text-[12px] xl:whitespace-nowrap break-words"

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    if (href === "#") return false
    if (href === "/events") return pathname.startsWith("/events")
    if (href === "/news") return pathname.startsWith("/news")
    if (href === "/branches") return pathname.startsWith("/branches")
    if (isExternalHref(href)) return false
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const closeMobileNav = () => setMobileNavOpen(false)

  return (
    <header className="fixed top-0 w-full max-w-[100vw] z-40 bg-white/90 backdrop-blur-md shadow-[0_10px_30px_-5px_rgba(25,28,30,0.08)]">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-5 xl:px-8 py-3 sm:py-4 flex items-center gap-2 sm:gap-4 min-w-0">
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 xl:flex-initial"
          onClick={closeMobileNav}
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-md overflow-hidden flex-none">
            <img
              alt={t(L("Логотип библиотеки", "Кітапхананың елтаңбасы"))}
              className="w-full h-full object-cover"
              src="/images/logo.png"
            />
          </div>
          <div className="flex flex-col leading-tight min-w-0">
            <span className="text-xs sm:text-sm font-black tracking-tight text-[#00236f] uppercase break-words line-clamp-2 xl:line-clamp-1 xl:whitespace-nowrap xl:text-ellipsis xl:overflow-hidden">
              {orgShort}
            </span>
            <span className="text-[8px] sm:text-[9px] font-bold text-[#00236f] mt-0.5 break-words line-clamp-2 xl:line-clamp-1 xl:whitespace-nowrap xl:text-ellipsis xl:overflow-hidden">
              {orgLong}
            </span>
          </div>
        </Link>

        <button
          type="button"
          className="xl:hidden inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#00236f]/15 bg-white text-[#00236f] shadow-sm transition-colors hover:bg-surface-container-low"
          aria-expanded={mobileNavOpen}
          aria-controls="site-mobile-nav"
          aria-label={t(L("Открыть меню", "Мәзірді ашу"))}
          onClick={() => setMobileNavOpen(true)}
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <nav
          className="hidden xl:flex items-center gap-3 2xl:gap-4 flex-1 min-w-0 justify-center"
          aria-label={t(L("Основная навигация", "Негізгі бағдарлама"))}
        >
          {HEADER_NAV_LINKS.map((item) => {
            if (item.href === "#" || isExternalHref(item.href)) {
              return (
                <a
                  key={item.href}
                  className={baseLinkClassName}
                  href={item.href}
                  {...(isExternalHref(item.href)
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
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
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="relative hidden md:block">
            <input
              className="bg-surface-container-low border-none rounded-md pl-3 pr-9 py-2 text-sm focus:ring-2 focus:ring-[#00236f] transition-all w-[min(100%,160px)] lg:w-[200px] xl:w-[120px] 2xl:w-[160px]"
              placeholder={t(L("Поиск…", "Іздеу…"))}
              type="search"
              autoComplete="off"
            />
            <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-outline text-sm">
              search
            </span>
          </div>
          <div className="hidden shrink-0 origin-right scale-100 xl:block">
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side="right"
          id="site-mobile-nav"
          className="flex h-full min-h-0 w-[min(100vw-1rem,22rem)] flex-col overflow-hidden gap-0 p-0 sm:max-w-sm z-50"
          showCloseButton
        >
          <SheetHeader className="border-b border-border px-4 py-4 text-left">
            <SheetTitle className="text-primary font-black text-sm uppercase tracking-wide">
              {t(L("Меню", "Мәзір"))}
            </SheetTitle>
          </SheetHeader>
          <div className="px-4 py-3 border-b border-border">
            <div className="relative">
              <input
                className="w-full bg-surface-container-low border-none rounded-md pl-3 pr-9 py-2.5 text-sm focus:ring-2 focus:ring-primary"
                placeholder={t(L("Поиск…", "Іздеу…"))}
                type="search"
                autoComplete="off"
              />
              <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-outline text-sm">
                search
              </span>
            </div>
          </div>
          <nav
            className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-2 py-3"
            aria-label={t(L("Мобильная навигация", "Мобильді бағдарлама"))}
          >
            {HEADER_NAV_LINKS.map((item) => {
              const cls = [
                "block rounded-md px-3 py-2.5 text-sm font-semibold transition-colors break-words",
                isActive(item.href)
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface hover:bg-surface-container-low",
              ].join(" ")
              if (item.href === "#" || isExternalHref(item.href)) {
                return (
                  <a
                    key={`m-${item.href}-${t(item.label)}`}
                    className={cls}
                    href={item.href}
                    {...(isExternalHref(item.href)
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    onClick={closeMobileNav}
                  >
                    {t(item.label)}
                  </a>
                )
              }
              return (
                <Link
                  key={`m-${item.href}`}
                  className={cls}
                  href={item.href}
                  onClick={closeMobileNav}
                >
                  {t(item.label)}
                </Link>
              )
            })}
          </nav>
          <div className="shrink-0 border-t border-border bg-popover px-4 py-4">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {t(L("Язык интерфейса", "Интерфейс тілі"))}
            </p>
            <div className="flex justify-start [&_button]:min-h-11 [&_button]:min-w-[3rem] [&_button]:text-sm">
              <LanguageSwitcher />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
