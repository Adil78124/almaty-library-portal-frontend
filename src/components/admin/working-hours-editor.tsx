"use client"

import { useLocale } from "@/components/i18n/locale-provider"
import { Label } from "@/components/ui/label"
import { L, pickLocalized } from "@/lib/i18n/app-locale"
import { cn } from "@/lib/utils"
import {
  DAY_KEYS,
  dayFullLabel,
  type DayKey,
  type WorkingHours,
} from "@/lib/working-hours"

type Props = {
  value: WorkingHours
  onChange: (next: WorkingHours) => void
}

export function WorkingHoursEditor({ value, onChange }: Props) {
  const { locale } = useLocale()
  const t = (v: Parameters<typeof pickLocalized>[0]) => pickLocalized(v, locale)

  function patchDay(key: DayKey, next: WorkingHours[DayKey]) {
    onChange({ ...value, [key]: next })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base">
          {t(L("Режим работы", "Жұмыс режимі"))}
        </Label>
        <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
          {t(
            L(
              "Для каждого дня укажите, открыт ли филиал, и интервал времени. На сайте дни с одинаковым графиком объединяются.",
              "Әр күн үшін филиал ашық па және уақыт аралығын көрсетіңіз. Сайтта бірдей кестелі күндер біріктіріледі."
            )
          )}
        </p>
      </div>
      <div className="divide-y rounded-lg border">
        {DAY_KEYS.map((key) => {
          const d = value[key]
          const open = d.isOpen === true
          return (
            <div
              key={key}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-center"
            >
              <div className="min-w-[140px] text-sm font-medium">
                {dayFullLabel(key, locale)}
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4 rounded border-input accent-primary"
                  checked={open}
                  onChange={(e) => {
                    if (e.target.checked) {
                      patchDay(key, { isOpen: true, from: "09:00", to: "18:00" })
                    } else {
                      patchDay(key, { isOpen: false })
                    }
                  }}
                />
                {t(L("Работает", "Жұмыс істейді"))}
              </label>
              {open && (
                <div className="flex flex-wrap items-center gap-2 sm:ml-2">
                  <span className="text-muted-foreground text-xs">
                    {t(L("с", "бастап"))}
                  </span>
                  <input
                    type="time"
                    className={cn(
                      "h-9 rounded-md border border-input bg-background px-2 text-sm shadow-xs",
                      "outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    )}
                    value={d.from}
                    onChange={(e) =>
                      patchDay(key, {
                        isOpen: true,
                        from: e.target.value,
                        to: d.to,
                      })
                    }
                  />
                  <span className="text-muted-foreground text-xs">
                    {t(L("до", "дейін"))}
                  </span>
                  <input
                    type="time"
                    className={cn(
                      "h-9 rounded-md border border-input bg-background px-2 text-sm shadow-xs",
                      "outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    )}
                    value={d.to}
                    onChange={(e) =>
                      patchDay(key, {
                        isOpen: true,
                        from: d.from,
                        to: e.target.value,
                      })
                    }
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
