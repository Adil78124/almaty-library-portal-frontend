"use client"

import { useEffect, useMemo, useState } from "react"

import { AdminImageUrlField } from "@/components/admin/admin-image-url-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type PartnerLinkRow = {
  id: string
  title: string
  titleKz: string | null
  logoUrl: string | null
  href: string
  sortOrder: number
  isActive: boolean
}

type Draft = Omit<PartnerLinkRow, never>

function norm(v: string): string {
  return v.trim()
}

function changed(a: Draft, b: Draft): boolean {
  return JSON.stringify(a) !== JSON.stringify(b)
}

export function UsefulLinksAdmin() {
  const [rows, setRows] = useState<PartnerLinkRow[] | null>(null)
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [visible, setVisible] = useState(30)

  async function load() {
    setError(null)
    const r = await fetch("/api/partner-links", { cache: "no-store" })
    if (!r.ok) {
      const t = await r.text().catch(() => "")
      throw new Error(t || `HTTP ${r.status}`)
    }
    const data = (await r.json()) as PartnerLinkRow[]
    setRows(data)
    const next: Record<string, Draft> = {}
    for (const it of data) {
      next[it.id] = {
        id: it.id,
        title: it.title,
        titleKz: it.titleKz ?? null,
        logoUrl: it.logoUrl ?? null,
        href: it.href,
        sortOrder: it.sortOrder ?? 0,
        isActive: it.isActive ?? true,
      }
    }
    setDrafts(next)
  }

  useEffect(() => {
    void load().catch((e: any) => setError(e?.message || "Ошибка загрузки"))
  }, [])

  const list = useMemo(() => {
    const base = rows ?? []
    return base
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .slice(0, visible)
  }, [rows, visible])

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
        title: "Новая ссылка",
        titleKz: "Жаңа сілтеме",
        href: "https://example.com",
        logoUrl: null,
        sortOrder: maxOrder + 1,
        isActive: true,
      }
      const r = await fetch("/api/partner-links", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      })
      if (!r.ok) {
        const t = await r.text().catch(() => "")
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
      title: base.title,
      titleKz: base.titleKz ?? null,
      logoUrl: base.logoUrl ?? null,
      href: base.href,
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
        logoUrl: draft.logoUrl ? norm(draft.logoUrl) : null,
        href: norm(draft.href),
        sortOrder: Number(draft.sortOrder) || 0,
        isActive: !!draft.isActive,
      }
      const r = await fetch(`/api/partner-links/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      })
      if (!r.ok) {
        const t = await r.text().catch(() => "")
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
      const r = await fetch(`/api/partner-links/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!r.ok) {
        const t = await r.text().catch(() => "")
        throw new Error(t || "Не удалось удалить")
      }
      await load()
    } catch (e: any) {
      setError(e?.message || "Ошибка")
    } finally {
      setBusy(null)
    }
  }

  if (!rows) return <div className="text-sm text-muted-foreground">Загрузка…</div>

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          Блок на главной: горизонтальный скролл, порядок по полю «Порядок», показ
          только с отметкой «Показывать на сайте».
        </div>
        <Button onClick={() => void addNew()} disabled={busy === "add"}>
          Добавить ссылку
        </Button>
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
                <div className="text-sm font-medium truncate">{d.title || "Без названия"}</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => void save(r.id)} disabled={busy === r.id}>
                    Сохранить
                  </Button>
                  <Button variant="destructive" onClick={() => void remove(r.id)} disabled={busy === `del:${r.id}`}>
                    Удалить
                  </Button>
                </div>
              </div>

              {expanded ? (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">RU</div>
                      <Input
                        value={d.title}
                        onChange={(e) => setField(r.id, "title", e.target.value)}
                        placeholder="Название (RU)"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">KZ</div>
                      <Input
                        value={d.titleKz ?? ""}
                        onChange={(e) => setField(r.id, "titleKz", e.target.value || null)}
                        placeholder="Атауы (KZ)"
                      />
                    </div>
                  </div>

                  <Input
                    value={d.href}
                    onChange={(e) => setField(r.id, "href", e.target.value)}
                    placeholder="Ссылка (https://...)"
                  />

                  <AdminImageUrlField
                    label="Логотип"
                    value={d.logoUrl ?? ""}
                    onChange={(url) => setField(r.id, "logoUrl", url || null)}
                    urlPlaceholder="Ссылка на логотип (или загрузить файл)"
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
          <Button variant="outline" onClick={() => setVisible((v) => v + 30)}>
            Показать ещё
          </Button>
        </div>
      ) : null}
    </div>
  )
}

