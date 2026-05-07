import { buildOfficialAboutSectionsBilingual } from "./customer-official"
import type { AboutSection } from "./types"

/** Дефолтные секции «О библиотеке» (официальные тексты, RU+KZ). */
export function getDefaultAboutSections(): AboutSection[] {
  return buildOfficialAboutSectionsBilingual()
}
