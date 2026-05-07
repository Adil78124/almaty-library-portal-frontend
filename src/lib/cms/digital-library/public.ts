import { fetchBackendJson } from "@/lib/backend"

import type { DigitalLibrarySection } from "./types"
import { DIGITAL_LIBRARY_SECTION_ORDER } from "./types"
import { getDefaultDigitalLibrarySections } from "./defaults"
import { resolveDigitalLibrarySections } from "./resolve"

export async function getDigitalLibraryPublic() {
  const defaults = getDefaultDigitalLibrarySections()
  const { sections } = await fetchBackendJson<{ page: string; sections: unknown | null }>(
    "/pages?page=digital-library",
    { cache: "no-store" }
  )
  return resolveDigitalLibrarySections((sections ?? undefined) as unknown)
}

export async function getDigitalLibrarySectionsRaw(): Promise<DigitalLibrarySection[]> {
  const defaults = getDefaultDigitalLibrarySections()
  const { sections } = await fetchBackendJson<{ page: string; sections: unknown | null }>(
    "/pages?page=digital-library",
    { cache: "no-store" }
  )
  const raw = (sections ?? undefined) as DigitalLibrarySection[] | undefined

  if (
    !raw ||
    raw.length !== DIGITAL_LIBRARY_SECTION_ORDER.length ||
    !raw.every((s, i) => s.type === DIGITAL_LIBRARY_SECTION_ORDER[i])
  ) {
    return defaults
  }

  // Мягкая нормализация: раньше в bento было 4 карточки — теперь оставляем только последние 2.
  const bento = raw[1]
  if (bento?.type === "bento") {
    const cards = Array.isArray((bento as any).data?.cards) ? (bento as any).data.cards : []
    const normalizedCards = cards.slice(-2)
    if (cards.length !== normalizedCards.length) {
      const normalized = raw.slice() as any[]
      normalized[1] = { ...bento, data: { ...(bento as any).data, cards: normalizedCards } }
      return normalized as DigitalLibrarySection[]
    }
  }

  return raw
}

