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

export type AboutDirectorData = {
  title: Localized
  name: Localized
  position: Localized
  body: Localized
  imageUrl: string
  imageAlt: Localized
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
  | { type: "director"; data: AboutDirectorData }
  | { type: "roleIntro"; data: AboutRoleIntroData }
  | { type: "timeline"; data: AboutTimelineData }
  | { type: "mission"; data: AboutMissionData }
  | { type: "facts"; data: AboutFactsData }
  | { type: "cta"; data: AboutCtaData }

export const ABOUT_SECTION_ORDER = [
  "hero",
  "director",
  "roleIntro",
  "timeline",
  "mission",
  "facts",
  "cta",
] as const

export type ResolvedAbout = {
  hero: AboutHeroData
  director: AboutDirectorData
  roleIntro: AboutRoleIntroData
  timeline: AboutTimelineData
  mission: AboutMissionData
  facts: AboutFactsData
  cta: AboutCtaData
}
