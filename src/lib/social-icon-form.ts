import { normalizeSocialIconStored } from "@/lib/social-icon-normalize"
import {
  SOCIAL_ICON_SELECT_OPTIONS,
  type SocialIconKey,
} from "@/lib/social-icons"

/** Значение select «свой ключ», не из предустановленного списка. */
export const ICON_PRESET_CUSTOM = "__custom__" as const

export type SocialIconFormPreset = SocialIconKey | typeof ICON_PRESET_CUSTOM

export function splitSocialIconForSelect(
  stored: string | null | undefined
): { iconPreset: SocialIconFormPreset; iconCustom: string } {
  const v = (stored?.trim() || "link") as string
  if (SOCIAL_ICON_SELECT_OPTIONS.some((o) => o.value === v)) {
    return { iconPreset: v as SocialIconKey, iconCustom: "" }
  }
  return { iconPreset: ICON_PRESET_CUSTOM, iconCustom: v }
}

export function joinSocialIconFromSelect(
  preset: SocialIconFormPreset,
  custom: string
): string {
  if (preset === ICON_PRESET_CUSTOM) {
    return normalizeSocialIconStored(custom)
  }
  return preset
}
