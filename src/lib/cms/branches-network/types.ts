export type BranchesNetworkData = {
  titleRu: string
  titleKz?: string
  leadRu: string
  leadKz?: string
  bodyRu: string
  bodyKz?: string
  imageUrl?: string
  imageAltRu?: string
  imageAltKz?: string
}

export type BranchesNetworkSection = {
  type: "branchesNetwork"
  data: BranchesNetworkData
}

export const BRANCHES_NETWORK_SECTION_ORDER = ["branchesNetwork"] as const

export type ResolvedBranchesNetworkPage = {
  network: BranchesNetworkData
}

