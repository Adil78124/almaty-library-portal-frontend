import type { Localized } from "@/lib/i18n/app-locale"

export type DigitalLibraryHeroData = {
  backgroundImageUrl: string
  backgroundImageAlt: Localized
  breadcrumbLabel: Localized
  title: Localized
  lead: Localized
}

export type DigitalLibraryCardTone =
  | "secondaryFixed"
  | "tertiaryFixed"
  | "primaryFixed"
  | "neutral"

export type DigitalLibraryBentoCard = {
  iconName: string
  title: Localized
  body: Localized
  tone: DigitalLibraryCardTone
}

export type DigitalLibraryBentoData = {
  cards: [DigitalLibraryBentoCard, DigitalLibraryBentoCard]
}

export type DigitalLibraryHelpData = {
  title: Localized
  steps: [Localized, Localized, Localized]
  formats: string[]
}

export type DigitalLibraryAccessData = {
  title: Localized
  body: Localized
}

export type DigitalLibraryCtaData = {
  title: Localized
  lead: Localized
  primaryLabel: Localized
  primaryHref: string
  secondaryLabel: Localized
  secondaryHref: string
}

export type DigitalLibrarySection =
  | { type: "hero"; data: DigitalLibraryHeroData }
  | { type: "bento"; data: DigitalLibraryBentoData }
  | { type: "help"; data: DigitalLibraryHelpData }
  | { type: "access"; data: DigitalLibraryAccessData }
  | { type: "cta"; data: DigitalLibraryCtaData }

export const DIGITAL_LIBRARY_SECTION_ORDER = [
  "hero",
  "bento",
  "help",
  "access",
  "cta",
] as const

export type ResolvedDigitalLibraryPage = {
  hero: DigitalLibraryHeroData
  bento: DigitalLibraryBentoData
  help: DigitalLibraryHelpData
  access: DigitalLibraryAccessData
  cta: DigitalLibraryCtaData
}

