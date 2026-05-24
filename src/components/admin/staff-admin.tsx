"use client"

import { useEffect, useMemo, useState } from "react"

import { AdminImageUrlField } from "@/components/admin/admin-image-url-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type StaffRow = {
  id: string
  slug: string
  fullNameRu: string
  fullNameKz: string | null
  birthDate: string | null
  phone: string | null
  positionRu: string | null
  positionKz: string | null
  branchRu: string
  branchKz: string | null
  imageUrl: string | null
  sortOrder: number
  isActive: boolean
}

type Draft = StaffRow

function clean(v: string): string {
  return v.trim()
}

function optional(v: string | null | undefined): string | null {
  const s = String(v ?? "").trim()
  return s ? s : null
}

function dateInputValue(v: string | null): string {
  if (!v) return ""
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return ""
  return d.toISOString().slice(0, 10)
}

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9а-яёқғңұүһіәө]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
  return `${base || "staff"}-${Date.now()}`
}

function hasChanges(a: Draft, b: Draft): boolean {
  return JSON.stringify(a) !== JSON.stringify(b)
}

function errorMessage(e: unknown, fallback: string): string {
  return e instanceof Error ? e.message : fallback
}

function toDraft(row: StaffRow): Draft {
  return {
    ...row,
    fullNameKz: row.fullNameKz ?? null,
    birthDate: row.birthDate ?? null,
    phone: row.phone ?? null,
    positionRu: row.positionRu ?? null,
    positionKz: row.positionKz ?? null,
    branchKz: row.branchKz ?? null,
    imageUrl: row.imageUrl ?? null,
    sortOrder: row.sortOrder ?? 0,
    isActive: row.isActive ?? true,
  }
}

