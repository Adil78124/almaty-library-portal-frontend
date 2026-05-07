import { NextResponse } from "next/server"

import { jsonError, jsonValidationError, parseJson } from "@/lib/api/http"
import { prisma } from "@/lib/prisma"
import { digitalItemCreateSchema } from "@/lib/validators/content"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const home = searchParams.get("showOnHome")
  const where =
    home === "true" ? { showOnHome: true } : home === "false" ? { showOnHome: false } : {}
  const items = await prisma.digitalLibraryItem.findMany({
    where,
    orderBy: { sortOrder: "asc" },
  })
  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const raw = await parseJson<unknown>(request)
  if (raw === null) {
    return jsonError("Некорректный JSON", 400)
  }
  const parsed = digitalItemCreateSchema.safeParse(raw)
  if (!parsed.success) {
    return jsonValidationError(parsed.error)
  }
  const item = await prisma.digitalLibraryItem.create({ data: parsed.data })
  return NextResponse.json(item, { status: 201 })
}
