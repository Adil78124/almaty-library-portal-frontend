import type {
  BranchesNetworkSection,
  ResolvedBranchesNetworkPage,
} from "./types"
import { BRANCHES_NETWORK_SECTION_ORDER } from "./types"
import { getDefaultBranchesNetworkSections } from "./defaults"

export function resolveBranchesNetworkSections(
  sections: BranchesNetworkSection[] | null | undefined
): ResolvedBranchesNetworkPage {
  const base = getDefaultBranchesNetworkSections()
  const merged: BranchesNetworkSection[] = BRANCHES_NETWORK_SECTION_ORDER.map(
    (type) => {
      const fromDb = sections?.find((s) => s.type === type)
      const fallback = base.find((s) => s.type === type)!
      return fromDb ?? fallback
    }
  )

  const network = merged[0]
  if (network?.type !== "branchesNetwork") {
    return { network: base[0]!.data }
  }
  return { network: network.data }
}

