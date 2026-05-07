"use client"

import type { SocialLink } from "@prisma/client"

import { useLocale } from "@/components/i18n/locale-provider"
import { pickDbField } from "@/lib/i18n/app-locale"
import { SocialIcon } from "@/lib/social-icons"
import { cn } from "@/lib/utils"

function socialLabel(
  label: string,
  labelKz: string | null | undefined,
  locale: Parameters<typeof pickDbField>[2]
): string {
  const kz = (labelKz ?? "").trim()
  return pickDbField(label, kz ? kz : label, locale)
}

type Props = {
  items: SocialLink[]
  variant: "footer" | "contacts"
  className?: string
}

export function SocialLinksRow({ items, variant, className }: Props) {
  const { locale } = useLocale()
  const labelShown = (item: SocialLink) =>
    socialLabel(item.label, item.labelKz, locale)

  if (items.length === 0) return null

  if (variant === "footer") {
    return (
      <div className={cn("flex flex-wrap gap-4", className)}>
        {items.map((item) => (
          <a
            key={item.id}
            className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20"
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={labelShown(item)}
            title={labelShown(item)}
          >
            <SocialIcon icon={item.icon} className="size-5" />
          </a>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {items.map((item) => (
        <a
          key={item.id}
          className="flex size-12 items-center justify-center rounded-xl bg-primary-fixed text-primary shadow-sm transition-all hover:bg-primary hover:text-white"
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={labelShown(item)}
          title={labelShown(item)}
        >
          <SocialIcon icon={item.icon} className="size-6" />
        </a>
      ))}
    </div>
  )
}
