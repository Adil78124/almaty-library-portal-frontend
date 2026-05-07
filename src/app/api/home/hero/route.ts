import { NextResponse } from "next/server"

import { jsonError, jsonValidationError, parseJson } from "@/lib/api/http"
import { prisma } from "@/lib/prisma"
import { homeHeroPutSchema } from "@/lib/validators/content"

export async function GET() {
  const row = await prisma.homeHero.findUnique({ where: { id: "default" } })
  if (!row) {
    return jsonError("Запись не найдена. Выполните prisma db push и npm run db:seed", 404)
  }
  return NextResponse.json(row)
}

export async function PUT(request: Request) {
  const raw = await parseJson<unknown>(request)
  if (raw === null) {
    return jsonError("Некорректный JSON", 400)
  }
  const parsed = homeHeroPutSchema.safeParse(raw)
  if (!parsed.success) {
    return jsonValidationError(parsed.error)
  }
  const row = await prisma.homeHero.upsert({
    where: { id: "default" },
    create: { id: "default", ...parsed.data },
    update: parsed.data,
  })
  return NextResponse.json(row)
}
