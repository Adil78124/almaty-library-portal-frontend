"use client"

import { useEffect, useMemo, useState } from "react"
import { Download, Loader2, UsersRound, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAdminToast } from "@/components/admin/admin-toast"

type Period = "3m" | "30d" | "7d"
type Summary = {
  period: Period
  totalVisits: number
  pageViews: number
  uniqueVisitors: number
  online: number
  series: Array<{ date: string; visits: number; uniqueVisitors: number }>
}
type PageRow = { path: string; section: string | null; visits: number; uniqueVisitors: number }
type BranchRow = { branchId: string; titleRu: string; titleKz: string | null; visits: number; uniqueVisitors: number }

const PERIOD_LABEL: Record<Period, string> = {
  "3m": "Последние 3 месяца",
  "30d": "30 дней",
  "7d": "7 дней",
}

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

function makePath(points: Array<{ x: number; y: number }>): string {
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ")
}

function AreaChart({ data }: { data: Summary["series"] }) {
  const width = 900
  const height = 260
  const pad = 24
  const max = Math.max(1, ...data.map((d) => d.visits))
  const points = data.map((d, i) => {
    const x = data.length <= 1 ? pad : pad + (i / (data.length - 1)) * (width - pad * 2)
    const y = height - pad - (d.visits / max) * (height - pad * 2)
    return { x, y }
  })
  const line = makePath(points)
  const area = points.length
    ? `${line} L ${points[points.length - 1]!.x.toFixed(2)} ${height - pad} L ${points[0]!.x.toFixed(2)} ${height - pad} Z`
    : ""
  const step = Math.max(1, Math.floor(data.length / 6))
  const ticks = data.filter((_, i) => i % step === 0 || i === data.length - 1)

  if (data.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-lg border border-dashed bg-muted/50">
        <p className="text-sm text-muted-foreground">Нет данных за выбранный период</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-neutral-950 p-4 text-white">
      <svg className="h-[320px] w-full" viewBox={`0 0 ${width} ${height + 48}`} role="img" aria-label="График посещений">
        <defs>
          <linearGradient id="analyticsArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.65" />
            <stop offset="100%" stopColor="white" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line key={ratio} x1={pad} x2={width - pad} y1={pad + ratio * (height - pad * 2)} y2={pad + ratio * (height - pad * 2)} stroke="rgba(255,255,255,.10)" />
        ))}
        <path d={area} fill="url(#analyticsArea)" />
        <path d={line} fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="2" />
        {ticks.map((d) => {
          const i = data.indexOf(d)
          const x = data.length <= 1 ? pad : pad + (i / (data.length - 1)) * (width - pad * 2)
          return (
            <text key={d.date} x={x} y={height + 22} textAnchor="middle" fill="rgba(255,255,255,.52)" fontSize="13">
              {dateLabel(d.date)}
            </text>
          )
        })}
      </svg>
    </div>
  )
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
        const [summaryRes, pagesRes, branchesRes] = await Promise.all([
          fetch(`/api/admin/analytics/summary?period=${period}`, { cache: "no-store", credentials: "include" }),
          fetch(`/api/admin/analytics/pages?period=${period}`, { cache: "no-store", credentials: "include" }),
          fetch(`/api/admin/analytics/branches?period=${period}`, { cache: "no-store", credentials: "include" }),
        ])
        if (!summaryRes.ok || !pagesRes.ok || !branchesRes.ok) throw new Error("Не удалось загрузить аналитику")
        const nextSummary = (await summaryRes.json()) as Summary
        const nextPages = (await pagesRes.json()) as PageRow[]
        const nextBranches = (await branchesRes.json()) as BranchRow[]
        if (!cancelled) {
          setSummary(nextSummary)
          setPages(nextPages)
          setBranches(nextBranches)
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Ошибка загрузки")
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
    if (!summary) {
      toast.success("Нет данных для экспорта")
      return
    }

    setExporting(format)
    try {
      const url = `/api/admin/analytics/export?format=${format}&period=${period}`
      const res = await fetch(url, { credentials: "include" })
      if (!res.ok) throw new Error("Ошибка при экспорте")

      const blob = await res.blob()
      const filename = `analytics-report-${period}-${new Date().toISOString().split("T")[0]}.${format === "xlsx" ? "xlsx" : "pdf"}`
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = filename
      link.click()
      URL.revokeObjectURL(link.href)

      toast.success(`Экспорт ${format.toUpperCase()} загружен`)
    } catch (e) {
      console.error("Export error:", e)
      toast.success(`Ошибка при экспорте ${format.toUpperCase()}`)
    } finally {
      setExporting(null)
    }
  }

  const cards = useMemo(
    () => [
      { label: "Всего посещений", value: summary?.totalVisits ?? 0, icon: TrendingUp },
      { label: "Просмотры страниц", value: summary?.pageViews ?? 0, icon: UsersRound },
      { label: "Уникальные посетители", value: summary?.uniqueVisitors ?? 0, icon: UsersRound },
      { label: "Сейчас на сайте", value: summary?.online ?? 0, icon: UsersRound },
    ],
    [summary]
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Статистика посещений</h1>
          <p className="mt-1 text-sm text-muted-foreground">Аналитика посещаемости сайта, страниц и филиалов</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["7d", "30d", "3m"] as Period[]).map((item) => (
            <Button
              key={item}
              variant={period === item ? "default" : "outline"}
              onClick={() => setPeriod(item)}
            >
              {PERIOD_LABEL[item]}
            </Button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fmt(card.value)}</div>
                <p className="text-xs text-muted-foreground">{PERIOD_LABEL[period]}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Посещения</CardTitle>
            <CardDescription>Динамика посещений за выбранный период</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleExport("xlsx")}
              disabled={exporting !== null || !summary}
            >
              {exporting === "xlsx" ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                </>
              ) : (
                <>
                  <Download className="size-4" />
                  Скачать XLS
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleExport("pdf")}
              disabled={exporting !== null || !summary}
            >
              {exporting === "pdf" ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                </>
              ) : (
                <>
                  <Download className="size-4" />
                  Скачать PDF
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading && !summary ? (
            <div className="flex h-80 items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" />
              Загрузка...
            </div>
          ) : (
            <AreaChart data={summary?.series ?? []} />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Популярные страницы</CardTitle>
            <CardDescription>Самые посещаемые страницы сайта</CardDescription>
          </CardHeader>
          <CardContent>
            {pages.length === 0 ? (
              <div className="flex h-48 items-center justify-center rounded-lg border border-dashed bg-muted/50">
                <p className="text-sm text-muted-foreground">Нет данных за выбранный период</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Страница</TableHead>
                    <TableHead>Раздел</TableHead>
                    <TableHead className="text-right">Просмотры</TableHead>
                    <TableHead className="text-right">Уникальные</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.slice(0, 12).map((row) => (
                    <TableRow key={row.path}>
                      <TableCell className="max-w-[260px] truncate font-medium">{row.path}</TableCell>
                      <TableCell className="text-muted-foreground">{row.section ?? "—"}</TableCell>
                      <TableCell className="text-right">{fmt(row.visits)}</TableCell>
                      <TableCell className="text-right">{fmt(row.uniqueVisitors)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Статистика филиалов</CardTitle>
            <CardDescription>Посещаемость по филиалам</CardDescription>
          </CardHeader>
          <CardContent>
            {branches.length === 0 ? (
              <div className="flex h-48 items-center justify-center rounded-lg border border-dashed bg-muted/50">
                <p className="text-sm text-muted-foreground">Нет данных за выбранный период</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Филиал</TableHead>
                    <TableHead className="text-right">Просмотры</TableHead>
                    <TableHead className="text-right">Уникальные</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches.slice(0, 12).map((row) => (
                    <TableRow key={row.branchId}>
                      <TableCell className="max-w-[280px] truncate font-medium">{row.titleRu}</TableCell>
                      <TableCell className="text-right">{fmt(row.visits)}</TableCell>
                      <TableCell className="text-right">{fmt(row.uniqueVisitors)}</TableCell>
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
