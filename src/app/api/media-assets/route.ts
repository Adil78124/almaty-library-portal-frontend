import { NextResponse } from "next/server"

import { jsonError, jsonValidationError, parseJson } from "@/lib/api/http"
import { prisma } from "@/lib/prisma"
import { mediaAssetCreateSchema } from "@/lib/validators/content"

export async function GET() {
  const items = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  })
  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const raw = await parseJson<unknown>(request)
  if (raw === null) {
    return jsonError("Некорректный JSON", 400)
  }
  const parsed = mediaAssetCreateSchema.safeParse(raw)
  if (!parsed.success) {
    return jsonValidationError(parsed.error)
  }
  const item = await prisma.mediaAsset.create({ data: parsed.data })
  return NextResponse.json(item, { status: 201 })
}
