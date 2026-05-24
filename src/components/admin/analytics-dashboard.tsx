"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Activity,
  Download,
  Eye,
  Loader2,
  MousePointerClick,
  UsersRound,
} from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { useAdminToast } from "@/components/admin/admin-toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Period = "7d" | "30d" | "3m"
type Summary = {
  period: Period
  from: string
  to: string
  scope?: "site" | "branch"
  branchId?: string | null
  branchName?: string | null
  totalVisits: number
  pageViews: number
  uniqueVisitors: number
  online: number
  series: Array<{ date: string; visits: number; uniqueVisitors: number }>
}
type PageRow = { path: string; section: string | null; visits: number; uniqueVisitors: number }
type BranchRow = { branchId: string; titleRu: string; titleKz: string | null; visits: number; uniqueVisitors: number }

const PERIOD_LABEL: Record<Period, string> = {
  "7d": "7 дней",
  "30d": "30 дней",
  "3m": "3 месяца",
}

const PERIODS: Period[] = ["7d", "30d", "3m"]

function fmt(n: number): string {
  return Number(n || 0).toLocaleString("ru-RU")
}

function dateLabel(iso: string): string {
  return new Date(`${iso}T00:00:00.000Z`).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  })
}

function hasChartData(data: Summary["series"]): boolean {
  return data.some((row) => row.visits > 0 || row.uniqueVisitors > 0)
}

type ChartTooltipPayload = {
  dataKey?: string | number
  value?: string | number
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: ChartTooltipPayload[]
  label?: string | number
}) {
  if (!active || !payload?.length) return null

  const visits = Number(payload.find((item) => item.dataKey === "visits")?.value ?? 0)
  const uniqueVisitors = Number(payload.find((item) => item.dataKey === "uniqueVisitors")?.value ?? 0)

  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{dateLabel(String(label))}</p>
      <p className="mt-1 text-muted-foreground">Посещения: {fmt(visits)}</p>
      <p className="text-muted-foreground">Уникальные посетители: {fmt(uniqueVisitors)}</p>
    </div>
  )
}

function EmptyState({ className }: { className?: string }) {
  return (
    <div className={className ?? "flex h-48 items-center justify-center rounded-lg border border-dashed bg-muted/40"}>
      <p className="text-sm text-muted-foreground">Нет данных за выбранный период</p>
    </div>
  )
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store", credentials: "include" })
  if (!res.ok) {
    throw new Error("Не удалось загрузить аналитику")
  }
  return (await res.json()) as T
}

