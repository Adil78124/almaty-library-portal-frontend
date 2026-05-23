import { prisma } from "@/lib/prisma"

export type BranchDisplayKind = "news" | "events"

export type BranchDisplaySettings = {
  enabled: boolean
  limit: number
}

export const DEFAULT_BRANCH_DISPLAY_SETTINGS: BranchDisplaySettings = {
  enabled: true,
  limit: 12,
}

export function branchDisplaySettingsKey(
  kind: BranchDisplayKind,
  branchId: string
): string {
  return `branch:${branchId}:${kind}:display`
}

function normalizeBranchDisplaySettings(
  data: unknown
): BranchDisplaySettings {
  if (!data || typeof data !== "object") {
    return DEFAULT_BRANCH_DISPLAY_SETTINGS
  }

  const raw = data as Record<string, unknown>
  const enabled =
    typeof raw.enabled === "boolean"
      ? raw.enabled
      : DEFAULT_BRANCH_DISPLAY_SETTINGS.enabled
  const limitRaw =
    typeof raw.limit === "number"
      ? raw.limit
      : Number.parseInt(String(raw.limit ?? ""), 10)
  const limit = Math.min(
    20,
    Math.max(
      1,
      Number.isFinite(limitRaw)
        ? limitRaw
        : DEFAULT_BRANCH_DISPLAY_SETTINGS.limit
    )
  )

  return { enabled, limit }
}

export async function getBranchDisplaySettings(
  kind: BranchDisplayKind,
  branchId: string
): Promise<BranchDisplaySettings> {
  const row = await prisma.pageContent.findUnique({
    where: { page: branchDisplaySettingsKey(kind, branchId) },
  })
  return normalizeBranchDisplaySettings(row?.sections)
}

