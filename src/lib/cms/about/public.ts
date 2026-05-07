import type { AboutSection } from "./types"
import { ABOUT_SECTION_ORDER } from "./types"
import { getDefaultAboutSections } from "./defaults"
import { normalizeAboutSectionsFromDb } from "./normalize-localized"
import { resolveAboutSections } from "./resolve"
import { fetchBackendJson } from "@/lib/backend"

export async function getAboutPublic() {
  const { sections } = await fetchBackendJson<{ page: string; sections: unknown | null }>(
    "/pages?page=about",
    { cache: "no-store" }
  )
  return resolveAboutSections(sections ?? undefined)
}

export async function getAboutSectionsRaw(): Promise<AboutSection[]> {
  const defaults = getDefaultAboutSections()
  const { sections } = await fetchBackendJson<{ page: string; sections: unknown | null }>(
    "/pages?page=about",
    { cache: "no-store" }
  )
  const normalized = normalizeAboutSectionsFromDb(sections ?? undefined)
  if (!normalized) {
    return defaults
  }
  const orderOk = normalized.every(
    (s, i) => s.type === ABOUT_SECTION_ORDER[i]
  )
  if (!orderOk) return defaults
  return normalized
}
