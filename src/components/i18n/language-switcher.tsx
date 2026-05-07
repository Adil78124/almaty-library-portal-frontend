"use client"

import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"

import { L, pickLocalized } from "@/lib/i18n/app-locale"

import { useLocale } from "./locale-provider"

const btn =
  "rounded px-2.5 py-1 text-xs font-bold transition-colors min-w-[2.25rem]"

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
      className="flex items-center rounded-md border border-[#00236f]/20 bg-white p-0.5 shadow-sm"
      role="group"
      aria-label={t(L("Переключение языка: русский или қазақша", "Тілді ауыстыру: орыс немесе қазақша"))}
    >
      <button
        type="button"
        className={cn(
          btn,
          locale === "ru"
            ? "bg-[#00236f] text-white"
            : "text-[#00236f] hover:bg-slate-100"
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
            ? "bg-[#00236f] text-white"
            : "text-[#00236f] hover:bg-slate-100"
        )}
        onClick={() => setLang("kz")}
      >
        KZ
      </button>
    </div>
  )
}
