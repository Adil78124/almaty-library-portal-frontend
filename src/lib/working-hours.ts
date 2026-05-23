import { z } from "zod"

import type { AppLocale } from "@/lib/i18n/app-locale"

export const DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const

export type DayKey = (typeof DAY_KEYS)[number]

export type DaySchedule =
  | { isOpen: false }
  | { isOpen: true; from: string; to: string }

export type WorkingHours = Record<DayKey, DaySchedule>

const timeHHmm = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Ожидается время ЧЧ:ММ")

const dayScheduleSchema = z.discriminatedUnion("isOpen", [
  z.object({ isOpen: z.literal(false) }),
  z.object({
    isOpen: z.literal(true),
    from: timeHHmm,
    to: timeHHmm,
  }),
])

export const workingHoursSchema = z.object({
  monday: dayScheduleSchema,
  tuesday: dayScheduleSchema,
  wednesday: dayScheduleSchema,
  thursday: dayScheduleSchema,
  friday: dayScheduleSchema,
  saturday: dayScheduleSchema,
  sunday: dayScheduleSchema,
})

export const DEFAULT_WORKING_HOURS: WorkingHours = {
  monday: { isOpen: true, from: "09:00", to: "18:00" },
  tuesday: { isOpen: true, from: "09:00", to: "18:00" },
  wednesday: { isOpen: true, from: "09:00", to: "18:00" },
  thursday: { isOpen: true, from: "09:00", to: "18:00" },
  friday: { isOpen: true, from: "09:00", to: "18:00" },
  saturday: { isOpen: true, from: "10:00", to: "16:00" },
  sunday: { isOpen: false },
}

const DAY_SHORT_LABELS: Record<AppLocale, Record<DayKey, string>> = {
  ru: {
    monday: "Пн",
    tuesday: "Вт",
    wednesday: "Ср",
    thursday: "Чт",
    friday: "Пт",
    saturday: "Сб",
    sunday: "Вс",
  },
  kz: {
    monday: "Дүй",
    tuesday: "Сей",
    wednesday: "Сәр",
    thursday: "Бей",
    friday: "Жұм",
    saturday: "Сен",
    sunday: "Жек",
  },
}

const DAY_FULL_LABELS: Record<AppLocale, Record<DayKey, string>> = {
  ru: {
    monday: "понедельник",
    tuesday: "вторник",
    wednesday: "среда",
    thursday: "четверг",
    friday: "пятница",
    saturday: "суббота",
    sunday: "воскресенье",
  },
  kz: {
    monday: "дүйсенбі",
    tuesday: "сейсенбі",
    wednesday: "сәрсенбі",
    thursday: "бейсенбі",
    friday: "жұма",
    saturday: "сенбі",
    sunday: "жексенбі",
  },
}

function dayShortLabel(key: DayKey, lang: AppLocale): string {
  return DAY_SHORT_LABELS[lang][key]
}

/** Полное имя дня недели для UI (публичный сайт и админка с учётом локали). */
export function dayFullLabel(key: DayKey, lang: AppLocale): string {
  return DAY_FULL_LABELS[lang][key]
}

function scheduleSignature(d: DaySchedule): string {
  if (!d.isOpen) return "closed"
  return `${d.from}|${d.to}`
}

function formatTimeCell(d: DaySchedule, lang: AppLocale): string {
  if (!d.isOpen) return lang === "kz" ? "демалыс" : "выходной"
  return `${d.from}–${d.to}`
}

/** Сгруппировать подряд идущие дни с одинаковым режимом (Пн–Пт …). */
export function formatWorkingHoursGrouped(
  raw: unknown,
  lang: AppLocale = "ru"
): { rangeLabel: string; timeLabel: string }[] {
  const parsed = workingHoursSchema.safeParse(raw)
  const wh = parsed.success ? parsed.data : DEFAULT_WORKING_HOURS

  const lines: { rangeLabel: string; timeLabel: string }[] = []
  let i = 0
  while (i < DAY_KEYS.length) {
    const key0 = DAY_KEYS[i]
    const sig = scheduleSignature(wh[key0])
    let j = i + 1
    while (j < DAY_KEYS.length && scheduleSignature(wh[DAY_KEYS[j]]) === sig) {
      j += 1
    }
    const keyLast = DAY_KEYS[j - 1]
    const rangeLabel =
      i === j - 1
        ? dayShortLabel(key0, lang)
        : `${dayShortLabel(key0, lang)}–${dayShortLabel(keyLast, lang)}`
    lines.push({
      rangeLabel,
      timeLabel: formatTimeCell(wh[key0], lang),
    })
    i = j
  }
  return lines
}

export function normalizeWorkingHoursInput(raw: unknown): WorkingHours {
  const r = workingHoursSchema.safeParse(raw)
  return r.success ? r.data : DEFAULT_WORKING_HOURS
}
