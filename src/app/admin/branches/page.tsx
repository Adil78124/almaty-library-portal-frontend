import Link from "next/link"
import { redirect } from "next/navigation"

import { BranchDeleteButton } from "@/app/admin/branches/branch-delete-button"
import { buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  getAdminSession,
  sessionIsSuperAdmin,
} from "@/lib/auth/require-admin"
import type { BranchRow } from "@/lib/branch-row"
import { prisma } from "@/lib/prisma"
import { cn } from "@/lib/utils"

export default async function AdminBranchesPage() {
  const session = await getAdminSession()
  if (!session || !sessionIsSuperAdmin(session)) {
    redirect("/admin")
  }

  const rows = (await prisma.branch.findMany({
    orderBy: { titleRu: "asc" },
  })) as BranchRow[]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Филиалы</h1>
          <p className="text-muted-foreground mt-1 text-sm max-w-2xl leading-relaxed">
            Сначала создайте филиалы здесь — они появятся на{" "}
            <a className="text-primary underline" href="/branches" target="_blank" rel="noreferrer">
              /branches
            </a>{" "}
            и получат страницу{" "}
            <code className="text-xs bg-muted px-1 rounded">/branches/[id]</code>.
            Ответственного администратора теперь можно назначить в редактировании филиала.
          </p>
        </div>
        <Link href="/admin/branches/new" className={cn(buttonVariants())}>
          Добавить филиал
        </Link>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Сайт</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground py-10 text-center"
                >
                  Филиалов пока нет. Нажмите «Добавить филиал».
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium max-w-[240px]">
                    {r.titleRu}
                    {r.isMainBranch && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (главный)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{r.type}</TableCell>
                  <TableCell>
                    {r.published ? (
                      <a
                        className="text-primary text-sm underline"
                        href={`/branches/${r.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Открыть
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-sm">Скрыт</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 flex-wrap">
                      <Link
                        href={`/admin/branches/${r.id}/edit`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        Редактировать
                      </Link>
                      <BranchDeleteButton id={r.id} name={r.titleRu} />
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
