import { L, type Localized } from "@/lib/i18n/app-locale"

import type { AboutSection } from "./types"
import { ABOUT_SECTION_ORDER } from "./types"

export function anyToLocalized(v: unknown): Localized {
  if (v && typeof v === "object" && "ru" in (v as object)) {
    const o = v as { ru?: unknown; kz?: unknown }
    return { ru: String(o.ru ?? ""), kz: String(o.kz ?? "") }
  }
  if (typeof v === "string") return L(v, "")
  return L("", "")
}

function normHero(data: Record<string, unknown>) {
  return {
    imageUrl: String(data.imageUrl ?? ""),
    imageAlt: anyToLocalized(data.imageAlt),
    breadcrumbLabel: anyToLocalized(data.breadcrumbLabel),
    title: anyToLocalized(data.title),
    lead: anyToLocalized(data.lead),
  }
}

function normRoleIntro(data: Record<string, unknown>) {
  const p = data.paragraphs
  let p0: unknown
  let p1: unknown
  if (Array.isArray(p) && p.length >= 2) {
    p0 = p[0]
    p1 = p[1]
  } else {
    p0 = ""
    p1 = ""
  }
  return {
    kicker: anyToLocalized(data.kicker),
    title: anyToLocalized(data.title),
    paragraphs: [anyToLocalized(p0), anyToLocalized(p1)] as [
      Localized,
      Localized,
    ],
    sideImageUrl: String(data.sideImageUrl ?? ""),
    sideImageAlt: anyToLocalized(data.sideImageAlt),
  }
}

function normTimeline(data: Record<string, unknown>) {
  const itemsRaw = Array.isArray(data.items) ? data.items : []
  const items = itemsRaw.map((it) => {
    const o = it as Record<string, unknown>
    return {
      year: anyToLocalized(o.year),
      title: anyToLocalized(o.title),
      body: anyToLocalized(o.body),
      align: (o.align === "right" ? "right" : "left") as "left" | "right",
    }
  })
  return {
    title: anyToLocalized(data.title),
    items,
  }
}

function normMission(data: Record<string, unknown>) {
  const cardsRaw = Array.isArray(data.cards) ? data.cards : []
  const cards = cardsRaw.map((c) => {
    const o = c as Record<string, unknown>
    return {
      iconName: String(o.iconName ?? "library_books"),
      title: anyToLocalized(o.title),
      body: anyToLocalized(o.body),
    }
  })
  return { cards }
}

function normFacts(data: Record<string, unknown>) {
  const statsRaw = Array.isArray(data.stats) ? data.stats : []
  const stats = statsRaw.map((s) => {
    const o = s as Record<string, unknown>
    return {
      value: anyToLocalized(o.value),
      label: anyToLocalized(o.label),
    }
  })
  return { stats }
}

function normSpace(data: Record<string, unknown>) {
  const slidesRaw = Array.isArray(data.slides) ? data.slides : []
  const slides = slidesRaw.map((sl) => {
    const o = sl as Record<string, unknown>
    return {
      imageUrl: String(o.imageUrl ?? ""),
      imageAlt: anyToLocalized(o.imageAlt),
      caption: anyToLocalized(o.caption),
    }
  })
  return {
    title: anyToLocalized(data.title),
    lead: anyToLocalized(data.lead),
    slides,
  }
}

function normQuote(data: Record<string, unknown>) {
  return {
    quote: anyToLocalized(data.quote),
    body: anyToLocalized(data.body),
  }
}

function normCta(data: Record<string, unknown>) {
  return {
    title: anyToLocalized(data.title),
    lead: anyToLocalized(data.lead),
    primaryLabel: anyToLocalized(data.primaryLabel),
    primaryHref: String(data.primaryHref ?? ""),
    secondaryLabel: anyToLocalized(data.secondaryLabel),
    secondaryHref: String(data.secondaryHref ?? ""),
  }
}

/** Приводит сырые секции из БД к типу с Localized (старые строки → { ru, kz: "" }). */
export function normalizeAboutSectionsFromDb(raw: unknown): AboutSection[] | null {
  if (!Array.isArray(raw) || raw.length !== ABOUT_SECTION_ORDER.length) {
    return null
  }
  const out: AboutSection[] = []
  for (let i = 0; i < ABOUT_SECTION_ORDER.length; i++) {
    const sec = raw[i] as { type?: string; data?: unknown }
    const type = sec?.type
    const data = (sec?.data ?? {}) as Record<string, unknown>
    if (type !== ABOUT_SECTION_ORDER[i]) return null
    switch (type) {
      case "hero":
        out.push({ type: "hero", data: normHero(data) })
        break
      case "roleIntro":
        out.push({ type: "roleIntro", data: normRoleIntro(data) })
        break
      case "timeline":
        out.push({ type: "timeline", data: normTimeline(data) })
        break
      case "mission":
        out.push({ type: "mission", data: normMission(data) })
        break
      case "facts":
        out.push({ type: "facts", data: normFacts(data) })
        break
      case "space":
        out.push({ type: "space", data: normSpace(data) })
        break
      case "quote":
        out.push({ type: "quote", data: normQuote(data) })
        break
      case "cta":
        out.push({ type: "cta", data: normCta(data) })
        break
      default:
        return null
    }
  }
  return out
}
