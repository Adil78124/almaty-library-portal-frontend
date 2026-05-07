import { NextResponse } from "next/server"

import { jsonError, jsonValidationError, parseJson } from "@/lib/api/http"
import { prisma } from "@/lib/prisma"
import { navItemCreateSchema } from "@/lib/validators/content"

export async function GET() {
  const items = await prisma.navItem.findMany({
    orderBy: { sortOrder: "asc" },
  })
  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const raw = await parseJson<unknown>(request)
  if (raw === null) {
    return jsonError("Некорректный JSON", 400)
  }
  const parsed = navItemCreateSchema.safeParse(raw)
  if (!parsed.success) {
    return jsonValidationError(parsed.error)
  }
  const item = await prisma.navItem.create({ data: parsed.data })
  return NextResponse.json(item, { status: 201 })
}
