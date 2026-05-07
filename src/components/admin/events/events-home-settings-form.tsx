"use client"

import { useState, useTransition } from "react"

import { useAdminToast } from "@/components/admin/admin-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { patchSiteSettingsHome } from "@/services/api"
import {
  pathsAfterSiteSettingsHomePatch,
  requestRevalidate,
} from "@/services/revalidate"

type Initial = {
  homeEventsLimit: number
  homeEventsAutoRefresh: boolean
  homeEventsPollSeconds: number | null
}

export function EventsHomeSettingsForm({ initial }: { initial: Initial }) {
  const { success } = useAdminToast()
  const [limit, setLimit] = useState(String(initial.homeEventsLimit))
  const [autoRefresh, setAutoRefresh] = useState(initial.homeEventsAutoRefresh)
  const [pollSeconds, setPollSeconds] = useState(
    initial.homeEventsPollSeconds != null
      ? String(initial.homeEventsPollSeconds)
      : ""
  )
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function save() {
    setError(null)
    const lim = Math.min(20, Math.max(1, Number.parseInt(limit, 10) || 4))
    const pollRaw = pollSeconds.trim()
    const poll =
      pollRaw === ""
        ? null
        : Math.min(3600, Math.max(10, Number.parseInt(pollRaw, 10) || 60))

    startTransition(async () => {
      const res = await patchSiteSettingsHome({
        homeEventsLimit: lim,
        homeEventsAutoRefresh: autoRefresh,
        homeEventsPollSeconds: poll,
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? "Не удалось сохранить")
        return
      }
      await requestRevalidate(pathsAfterSiteSettingsHomePatch())
      success("Настройки сохранены.")
      setLimit(String(lim))
      if (poll !== null) setPollSeconds(String(poll))
    })
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-6">
      <h2 className="text-lg font-semibold tracking-tight">
        Настройки отображения на главной
      </h2>
      <p className="text-muted-foreground text-sm leading-relaxed">
        Блок «Афиша» на главной строится из опубликованных мероприятий с датой
        начала (предстоящие). Материалы создаются в списке ниже.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="home-events-limit">
            Количество мероприятий на главной
          </Label>
          <Input
            id="home-events-limit"
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
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Автообновление (опрос API в открытой вкладке главной)
          </label>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="home-events-poll">
            Интервал обновления (сек), 10–3600. Пусто — 60 с.
          </Label>
          <Input
            id="home-events-poll"
            type="number"
            min={10}
            max={3600}
            placeholder="60"
            value={pollSeconds}
            onChange={(e) => setPollSeconds(e.target.value)}
            disabled={!autoRefresh}
          />
        </div>
      </div>
      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="button" disabled={pending} onClick={save}>
        Сохранить настройки
      </Button>
    </div>
  )
}
