"use client"

import { useState, useTransition } from "react"

import { useAdminToast } from "@/components/admin/admin-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type {
  BranchDisplayKind,
  BranchDisplaySettings,
} from "@/lib/branch-display-settings"
import { requestRevalidate } from "@/services/revalidate"

const copy = {
  news: {
    heading: "Настройка отображения новостей филиала",
    description: "Управление блоком новостей на странице филиала.",
    enabledLabel: "Показывать блок новостей на странице филиала",
    limitLabel: "Количество новостей на странице филиала",
    success: "Настройки новостей филиала сохранены.",
  },
  events: {
    heading: "Настройка отображения мероприятий филиала",
    description: "Управление блоком мероприятий на странице филиала.",
    enabledLabel: "Показывать блок мероприятий на странице филиала",
    limitLabel: "Количество мероприятий на странице филиала",
    success: "Настройки мероприятий филиала сохранены.",
  },
} as const

export function BranchDisplaySettingsForm({
  kind,
  branchId,
  initial,
}: {
  kind: BranchDisplayKind
  branchId: string
  initial: BranchDisplaySettings
}) {
  const toast = useAdminToast()
  const [enabled, setEnabled] = useState(initial.enabled)
  const [limit, setLimit] = useState(String(initial.limit))
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const text = copy[kind]

  function save() {
    setError(null)
    const nextLimit = Math.min(20, Math.max(1, Number.parseInt(limit, 10) || 12))

    startTransition(async () => {
      const res = await fetch(`/api/branch-display-settings/${kind}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled, limit: nextLimit }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? "Не удалось сохранить настройки")
        return
      }

      await requestRevalidate([`/branches/${branchId}`])
      setLimit(String(nextLimit))
      toast.success(text.success)
    })
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{text.heading}</h2>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          {text.description} Эти настройки применяются только к текущему филиалу.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`branch-${kind}-limit`}>{text.limitLabel}</Label>
          <Input
            id={`branch-${kind}-limit`}
            type="number"
            min={1}
            max={20}
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
            {text.enabledLabel}
          </label>
        </div>
      </div>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="button" disabled={pending} onClick={save}>
        {pending ? "Сохранение…" : "Сохранить настройки"}
      </Button>
    </div>
  )
}

