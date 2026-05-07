import { NextResponse } from "next/server"

import { OFFICIAL_SANITARY } from "@/lib/cms/about/customer-official"
import { DEFAULT_WORKING_HOURS } from "@/lib/working-hours"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

/** График работы и санитарные дни (из SiteSettings). */
export async function GET() {
  const site = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  })
  const workingHours = site?.workingHours ?? DEFAULT_WORKING_HOURS
  return NextResponse.json({
    workingHours,
    sanitaryDayRu: site?.sanitaryDayRu?.trim() || OFFICIAL_SANITARY.ru,
    sanitaryDayKz: site?.sanitaryDayKz?.trim() || OFFICIAL_SANITARY.kz,
  })
}
