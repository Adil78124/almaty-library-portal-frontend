export const SIMPLE_PAGE_SLUGS = ["news", "events", "branches", "structure"] as const

export type SimplePageSlug = (typeof SIMPLE_PAGE_SLUGS)[number]

export type SimpleHeroData = {
  backgroundImageUrl: string
  backgroundImageAlt: string
  backgroundImageAltKz?: string
  breadcrumbLabel: string
  breadcrumbLabelKz?: string
  title: string
  titleKz?: string
  lead: string
  leadKz?: string
}

export type SimplePageSection = { type: "hero"; data: SimpleHeroData }

export const SIMPLE_PAGE_SECTION_ORDER = ["hero"] as const

/** То, что уходит на публичную страницу (пока один hero). */
export type ResolvedSimplePage = {
  hero: SimpleHeroData
}
