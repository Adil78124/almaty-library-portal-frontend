import { NextResponse } from "next/server"

import { jsonError, jsonValidationError, parseJson } from "@/lib/api/http"
import { prisma } from "@/lib/prisma"
import { galleryItemCreateSchema } from "@/lib/validators/content"

export async function GET() {
  const items = await prisma.galleryItem.findMany({
    orderBy: { slot: "asc" },
  })
  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const raw = await parseJson<unknown>(request)
  if (raw === null) {
    return jsonError("Некорректный JSON", 400)
  }
  const parsed = galleryItemCreateSchema.safeParse(raw)
  if (!parsed.success) {
    return jsonValidationError(parsed.error)
  }
  try {
    const item = await prisma.galleryItem.create({ data: parsed.data })
    return NextResponse.json(item, { status: 201 })
  } catch {
    return jsonError("Слот уже занят (slot уникален)", 409)
  }
}
