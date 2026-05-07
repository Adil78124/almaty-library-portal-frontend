import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"

import { jsonValidationError } from "@/lib/api/http"
import { requireSuperAdminSession } from "@/lib/auth/require-admin"
import { getHomePagePublic } from "@/lib/cms/home/public"
import { parseHomeCmsPayload } from "@/lib/cms/home/validate"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const data = await getHomePagePublic()
  return NextResponse.json({ page: "home", data })
}

export async function POST(request: Request) {
  const session = await requireSuperAdminSession()
  if (!session) {
    return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 })
  }

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 })
  }

  const parsed = parseHomeCmsPayload(raw)
  if (!parsed.ok) {
    return jsonValidationError(parsed.error)
  }

  await prisma.pageContent.upsert({
    where: { page: "home" },
    create: {
      page: "home",
      sections: parsed.data.sections as object[],
    },
    update: {
      sections: parsed.data.sections as object[],
    },
  })

  revalidatePath("/")
  return NextResponse.json({ ok: true })
}
