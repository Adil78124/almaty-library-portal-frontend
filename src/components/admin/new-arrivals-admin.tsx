"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { AdminImageUrlField } from "@/components/admin/admin-image-url-field"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type NewArrivalRow = {
  id: string
  title: string
  titleKz: string | null
  author: string
  authorKz: string | null
  coverUrl: string | null
  detailUrl: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

type Draft = Omit<NewArrivalRow, "createdAt" | "updatedAt">

function norm(v: string): string {
  return v.trim()
}

function changed(a: Draft, b: Draft): boolean {
  return JSON.stringify(a) !== JSON.stringify(b)
}

async function readApiError(r: Response): Promise<string> {
  try {
    const data = (await r.json()) as any
    if (typeof data?.error === "string" && data.error.trim()) return data.error
  } catch {
    // ignore
  }
  const t = await r.text().catch(() => "")
  return t.trim() || `HTTP ${r.status}`
}

export function NewArrivalsAdmin() {
  const [rows, setRows] = useState<NewArrivalRow[] | null>(null)
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showHidden, setShowHidden] = useState(false)
  const [query, setQuery] = useState("")
  const [visible, setVisible] = useState(24)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  async function load() {
    setError(null)
    const r = await fetch(`/api/new-arrivals`, { cache: "no-store" })
    if (!r.ok) throw new Error(await readApiError(r))
    const data = (await r.json()) as NewArrivalRow[]
    setRows(data)
    const nextDrafts: Record<string, Draft> = {}
    for (const it of data) {
      nextDrafts[it.id] = {
        id: it.id,
        title: it.title,
        titleKz: it.titleKz ?? null,
        author: it.author,
        authorKz: it.authorKz ?? null,
        coverUrl: it.coverUrl ?? null,
        detailUrl: it.detailUrl ?? null,
        sortOrder: it.sortOrder ?? 0,
        isActive: it.isActive ?? true,
      }
    }
    setDrafts(nextDrafts)
  }

  useEffect(() => {
    void load().catch((e: any) => setError(e?.message || "Ошибка загрузки"))
  }, [])

  const list = useMemo(() => {
    const base = rows ?? []
    const filteredByVisibility = showHidden
      ? base
      : base.filter((r) => (r.isActive ?? true) === true)
    const q = query.trim().toLowerCase()
    const filtered = q
      ? base.filter((r) => {
          const parts = [r.title, r.titleKz, r.author, r.authorKz, r.detailUrl]
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
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .slice(0, visible)
  }, [rows, query, showHidden, visible])

  function setField(id: string, key: keyof Draft, value: any) {
    setDrafts((prev) => ({ ...prev, [id]: { ...(prev[id] as Draft), [key]: value } }))
  }

  async function save(id: string) {
    if (!rows) return
    const base = rows.find((r) => r.id === id)
    const draft = drafts[id]
    if (!base || !draft) return
    const baseDraft: Draft = {
      id: base.id,
      title: base.title,
      titleKz: base.titleKz ?? null,
      author: base.author,
      authorKz: base.authorKz ?? null,
      coverUrl: base.coverUrl ?? null,
      detailUrl: base.detailUrl ?? null,
      sortOrder: base.sortOrder ?? 0,
      isActive: base.isActive ?? true,
    }
    if (!changed(baseDraft, draft)) return

    setError(null)
    setBusy(id)
    try {
      const payload = {
        title: norm(draft.title),
        titleKz: draft.titleKz ? norm(draft.titleKz) : null,
        author: norm(draft.author),
        authorKz: draft.authorKz ? norm(draft.authorKz) : null,
        coverUrl: draft.coverUrl ? norm(draft.coverUrl) : null,
        detailUrl: draft.detailUrl ? norm(draft.detailUrl) : null,
        sortOrder: Number(draft.sortOrder) || 0,
        isActive: !!draft.isActive,
      }
      const r = await fetch(`/api/new-arrivals/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!r.ok) throw new Error(await readApiError(r))
      await load()
    } catch (e: any) {
      setError(e?.message || "Ошибка")
    } finally {
      setBusy(null)
    }
  }

  async function remove(id: string) {
    setError(null)
    setBusy(`del:${id}`)
    try {
      const r = await fetch(`/api/new-arrivals/${id}`, { method: "DELETE" })
      if (!r.ok) throw new Error(await readApiError(r))
      await load()
    } catch (e: any) {
      setError(e?.message || "Ошибка")
    } finally {
      setBusy(null)
    }
  }

  if (!rows) {
    return <div className="text-sm text-muted-foreground">Загрузка…</div>
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
              setVisible(24)
            }}
            placeholder="Поиск по названию / автору / ссылке…"
            className="w-[min(420px,100%)]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            className={cn(buttonVariants(), "shrink-0")}
            href="/admin/digital-library/new?preset=new-arrivals"
          >
            Добавить книгу
          </Link>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="space-y-6">
        {list.map((r) => {
          const d = drafts[r.id]
          if (!d) return null
          const expanded = expandedId === r.id
          return (
            <div key={r.id} className="rounded-xl border bg-card p-4 md:p-6 space-y-4">
              <button
                type="button"
                className="w-full text-left"
                onClick={() => setExpandedId((prev) => (prev === r.id ? null : r.id))}
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm text-muted-foreground shrink-0">Порядок</div>
                  <Input
                    className="w-[110px]"
                    type="number"
                    value={String(d.sortOrder ?? 0)}
                    onChange={(e) => setField(r.id, "sortOrder", Number(e.target.value))}
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!d.isActive}
                      onChange={(e) => setField(r.id, "isActive", e.target.checked)}
                    />
                    Показывать на сайте
                  </label>
                  <div className="ml-auto text-xs text-muted-foreground">
                    {expanded ? "Свернуть" : "Развернуть"}
                  </div>
                </div>
              </button>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm font-medium truncate">
                  {d.title || "Без названия"}{" "}
                  <span className="text-muted-foreground">—</span>{" "}
                  <span className="text-muted-foreground">{d.author || "Без автора"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => void save(r.id)}
                    disabled={busy === r.id}
                  >
                    Сохранить
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => void remove(r.id)}
                    disabled={busy === `del:${r.id}`}
                  >
                    Удалить
                  </Button>
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
                        value={d.title}
                        onChange={(e) => setField(r.id, "title", e.target.value)}
                        placeholder="Название (RU)"
                      />
                      <Input
                        value={d.author}
                        onChange={(e) => setField(r.id, "author", e.target.value)}
                        placeholder="Автор (RU)"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        KZ
                      </div>
                      <Input
                        value={d.titleKz ?? ""}
                        onChange={(e) => setField(r.id, "titleKz", e.target.value || null)}
                        placeholder="Атауы (KZ)"
                      />
                      <Input
                        value={d.authorKz ?? ""}
                        onChange={(e) => setField(r.id, "authorKz", e.target.value || null)}
                        placeholder="Автор (KZ)"
                      />
                    </div>
                  </div>

                  <AdminImageUrlField
                    label="Обложка"
                    value={d.coverUrl ?? ""}
                    onChange={(url) => setField(r.id, "coverUrl", url || null)}
                    urlPlaceholder="Ссылка на обложку (или загрузить файл)"
                    onUploadError={(msg) => setError(msg)}
                  />

                  <Input
                    value={d.detailUrl ?? ""}
                    onChange={(e) => setField(r.id, "detailUrl", e.target.value || null)}
                    placeholder="Ссылка (на сайт заказчика / страницу книги)"
                  />
                </>
              ) : null}
            </div>
          )
        })}
      </div>

      {(rows?.length ?? 0) > visible ? (
        <div className="pt-2">
          <Button variant="outline" onClick={() => setVisible((v) => v + 24)}>
            Показать ещё
          </Button>
        </div>
      ) : null}
    </div>
  )
}

