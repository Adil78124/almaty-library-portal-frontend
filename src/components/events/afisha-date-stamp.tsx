import type { AfishaDateParts } from "@/lib/events/home-afisha-card"
import { cn } from "@/lib/utils"

type Props = {
  parts: AfishaDateParts
  className?: string
  compact?: boolean
}

export function AfishaDateStamp({ parts, className, compact = false }: Props) {
  const metaParts = [parts.time].filter(Boolean)

  return (
    <div
      className={cn(
        "flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-1 text-primary",
        className
      )}
    >
      <span className="inline-flex shrink-0 items-baseline gap-x-2 whitespace-nowrap text-primary">
        <span
          className={`font-black leading-none tabular-nums text-primary ${
            compact ? "text-4xl" : "text-3xl sm:text-4xl"
          }`}
        >
          {parts.day}
        </span>
        <span
          className={`font-black uppercase leading-none text-primary ${
            compact ? "text-[11px] tracking-widest" : "text-xs sm:text-sm tracking-widest"
          }`}
        >
          {parts.month}
        </span>
      </span>
      {metaParts.map((part, idx) => (
        <span
          key={`${part}-${idx}`}
          className={`inline-flex items-center gap-x-1.5 whitespace-nowrap font-black uppercase leading-none text-primary ${
            compact ? "text-[11px] tracking-widest" : "text-xs sm:text-sm tracking-widest"
          }`}
        >
          <span aria-hidden="true">|</span>
          <span>{part}</span>
        </span>
      ))}
    </div>
  )
}
