"use client"

import { useMemo, useState, useTransition } from "react"

import type { HomeSection } from "@/lib/cms/home/types"
import { useAdminToast } from "@/components/admin/admin-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function pickLatestNewsSection(
  sections: HomeSection[]
): Extract<HomeSection, { type: "latestNews" }> | null {
  const s = sections.find((x) => x.type === "latestNews") as
    | Extract<HomeSection, { type: "latestNews" }>
    | undefined
  return s ?? null
}

export function NewsHomeSectionForm({
  initialSections,
}: {
  initialSections: HomeSection[]
}) {
  const { success } = useAdminToast()
  const initial = useMemo(() => pickLatestNewsSection(initialSections), [initialSections])

  const [kicker, setKicker] = useState(initial?.data.kicker ?? "")
  const [kickerKz, setKickerKz] = useState(initial?.data.kickerKz ?? "")
  const [title, setTitle] = useState(initial?.data.title ?? "")
  const [titleKz, setTitleKz] = useState(initial?.data.titleKz ?? "")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function save() {
    setError(null)
    startTransition(async () => {
      const next = initialSections.map((s) => {
        if (s.type !== "latestNews") return s
        return {
          type: "latestNews",
          data: {
            ...s.data,
            kicker: kicker.trim() || s.data.kicker,
            kickerKz: kickerKz.trim() || undefined,
            title: title.trim() || s.data.title,
            titleKz: titleKz.trim() || undefined,
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
          setError(data.error ?? "Не удалось сохранить")
        }
        return
      }

      success("Сохранено. Главная страница обновлена.")
    })
  }

  if (!initial) {
    return (
      <p className="text-destructive text-sm">
        Не удалось найти секцию latestNews в настройках главной страницы.
      </p>
    )
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="news-home-kicker-ru">Подзаголовок (kicker) (RU)</Label>
          <Input
            id="news-home-kicker-ru"
            value={kicker}
            onChange={(e) => setKicker(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="news-home-kicker-kz">Подзаголовок (kicker) (KZ)</Label>
          <Input
            id="news-home-kicker-kz"
            value={kickerKz}
            onChange={(e) => setKickerKz(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="news-home-title-ru">Заголовок секции (RU)</Label>
          <Input
            id="news-home-title-ru"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="news-home-title-kz">Заголовок секции (KZ)</Label>
          <Input
            id="news-home-title-kz"
            value={titleKz}
            onChange={(e) => setTitleKz(e.target.value)}
          />
        </div>
      </div>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="button" disabled={pending} onClick={save}>
        Сохранить
      </Button>
    </div>
  )
}

