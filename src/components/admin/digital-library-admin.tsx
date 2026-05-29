"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

import { AdminImageUrlField } from "@/components/admin/admin-image-url-field"
import { useAdminToast } from "@/components/admin/admin-toast"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  deleteDigitalBook,
  fetchDigitalBooks,
  updateDigitalBook,
} from "@/services/api"

type DigitalBookRow = {
  id: string
  titleRu: string
  titleKz: string
  authorRu: string
  authorKz: string
  imageUrl: string | null
  fileUrl: string | null
  externalUrl: string | null
  isActive: boolean
  order: number
}

function norm(value: string): string {
  return value.trim()
}

function errText(error: unknown): string {
  return error instanceof Error ? error.message : "Ошибка"
}

async function safeReadErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string }
    if (data.error?.trim()) return data.error
  } catch {
    // ignore
  }
  try {
    const text = await response.text()
    if (text.trim()) return text
  } catch {
    // ignore
  }
  return `${response.status} ${response.statusText || "Ошибка запроса"}`.trim()
}

function linkKind(book: DigitalBookRow): string {
  if (book.fileUrl?.trim()) return "Файл ресурса"
  if (book.externalUrl?.trim()) return "Внешний сайт"
  return "Ссылка не указана"
}

function orderBooks(rows: DigitalBookRow[]): DigitalBookRow[] {
  return [...rows]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((book, index) => ({ ...book, order: index + 1 }))
}