export function AnalyticsDashboard() {
  const toast = useAdminToast()
  const [period, setPeriod] = useState<Period>("7d")
  const [summary, setSummary] = useState<Summary | null>(null)
  const [pages, setPages] = useState<PageRow[]>([])
  const [branches, setBranches] = useState<BranchRow[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState<"xlsx" | "pdf" | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const [nextSummary, nextPages, nextBranches] = await Promise.all([
          fetchJson<Summary>(`/api/admin/analytics/summary?period=${period}`),
          fetchJson<PageRow[]>(`/api/admin/analytics/pages?period=${period}`),
          fetchJson<BranchRow[]>(`/api/admin/analytics/branches?period=${period}`),
        ])

        if (!cancelled) {
          setSummary(nextSummary)
          setPages(nextPages)
          setBranches(nextBranches)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Ошибка загрузки аналитики")
          setSummary(null)
          setPages([])
          setBranches([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    const id = window.setInterval(() => void load(), 60_000)

    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [period])

  const handleExport = async (format: "xlsx" | "pdf") => {
    setExporting(format)

    try {
      const res = await fetch(`/api/admin/analytics/export?format=${format}&period=${period}`, {
        credentials: "include",
      })
      if (!res.ok) {
        throw new Error("Ошибка при экспорте")
      }

      const blob = await res.blob()
      const date = new Date().toISOString().slice(0, 10)
      const filename = `analytics-report-${period}-${date}.${format === "xlsx" ? "xlsx" : "pdf"}`
      const link = document.createElement("a")
      const href = URL.createObjectURL(blob)
      link.href = href
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(href)

      toast.success(`${format === "xlsx" ? "XLS" : "PDF"} отчёт скачан`)
    } catch (e) {
      console.error("Analytics export error:", e)
      toast.error(`Не удалось скачать ${format === "xlsx" ? "XLS" : "PDF"} отчёт`)
    } finally {
      setExporting(null)
    }
  }

  const isBranchScope = summary?.scope === "branch"
  const chartData = summary?.series ?? []
  const chartHasData = hasChartData(chartData)

  const cards = useMemo(
    () => [
      { label: "Всего посещений", value: summary?.totalVisits ?? 0, icon: MousePointerClick },
      { label: "Просмотры страниц", value: summary?.pageViews ?? 0, icon: Eye },
      { label: "Уникальные посетители", value: summary?.uniqueVisitors ?? 0, icon: UsersRound },
      { label: "Сейчас на сайте", value: summary?.online ?? 0, icon: Activity },
    ],
    [summary]
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              {isBranchScope ? "Статистика вашего филиала" : "Статистика посещений"}
            </h1>
            {isBranchScope ? <Badge variant="secondary">{summary?.branchName ?? "Филиал"}</Badge> : null}
          </div>
          <p className="text-sm text-muted-foreground">
            Аналитика посещаемости сайта, страниц и филиалов
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => void handleExport("xlsx")}
            disabled={exporting !== null}
          >
            {exporting === "xlsx" ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            {exporting === "xlsx" ? "Скачивание" : "Скачать XLS"}
          </Button>
          <Button
            variant="outline"
            onClick={() => void handleExport("pdf")}
            disabled={exporting !== null}
          >
            {exporting === "pdf" ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            {exporting === "pdf" ? "Скачивание" : "Скачать PDF"}
          </Button>
        </div>
      </div>

      <Tabs value={period} onValueChange={(value) => setPeriod(value as Period)}>
        <TabsList>
          {PERIODS.map((item) => (
            <TabsTrigger key={item} value={item}>
              {PERIOD_LABEL[item]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon

          return (
            <Card key={card.label} size="sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tracking-tight">{loading && !summary ? "..." : fmt(card.value)}</div>
                <p className="mt-1 text-xs text-muted-foreground">{PERIOD_LABEL[period]}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Посещения</CardTitle>
          <CardDescription>Динамика посещений за выбранный период</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !summary ? (
            <div className="flex h-80 items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" />
              Загрузка...
            </div>
          ) : !chartHasData ? (
            <EmptyState className="flex h-80 items-center justify-center rounded-lg border border-dashed bg-muted/40" />
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="analyticsVisits" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.32} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={dateLabel}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={24}
                    fontSize={12}
                  />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} width={34} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="visits"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#analyticsVisits)"
                    name="Посещения"
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Популярные страницы</CardTitle>
            <CardDescription>Страницы с наибольшим количеством просмотров</CardDescription>
          </CardHeader>
          <CardContent>
            {pages.length === 0 ? (
              <EmptyState />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Страница</TableHead>
                    <TableHead>Раздел</TableHead>
                    <TableHead className="text-right">Просмотры</TableHead>
                    <TableHead className="text-right">Уникальные посетители</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.slice(0, 12).map((row) => (
                    <TableRow key={row.path}>
                      <TableCell className="max-w-[260px] truncate font-medium">{row.path}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{row.section ?? "Без раздела"}</Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{fmt(row.visits)}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmt(row.uniqueVisitors)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isBranchScope ? "Статистика вашего филиала" : "Статистика филиалов"}</CardTitle>
            <CardDescription>
              {isBranchScope ? "Просмотры и посетители филиала" : "Посещаемость по филиалам"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {branches.length === 0 ? (
              <EmptyState />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Филиал</TableHead>
                    <TableHead className="text-right">Просмотры</TableHead>
                    <TableHead className="text-right">Уникальные посетители</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches.slice(0, 12).map((row) => (
                    <TableRow key={row.branchId}>
                      <TableCell className="max-w-[280px] truncate font-medium">{row.titleRu}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmt(row.visits)}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmt(row.uniqueVisitors)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
