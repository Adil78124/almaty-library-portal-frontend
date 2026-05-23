"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { AdminImageUrlField } from "@/components/admin/admin-image-url-field"
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

function norm(v: string): string {
  return v.trim()
}

function errText(e: any): string {
  return e?.message || "Ошибка"
}

async function safeReadErrorMessage(r: Response): Promise<string> {
  // API в проекте обычно возвращает `{ error: string }` при ошибках.
  try {
    const data = (await r.json()) as any
    const msg = data?.error
    if (typeof msg === "string" && msg.trim()) return msg
  } catch {
    // ignore
  }
  try {
    const t = await r.text()
    if (t.trim()) return t
  } catch {
    // ignore
  }
  return `${r.status} ${r.statusText || "Ошибка запроса"}`.trim()
}

export function DigitalLibraryAdmin() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const [books, setBooks] = useState<DigitalBookRow[] | null>(null)

  const [showHidden, setShowHidden] = useState(false)
  const [query, setQuery] = useState("")
  const [visible, setVisible] = useState(30)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  async function load() {
    setError(null)
    setPending(true)
    try {
      const rb = await fetchDigitalBooks(false)

      if (!rb.ok) throw new Error(await safeReadErrorMessage(rb))

    const b = await rb.json()
    // Новые/пустые записи удобнее видеть сверху.
    const ordered = Array.isArray(b)
      ? [...b].sort((a, c) => (a.order ?? 0) - (c.order ?? 0))
      : b
    setBooks(ordered)
    } catch (e) {
      setError(errText(e))
    } finally {
      setPending(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  // Если пришли со страницы создания — после загрузки раскроем первую карточку.
  useEffect(() => {
    if (searchParams.get("created") !== "1") return
    if (!books?.length) return
    setExpandedId((prev) => prev ?? books[0]!.id)
    setVisible(60)
  }, [searchParams, books])

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

  async function removeBook(id: string) {
    setError(null)
    setPending(true)
    try {
      await deleteDigitalBook(id)
      await load()
    } catch (e) {
      setError(errText(e))
    } finally {
      setPending(false)
    }
  }

  const loading = pending && !books
  const list = useMemo(() => {
    const base = books ?? []
    const filteredByVisibility = showHidden
      ? base
      : base.filter((r) => (r.isActive ?? true) === true)
    const q = query.trim().toLowerCase()
    const filtered = q
      ? base.filter((r) => {
          const parts = [
            r.titleRu,
            r.titleKz,
            r.authorRu,
            r.authorKz,
            r.externalUrl,
            r.fileUrl,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
          return parts.includes(q)
        })
      : filteredByVisibility
    const final = q
      ? filtered.filter((r) => (showHidden ? true : (r.isActive ?? true) === true))
      : filtered
    return [...final]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .slice(0, visible)
  }, [books, query, showHidden, visible])

  function normalizeBookForSave(b: DigitalBookRow) {
    return {
      ...b,
      titleRu: norm(b.titleRu),
      titleKz: norm(b.titleKz),
      authorRu: norm(b.authorRu),
      authorKz: norm(b.authorKz),
      imageUrl: b.imageUrl?.trim() || null,
      fileUrl: b.fileUrl?.trim() || null,
      externalUrl: b.externalUrl?.trim() || null,
      order: Number(b.order) || 0,
    } satisfies DigitalBookRow
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showHidden}
              onChange={(e) => setShowHidden(e.target.checked)}
            />
            Показать скрытые
          </label>
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setVisible(30)
            }}
            placeholder="Поиск по названию / автору / ссылке…"
            className="w-[min(420px,100%)]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => void load()} disabled={pending}>
            Обновить
          </Button>
          <Link className={cn(buttonVariants(), "shrink-0")} href="/admin/digital-library/new">
            Добавить книгу
          </Link>
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

      <div className="space-y-6">
        {list.map((b) => {
          const expanded = expandedId === b.id
          const title = (b.titleRu ?? "").trim() || "(без названия)"
          const author = (b.authorRu ?? "").trim() || "(без автора)"
          return (
            <div key={b.id} className="rounded-xl border bg-card p-4 md:p-6 space-y-4">
              <div
                role="button"
                tabIndex={0}
                className="w-full text-left"
                onClick={() => setExpandedId((prev) => (prev === b.id ? null : b.id))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    setExpandedId((prev) => (prev === b.id ? null : b.id))
                  }
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-sm text-muted-foreground shrink-0">Порядок</div>
                    <Input
                      className="w-[110px]"
                      type="number"
                      value={String(b.order ?? 0)}
                      onChange={(e) =>
                        setBooks((prev) =>
                          (prev ?? []).map((x) =>
                            x.id === b.id ? { ...x, order: Number(e.target.value) } : x
                          )
                        )
                      }
                    />
                    <label
                      className="flex items-center gap-2 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={!!b.isActive}
                        onChange={(e) =>
                          setBooks((prev) =>
                            (prev ?? []).map((x) =>
                              x.id === b.id ? { ...x, isActive: e.target.checked } : x
                            )
                          )
                        }
                      />
                      Показывать
                    </label>
                  </div>
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pending}
                      onClick={() => void saveBook(b.id, normalizeBookForSave(b))}
                    >
                      Сохранить
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={pending}
                      onClick={() => void removeBook(b.id)}
                    >
                      Удалить
                    </Button>
                    <div className="text-sm text-muted-foreground ml-2">
                      {expanded ? "Свернуть" : "Развернуть"}
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="font-semibold">{title}</div>
                  <div className="text-sm text-muted-foreground">{author}</div>
                </div>
              </div>

              {expanded ? (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        RU
                      </div>
                      <Input
                        value={b.titleRu}
                        onChange={(e) =>
                          setBooks((prev) =>
                            (prev ?? []).map((x) =>
                              x.id === b.id ? { ...x, titleRu: e.target.value } : x
                            )
                          )
                        }
                        placeholder="Название (RU)"
                      />
                      <Input
                        value={b.authorRu}
                        onChange={(e) =>
                          setBooks((prev) =>
                            (prev ?? []).map((x) =>
                              x.id === b.id ? { ...x, authorRu: e.target.value } : x
                            )
                          )
                        }
                        placeholder="Автор (RU)"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        KZ
                      </div>
                      <Input
                        value={b.titleKz}
                        onChange={(e) =>
                          setBooks((prev) =>
                            (prev ?? []).map((x) =>
                              x.id === b.id ? { ...x, titleKz: e.target.value } : x
                            )
                          )
                        }
                        placeholder="Атауы (KZ)"
                      />
                      <Input
                        value={b.authorKz}
                        onChange={(e) =>
                          setBooks((prev) =>
                            (prev ?? []).map((x) =>
                              x.id === b.id ? { ...x, authorKz: e.target.value } : x
                            )
                          )
                        }
                        placeholder="Автор (KZ)"
                      />
                    </div>
                  </div>

                  <AdminImageUrlField
                    label="Обложка"
                    value={b.imageUrl ?? ""}
                    onChange={(url) =>
                      setBooks((prev) =>
                        (prev ?? []).map((x) =>
                          x.id === b.id ? { ...x, imageUrl: url || null } : x
                        )
                      )
                    }
                    urlPlaceholder="Ссылка на обложку (или загрузить файл)"
                    onUploadError={(msg) => setError(msg)}
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Input
                      value={b.fileUrl ?? ""}
                      onChange={(e) =>
                        setBooks((prev) =>
                          (prev ?? []).map((x) =>
                            x.id === b.id ? { ...x, fileUrl: e.target.value || null } : x
                          )
                        )
                      }
                      placeholder="Файл (ссылка на PDF/DOC и т.д.)"
                    />
                    <Input
                      value={b.externalUrl ?? ""}
                      onChange={(e) =>
                        setBooks((prev) =>
                          (prev ?? []).map((x) =>
                            x.id === b.id
                              ? { ...x, externalUrl: e.target.value || null }
                              : x
                          )
                        )
                      }
                      placeholder="Ссылка (если чтение на внешнем сайте)"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        void saveBook(b.id, normalizeBookForSave(b))
                      }
                      disabled={pending}
                    >
                      Сохранить
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => void removeBook(b.id)}
                      disabled={pending}
                    >
                      Удалить
                    </Button>
                  </div>
                </>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