export function DigitalLibraryAdmin() {
  const toast = useAdminToast()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [books, setBooks] = useState<DigitalBookRow[] | null>(null)
  const [visible, setVisible] = useState(30)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  async function load(): Promise<boolean> {
    setError(null)
    setPending(true)
    try {
      const response = await fetchDigitalBooks(false)
      if (!response.ok) throw new Error(await safeReadErrorMessage(response))

      const data = (await response.json()) as DigitalBookRow[]
      setBooks(Array.isArray(data) ? orderBooks(data) : [])
      return true
    } catch (e) {
      setError(errText(e))
      return false
    } finally {
      setPending(false)
    }
  }

  async function refreshList() {
    const ok = await load()
    if (ok) toast.success("Список обновлён")
  }

  useEffect(() => {
    void load()
  }, [])

  useEffect(() => {
    if (searchParams.get("created") !== "1") return
    if (!books?.length) return
    setExpandedId((prev) => prev ?? books[0]!.id)
    setVisible(60)
  }, [searchParams, books])

  function setBookField<K extends keyof DigitalBookRow>(
    id: string,
    key: K,
    value: DigitalBookRow[K]
  ) {
    setBooks((prev) =>
      (prev ?? []).map((book) =>
        book.id === id ? { ...book, [key]: value } : book
      )
    )
  }

  async function saveBook(id: string, patch: Partial<DigitalBookRow>) {
    setError(null)
    setPending(true)
    try {
      await updateDigitalBook(id, patch)
      await load()
    } catch (e) {
      setError(errText(e))
    } finally {
      setPending(false)
    }
  }

  async function removeBook(book: DigitalBookRow) {
    const title = book.titleRu?.trim() || book.titleKz?.trim() || "эту запись"
    if (!window.confirm(`Удалить ${title}?`)) return

    setError(null)
    setPending(true)
    try {
      await deleteDigitalBook(book.id)
      await load()
    } catch (e) {
      setError(errText(e))
    } finally {
      setPending(false)
    }
  }

  const list = (books ?? []).slice(0, visible)
  const loading = pending && !books

  function normalizeBookForSave(book: DigitalBookRow) {
    return {
      ...book,
      titleRu: norm(book.titleRu),
      titleKz: norm(book.titleKz),
      authorRu: norm(book.authorRu),
      authorKz: norm(book.authorKz),
      imageUrl: book.imageUrl?.trim() || null,
      fileUrl: book.fileUrl?.trim() || null,
      externalUrl: book.externalUrl?.trim() || null,
      order: Number(book.order) || 1,
    } satisfies DigitalBookRow
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border bg-muted/20 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/digital-library/new-arrivals"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Новые поступления
            </Link>
            <Link
              href="/admin/digital-library/home-section"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Блок на главной
            </Link>
            <Link
              href="/admin/digital-library/display"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Настройки
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => void refreshList()} disabled={pending}>
              {pending ? "Обновление..." : "Обновить"}
            </Button>
            <Link
              className={cn(buttonVariants(), "shrink-0")}
              href="/admin/digital-library/new"
            >
              Добавить ресурс
            </Link>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : null}

      <div className="space-y-5">
        {list.length === 0 && !loading ? (
          <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            Ресурсов пока нет. Нажмите «Добавить ресурс», чтобы заполнить блок.
          </div>
        ) : null}

        {list.map((book) => {
          const expanded = expandedId === book.id
          const title = book.titleRu.trim() || book.titleKz.trim() || "(без названия)"
          const author = book.authorRu.trim() || book.authorKz.trim() || "(без автора)"
          return (
            <div
              key={book.id}
              className="space-y-4 rounded-lg border bg-card p-4 md:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-md border px-2 py-1 text-xs">
                      Порядок: {book.order}
                    </span>
                    <span
                      className={cn(
                        "rounded-md px-2 py-1 text-xs",
                        book.isActive
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {book.isActive ? "Показывается" : "Скрыто"}
                    </span>
                    <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                      {linkKind(book)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="block w-full text-left"
                    aria-expanded={expanded}
                    onClick={() =>
                      setExpandedId((prev) => (prev === book.id ? null : book.id))
                    }
                  >
                    <div className="truncate font-semibold">{title}</div>
                    <div className="truncate text-sm text-muted-foreground">
                      {author}
                    </div>
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    onClick={() => void saveBook(book.id, normalizeBookForSave(book))}
                  >
                    Сохранить
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={pending}
                    onClick={() => void removeBook(book)}
                  >
                    Удалить
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-expanded={expanded}
                    onClick={() =>
                      setExpandedId((prev) => (prev === book.id ? null : book.id))
                    }
                  >
                    {expanded ? "Свернуть" : "Развернуть"}
                  </Button>
                </div>
              </div>

              {expanded ? (
                <div className="space-y-4 border-t pt-4">
                  <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
                    <label className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Порядок</span>
                      <Input
                        className="w-20"
                        type="number"
                        value={String(book.order)}
                        onChange={(e) =>
                          setBookField(book.id, "order", Number(e.target.value))
                        }
                      />
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={!!book.isActive}
                        onChange={(e) =>
                          setBookField(book.id, "isActive", e.target.checked)
                        }
                      />
                      Показывать на сайте
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="space-y-3">
                      <div className="text-xs font-bold uppercase text-muted-foreground">
                        RU
                      </div>
                      <Input
                        value={book.titleRu}
                        onChange={(e) =>
                          setBookField(book.id, "titleRu", e.target.value)
                        }
                        placeholder="Название (RU)"
                      />
                      <Input
                        value={book.authorRu}
                        onChange={(e) =>
                          setBookField(book.id, "authorRu", e.target.value)
                        }
                        placeholder="Автор (RU)"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="text-xs font-bold uppercase text-muted-foreground">
                        KZ
                      </div>
                      <Input
                        value={book.titleKz}
                        onChange={(e) =>
                          setBookField(book.id, "titleKz", e.target.value)
                        }
                        placeholder="Атауы (KZ)"
                      />
                      <Input
                        value={book.authorKz}
                        onChange={(e) =>
                          setBookField(book.id, "authorKz", e.target.value)
                        }
                        placeholder="Автор (KZ)"
                      />
                    </div>
                  </div>

                  <AdminImageUrlField
                    label="Обложка"
                    value={book.imageUrl ?? ""}
                    onChange={(url) =>
                      setBookField(book.id, "imageUrl", url || null)
                    }
                    urlPlaceholder="Ссылка на обложку или загрузка файла"
                    onUploadError={(msg) => setError(msg)}
                  />

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <Input
                      value={book.fileUrl ?? ""}
                      onChange={(e) =>
                        setBookField(book.id, "fileUrl", e.target.value || null)
                      }
                      placeholder="Файл ресурса: PDF/DOC или другой документ"
                    />
                    <Input
                      value={book.externalUrl ?? ""}
                      onChange={(e) =>
                        setBookField(book.id, "externalUrl", e.target.value || null)
                      }
                      placeholder="Внешняя ссылка на ресурс заказчика"
                    />
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void saveBook(book.id, normalizeBookForSave(book))}
                      disabled={pending}
                    >
                      Сохранить
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => void removeBook(book)}
                      disabled={pending}
                    >
                      Удалить
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      {(books?.length ?? 0) > list.length ? (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => setVisible((value) => value + 30)}
          >
            Показать ещё
          </Button>
        </div>
      ) : null}
    </div>
  )
}
