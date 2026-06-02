"use client"

import { useMemo, useState, useTransition } from "react"

import { useAdminToast } from "@/components/admin/admin-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { HomeSection } from "@/lib/cms/home/types"

function pickNewArrivalsSection(
  sections: HomeSection[]
): Extract<HomeSection, { type: "newArrivals" }> | null {
  const section = sections.find((x) => x.type === "newArrivals") as
    | Extract<HomeSection, { type: "newArrivals" }>
    | undefined
  return section ?? null
}

export function NewArrivalsDisplaySettingsForm({
  initialSections,
}: {
  initialSections: HomeSection[]
}) {
  const { success } = useAdminToast()
  const initial = useMemo(
    () => pickNewArrivalsSection(initialSections),
    [initialSections]
  )
  const [enabled, setEnabled] = useState(initial?.data.enabled !== false)
  const [limit, setLimit] = useState(String(initial?.data.database?.limit ?? 6))
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function save() {
    if (!initial) return
    setError(null)
    const nextLimit = Math.min(12, Math.max(1, Number.parseInt(limit, 10) || 6))

    startTransition(async () => {
      const next = initialSections.map((section) => {
        if (section.type !== "newArrivals") return section
        return {
          type: "newArrivals",
          data: {
            ...section.data,
            enabled,
            source: "database",
            database: {
              ...(section.data.database ?? {}),
              limit: nextLimit,
            },
          },
        } satisfies HomeSection
      })

      const res = await fetch("/api/page/home", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: "home", sections: next }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        issues?: { path: string; message: string }[]
      }
      if (!res.ok) {
        if (data.issues?.length) {
          setError(data.issues.map((i) => `${i.path}: ${i.message}`).join("; "))
        } else {
          setError(data.error ?? "Не удалось сохранить настройки")
        }
        return
      }

      setLimit(String(nextLimit))
      success("Настройки новых поступлений сохранены.")
    })
  }

  if (!initial) {
    return (
      <p className="text-destructive text-sm">
        Не удалось найти секцию newArrivals в настройках главной страницы.
      </p>
    )
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Настройки вывода
        </h2>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
          Настройки вывода блока “Новые поступления” на сайте. Создание и
          редактирование книг выполняется в разделе “Новые поступления”.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="new-arrivals-limit">Количество отображаемых книг</Label>
          <Input
            id="new-arrivals-limit"
            type="number"
            min={1}
            max={12}
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              className="size-4 rounded border-input"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            Показывать блок “Новые поступления” на главной странице
          </label>
        </div>
      </div>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="button" disabled={pending} onClick={save}>
        {pending ? "Сохранение..." : "Сохранить настройки"}
      </Button>
    </div>
  )
}
