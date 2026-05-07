import { normalizeSocialIconStored } from "@/lib/social-icon-normalize"

/** Ссылка филиала (JSON в Branch.socialLinksJson). */
export type BranchSocialLink = {
  label: string
  labelKz?: string | null
  url: string
  /** Ключ иконки на сайте (instagram, youtube, …); без поля — как универсальная ссылка. */
  icon?: string
}

export function parseBranchSocialLinksJson(
  raw: string | null | undefined
): BranchSocialLink[] {
  if (!raw?.trim()) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    const out: BranchSocialLink[] = []
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue
      const o = item as Record<string, unknown>
      if (typeof o.label !== "string" || typeof o.url !== "string") continue
      const label = o.label.trim()
      const url = o.url.trim()
      if (!label || !url) continue
      const labelKz =
        typeof o.labelKz === "string" && o.labelKz.trim()
          ? o.labelKz.trim()
          : null
      let icon: string | undefined
      if (typeof o.icon === "string" && o.icon.trim()) {
        const ic = normalizeSocialIconStored(o.icon)
        if (ic !== "link") icon = ic
      }
      const base = icon ? { label, url, icon } : { label, url }
      out.push(
        labelKz ? { ...base, labelKz } : base
      )
    }
    return out
  } catch {
    return []
  }
}

/** Сериализация для поля БД; пустой список → пустая строка (форма дальше шлёт null). */
export function branchSocialLinksToJson(
  items: {
    label: string
    labelKz?: string | null
    url: string
    icon?: string
  }[]
): string {
  const normalized: BranchSocialLink[] = []
  for (const l of items) {
    const label = l.label.trim()
    const url = l.url.trim()
    if (!label || !url) continue
    const labelKz = l.labelKz?.trim() || null
    const iconRaw = l.icon?.trim() ? normalizeSocialIconStored(l.icon) : undefined
    const icon = iconRaw && iconRaw !== "link" ? iconRaw : undefined
    const base = icon ? { label, url, icon } : { label, url }
    normalized.push(labelKz ? { ...base, labelKz } : base)
  }
  if (normalized.length === 0) return ""
  return JSON.stringify(normalized)
}
