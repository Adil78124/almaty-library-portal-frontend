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

function normDirector(data: Record<string, unknown>) {
  return {
    title: anyToLocalized(data.title),
    name: anyToLocalized(data.name),
    position: anyToLocalized(data.position),
    body: anyToLocalized(data.body),
    imageUrl: String(data.imageUrl ?? "/placeholder.svg"),
    imageAlt: anyToLocalized(data.imageAlt),
  }
}

function normDirectorFromLegacyQuote(data: Record<string, unknown>) {
  const quote = normQuote(data)
  const directorLineRu =
    quote.body.ru
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.toLowerCase().startsWith("директор:")) ?? ""
  const directorLineKz =
    quote.body.kz
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.toLowerCase().startsWith("директор:")) ?? ""
  const nameRu = directorLineRu.replace(/^директор:\s*/i, "").trim()
  const nameKz = directorLineKz.replace(/^директор:\s*/i, "").trim()

  return {
    title: L("Директор библиотеки", "Кітапхана директоры"),
    name: L(nameRu || "Тоқабаева Ғалия Сламбайқызы", nameKz || nameRu),
    position: L("Директор", "Директор"),
    body: L(
      "Директор библиотеки координирует развитие учреждения, работу с читателями и внедрение современных библиотечных сервисов.",
      "Кітапхана директоры мекеменің дамуын, оқырмандармен жұмысты және заманауи кітапханалық қызметтерді үйлестіреді."
    ),
    imageUrl: "/placeholder.svg",
    imageAlt: L("Директор библиотеки", "Кітапхана директоры"),
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
  if (!Array.isArray(raw)) {
    return null
  }
  const byType = new Map<string, { type?: string; data?: unknown }>()
  for (const item of raw) {
    const sec = item as { type?: string; data?: unknown }
    if (sec?.type) byType.set(sec.type, sec)
  }

  const out: AboutSection[] = []
  for (let i = 0; i < ABOUT_SECTION_ORDER.length; i++) {
    const expectedType = ABOUT_SECTION_ORDER[i]
    const sec = byType.get(expectedType)
    if (!sec && expectedType !== "director") return null
    const data = (sec?.data ?? {}) as Record<string, unknown>
    switch (expectedType) {
      case "hero":
        out.push({ type: "hero", data: normHero(data) })
        break
      case "director":
        out.push({
          type: "director",
          data: sec
            ? normDirector(data)
            : normDirectorFromLegacyQuote(
                (byType.get("quote")?.data ?? {}) as Record<string, unknown>
              ),
        })
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
      case "cta":
        out.push({ type: "cta", data: normCta(data) })
        break
      default:
        return null
    }
  }
  return out
}
