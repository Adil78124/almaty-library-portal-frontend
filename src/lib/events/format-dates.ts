import type { AppLocale } from "@/lib/i18n/app-locale"

export function parseEventDate(
  value: Date | string | null | undefined
): Date | null {
  if (value == null) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function eventDateLocale(locale?: AppLocale): string {
  return locale === "kz" ? "kk-KZ" : "ru-RU"
}

export function formatEventMonthUpper(
  value: Date | string | null | undefined,
  locale?: AppLocale
): string {
  const date = parseEventDate(value)
  if (!date) return ""
  return date
    .toLocaleDateString(eventDateLocale(locale), { month: "long" })
    .toUpperCase()
}

export function formatEventCardDate(
  value: Date | string | null | undefined,
  locale?: AppLocale
): string {
  const date = parseEventDate(value)
  if (!date) return ""
  return date.toLocaleDateString(eventDateLocale(locale), {
    day: "2-digit",
    month: "long",
  })
}

export function formatEventShortDateTime(
  value: Date | string | null | undefined,
  locale?: AppLocale
): string {
  const date = parseEventDate(value)
  if (!date) return ""
  return date.toLocaleDateString(eventDateLocale(locale), {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatEventFullDateTime(
  value: Date | string | null | undefined,
  locale?: AppLocale,
  fallbackTime?: string | null
): string {
  const date = parseEventDate(value)
  if (!date) return ""
  const datePart = date.toLocaleDateString(eventDateLocale(locale), {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).replace(" г.", "")
  const rawTime = (fallbackTime ?? "").trim()
  const timePart =
    rawTime ||
    date.toLocaleTimeString(eventDateLocale(locale), {
      hour: "2-digit",
      minute: "2-digit",
    })
  return timePart ? `${datePart}, ${timePart}` : datePart
}
