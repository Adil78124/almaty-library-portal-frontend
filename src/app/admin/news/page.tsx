import Link from "next/link"

import { NewsDeleteButton } from "@/components/admin/news/news-delete-button"
import { AdminContentScopeFilter } from "@/components/admin/content-scope-filter"
import { buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Prisma } from "@prisma/client"

import {
  getAdminSession,
  sessionIsSuperAdmin,
} from "@/lib/auth/require-admin"
import { prisma } from "@/lib/prisma"
import { formatNewsListDate } from "@/lib/news/repository"
import { cn } from "@/lib/utils"

type Scope = "main" | "branches" | "all"

function scopeFromSearchParams(v: unknown): Scope {
  if (v === "branches" || v === "all" || v === "main") return v
  return "main"
}

export default async function AdminNewsListPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = (await searchParams) ?? {}
  const scope = scopeFromSearchParams(
    Array.isArray(sp.type) ? sp.type[0] : sp.type
  )

  const session = await getAdminSession()
  const isSuper = session ? sessionIsSuperAdmin(session) : false
  const branchScopedWhere: Prisma.NewsArticleWhereInput | undefined = (() => {
    if (
      session &&
      session.kind === "user" &&
      session.user.role === "ADMIN" &&
      session.user.branchId
    ) {
      return { branchId: session.user.branchId }
    }
    if (!isSuper) return undefined
    if (scope === "main") return { branchId: null }
    if (scope === "branches") return { branchId: { not: null } }
    return undefined
  })()

  const [rows] = await Promise.all([
    prisma.newsArticle.findMany({
      where: branchScopedWhere,
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Новости</h1>
          <p className="text-muted-foreground mt-1 text-sm max-w-xl leading-relaxed">
            {isSuper
              ? "Материалы для раздела /news. Настройки страницы /news — в «Новости → Страница новостей», настройки блока на главной — в «Новости → Главная секция»."
              : "Новости вашего филиала. Они привязываются только к текущему филиалу и отображаются на его странице."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isSuper && (
            <AdminContentScopeFilter
              label="Показывать"
              defaultValue="main"
            />
          )}
          <Link
            href="/admin/news/new"
            className={cn(buttonVariants(), "shrink-0")}
          >
            Добавить новость
          </Link>
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Заголовок</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground py-10 text-center">
                  Пока нет новостей. Нажмите «Добавить новость».
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium max-w-[280px] truncate">
                    {r.titleRu}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {r.slug}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatNewsListDate(r.publishedAt) || "—"}
                  </TableCell>
                  <TableCell>{r.status}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 flex-wrap">
                      <Link
                        href={`/admin/news/${r.id}/edit`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        Редактировать
                      </Link>
                      <NewsDeleteButton id={r.id} slug={r.slug} title={r.titleRu} />
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
