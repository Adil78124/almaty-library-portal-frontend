"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { PublishStatus } from "@prisma/client"

import { AdminImageUrlField } from "@/components/admin/admin-image-url-field"
import { useAdminToast } from "@/components/admin/admin-toast"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { slugifyNewsTitle } from "@/lib/news/slugify"
import { createEvent, updateEvent } from "@/services/api"
import {
  pathsAfterEventMutation,
  requestRevalidate,
} from "@/services/revalidate"

export type SerializedEvent = {
  id: string
  slug: string
  titleRu: string
  titleKz: string | null
  descriptionRu: string
  descriptionKz: string | null
  posterUrl: string | null
  startsAt: string | null
  timeDisplay: string | null
  timeDisplayKz: string | null
  format: string | null
  formatKz: string | null
  category: string | null
  categoryKz: string | null
  location: string | null
  locationKz: string | null
  ctaLabel: string | null
  ctaLabelKz: string | null
  featuredOnHome: boolean
  status: PublishStatus
  sortOrder: number
}

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return ""
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  const tz = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - tz).toISOString().slice(0, 16)
}

const textareaClass = cn(
  "flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm",
  "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
)

type Props = { mode: "create" } | { mode: "edit"; initial: SerializedEvent }

export function EventForm(props: Props) {
  const router = useRouter()
  const { success } = useAdminToast()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const isEdit = props.mode === "edit"
  const init = isEdit ? props.initial : null

  const [titleRu, setTitleRu] = useState(init?.titleRu ?? "")
  const [titleKz, setTitleKz] = useState(init?.titleKz ?? "")
  const [slug, setSlug] = useState(init?.slug ?? "")
  const [slugManual, setSlugManual] = useState(isEdit)
  const [descriptionRu, setDescriptionRu] = useState(
    init?.descriptionRu ?? ""
  )
  const [descriptionKz, setDescriptionKz] = useState(
    init?.descriptionKz ?? ""
  )
  const [posterUrl, setPosterUrl] = useState(init?.posterUrl ?? "")
  const [startsAt, setStartsAt] = useState(
    init ? toDatetimeLocal(init.startsAt) : ""
  )
  const [timeDisplay, setTimeDisplay] = useState(init?.timeDisplay ?? "")
  const [timeDisplayKz, setTimeDisplayKz] = useState(init?.timeDisplayKz ?? "")
  const [format, setFormat] = useState(init?.format ?? "")
  const [formatKz, setFormatKz] = useState(init?.formatKz ?? "")
  const [category, setCategory] = useState(init?.category ?? "")
  const [categoryKz, setCategoryKz] = useState(init?.categoryKz ?? "")
  const [location, setLocation] = useState(init?.location ?? "")
  const [locationKz, setLocationKz] = useState(init?.locationKz ?? "")
  const [ctaLabel, setCtaLabel] = useState(init?.ctaLabel ?? "")
  const [ctaLabelKz, setCtaLabelKz] = useState(init?.ctaLabelKz ?? "")
  const [status, setStatus] = useState<PublishStatus>(init?.status ?? "DRAFT")

  function save() {
    setError(null)
    const slugClean = slugManual
      ? slug.trim()
      : slugifyNewsTitle(titleRu).trim()
    if (!titleRu.trim() || !slugClean || !descriptionRu.trim()) {
      setError(
        "Заполните заголовок (RU), адрес страницы и описание (RU)."
      )
      return
    }

    startTransition(async () => {
      const payload = {
        slug: slugClean,
        titleRu: titleRu.trim(),
        titleKz: titleKz.trim() || null,
        descriptionRu: descriptionRu.trim(),
        descriptionKz: descriptionKz.trim() || null,
        posterUrl: posterUrl.trim() ? posterUrl.trim() : null,
        startsAt: startsAt ? new Date(startsAt).toISOString() : null,
        timeDisplay: timeDisplay.trim() || null,
        timeDisplayKz: timeDisplayKz.trim() || null,
        format: format.trim() || null,
        formatKz: formatKz.trim() || null,
        category: category.trim() || null,
        categoryKz: categoryKz.trim() || null,
        location: location.trim() || null,
        locationKz: locationKz.trim() || null,
        ctaLabel: ctaLabel.trim() || null,
        ctaLabelKz: ctaLabelKz.trim() || null,
        status,
      }

      const res = isEdit
        ? await updateEvent(init!.id, payload)
        : await createEvent(payload)
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        id?: string
        slug?: string
      }
      if (!res.ok) {
        setError(data.error ?? "Не удалось сохранить")
        return
      }
      if (typeof data.id === "string" && typeof data.slug === "string") {
        await requestRevalidate(
          pathsAfterEventMutation({ id: data.id, slug: data.slug })
        )
      }
      success(isEdit ? "Сохранено." : "Создано.")
      router.push("/admin/events")
    })
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      {error ? (
        <p className="text-destructive bg-destructive/10 rounded-md px-3 py-2 text-sm">
          {error}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
          <CardDescription>Заголовок и адрес страницы</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Заголовок (RU)</Label>
              <Input
                value={titleRu}
                onChange={(e) => setTitleRu(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Заголовок (KZ)</Label>
              <Input value={titleKz} onChange={(e) => setTitleKz(e.target.value)} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={slugManual}
              onChange={(e) => {
                const manual = e.target.checked
                setSlugManual(manual)
                if (manual) {
                  setSlug(slugifyNewsTitle(titleRu))
                }
              }}
            />
            Редактировать адрес страницы вручную
          </label>
          <div className="space-y-2">
            <Label>Адрес страницы (URL)</Label>
            <Input
              value={slugManual ? slug : slugifyNewsTitle(titleRu)}
              onChange={(e) => setSlug(e.target.value)}
              readOnly={!slugManual}
              className={!slugManual ? "bg-muted" : ""}
            />
            {!slugManual ? (
              <p className="text-muted-foreground text-xs">
                Генерируется из заголовка. Включите ручной режим, чтобы изменить.
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Текст мероприятия</CardTitle>
          <CardDescription>
            Лид и основной текст в одном поле. Абзацы — пустой строкой. Первый
            абзац часто показывается как краткое описание в списках.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Описание (RU)</Label>
            <textarea
              className={textareaClass}
              value={descriptionRu}
              onChange={(e) => setDescriptionRu(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Описание (KZ)</Label>
            <textarea
              className={textareaClass}
              value={descriptionKz}
              onChange={(e) => setDescriptionKz(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Медиа</CardTitle>
          <CardDescription>Постер мероприятия</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <AdminImageUrlField
            label="Постер мероприятия"
            value={posterUrl}
            onChange={setPosterUrl}
            onUploadError={setError}
            urlPlaceholder="URL постера или загрузите файл (сохранится как /uploads/…)"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Детали</CardTitle>
          <CardDescription>Дата и время, место, формат, категория, статус</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Дата и время начала</Label>
            <Input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Отображаемое время (RU)</Label>
              <Input
                value={timeDisplay}
                onChange={(e) => setTimeDisplay(e.target.value)}
                placeholder="Напр. 18:00"
              />
            </div>
            <div className="space-y-2">
              <Label>Отображаемое время (KZ)</Label>
              <Input
                value={timeDisplayKz}
                onChange={(e) => setTimeDisplayKz(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Формат (RU)</Label>
              <Input
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                placeholder="Онлайн / Офлайн / Лекция / Встреча"
              />
            </div>
            <div className="space-y-2">
              <Label>Формат (KZ)</Label>
              <Input value={formatKz} onChange={(e) => setFormatKz(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Категория (RU)</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Выставка / Встреча / …"
              />
            </div>
            <div className="space-y-2">
              <Label>Категория (KZ)</Label>
              <Input value={categoryKz} onChange={(e) => setCategoryKz(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Место проведения (RU)</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Место проведения (KZ)</Label>
              <Input value={locationKz} onChange={(e) => setLocationKz(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Текст кнопки (RU)</Label>
              <Input
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                placeholder="Подробнее"
              />
            </div>
            <div className="space-y-2">
              <Label>Текст кнопки (KZ)</Label>
              <Input value={ctaLabelKz} onChange={(e) => setCtaLabelKz(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Статус</Label>
            <select
              className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as PublishStatus)}
            >
              <option value="DRAFT">Черновик</option>
              <option value="PUBLISHED">Опубликовано</option>
              <option value="ARCHIVED">Архив</option>
            </select>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3 border-t pt-4">
          <Button type="button" disabled={pending} onClick={save}>
            {pending ? "Сохранение…" : isEdit ? "Сохранить" : "Создать"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/events")}
          >
            Отмена
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
