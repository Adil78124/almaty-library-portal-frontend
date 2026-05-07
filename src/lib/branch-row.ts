import type { BranchType } from "@prisma/client"

/** Соответствует модели Branch в schema.prisma (актуально после db push). */
export type BranchRow = {
  id: string
  titleRu: string
  titleKz?: string | null
  descriptionRu: string
  descriptionKz?: string | null
  type: BranchType
  published: boolean
  isMainBranch: boolean
  subtitle: string | null
  subtitleKz?: string | null
  cityLabel: string | null
  cityLabelKz?: string | null
  address: string | null
  addressKz?: string | null
  phone: string | null
  email: string | null
  hours: string | null
  cardImageUrl: string | null
  heroImageUrl: string | null
  socialLinksJson: string | null
  createdAt: Date
  updatedAt: Date
}

/** Данные филиала для клиентских страниц (без служебных дат). */
export type BranchDetailViewModel = Omit<BranchRow, "createdAt" | "updatedAt">
