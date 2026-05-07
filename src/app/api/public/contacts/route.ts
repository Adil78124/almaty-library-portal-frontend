import { NextResponse } from "next/server"

import { SITE_CONTACT_FALLBACK } from "@/lib/site-contact-fallbacks"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

/** Публичные контакты и связанные поля SiteSettings. */
export async function GET() {
  const site = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  })
  return NextResponse.json({
    address: site?.address ?? SITE_CONTACT_FALLBACK.address,
    addressKz: site?.addressKz ?? SITE_CONTACT_FALLBACK.addressKz,
    phone: site?.phone ?? SITE_CONTACT_FALLBACK.phone,
    phoneSecondary:
      site?.phoneSecondary ?? SITE_CONTACT_FALLBACK.phoneSecondary,
    email: site?.email ?? SITE_CONTACT_FALLBACK.email,
    orgNameShort: site?.orgNameShort ?? SITE_CONTACT_FALLBACK.orgNameShort,
    orgNameLong: site?.orgNameLong ?? SITE_CONTACT_FALLBACK.orgNameLong,
    orgNameShortKz: site?.orgNameShortKz ?? null,
    orgNameLongKz: site?.orgNameLongKz ?? null,
  })
}
