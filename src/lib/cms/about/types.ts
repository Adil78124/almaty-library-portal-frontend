import type { Localized } from "@/lib/i18n/app-locale"

export type AboutHeroData = {
  imageUrl: string
  imageAlt: Localized
  breadcrumbLabel: Localized
  title: Localized
  lead: Localized
}

export type AboutRoleIntroData = {
  kicker: Localized
  title: Localized
  paragraphs: [Localized, Localized]
  sideImageUrl: string
  sideImageAlt: Localized
}

export type AboutTimelineItem = {
  year: Localized
  title: Localized
  body: Localized
  align: "left" | "right"
}

export type AboutTimelineData = {
  title: Localized
  items: AboutTimelineItem[]
}

export type AboutMissionCard = {
  iconName: string
  title: Localized
  body: Localized
}

export type AboutMissionData = {
  cards: AboutMissionCard[]
}

export type AboutFactStat = { value: Localized; label: Localized }

export type AboutFactsData = {
  stats: AboutFactStat[]
}

export type AboutSpaceSlide = {
  imageUrl: string
  imageAlt: Localized
  caption: Localized
}

export type AboutSpaceData = {
  title: Localized
  lead: Localized
  slides: AboutSpaceSlide[]
}

export type AboutQuoteData = {
  quote: Localized
  body: Localized
}

export type AboutCtaData = {
  title: Localized
  lead: Localized
  primaryLabel: Localized
  primaryHref: string
  secondaryLabel: Localized
  secondaryHref: string
}

export type AboutSection =
  | { type: "hero"; data: AboutHeroData }
  | { type: "roleIntro"; data: AboutRoleIntroData }
  | { type: "timeline"; data: AboutTimelineData }
  | { type: "mission"; data: AboutMissionData }
  | { type: "facts"; data: AboutFactsData }
  | { type: "space"; data: AboutSpaceData }
  | { type: "quote"; data: AboutQuoteData }
  | { type: "cta"; data: AboutCtaData }

export const ABOUT_SECTION_ORDER = [
  "hero",
  "roleIntro",
  "timeline",
  "mission",
  "facts",
  "space",
  "quote",
  "cta",
] as const

export type ResolvedAbout = {
  hero: AboutHeroData
  roleIntro: AboutRoleIntroData
  timeline: AboutTimelineData
  mission: AboutMissionData
  facts: AboutFactsData
  space: AboutSpaceData
  quote: AboutQuoteData
  cta: AboutCtaData
}
