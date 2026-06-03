import type { ResolvedAbout } from "./types"

/** Плоский JSON для GET /api/public/about (все строки — { ru, kz }). */
export function resolvedAboutToPublicApi(data: ResolvedAbout) {
  return {
    hero: {
      imageUrl: data.hero.imageUrl,
      imageAlt: data.hero.imageAlt,
      breadcrumbLabel: data.hero.breadcrumbLabel,
      title: data.hero.title,
      lead: data.hero.lead,
    },
    director: {
      title: data.director.title,
      name: data.director.name,
      position: data.director.position,
      body: data.director.body,
      imageUrl: data.director.imageUrl,
      imageAlt: data.director.imageAlt,
    },
    roleIntro: {
      kicker: data.roleIntro.kicker,
      title: data.roleIntro.title,
      paragraphs: data.roleIntro.paragraphs,
      sideImageUrl: data.roleIntro.sideImageUrl,
      sideImageAlt: data.roleIntro.sideImageAlt,
    },
    timeline: {
      title: data.timeline.title,
      items: data.timeline.items,
    },
    mission: { cards: data.mission.cards },
    facts: { stats: data.facts.stats },
    cta: {
      title: data.cta.title,
      lead: data.cta.lead,
      primaryLabel: data.cta.primaryLabel,
      primaryHref: data.cta.primaryHref,
      secondaryLabel: data.cta.secondaryLabel,
      secondaryHref: data.cta.secondaryHref,
    },
  }
}
