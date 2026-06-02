import type { AppLocale } from "@/lib/i18n/app-locale"

const EVENT_TIME_ZONE = "Asia/Almaty"

const EVENT_MONTHS: Record<
  AppLocale,
  { long: string[]; short: string[] }
> = {
  ru: {
    long: [
      "января",
      "февраля",
      "марта",
      "апреля",
      "мая",
      "июня",
      "июля",
      "августа",
      "сентября",
      "октября",
      "ноября",
      "декабря",
    ],
    short: [
      "янв",
      "фев",
      "мар",
      "апр",
      "май",
      "июн",
      "июл",
      "авг",
      "сен",
      "окт",
      "ноя",
      "дек",
    ],
  },
  kz: {
    long: [
      "қаңтар",
      "ақпан",
      "наурыз",
      "сәуір",
      "мамыр",
      "маусым",
      "шілде",
      "тамыз",
      "қыркүйек",
      "қазан",
      "қараша",
      "желтоқсан",
    ],
    short: [
      "қаң",
      "ақп",
      "наур",
      "сәу",
      "мам",
      "маус",
      "шіл",
      "там",
      "қырк",
      "қаз",
      "қар",
      "желт",
    ],
  },
}

export type EventDateParts = {
  day: number
  monthIndex: number
  year: number
  hour: number
  minute: number
}

export function parseEventDate(
  value: Date | string | null | undefined
): Date | null {
  if (value == null) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function parseTimezoneLessParts(value: string): EventDateParts | null {
  const trimmed = value.trim()
  if (!trimmed || /(?:z|[+-]\d{2}:?\d{2})$/i.test(trimmed)) return null

  const match = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?/
  )
  if (!match) return null

  const year = Number(match[1])
  const monthIndex = Number(match[2]) - 1
  const day = Number(match[3])
  const hour = Number(match[4] ?? 0)
  const minute = Number(match[5] ?? 0)
  if (
    monthIndex < 0 ||
    monthIndex > 11 ||
    day < 1 ||
    day > 31 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null
  }

  return { day, monthIndex, year, hour, minute }
}

export function getEventDateParts(
  value: Date | string | null | undefined
): EventDateParts | null {
  if (typeof value === "string") {
    const timezoneLess = parseTimezoneLessParts(value)
    if (timezoneLess) return timezoneLess
  }

  const date = parseEventDate(value)
  if (!date) return null

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: EVENT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date)

  const byType = new Map(parts.map((part) => [part.type, part.value]))
  const year = Number(byType.get("year"))
  const monthIndex = Number(byType.get("month")) - 1
  const day = Number(byType.get("day"))
  const hour = Number(byType.get("hour") ?? 0)
  const minute = Number(byType.get("minute") ?? 0)

  if ([year, monthIndex, day, hour, minute].some(Number.isNaN)) return null
  return { day, monthIndex, year, hour, minute }
}

function monthName(
  monthIndex: number,
  locale: AppLocale,
  width: "long" | "short"
): string {
  return EVENT_MONTHS[locale][width][monthIndex] ?? ""
}

function two(value: number): string {
  return String(value).padStart(2, "0")
}

function formatTime(parts: EventDateParts): string {
  return `${two(parts.hour)}:${two(parts.minute)}`
}

export function formatEventMonthUpper(
  value: Date | string | null | undefined,
  locale?: AppLocale
): string {
  const parts = getEventDateParts(value)
  if (!parts) return ""
  return monthName(parts.monthIndex, locale ?? "ru", "long").toUpperCase()
}

export function formatEventCardDate(
  value: Date | string | null | undefined,
  locale?: AppLocale
): string {
  const parts = getEventDateParts(value)
  if (!parts) return ""
  return `${two(parts.day)} ${monthName(parts.monthIndex, locale ?? "ru", "long")}`
}

export function formatEventShortDateTime(
  value: Date | string | null | undefined,
  locale?: AppLocale
): string {
  const parts = getEventDateParts(value)
  if (!parts) return ""
  return `${two(parts.day)} ${monthName(
    parts.monthIndex,
    locale ?? "ru",
    "short"
  )} | ${formatTime(parts)}`
}

export function formatEventFullDateTime(
  value: Date | string | null | undefined,
  locale?: AppLocale,
  fallbackTime?: string | null
): string {
  const parts = getEventDateParts(value)
  if (!parts) return ""
  const datePart = `${two(parts.day)} ${monthName(
    parts.monthIndex,
    locale ?? "ru",
    "long"
  )} ${parts.year}`
  const rawTime = (fallbackTime ?? "").trim()
  const timePart = rawTime || formatTime(parts)
  return timePart ? `${datePart}, ${timePart}` : datePart
}

export function formatEventCalendarMonthTitle(
  year: number,
  monthIndex: number,
  locale?: AppLocale
): string {
  const month = monthName(monthIndex, locale ?? "ru", "long")
  return month ? `${month} ${year}` : String(year)
}

export function formatEventLongDateFromYmd(
  ymd: string,
  locale?: AppLocale
): string {
  const parts = parseTimezoneLessParts(ymd)
  if (!parts) return ""
  return `${parts.day} ${monthName(parts.monthIndex, locale ?? "ru", "long")} ${parts.year}`
}

export function formatEventYmd(
  value: Date | string | null | undefined
): string | null {
  const parts = getEventDateParts(value)
  if (!parts) return null
  return `${parts.year}-${two(parts.monthIndex + 1)}-${two(parts.day)}`
}
