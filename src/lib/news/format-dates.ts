import type { AppLocale } from "@/lib/i18n/app-locale"

function parseNewsDate(
  d: Date | string | null | undefined
): Date | null {
  if (d == null) return null
  if (d instanceof Date) return Number.isNaN(d.getTime()) ? null : d
  const x = new Date(d)
  return Number.isNaN(x.getTime()) ? null : x
}

function newsDateLocale(lang?: AppLocale): string {
  return lang === "kz" ? "kk-KZ" : "ru-RU"
}

export function formatNewsListDate(
  d: Date | string | null | undefined,
  lang?: AppLocale
): string {
  const dt = parseNewsDate(d)
  if (!dt) return ""
  return dt.toLocaleDateString(newsDateLocale(lang), {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function formatNewsCardDateUpper(
  d: Date | string | null | undefined,
  lang?: AppLocale
): string {
  const dt = parseNewsDate(d)
  if (!dt) return ""
  return dt
    .toLocaleDateString(newsDateLocale(lang), {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .toUpperCase()
}

/** Как на карточках списка: «12 июня 2024» → «12 Июня 2024». */
export function formatNewsListCardDate(
  d: Date | string | null | undefined,
  lang?: AppLocale
): string {
  const dt = parseNewsDate(d)
  if (!dt) return ""
  const s = dt.toLocaleDateString(newsDateLocale(lang), {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  return s.charAt(0).toUpperCase() + s.slice(1).replace(" г.", "")
}
