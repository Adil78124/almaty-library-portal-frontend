import type { SocialLink } from "@prisma/client"

import { SocialLinksRow } from "@/components/social/social-links-row"

/** Только разметка: данные загружаются на сервере и передаются сюда (нельзя Prisma в Client Component). */
export function FooterSocialIcons({
  items,
  className,
}: {
  items: SocialLink[]
  className?: string
}) {
  return <SocialLinksRow items={items} variant="footer" className={className} />
}
