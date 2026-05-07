import type { DigitalLibrarySection, ResolvedDigitalLibraryPage } from "./types"
import { DIGITAL_LIBRARY_SECTION_ORDER } from "./types"
import { getDefaultDigitalLibrarySections } from "./defaults"

function normalizeBentoCards(data: any): any {
  const cards = Array.isArray(data?.cards) ? data.cards : []
  // Раньше было 4 карточки; теперь оставляем только последние 2.
  const lastTwo = cards.slice(-2)
  return { ...data, cards: lastTwo }
}

function byType(
  sections: DigitalLibrarySection[],
  type: DigitalLibrarySection["type"]
) {
  return sections.find((s) => s.type === type) as
    | Extract<DigitalLibrarySection, { type: typeof type }>
    | undefined
}

export function resolveDigitalLibrarySections(
  raw: unknown
): ResolvedDigitalLibraryPage {
  const defaults = getDefaultDigitalLibrarySections()
  const sections = Array.isArray(raw) ? (raw as DigitalLibrarySection[]) : null
  const orderOk =
    !!sections &&
    sections.length === DIGITAL_LIBRARY_SECTION_ORDER.length &&
    sections.every((s, i) => s?.type === DIGITAL_LIBRARY_SECTION_ORDER[i])

  const base = orderOk ? sections : defaults

  const hero = byType(base, "hero")?.data ?? (defaults[0] as any).data
  const rawBento = byType(base, "bento")?.data ?? (defaults[1] as any).data
  const bento = normalizeBentoCards(rawBento)
  const help = byType(base, "help")?.data ?? (defaults[2] as any).data
  const access = byType(base, "access")?.data ?? (defaults[3] as any).data
  const cta = byType(base, "cta")?.data ?? (defaults[4] as any).data

  return { hero, bento, help, access, cta }
}

