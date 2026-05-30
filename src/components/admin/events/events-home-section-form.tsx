"use client"

import { useMemo, useState, useTransition } from "react"

import type { HomeSection } from "@/lib/cms/home/types"
import { useAdminToast } from "@/components/admin/admin-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DEFAULT_AFISHA_INFO } from "@/lib/cms/home/types"

function pickAfishaSection(
  sections: HomeSection[]
): Extract<HomeSection, { type: "afisha" }> | null {
  const s = sections.find((x) => x.type === "afisha") as
    | Extract<HomeSection, { type: "afisha" }>
    | undefined
  return s ?? null
}

export function EventsHomeSectionForm({
  initialSections,
}: {
  initialSections: HomeSection[]
}) {
  const { success } = useAdminToast()
  const initial = useMemo(
    () => pickAfishaSection(initialSections),
    [initialSections]
  )

  const [kicker, setKicker] = useState(initial?.data.kicker ?? "")
  const [kickerKz, setKickerKz] = useState(initial?.data.kickerKz ?? "")
  const [title, setTitle] = useState(initial?.data.title ?? "")
  const [titleKz, setTitleKz] = useState(initial?.data.titleKz ?? "")
  const [infoTitle, setInfoTitle] = useState(
    initial?.data.infoTitle ?? DEFAULT_AFISHA_INFO.title
  )
  const [infoTitleKz, setInfoTitleKz] = useState(
    initial?.data.infoTitleKz ?? DEFAULT_AFISHA_INFO.titleKz
  )
  const [infoDescription, setInfoDescription] = useState(
    initial?.data.infoDescription ?? DEFAULT_AFISHA_INFO.description
  )
  const [infoDescriptionKz, setInfoDescriptionKz] = useState(
    initial?.data.infoDescriptionKz ?? DEFAULT_AFISHA_INFO.descriptionKz
  )
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function save() {
    setError(null)
    startTransition(async () => {
      const next = initialSections.map((s) => {
        if (s.type !== "afisha") return s
        return {
          type: "afisha",
          data: {
            ...s.data,
            kicker: kicker.trim() || s.data.kicker,
            kickerKz: kickerKz.trim() || undefined,
            title: title.trim() || s.data.title,
            titleKz: titleKz.trim() || undefined,
            infoTitle: infoTitle.trim() || DEFAULT_AFISHA_INFO.title,
            infoTitleKz: infoTitleKz.trim() || DEFAULT_AFISHA_INFO.titleKz,
            infoDescription:
              infoDescription.trim() || DEFAULT_AFISHA_INFO.description,
            infoDescriptionKz:
              infoDescriptionKz.trim() || DEFAULT_AFISHA_INFO.descriptionKz,
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
        Не удалось найти секцию afisha в настройках главной страницы.
      </p>
    )
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="events-home-kicker-ru">Подзаголовок (kicker) (RU)</Label>
          <Input
            id="events-home-kicker-ru"
            value={kicker}
            onChange={(e) => setKicker(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="events-home-kicker-kz">Подзаголовок (kicker) (KZ)</Label>
          <Input
            id="events-home-kicker-kz"
            value={kickerKz}
            onChange={(e) => setKickerKz(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="events-home-title-ru">Заголовок секции (RU)</Label>
          <Input
            id="events-home-title-ru"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="events-home-title-kz">Заголовок секции (KZ)</Label>
          <Input
            id="events-home-title-kz"
            value={titleKz}
            onChange={(e) => setTitleKz(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="events-info-title-ru">Заголовок синего блока (RU)</Label>
          <Input
            id="events-info-title-ru"
            value={infoTitle}
            onChange={(e) => setInfoTitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="events-info-title-kz">Заголовок синего блока (KZ)</Label>
          <Input
            id="events-info-title-kz"
            value={infoTitleKz}
            onChange={(e) => setInfoTitleKz(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="events-info-description-ru">Описание синего блока (RU)</Label>
          <textarea
            id="events-info-description-ru"
            className="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm"
            value={infoDescription}
            onChange={(e) => setInfoDescription(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="events-info-description-kz">Описание синего блока (KZ)</Label>
          <textarea
            id="events-info-description-kz"
            className="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm"
            value={infoDescriptionKz}
            onChange={(e) => setInfoDescriptionKz(e.target.value)}
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

