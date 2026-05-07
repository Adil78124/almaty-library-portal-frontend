"use client"

import { useEffect, useMemo, useState } from "react"

import { AdminImageUrlField } from "@/components/admin/admin-image-url-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type LocalHistoryRow = {
  id: string
  name: string
  nameKz: string | null
  excerpt: string
  excerptKz: string | null
  portraitUrl: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

type Draft = Omit<LocalHistoryRow, "createdAt" | "updatedAt">

function norm(v: string): string {
  return v.trim()
}

function changed(a: Draft, b: Draft): boolean {
  return JSON.stringify(a) !== JSON.stringify(b)
}

export function LocalHistoryAdmin() {
  const [rows, setRows] = useState<LocalHistoryRow[] | null>(null)
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showHidden, setShowHidden] = useState(false)
  const [query, setQuery] = useState("")
  const [visible, setVisible] = useState(20)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  async function load() {
    setError(null)
    // В админке всегда грузим ВСЕ записи, чтобы можно было редактировать скрытые.
    const r = await fetch(`/api/local-history`, { cache: "no-store" })
    if (!r.ok) {
      const t = await r.text().catch(() => "")
      throw new Error(t || `HTTP ${r.status}`)
    }
    const data = (await r.json()) as LocalHistoryRow[]
    setRows(data)
    const nextDrafts: Record<string, Draft> = {}
    for (const it of data) {
      nextDrafts[it.id] = {
        id: it.id,
        name: it.name,
        nameKz: it.nameKz ?? null,
        excerpt: it.excerpt,
        excerptKz: it.excerptKz ?? null,
        portraitUrl: it.portraitUrl ?? null,
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
          const parts = [r.name, r.nameKz, r.excerpt, r.excerptKz]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
          return parts.includes(q)
        })
      : filteredByVisibility
    // если есть query — ищем по всем, но уважаем фильтр скрытых
    const final = q
      ? filtered.filter((r) => (showHidden ? true : (r.isActive ?? true) === true))
      : filtered
    return [...final]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .slice(0, visible)
  }, [rows, query, visible, showHidden])

  function setField(id: string, key: keyof Draft, value: any) {
    setDrafts((prev) => ({ ...prev, [id]: { ...(prev[id] as Draft), [key]: value } }))
  }

  async function addNew() {
    setError(null)
    setBusy("add")
    try {
      const maxOrder = Math.max(
        0,
        ...((rows ?? []).map((r) => (typeof r.sortOrder === "number" ? r.sortOrder : 0)))
      )
      const payload = {
        name: "Новая персона",
        excerpt: "Краткое описание",
        sortOrder: maxOrder + 1,
        isActive: true,
      }
      const r = await fetch("/api/local-history", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!r.ok) {
        const t = await r.text()
        throw new Error(t || "Не удалось создать")
      }
      await load()
    } catch (e: any) {
      setError(e?.message || "Ошибка")
    } finally {
      setBusy(null)
    }
  }

  async function save(id: string) {
    if (!rows) return
    const base = rows.find((r) => r.id === id)
    const draft = drafts[id]
    if (!base || !draft) return
    const baseDraft: Draft = {
      id: base.id,
      name: base.name,
      nameKz: base.nameKz ?? null,
      excerpt: base.excerpt,
      excerptKz: base.excerptKz ?? null,
      portraitUrl: base.portraitUrl ?? null,
      sortOrder: base.sortOrder ?? 0,
      isActive: base.isActive ?? true,
    }
    if (!changed(baseDraft, draft)) return

    setError(null)
    setBusy(id)
    try {
      const payload = {
        name: norm(draft.name),
        nameKz: draft.nameKz ? norm(draft.nameKz) : null,
        excerpt: norm(draft.excerpt),
        excerptKz: draft.excerptKz ? norm(draft.excerptKz) : null,
        portraitUrl: draft.portraitUrl ? norm(draft.portraitUrl) : null,
        sortOrder: Number(draft.sortOrder) || 0,
        isActive: !!draft.isActive,
      }
      const r = await fetch(`/api/local-history/${id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!r.ok) {
        const t = await r.text()
        throw new Error(t || "Не удалось сохранить")
      }
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
      const r = await fetch(`/api/local-history/${id}`, { method: "DELETE" })
      if (!r.ok) {
        const t = await r.text()
        throw new Error(t || "Не удалось удалить")
      }
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
              setVisible(20)
            }}
            placeholder="Поиск по имени или описанию…"
            className="w-[min(380px,100%)]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => void addNew()} disabled={busy === "add"}>
            Добавить
          </Button>
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
            <div
              key={r.id}
              className="rounded-xl border bg-card p-4 md:p-6 space-y-4"
            >
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
                  {d.name || "Без названия"}
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
                    value={d.name}
                    onChange={(e) => setField(r.id, "name", e.target.value)}
                    placeholder="Имя (RU)"
                  />
                  <textarea
                    className="min-h-[96px] w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={d.excerpt}
                    onChange={(e) => setField(r.id, "excerpt", e.target.value)}
                    placeholder="Описание (RU)"
                  />
                    </div>
                    <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    KZ
                  </div>
                  <Input
                    value={d.nameKz ?? ""}
                    onChange={(e) =>
                      setField(r.id, "nameKz", e.target.value || null)
                    }
                    placeholder="Аты (KZ)"
                  />
                  <textarea
                    className="min-h-[96px] w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={d.excerptKz ?? ""}
                    onChange={(e) =>
                      setField(r.id, "excerptKz", e.target.value || null)
                    }
                    placeholder="Сипаттама (KZ)"
                  />
                    </div>
                  </div>

                  <AdminImageUrlField
                    label="Фото"
                    value={d.portraitUrl ?? ""}
                    onChange={(url) =>
                      setField(r.id, "portraitUrl", url || null)
                    }
                    urlPlaceholder="Ссылка на фото (если уже есть)"
                    onUploadError={(msg) => setError(msg)}
                  />
                </>
              ) : null}
            </div>
          )
        })}
      </div>

      {(rows?.length ?? 0) > visible ? (
        <div className="pt-2">
          <Button
            variant="outline"
            onClick={() => setVisible((v) => v + 20)}
          >
            Показать ещё
          </Button>
        </div>
      ) : null}
    </div>
  )
}

