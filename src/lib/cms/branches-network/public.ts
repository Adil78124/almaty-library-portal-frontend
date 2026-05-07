import { fetchBackendJson } from "@/lib/backend"

import type { BranchesNetworkSection } from "./types"
import { BRANCHES_NETWORK_SECTION_ORDER } from "./types"
import { getDefaultBranchesNetworkSections } from "./defaults"
import { resolveBranchesNetworkSections } from "./resolve"

const PAGE_KEY = "branches-network" as const

export async function getBranchesNetworkPublic() {
  const defaults = getDefaultBranchesNetworkSections()
  const { sections } = await fetchBackendJson<{ page: string; sections: unknown | null }>(
    `/pages?page=${PAGE_KEY}`,
    { cache: "no-store" }
  )
  const raw = (sections ?? undefined) as BranchesNetworkSection[] | undefined
  if (
    !raw ||
    raw.length !== BRANCHES_NETWORK_SECTION_ORDER.length ||
    !raw.every((s, i) => s.type === BRANCHES_NETWORK_SECTION_ORDER[i])
  ) {
    return resolveBranchesNetworkSections(defaults)
  }

  return resolveBranchesNetworkSections(raw)
}

export async function getBranchesNetworkSectionsRaw(): Promise<
  BranchesNetworkSection[]
> {
  const defaults = getDefaultBranchesNetworkSections()
  const { sections } = await fetchBackendJson<{ page: string; sections: unknown | null }>(
    `/pages?page=${PAGE_KEY}`,
    { cache: "no-store" }
  )
  const raw = (sections ?? undefined) as BranchesNetworkSection[] | undefined
  if (
    !raw ||
    raw.length !== BRANCHES_NETWORK_SECTION_ORDER.length ||
    !raw.every((s, i) => s.type === BRANCHES_NETWORK_SECTION_ORDER[i])
  ) {
    return defaults
  }
  return raw
}

