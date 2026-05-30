"use client"

import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"

import { L, pickLocalized } from "@/lib/i18n/app-locale"

import { useLocale } from "./locale-provider"

const btn =
  "relative z-10 flex h-8 min-w-[2.75rem] flex-1 items-center justify-center rounded-full px-3 text-xs font-black transition-colors"

export function LanguageSwitcher() {
  const router = useRouter()
  const { locale, setLocale } = useLocale()
  const t = (v: Parameters<typeof pickLocalized>[0]) => pickLocalized(v, locale)

  const setLang = (next: "ru" | "kz") => {
    setLocale(next)
    // Важно: серверные компоненты читают язык из cookie,
    // поэтому делаем refresh, чтобы обновилось ВСЁ (динамика + статика).
    router.refresh()
  }

  return (
    <div
      className="relative grid h-10 min-w-[6.25rem] grid-cols-2 items-center overflow-hidden rounded-full border border-[#00236f]/15 bg-white p-1 shadow-[0_6px_18px_-10px_rgba(0,35,111,0.65),0_1px_4px_rgba(0,35,111,0.16)]"
      role="group"
      aria-label={t(L("Переключение языка: русский или қазақша", "Тілді ауыстыру: орыс немесе қазақша"))}
    >
      <span
        className={cn(
          "absolute left-1 top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-full bg-[#00236f] shadow-sm transition-transform duration-200 ease-out",
          locale === "kz" ? "translate-x-full" : "translate-x-0"
        )}
        aria-hidden="true"
      />
      <button
        type="button"
        className={cn(
          btn,
          locale === "ru"
            ? "text-white"
            : "text-[#00236f] hover:bg-[#00236f]/5"
        )}
        onClick={() => setLang("ru")}
      >
        RU
      </button>
      <button
        type="button"
        className={cn(
          btn,
          locale === "kz"
            ? "text-white"
            : "text-[#00236f] hover:bg-[#00236f]/5"
        )}
        onClick={() => setLang("kz")}
      >
        KZ
      </button>
    </div>
  )
}
