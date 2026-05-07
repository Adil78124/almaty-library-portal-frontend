import type { SimplePageSection, SimplePageSlug, ResolvedSimplePage } from "./types"
import { SIMPLE_PAGE_SECTION_ORDER } from "./types"
import { getDefaultSimpleSections } from "./defaults"

export function resolveSimpleSections(
  sections: SimplePageSection[] | null | undefined,
  slug: SimplePageSlug
): ResolvedSimplePage {
  const base = getDefaultSimpleSections(slug)
  const merged: SimplePageSection[] = SIMPLE_PAGE_SECTION_ORDER.map((type) => {
    const fromDb = sections?.find((s) => s.type === type)
    const fallback = base.find((s) => s.type === type)!
    return fromDb ?? fallback
  })

  const hero = merged[0]!
  if (hero.type !== "hero") {
    return { hero: base[0]!.data }
  }
  return { hero: hero.data }
}
