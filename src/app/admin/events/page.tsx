import type { Prisma } from "@prisma/client"
import Link from "next/link"

import { AdminBranchFilter } from "@/components/admin/admin-branch-filter"
import { AdminContentScopeFilter } from "@/components/admin/content-scope-filter"
import { EventDeleteButton } from "@/components/admin/events/event-delete-button"
import { buttonVariants } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  getAdminSession,
  sessionIsSuperAdmin,
} from "@/lib/auth/require-admin"
import { formatEventFullDateTime } from "@/lib/events/format-dates"
import { prisma } from "@/lib/prisma"
import { cn } from "@/lib/utils"

function formatEventDate(d: Date | null): string {
  return formatEventFullDateTime(d, "ru") || "—"
}

type Scope = "main" | "branches" | "all"

function scopeFromSearchParams(v: unknown): Scope {
  if (v === "branches" || v === "all" || v === "main") return v
  return "main"
}

export default async function AdminEventsListPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = (await searchParams) ?? {}
  const scope = scopeFromSearchParams(
    Array.isArray(sp.type) ? sp.type[0] : sp.type
  )
  const requestedBranchId = Array.isArray(sp.branchId)
    ? sp.branchId[0]
    : sp.branchId

  const session = await getAdminSession()
  const isSuper = session ? sessionIsSuperAdmin(session) : false
  const branchScopedWhere: Prisma.EventWhereInput | undefined = (() => {
    if (
      session &&
      session.kind === "user" &&
      session.user.role === "ADMIN" &&
      session.user.branchId
    ) {
      return { branchId: session.user.branchId }
    }
    if (!isSuper) return undefined
    if (requestedBranchId) return { branchId: requestedBranchId }
    if (scope === "main") return { branchId: null }
    if (scope === "branches") return { branchId: { not: null } }
    return undefined
  })()

  const [rows, selectedBranch, branches] = await Promise.all([
    prisma.event.findMany({
      where: branchScopedWhere,
      orderBy: [{ startsAt: "desc" }, { updatedAt: "desc" }],
    }),
    isSuper && requestedBranchId
      ? prisma.branch.findUnique({
          where: { id: requestedBranchId },
          select: { titleRu: true },
        })
      : Promise.resolve(null),
    isSuper
      ? prisma.branch.findMany({
          orderBy: { titleRu: "asc" },
          select: { id: true, titleRu: true },
        })
      : Promise.resolve([]),
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Мероприятия</h1>
          <p className="text-muted-foreground mt-1 text-sm max-w-xl leading-relaxed">
            {isSuper
              ? "Материалы для /events. Настройки страницы /events — в «Мероприятия → Страница мероприятий», настройки блока «Афиша» на главной — в «Мероприятия → Главная секция»."
              : "Мероприятия вашего филиала. Они привязываются только к текущему филиалу и отображаются на его странице."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isSuper && (
            <>
              <AdminContentScopeFilter
                label="Показывать"
                defaultValue="main"
              />
              <AdminBranchFilter
                branches={branches}
                selectedBranchId={requestedBranchId}
              />
            </>
          )}
          <Link
            href="/admin/events/new"
            className={cn(buttonVariants(), "shrink-0")}
          >
            Добавить мероприятие
          </Link>
        </div>
      </div>

      {selectedBranch ? (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
          Выбран филиал: <strong>{selectedBranch.titleRu}</strong>
        </div>
      ) : null}

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Заголовок</TableHead>
              <TableHead>Адрес (URL)</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground py-10 text-center">
                  Пока нет мероприятий. Нажмите «Добавить мероприятие».
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium max-w-[280px] truncate">{r.titleRu}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{r.slug}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatEventDate(r.startsAt)}</TableCell>
                  <TableCell>{r.status}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 flex-wrap">
                      <Link
                        href={`/admin/events/${r.id}/edit`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        Редактировать
                      </Link>
                      <EventDeleteButton
                        id={r.id}
                        slug={r.slug}
                        title={r.titleRu}
                      />
                      <form action={`/api/events/${r.id}`} method="post" hidden>
                        {/* delete кнопка — через fetch будет добавлена позднее, чтобы не расширять UI лишним */}
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
