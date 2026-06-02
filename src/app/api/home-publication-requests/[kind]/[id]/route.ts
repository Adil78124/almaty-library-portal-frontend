import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import type { HomePublishStatus, Prisma } from "@prisma/client"
import { z } from "zod"

import {
  getAdminSession,
  sessionIsSuperAdmin,
} from "@/lib/auth/require-admin"
import { prisma } from "@/lib/prisma"

const kindSchema = z.enum(["news", "event"])
const payloadSchema = z.object({
  action: z.enum(["approve", "reject", "remove", "return"]),
})

type RequestAction = z.infer<typeof payloadSchema>["action"]
type Params = { params: Promise<{ kind: string; id: string }> }
type AdminSession = NonNullable<Awaited<ReturnType<typeof getAdminSession>>>

function reviewerId(session: AdminSession): string {
  return session.kind === "user" ? session.user.id : session.email
}

function expectedStatus(action: RequestAction): HomePublishStatus {
  if (action === "remove") return "APPROVED"
  if (action === "return") return "REJECTED"
  return "PENDING"
}

function nextData(
  action: RequestAction,
  session: AdminSession
): Prisma.NewsArticleUncheckedUpdateInput & Prisma.EventUncheckedUpdateInput {
  if (action === "approve") {
    return {
      showOnHomeRequested: true,
      homePublishStatus: "APPROVED",
      homePublishReviewedAt: new Date(),
      homePublishReviewedBy: reviewerId(session),
      homePublishRejectReason: null,
    }
  }
  if (action === "reject") {
    return {
      showOnHomeRequested: false,
      homePublishStatus: "REJECTED",
      homePublishReviewedAt: new Date(),
      homePublishReviewedBy: reviewerId(session),
      homePublishRejectReason: "Отклонено супер-админом",
    }
  }
  if (action === "remove") {
    return {
      showOnHomeRequested: false,
      homePublishStatus: "REJECTED",
      homePublishReviewedAt: new Date(),
      homePublishReviewedBy: reviewerId(session),
      homePublishRejectReason: "Снято с главной",
    }
  }
  return {
    showOnHomeRequested: true,
    homePublishStatus: "PENDING",
    homePublishRequestedAt: new Date(),
    homePublishReviewedAt: null,
    homePublishReviewedBy: null,
    homePublishRejectReason: null,
  }
}

function statusError(
  action: RequestAction,
  current: HomePublishStatus | null
): NextResponse {
  const expected = expectedStatus(action)
  const messages: Record<RequestAction, string> = {
    approve: "Одобрить можно только заявку, ожидающую рассмотрения.",
    reject: "Отклонить можно только заявку, ожидающую рассмотрения.",
    remove: "Снять с главной можно только одобренный материал.",
    return: "Вернуть на рассмотрение можно только отклонённую заявку.",
  }
  return NextResponse.json(
    {
      error:
        current === expected
          ? "Некорректное действие"
          : messages[action],
    },
    { status: 409 }
  )
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await getAdminSession()
  if (!session || !sessionIsSuperAdmin(session)) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 })
  }

  const { kind: kindRaw, id } = await params
  const kind = kindSchema.safeParse(kindRaw)
  if (!kind.success) {
    return NextResponse.json({ error: "Неизвестный тип заявки" }, { status: 404 })
  }

  const raw = await req.json().catch(() => null)
  const parsed = payloadSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректное действие" }, { status: 400 })
  }

  const action = parsed.data.action
  const expected = expectedStatus(action)
  const data = nextData(action, session)

  if (kind.data === "news") {
    const existing = await prisma.newsArticle.findUnique({ where: { id } })
    if (!existing || !existing.branchId || !existing.homePublishStatus) {
      return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 })
    }
    if (existing.homePublishStatus !== expected) {
      return statusError(action, existing.homePublishStatus)
    }
    const updated = await prisma.newsArticle.update({
      where: { id },
      data,
    })
    revalidatePath("/")
    return NextResponse.json({ ok: true, status: updated.homePublishStatus })
  }

  const existing = await prisma.event.findUnique({ where: { id } })
  if (!existing || !existing.branchId || !existing.homePublishStatus) {
    return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 })
  }
  if (existing.homePublishStatus !== expected) {
    return statusError(action, existing.homePublishStatus)
  }
  const updated = await prisma.event.update({
    where: { id },
    data,
  })
  revalidatePath("/")
  return NextResponse.json({ ok: true, status: updated.homePublishStatus })
}
