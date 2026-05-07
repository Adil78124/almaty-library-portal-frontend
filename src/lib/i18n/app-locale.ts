export type AppLocale = "ru" | "kz"

export const APP_LOCALES: AppLocale[] = ["ru", "kz"]

export const LOCALE_STORAGE_KEY = "library-lang"

export function isAppLocale(v: string | null | undefined): v is AppLocale {
  return v === "ru" || v === "kz"
}

/** Значение cookie / localStorage — то же имя, что LOCALE_STORAGE_KEY. */
export function appLocaleFromRequestValue(
  v: string | null | undefined
): AppLocale {
  return isAppLocale(v) ? v : "ru"
}

/** Атрибут <html lang>: для казахского — BCP 47 `kk`. */
export function htmlLangFromAppLocale(locale: AppLocale): "ru" | "kk" {
  return locale === "kz" ? "kk" : "ru"
}

/** Текст на два языка (в БД и API — один объект). */
export type Localized = { ru: string; kz: string }

export function L(ru: string, kz?: string): Localized {
  return { ru, kz: kz ?? "" }
}

export function pickLocalized(
  loc: Localized | string | null | undefined,
  lang: AppLocale
): string {
  if (loc == null) return ""
  if (typeof loc === "string") return loc
  if (lang === "kz" && loc.kz.trim()) return loc.kz
  return loc.ru
}

/** Для Prisma: основное поле + опциональный KZ. */
export function pickDbField(
  main: string,
  alt: string | null | undefined,
  lang: AppLocale
): string {
  if (lang === "kz" && alt?.trim()) return alt
  return main
}
