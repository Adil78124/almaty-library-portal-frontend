import { NextResponse } from "next/server"
import type { Prisma } from "@prisma/client"

import { jsonError, jsonValidationError, parseJson } from "@/lib/api/http"
import { prisma } from "@/lib/prisma"
import { socialLinkCreateSchema } from "@/lib/validators/content"

export async function GET() {
  const items = await prisma.socialLink.findMany({
    orderBy: { sortOrder: "asc" },
  })
  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const raw = await parseJson<unknown>(request)
  if (raw === null) {
    return jsonError("Некорректный JSON", 400)
  }
  const parsed = socialLinkCreateSchema.safeParse(raw)
  if (!parsed.success) {
    return jsonValidationError(parsed.error)
  }
  const data = parsed.data as unknown as Prisma.SocialLinkCreateInput
  const item = await prisma.socialLink.create({ data })
  return NextResponse.json(item, { status: 201 })
}
