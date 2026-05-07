"use client"

import Link from "next/link"
import { Library } from "lucide-react"

import { useLocale } from "@/components/i18n/locale-provider"
import { L, pickLocalized } from "@/lib/i18n/app-locale"

export function LoginPageBrandLink() {
  const { locale } = useLocale()
  const t = (v: Parameters<typeof pickLocalized>[0]) => pickLocalized(v, locale)
  return (
    <Link
      href="/"
      className="flex items-center gap-2 font-medium text-foreground"
    >
      <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Library className="size-4" />
      </div>
      <span className="leading-tight">
        <span className="block text-sm font-black uppercase tracking-tight text-primary">
          {t(L("Админка", "Админка"))}
        </span>
        <span className="text-xs text-muted-foreground">
          {t(L("Областная библиотека", "Облыстық кітапхана"))}
        </span>
      </span>
    </Link>
  )
}

export function LoginPageAsideCaption() {
  const { locale } = useLocale()
  const t = (v: Parameters<typeof pickLocalized>[0]) => pickLocalized(v, locale)
  return (
    <p className="absolute bottom-10 left-10 right-10 text-lg font-medium text-white drop-shadow-md">
      {t(
        L(
          "Алматинская областная универсальная библиотека — управление контентом портала",
          "Алматы облыстық әмбебап кітапханасы — портал мазмұнын басқару"
        )
      )}
    </p>
  )
}
