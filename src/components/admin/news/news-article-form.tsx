"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
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
import {
  createNewsArticle,
  updateNewsArticle,
} from "@/services/api"
import {
  pathsAfterNewsMutation,
  requestRevalidate,
} from "@/services/revalidate"

export type SerializedNewsArticle = {
  id: string
  slug: string
  titleRu: string
  titleKz?: string | null
  descriptionRu: string
  descriptionKz?: string | null
  coverImageUrl: string | null
  publishedAt: string | null
  location: string | null
  locationKz?: string | null
  curator: string | null
  curatorKz?: string | null
  status: PublishStatus
  sortOrder: number
  branchId?: string | null
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

type Props =
  | { mode: "create" }
  | { mode: "edit"; initial: SerializedNewsArticle }

export function NewsArticleForm(props: Props) {
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
  const [coverImageUrl, setCoverImageUrl] = useState(init?.coverImageUrl ?? "")
  const [publishedAt, setPublishedAt] = useState(
    init ? toDatetimeLocal(init.publishedAt) : ""
  )
  const [location, setLocation] = useState(init?.location ?? "")
  const [locationKz, setLocationKz] = useState(init?.locationKz ?? "")
  const [curator, setCurator] = useState(init?.curator ?? "")
  const [curatorKz, setCuratorKz] = useState(init?.curatorKz ?? "")
  const [status, setStatus] = useState<PublishStatus>(init?.status ?? "DRAFT")

  function save() {
    setError(null)
    const resolvedSlug = slugManual
      ? slug.trim()
      : slugifyNewsTitle(titleRu).trim()
    if (!titleRu.trim() || !resolvedSlug || !descriptionRu.trim()) {
      setError("Заполните заголовок (RU), slug и текст (RU).")
      return
    }

    startTransition(async () => {
      const payload = {
        slug: resolvedSlug,
        titleRu: titleRu.trim(),
        titleKz: titleKz.trim() || null,
        descriptionRu: descriptionRu.trim(),
        descriptionKz: descriptionKz.trim() || null,
        coverImageUrl: coverImageUrl.trim() || null,
        publishedAt: publishedAt.trim() || null,
        location: location.trim() || null,
        locationKz: locationKz.trim() || null,
        curator: curator.trim() || null,
        curatorKz: curatorKz.trim() || null,
        status,
      }

      if (isEdit && init) {
        const previousSlug = init.slug
        const res = await updateNewsArticle(init.id, payload)
        const data = (await res.json().catch(() => ({}))) as {
          error?: string
          issues?: { path: string; message: string }[]
          slug?: string
          id?: string
        }
        if (!res.ok) {
          if (data.issues?.length) {
            setError(data.issues.map((i) => `${i.path}: ${i.message}`).join("; "))
          } else {
            setError(data.error ?? "Ошибка сохранения")
          }
          return
        }
        const slug = typeof data.slug === "string" ? data.slug : init.slug
        const id = typeof data.id === "string" ? data.id : init.id
        await requestRevalidate(
          pathsAfterNewsMutation({ slug, id, previousSlug })
        )
        success("Сохранено.")
        router.push("/admin/news")
        router.refresh()
        return
      }

      const res = await createNewsArticle(payload)
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        issues?: { path: string; message: string }[]
        id?: string
        slug?: string
      }
      if (!res.ok) {
        if (data.issues?.length) {
          setError(data.issues.map((i) => `${i.path}: ${i.message}`).join("; "))
        } else {
          setError(data.error ?? "Ошибка создания")
        }
        return
      }
      if (data.id && data.slug) {
        await requestRevalidate(
          pathsAfterNewsMutation({ slug: data.slug, id: data.id })
        )
      }
      success("Создано.")
      if (data.id) {
        router.push(`/admin/news/${data.id}/edit`)
      } else {
        router.push("/admin/news")
      }
      router.refresh()
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
          <div className="space-y-2">
            <Label htmlFor="news-title">Заголовок (RU)</Label>
            <Input
              id="news-title"
              value={titleRu}
              onChange={(e) => setTitleRu(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="news-title-kz">Заголовок (KZ)</Label>
            <Input
              id="news-title-kz"
              value={titleKz}
              onChange={(e) => setTitleKz(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="news-slug">Адрес страницы (URL)</Label>
            <Input
              id="news-slug"
              value={slugManual ? slug : slugifyNewsTitle(titleRu)}
              onChange={(e) => setSlug(e.target.value)}
              readOnly={!slugManual}
              className={!slugManual ? "bg-muted" : ""}
            />
            {!slugManual ? (
              <p className="text-muted-foreground text-xs">
                Генерируется из заголовка. Включите ручной режим, чтобы изменить.
              </p>
            ) : !isEdit ? (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    const base = (
                      slugifyNewsTitle(titleRu) ||
                      slug.replace(/-\d+$/, "").replace(/-+$/g, "") ||
                      "news"
                    ).slice(0, 80)
                    setSlug(`${base}-${Date.now().toString(36)}`)
                  }}
                >
                  Сделать адрес уникальным (суффикс)
                </Button>
                <span className="text-muted-foreground text-xs">
                  Если сервер пишет, что адрес занят — нажмите или измените вручную.
                </span>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Текст материала</CardTitle>
          <CardDescription>
            Лид и основной текст в одном поле. Абзацы — пустой строкой. Первый
            абзац часто показывается как краткое описание в списках.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="news-desc-ru">Описание / текст (RU)</Label>
            <textarea
              id="news-desc-ru"
              className={textareaClass}
              value={descriptionRu}
              onChange={(e) => setDescriptionRu(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="news-desc-kz">Описание / текст (KZ)</Label>
            <textarea
              id="news-desc-kz"
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
          <CardDescription>Обложка для списка и страницы материала</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AdminImageUrlField
            id="news-image-url"
            label="Обложка"
            value={coverImageUrl}
            onChange={setCoverImageUrl}
            onUploadError={(msg) => setError(msg)}
            urlPlaceholder="URL обложки или загрузите файл"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Дополнительно</CardTitle>
          <CardDescription>Дата, место, куратор, статус публикации</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="news-date">Дата публикации</Label>
            <Input
              id="news-date"
              type="datetime-local"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="news-location">Место (RU)</Label>
            <Input
              id="news-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="news-location-kz">Место (KZ)</Label>
            <Input
              id="news-location-kz"
              value={locationKz}
              onChange={(e) => setLocationKz(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="news-curator">Куратор / контакт (RU)</Label>
            <Input
              id="news-curator"
              value={curator}
              onChange={(e) => setCurator(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="news-curator-kz">Куратор / контакт (KZ)</Label>
            <Input
              id="news-curator-kz"
              value={curatorKz}
              onChange={(e) => setCuratorKz(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="news-status">Статус</Label>
            <select
              id="news-status"
              className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as PublishStatus)}
            >
              <option value="DRAFT">Черновик</option>
              <option value="PUBLISHED">Опубликовано</option>
              <option value="ARCHIVED">Архив</option>
            </select>
            <div className="text-muted-foreground text-xs space-y-1 leading-relaxed">
              <p>
                <strong>Черновик</strong> — видно только в админке, на сайте не
                показывается.
              </p>
              <p>
                <strong>Опубликовано</strong> — показывается пользователям на
                главной, в списке новостей и по ссылке.
              </p>
              <p>
                <strong>Архив</strong> — скрыто с сайта, но запись остаётся в
                базе (можно вернуть в «Опубликовано»).
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3 border-t pt-4">
          <Button type="button" disabled={pending} onClick={save}>
            {pending ? "Сохранение…" : isEdit ? "Сохранить" : "Создать"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/news")}
          >
            Отмена
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
