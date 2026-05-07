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
  homeNewsLimit: number
  homeNewsAutoRefresh: boolean
  homeNewsPollSeconds: number | null
}

export function NewsHomeSettingsForm({ initial }: { initial: Initial }) {
  const { success } = useAdminToast()
  const [limit, setLimit] = useState(String(initial.homeNewsLimit))
  const [autoRefresh, setAutoRefresh] = useState(initial.homeNewsAutoRefresh)
  const [pollSeconds, setPollSeconds] = useState(
    initial.homeNewsPollSeconds != null
      ? String(initial.homeNewsPollSeconds)
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
        homeNewsLimit: lim,
        homeNewsAutoRefresh: autoRefresh,
        homeNewsPollSeconds: poll,
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
        Настройки отображения
      </h2>
      <p className="text-muted-foreground text-sm leading-relaxed">
        Эти параметры задают блок «Последние новости» на главной странице сайта.
        Сами материалы по-прежнему создаются только здесь, в списке новостей.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="home-news-limit">Количество новостей на главной</Label>
          <Input
            id="home-news-limit"
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
          <Label htmlFor="home-news-poll">
            Интервал обновления (сек), 10–3600. Пусто — 60 с.
          </Label>
          <Input
            id="home-news-poll"
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
