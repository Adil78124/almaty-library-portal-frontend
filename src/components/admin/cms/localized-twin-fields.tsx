"use client"

import { L, type Localized } from "@/lib/i18n/app-locale"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const ta = cn(
  "flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm",
  "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
)

type Props = {
  value: Localized | string
  onChange: (next: Localized) => void
  labelRu?: string
  labelKz?: string
  multiline?: boolean
}

export function LocalizedTwinFields({
  value,
  onChange,
  labelRu = "Русский",
  labelKz = "Қазақша",
  multiline,
}: Props) {
  const v = typeof value === "string" ? L(value, "") : value
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{labelRu}</Label>
        {multiline ? (
          <textarea
            className={ta}
            rows={4}
            value={v.ru}
            onChange={(e) => onChange({ ...v, ru: e.target.value })}
          />
        ) : (
          <Input
            value={v.ru}
            onChange={(e) => onChange({ ...v, ru: e.target.value })}
          />
        )}
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{labelKz}</Label>
        {multiline ? (
          <textarea
            className={ta}
            rows={4}
            value={v.kz}
            onChange={(e) => onChange({ ...v, kz: e.target.value })}
          />
        ) : (
          <Input
            value={v.kz}
            onChange={(e) => onChange({ ...v, kz: e.target.value })}
          />
        )}
      </div>
    </div>
  )
}
