import type { AboutSection, ResolvedAbout } from "./types"
import { ABOUT_SECTION_ORDER } from "./types"
import { getDefaultAboutSections } from "./defaults"
import { normalizeAboutSectionsFromDb } from "./normalize-localized"

function pickSection<T extends AboutSection["type"]>(
  sections: AboutSection[],
  type: T
): Extract<AboutSection, { type: T }> | undefined {
  return sections.find((s) => s.type === type) as
    | Extract<AboutSection, { type: T }>
    | undefined
}

export function resolveAboutSections(sections: unknown): ResolvedAbout {
  const baseNorm = normalizeAboutSectionsFromDb(getDefaultAboutSections())!
  const userNorm = normalizeAboutSectionsFromDb(sections)
  const merged: AboutSection[] = ABOUT_SECTION_ORDER.map((_, i) => {
    return (userNorm && userNorm[i]) ?? baseNorm[i]!
  }) as AboutSection[]

  const heroS = pickSection(merged, "hero")!
  const roleS = pickSection(merged, "roleIntro")!
  const timelineS = pickSection(merged, "timeline")!
  const missionS = pickSection(merged, "mission")!
  const factsS = pickSection(merged, "facts")!
  const spaceS = pickSection(merged, "space")!
  const quoteS = pickSection(merged, "quote")!
  const ctaS = pickSection(merged, "cta")!

  return {
    hero: heroS.data,
    roleIntro: roleS.data,
    timeline: timelineS.data,
    mission: missionS.data,
    facts: factsS.data,
    space: spaceS.data,
    quote: quoteS.data,
    cta: ctaS.data,
  }
}
