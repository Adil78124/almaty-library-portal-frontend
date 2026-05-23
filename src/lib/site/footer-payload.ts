import type { SiteSettings } from "@prisma/client"

import { OFFICIAL_SANITARY } from "@/lib/cms/about/customer-official"
import { L, type Localized } from "@/lib/i18n/app-locale"
import { SITE_CONTACT_FALLBACK } from "@/lib/site-contact-fallbacks"

export type SiteFooterPayload = {
  orgShort: Localized
  orgLong: Localized
  tagline: Localized
  address: Localized
  phone: string
  phoneSecondary: string | null
  email: string
  /** Сырой JSON графика; строки для UI строятся на клиенте с учётом locale */
  workingHoursRaw: unknown | null
  sanitary: Localized
  copyright: Localized
  privacyUrl: string | null
  termsUrl: string | null
}

type SiteRow = SiteSettings & {
  footerTaglineKz?: string | null
  copyrightLineKz?: string | null
}

export function buildSiteFooterPayload(site: SiteSettings | null): SiteFooterPayload {
  const s = site as SiteRow | null
  const fb = SITE_CONTACT_FALLBACK
  return {
    orgShort: L(
      s?.orgNameShort ?? fb.orgNameShort,
      s?.orgNameShortKz?.trim() ?? fb.orgNameShortKz
    ),
    orgLong: L(
      s?.orgNameLong ?? fb.orgNameLong,
      s?.orgNameLongKz?.trim() ?? fb.orgNameLongKz
    ),
    tagline: L(
      s?.footerTagline ?? fb.footerTagline,
      s?.footerTaglineKz?.trim() ?? fb.footerTaglineKz
    ),
    address: L(
      s?.address ?? fb.address,
      s?.addressKz?.trim() ?? fb.addressKz ?? ""
    ),
    phone: s?.phone ?? fb.phone,
    phoneSecondary:
      s?.phoneSecondary?.trim() ?? fb.phoneSecondary ?? null,
    email: s?.email ?? fb.email,
    workingHoursRaw: s?.workingHours ?? null,
    sanitary: L(
      s?.sanitaryDayRu?.trim() || OFFICIAL_SANITARY.ru,
      s?.sanitaryDayKz?.trim() || OFFICIAL_SANITARY.kz
    ),
    copyright: L(
      s?.copyrightLine ?? fb.copyrightLine,
      s?.copyrightLineKz?.trim() ?? fb.copyrightLineKz
    ),
    privacyUrl: s?.privacyUrl?.trim() ?? null,
    termsUrl: s?.termsUrl?.trim() ?? null,
  }
}
