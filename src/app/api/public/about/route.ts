import { NextResponse } from "next/server"

import { getAboutPublic } from "@/lib/cms/about/public"
import { resolvedAboutToPublicApi } from "@/lib/cms/about/public-api"

export const dynamic = "force-dynamic"

/** Публичные данные страницы «О библиотеке» (все строки — { ru, kz }). */
export async function GET() {
  const data = await getAboutPublic()
  return NextResponse.json(resolvedAboutToPublicApi(data))
}
