import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"

import { getAdminSession } from "@/lib/auth/require-admin"

export async function POST(request: Request) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 })
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("paths" in body) ||
    !Array.isArray((body as { paths: unknown }).paths)
  ) {
    return NextResponse.json({ error: "Нужен объект с массивом paths" }, { status: 400 })
  }

  for (const p of (body as { paths: unknown[] }).paths) {
    if (typeof p === "string" && p.startsWith("/")) {
      try {
        revalidatePath(p)
      } catch (err) {
        console.error("[revalidatePath]", p, err)
      }
    }
  }

  return NextResponse.json({ ok: true })
}
