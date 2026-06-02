"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { requestRevalidate } from "@/services/revalidate"

export type HomePublicationRequestStatus = "PENDING" | "APPROVED" | "REJECTED"
export type HomePublicationRequestFilter =
  | "all"
  | "pending"
  | "approved"
  | "rejected"

export type HomePublicationRequest = {
  id: string
  kind: "news" | "event"
  title: string
  branchTitle: string
  createdAt: string
  updatedAt: string
  status: HomePublicationRequestStatus
  rejectReason: string | null
  excerpt: string
  imageUrl: string | null
  href: string
}

type RequestAction = "approve" | "reject" | "remove" | "return"

const statusLabels: Record<HomePublicationRequestStatus, string> = {
  PENDING: "Ожидает рассмотрения",
  APPROVED: "Одобрено",
  REJECTED: "Отклонено",
}

const kindLabels: Record<HomePublicationRequest["kind"], string> = {
  news: "Новость",
  event: "Мероприятие",
}

const filterItems: {
  value: HomePublicationRequestFilter
  label: string
}[] = [
  { value: "pending", label: "Ожидают рассмотрения" },
  { value: "approved", label: "Одобренные" },
  { value: "rejected", label: "Отклонённые" },
  { value: "all", label: "Все" },
]

const actionLabels: Record<RequestAction, string> = {
  approve: "Одобрить",
  reject: "Отклонить",
  remove: "Снять с главной",
  return: "Вернуть на рассмотрение",
}

const actionConfirmText: Record<RequestAction, string> = {
  approve: "Одобрить заявку?",
  reject: "Отклонить заявку?",
  remove: "Снять материал с главной?",
  return: "Вернуть заявку на рассмотрение?",
}

function filterHref(value: HomePublicationRequestFilter): string {
  return value === "pending"
    ? "/admin/home-publication-requests"
    : `/admin/home-publication-requests?status=${value}`
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

function displayStatus(item: HomePublicationRequest): string {
  if (
    item.status === "REJECTED" &&
    item.rejectReason?.toLowerCase().includes("снято")
  ) {
    return "Снято с главной"
  }
  return statusLabels[item.status]
}

export function HomePublicationRequestsClient({
  items,
  activeFilter,
}: {
  items: HomePublicationRequest[]
  activeFilter: HomePublicationRequestFilter
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function mutate(item: HomePublicationRequest, action: RequestAction) {
    if (!window.confirm(actionConfirmText[action])) return

    startTransition(async () => {
      const res = await fetch(
        `/api/home-publication-requests/${item.kind}/${item.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      )
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        window.alert(data.error ?? "Не удалось обновить заявку")
        return
      }
      await requestRevalidate(["/"])
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filterItems.map((item) => (
          <Link
            key={item.value}
            href={filterHref(item.value)}
            className={cn(
              buttonVariants({
                variant: activeFilter === item.value ? "default" : "outline",
                size: "sm",
              })
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Материал</TableHead>
              <TableHead>Филиал</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground py-10 text-center"
                >
                  Заявок в выбранном фильтре пока нет.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={`${item.kind}-${item.id}`}>
                  <TableCell className="min-w-[320px]">
                    <div className="flex items-start gap-3">
                      {item.imageUrl ? (
                        <img
                          alt=""
                          className="size-14 shrink-0 rounded-md object-cover"
                          src={item.imageUrl}
                        />
                      ) : (
                        <div className="size-14 shrink-0 rounded-md bg-muted" />
                      )}
                      <div className="min-w-0">
                        <p className="text-muted-foreground text-xs font-semibold uppercase">
                          {kindLabels[item.kind]}
                        </p>
                        <p className="line-clamp-1 font-semibold">{item.title}</p>
                        <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">
                          {item.excerpt}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate">
                    {item.branchTitle}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(item.updatedAt || item.createdAt)}
                  </TableCell>
                  <TableCell>{displayStatus(item)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link
                        href={item.href}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" })
                        )}
                      >
                        Открыть материал
                      </Link>
                      {item.status === "PENDING" ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={pending}
                            onClick={() => mutate(item, "approve")}
                          >
                            {actionLabels.approve}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            disabled={pending}
                            onClick={() => mutate(item, "reject")}
                          >
                            {actionLabels.reject}
                          </Button>
                        </>
                      ) : null}
                      {item.status === "APPROVED" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          disabled={pending}
                          onClick={() => mutate(item, "remove")}
                        >
                          {actionLabels.remove}
                        </Button>
                      ) : null}
                      {item.status === "REJECTED" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={pending}
                          onClick={() => mutate(item, "return")}
                        >
                          {actionLabels.return}
                        </Button>
                      ) : null}
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