export function StaffAdmin() {
  const [rows, setRows] = useState<StaffRow[] | null>(null)
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setError(null)
    const r = await fetch("/api/staff", { cache: "no-store", credentials: "include" })
    if (!r.ok) {
      const t = await r.text().catch(() => "")
      throw new Error(t || `HTTP ${r.status}`)
    }
    const data = (await r.json()) as StaffRow[]
    setRows(data)
    const next: Record<string, Draft> = {}
    for (const row of data) {
      next[row.id] = toDraft(row)
    }
    setDrafts(next)
  }

  useEffect(() => {
    void load().catch((e: unknown) => setError(errorMessage(e, "Ошибка загрузки сотрудников")))
  }, [])

  const list = useMemo(() => {
    return (rows ?? []).slice().sort((a, b) => {
      const order = (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
      return order || a.fullNameRu.localeCompare(b.fullNameRu)
    })
  }, [rows])

  function setField<K extends keyof Draft>(id: string, key: K, value: Draft[K]) {
    setDrafts((prev) => ({ ...prev, [id]: { ...(prev[id] as Draft), [key]: value } }))
  }

  async function addNew() {
    setError(null)
    setBusy("add")
    try {
      const nextOrder = Math.max(0, ...((rows ?? []).map((r) => r.sortOrder ?? 0))) + 1
      const payload = {
        slug: slugify("new-staff"),
        fullNameRu: "Новый сотрудник",
        fullNameKz: "Жаңа қызметкер",
        positionRu: "Директор",
        positionKz: "Директор",
        branchRu: "Районная библиотека",
        branchKz: "Аудандық кітапхана",
        phone: null,
        birthDate: null,
        imageUrl: null,
        sortOrder: nextOrder,
        isActive: true,
      }
      const r = await fetch("/api/staff", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      })
      if (!r.ok) {
        const t = await r.text().catch(() => "")
        throw new Error(t || "Не удалось добавить сотрудника")
      }
      await load()
    } catch (e: unknown) {
      setError(errorMessage(e, "Ошибка добавления сотрудника"))
    } finally {
      setBusy(null)
    }
  }

  async function save(id: string) {
    const row = rows?.find((item) => item.id === id)
    const draft = drafts[id]
    if (!row || !draft || !hasChanges(toDraft(row), draft)) return

    setError(null)
    setBusy(id)
    try {
      const payload = {
        fullNameRu: clean(draft.fullNameRu),
        fullNameKz: optional(draft.fullNameKz),
        birthDate: optional(draft.birthDate),
        phone: optional(draft.phone),
        positionRu: optional(draft.positionRu),
        positionKz: optional(draft.positionKz),
        branchRu: clean(draft.branchRu),
        branchKz: optional(draft.branchKz),
        imageUrl: optional(draft.imageUrl),
        sortOrder: Number(draft.sortOrder) || 0,
        isActive: !!draft.isActive,
      }
      const r = await fetch(`/api/staff/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      })
      if (!r.ok) {
        const t = await r.text().catch(() => "")
        throw new Error(t || "Не удалось сохранить сотрудника")
      }
      await load()
    } catch (e: unknown) {
      setError(errorMessage(e, "Ошибка сохранения"))
    } finally {
      setBusy(null)
    }
  }

  async function remove(id: string) {
    const row = rows?.find((item) => item.id === id)
    const label = row?.fullNameRu ?? "этого сотрудника"
    if (!window.confirm(`Удалить ${label}?`)) return

    setError(null)
    setBusy(`del:${id}`)
    try {
      const r = await fetch(`/api/staff/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!r.ok) {
        const t = await r.text().catch(() => "")
        throw new Error(t || "Не удалось удалить сотрудника")
      }
      await load()
    } catch (e: unknown) {
      setError(errorMessage(e, "Ошибка удаления"))
    } finally {
      setBusy(null)
    }
  }

  if (!rows) {
    return <div className="text-sm text-muted-foreground">Загрузка сотрудников...</div>
  }

  return (
    <section className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Руководители районных библиотек</h2>
          <p className="text-sm text-muted-foreground">
            Эти карточки отображаются на странице /structure в горизонтальном скролле.
          </p>
        </div>
        <Button onClick={() => void addNew()} disabled={busy === "add"}>
          Добавить сотрудника
        </Button>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="space-y-5">
        {list.map((row) => {
          const draft = drafts[row.id]
          if (!draft) return null
          const changed = hasChanges(toDraft(row), draft)
          return (
            <article key={row.id} className="space-y-4 rounded-lg border bg-background p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{draft.fullNameRu || "Без ФИО"}</div>
                  <div className="text-xs text-muted-foreground">ID: {row.id}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" onClick={() => void save(row.id)} disabled={!changed || busy === row.id}>
                    Сохранить
                  </Button>
                  <Button variant="destructive" onClick={() => void remove(row.id)} disabled={busy === `del:${row.id}`}>
                    Удалить
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="space-y-1">
                  <span className="block text-xs font-medium text-muted-foreground">Порядок</span>
                  <Input
                    className="w-28"
                    type="number"
                    min={0}
                    value={String(draft.sortOrder ?? 0)}
                    onChange={(e) => setField(row.id, "sortOrder", Number(e.target.value))}
                  />
                </label>
                <label className="flex items-center gap-2 pt-5 text-sm">
                  <input
                    type="checkbox"
                    checked={!!draft.isActive}
                    onChange={(e) => setField(row.id, "isActive", e.target.checked)}
                  />
                  Показывать на сайте
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <label className="space-y-1">
                  <span className="block text-xs font-medium text-muted-foreground">ФИО RU</span>
                  <Input value={draft.fullNameRu} onChange={(e) => setField(row.id, "fullNameRu", e.target.value)} />
                </label>
                <label className="space-y-1">
                  <span className="block text-xs font-medium text-muted-foreground">ФИО KZ</span>
                  <Input
                    value={draft.fullNameKz ?? ""}
                    onChange={(e) => setField(row.id, "fullNameKz", e.target.value || null)}
                  />
                </label>
                <label className="space-y-1">
                  <span className="block text-xs font-medium text-muted-foreground">Должность RU</span>
                  <Input
                    value={draft.positionRu ?? ""}
                    onChange={(e) => setField(row.id, "positionRu", e.target.value || null)}
                  />
                </label>
                <label className="space-y-1">
                  <span className="block text-xs font-medium text-muted-foreground">Должность KZ</span>
                  <Input
                    value={draft.positionKz ?? ""}
                    onChange={(e) => setField(row.id, "positionKz", e.target.value || null)}
                  />
                </label>
                <label className="space-y-1">
                  <span className="block text-xs font-medium text-muted-foreground">Район/филиал RU</span>
                  <Input value={draft.branchRu} onChange={(e) => setField(row.id, "branchRu", e.target.value)} />
                </label>
                <label className="space-y-1">
                  <span className="block text-xs font-medium text-muted-foreground">Район/филиал KZ</span>
                  <Input
                    value={draft.branchKz ?? ""}
                    onChange={(e) => setField(row.id, "branchKz", e.target.value || null)}
                  />
                </label>
                <label className="space-y-1">
                  <span className="block text-xs font-medium text-muted-foreground">Телефон</span>
                  <Input value={draft.phone ?? ""} onChange={(e) => setField(row.id, "phone", e.target.value || null)} />
                </label>
                <label className="space-y-1">
                  <span className="block text-xs font-medium text-muted-foreground">Дата рождения</span>
                  <Input
                    type="date"
                    value={dateInputValue(draft.birthDate)}
                    onChange={(e) => setField(row.id, "birthDate", e.target.value || null)}
                  />
                </label>
              </div>

              <AdminImageUrlField
                label="Фото"
                value={draft.imageUrl ?? ""}
                onChange={(url) => setField(row.id, "imageUrl", url || null)}
                urlPlaceholder="URL фото или загрузите файл"
                onUploadError={(msg) => setError(msg)}
              />
            </article>
          )
        })}
      </div>
    </section>
  )
}
