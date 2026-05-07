import type { SimplePageSection, SimplePageSlug, ResolvedSimplePage } from "./types"
import { SIMPLE_PAGE_SECTION_ORDER } from "./types"
import { getDefaultSimpleSections } from "./defaults"
import { resolveSimpleSections } from "./resolve"
import { fetchBackendJson } from "@/lib/backend"

export async function getSimplePagePublic(
  slug: SimplePageSlug
): Promise<ResolvedSimplePage> {
  const { sections } = await fetchBackendJson<{ page: string; sections: unknown | null }>(
    `/pages?page=${slug}`,
    { cache: "no-store" }
  )
  const resolved = (sections ?? undefined) as SimplePageSection[] | undefined
  return resolveSimpleSections(resolved, slug)
}

export async function getSimpleSectionsRaw(
  slug: SimplePageSlug
): Promise<SimplePageSection[]> {
  const defaults = getDefaultSimpleSections(slug)
  const { sections } = await fetchBackendJson<{ page: string; sections: unknown | null }>(
    `/pages?page=${slug}`,
    { cache: "no-store" }
  )
  const raw = (sections ?? undefined) as SimplePageSection[] | undefined
  if (
    !raw ||
    raw.length !== SIMPLE_PAGE_SECTION_ORDER.length ||
    !raw.every((s, i) => s.type === SIMPLE_PAGE_SECTION_ORDER[i])
  ) {
    return defaults
  }
  return raw
}
