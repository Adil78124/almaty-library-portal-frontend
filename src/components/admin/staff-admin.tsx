"use client"

import { useEffect, useMemo, useState } from "react"

import { AdminImageUrlField } from "@/components/admin/admin-image-url-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type StaffRow = {
  id: string
  slug: string
  sectionId: string
  fullNameRu: string
  fullNameKz: string | null
  birthDate: string | null
  phone: string | null
  email: string | null
  positionRu: string | null
  positionKz: string | null
  branchRu: string
  branchKz: string | null
  imageUrl: string | null
  sortOrder: number
  isActive: boolean
}

type StaffSectionRow = {
  id: string
  titleRu: string
  titleKz: string | null
  sortOrder: number
  staff: StaffRow[]
}

type StaffDraft = StaffRow
type SectionDraft = Omit<StaffSectionRow, "staff">

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
    .replace(/[^a-z0-9а-яёқғұңүһіәө]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
  return `${base || "staff"}-${Date.now()}`
}

function hasChanges<T>(a: T, b: T): boolean {
  return JSON.stringify(a) !== JSON.stringify(b)
}

function errorMessage(e: unknown, fallback: string): string {
  return e instanceof Error ? e.message : fallback
}

function toStaffDraft(row: StaffRow): StaffDraft {
  return {
    ...row,
    fullNameKz: row.fullNameKz ?? null,
    birthDate: row.birthDate ?? null,
    phone: row.phone ?? null,
    email: row.email ?? null,
    positionRu: row.positionRu ?? null,
    positionKz: row.positionKz ?? null,
    branchKz: row.branchKz ?? null,
    imageUrl: row.imageUrl ?? null,
    sortOrder: row.sortOrder ?? 0,
    isActive: row.isActive ?? true,
  }
}

function toSectionDraft(row: StaffSectionRow): SectionDraft {
  return {
    id: row.id,
    titleRu: row.titleRu,
    titleKz: row.titleKz ?? null,
    sortOrder: row.sortOrder ?? 0,
  }
}

async function fetchStaffSections(): Promise<StaffSectionRow[]> {
  const r = await fetch("/api/staff/sections", {
    cache: "no-store",
    credentials: "include",
  })
  if (!r.ok) {
    const t = await r.text().catch(() => "")
    throw new Error(t || `HTTP ${r.status}`)
  }
  return (await r.json()) as StaffSectionRow[]
}

export function StaffAdmin() {
  const [sections, setSections] = useState<StaffSectionRow[] | null>(null)
  const [sectionDrafts, setSectionDrafts] = useState<Record<string, SectionDraft>>({})
  const [staffDrafts, setStaffDrafts] = useState<Record<string, StaffDraft>>({})
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})
  const [collapsedStaff, setCollapsedStaff] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function applySections(data: StaffSectionRow[]) {
    setSections(data)

    const nextSections: Record<string, SectionDraft> = {}
    const nextStaff: Record<string, StaffDraft> = {}
    for (const section of data) {
      nextSections[section.id] = toSectionDraft(section)
      for (const row of section.staff) {
        nextStaff[row.id] = toStaffDraft(row)
      }
    }
    setSectionDrafts(nextSections)
    setStaffDrafts(nextStaff)
    setCollapsedSections((prev) => {
      const next: Record<string, boolean> = {}
      for (const section of data) {
        next[section.id] = prev[section.id] ?? false
      }
      return next
    })
    setCollapsedStaff((prev) => {
      const next: Record<string, boolean> = {}
      for (const section of data) {
        for (const row of section.staff) {
          next[row.id] = prev[row.id] ?? true
        }
      }
      return next
    })
  }

  async function load() {
    setError(null)
    applySections(await fetchStaffSections())
  }

  useEffect(() => {
    let cancelled = false
    void fetchStaffSections()
      .then((data) => {
        if (!cancelled) applySections(data)
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(errorMessage(e, "Ошибка загрузки секций сотрудников"))
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const list = useMemo(() => {
    return (sections ?? []).slice().sort((a, b) => {
      const order = (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
      return order || a.titleRu.localeCompare(b.titleRu)
    })
  }, [sections])

  const sectionOptions = useMemo(() => {
    return list.map((section) => ({
      id: section.id,
      title: sectionDrafts[section.id]?.titleRu || section.titleRu,
    }))
  }, [list, sectionDrafts])

  function setSectionField<K extends keyof SectionDraft>(
    id: string,
    key: K,
    value: SectionDraft[K]
  ) {
    setSectionDrafts((prev) => ({
      ...prev,
      [id]: { ...(prev[id] as SectionDraft), [key]: value },
    }))
  }

  function setStaffField<K extends keyof StaffDraft>(
    id: string,
    key: K,
    value: StaffDraft[K]
  ) {
    setStaffDrafts((prev) => ({
      ...prev,
      [id]: { ...(prev[id] as StaffDraft), [key]: value },
    }))
  }

  function toggleSection(id: string) {
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function toggleStaff(id: string) {
    setCollapsedStaff((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  async function addSection() {
    setError(null)
    setBusy("section:add")
    try {
      const nextOrder = Math.max(0, ...((sections ?? []).map((s) => s.sortOrder ?? 0))) + 1
      const r = await fetch("/api/staff/sections", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          titleRu: "Новая секция",
          titleKz: "Жаңа бөлім",
          sortOrder: nextOrder,
        }),
        credentials: "include",
      })
      if (!r.ok) {
        const t = await r.text().catch(() => "")
        throw new Error(t || "Не удалось добавить секцию")
      }
      await load()
    } catch (e: unknown) {
      setError(errorMessage(e, "Ошибка добавления секции"))
    } finally {
      setBusy(null)
    }
  }

  async function saveSection(id: string) {
    const section = sections?.find((item) => item.id === id)
    const draft = sectionDrafts[id]
    if (!section || !draft || !hasChanges(toSectionDraft(section), draft)) return

    setError(null)
    setBusy(`section:${id}`)
    try {
      const r = await fetch(`/api/staff/sections/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          titleRu: clean(draft.titleRu),
          titleKz: optional(draft.titleKz),
          sortOrder: Number(draft.sortOrder) || 0,
        }),
        credentials: "include",
      })
      if (!r.ok) {
        const t = await r.text().catch(() => "")
        throw new Error(t || "Не удалось сохранить секцию")
      }
      await load()
    } catch (e: unknown) {
      setError(errorMessage(e, "Ошибка сохранения секции"))
    } finally {
      setBusy(null)
    }
  }

  async function removeSection(id: string) {
    const section = sections?.find((item) => item.id === id)
    const label = section?.titleRu ?? "эту секцию"
    if (!window.confirm(`Удалить секцию "${label}"?`)) return

    setError(null)
    setBusy(`section:del:${id}`)
    try {
      const r = await fetch(`/api/staff/sections/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!r.ok) {
        const t = await r.text().catch(() => "")
        throw new Error(t || "Не удалось удалить секцию")
      }
      await load()
    } catch (e: unknown) {
      setError(errorMessage(e, "Ошибка удаления секции"))
    } finally {
      setBusy(null)
    }
  }

  async function addStaff(sectionId: string) {
    setError(null)
    setBusy(`staff:add:${sectionId}`)
    try {
      const section = sections?.find((item) => item.id === sectionId)
      const nextOrder =
        Math.max(0, ...((section?.staff ?? []).map((r) => r.sortOrder ?? 0))) + 1
      const payload = {
        slug: slugify("new-staff"),
        sectionId,
        fullNameRu: "Новый сотрудник",
        fullNameKz: "Жаңа қызметкер",
        positionRu: "Сотрудник",
        positionKz: "Қызметкер",
        branchRu: "Библиотека",
        branchKz: "Кітапхана",
        phone: null,
        email: null,
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

  async function saveStaff(id: string) {
    const row = sections?.flatMap((section) => section.staff).find((item) => item.id === id)
    const draft = staffDrafts[id]
    if (!row || !draft || !hasChanges(toStaffDraft(row), draft)) return

    setError(null)
    setBusy(`staff:${id}`)
    try {
      const payload = {
        sectionId: draft.sectionId,
        fullNameRu: clean(draft.fullNameRu),
        fullNameKz: optional(draft.fullNameKz),
        birthDate: optional(draft.birthDate),
        phone: optional(draft.phone),
        email: optional(draft.email),
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
      setError(errorMessage(e, "Ошибка сохранения сотрудника"))
    } finally {
      setBusy(null)
    }
  }

  async function removeStaff(id: string) {
    const row = sections?.flatMap((section) => section.staff).find((item) => item.id === id)
    const label = row?.fullNameRu ?? "этого сотрудника"
    if (!window.confirm(`Удалить ${label}?`)) return

    setError(null)
    setBusy(`staff:del:${id}`)
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
      setError(errorMessage(e, "Ошибка удаления сотрудника"))
    } finally {
      setBusy(null)
    }
  }

  if (!sections) {
    return <div className="text-sm text-muted-foreground">Загрузка секций сотрудников...</div>
  }

  return (
    <section className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Секции сотрудников</h2>
          <p className="text-sm text-muted-foreground">
            Эти секции отображаются на странице /structure в заданном порядке.
          </p>
        </div>
        <Button onClick={() => void addSection()} disabled={busy === "section:add"}>
          Создать секцию
        </Button>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="space-y-6">
        {list.map((section) => {
          const sectionDraft = sectionDrafts[section.id]
          if (!sectionDraft) return null
          const sectionChanged = hasChanges(toSectionDraft(section), sectionDraft)
          const staff = section.staff.slice().sort((a, b) => {
            const order = (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
            return order || a.fullNameRu.localeCompare(b.fullNameRu)
          })
          const sectionCollapsed = !!collapsedSections[section.id]

          return (
            <article key={section.id} className="space-y-5 rounded-lg border bg-background p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {sectionDraft.titleRu || "Без названия"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ID: {section.id} · сотрудников: {section.staff.length}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => toggleSection(section.id)}
                  >
                    {sectionCollapsed ? "Развернуть" : "Свернуть"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => void saveSection(section.id)}
                    disabled={!sectionChanged || busy === `section:${section.id}`}
                  >
                    Сохранить секцию
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => void addStaff(section.id)}
                    disabled={busy === `staff:add:${section.id}`}
                  >
                    Добавить сотрудника
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => void removeSection(section.id)}
                    disabled={busy === `section:del:${section.id}`}
                  >
                    Удалить секцию
                  </Button>
                </div>
              </div>

              {!sectionCollapsed ? (
                <>
              <div className="grid gap-4 lg:grid-cols-[1fr_1fr_8rem]">
                <label className="space-y-1">
                  <span className="block text-xs font-medium text-muted-foreground">Заголовок RU</span>
                  <Input
                    value={sectionDraft.titleRu}
                    onChange={(e) => setSectionField(section.id, "titleRu", e.target.value)}
                  />
                </label>
                <label className="space-y-1">
                  <span className="block text-xs font-medium text-muted-foreground">Заголовок KZ</span>
                  <Input
                    value={sectionDraft.titleKz ?? ""}
                    onChange={(e) => setSectionField(section.id, "titleKz", e.target.value || null)}
                  />
                </label>
                <label className="space-y-1">
                  <span className="block text-xs font-medium text-muted-foreground">Порядок</span>
                  <Input
                    type="number"
                    min={0}
                    value={String(sectionDraft.sortOrder ?? 0)}
                    onChange={(e) => setSectionField(section.id, "sortOrder", Number(e.target.value))}
                  />
                </label>
              </div>

              {staff.length === 0 ? (
                <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                  В этой секции пока нет сотрудников.
                </div>
              ) : (
                <div className="space-y-4">
                  {staff.map((row) => {
                    const draft = staffDrafts[row.id]
                    if (!draft) return null
                    const changed = hasChanges(toStaffDraft(row), draft)
                    const staffCollapsed = !!collapsedStaff[row.id]
                    return (
                      <article key={row.id} className="space-y-4 rounded-lg border bg-card p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold">
                              {draft.fullNameRu || "Без ФИО"}
                            </div>
                            <div className="text-xs text-muted-foreground">ID: {row.id}</div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              variant="outline"
                              onClick={() => toggleStaff(row.id)}
                            >
                              {staffCollapsed ? "Развернуть" : "Свернуть"}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => void saveStaff(row.id)}
                              disabled={!changed || busy === `staff:${row.id}`}
                            >
                              Сохранить
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => void removeStaff(row.id)}
                              disabled={busy === `staff:del:${row.id}`}
                            >
                              Удалить
                            </Button>
                          </div>
                        </div>

                        {!staffCollapsed ? (
                          <>
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="space-y-1">
                            <span className="block text-xs font-medium text-muted-foreground">Порядок</span>
                            <Input
                              className="w-28"
                              type="number"
                              min={0}
                              value={String(draft.sortOrder ?? 0)}
                              onChange={(e) => setStaffField(row.id, "sortOrder", Number(e.target.value))}
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="block text-xs font-medium text-muted-foreground">Секция</span>
                            <select
                              className="h-10 min-w-64 rounded-md border border-input bg-background px-3 py-2 text-sm"
                              value={draft.sectionId}
                              onChange={(e) => setStaffField(row.id, "sectionId", e.target.value)}
                            >
                              {sectionOptions.map((option) => (
                                <option key={option.id} value={option.id}>
                                  {option.title}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="flex items-center gap-2 pt-5 text-sm">
                            <input
                              type="checkbox"
                              checked={!!draft.isActive}
                              onChange={(e) => setStaffField(row.id, "isActive", e.target.checked)}
                            />
                            Показывать на сайте
                          </label>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                          <label className="space-y-1">
                            <span className="block text-xs font-medium text-muted-foreground">ФИО RU</span>
                            <Input
                              value={draft.fullNameRu}
                              onChange={(e) => setStaffField(row.id, "fullNameRu", e.target.value)}
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="block text-xs font-medium text-muted-foreground">ФИО KZ</span>
                            <Input
                              value={draft.fullNameKz ?? ""}
                              onChange={(e) => setStaffField(row.id, "fullNameKz", e.target.value || null)}
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="block text-xs font-medium text-muted-foreground">Должность RU</span>
                            <Input
                              value={draft.positionRu ?? ""}
                              onChange={(e) => setStaffField(row.id, "positionRu", e.target.value || null)}
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="block text-xs font-medium text-muted-foreground">Должность KZ</span>
                            <Input
                              value={draft.positionKz ?? ""}
                              onChange={(e) => setStaffField(row.id, "positionKz", e.target.value || null)}
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="block text-xs font-medium text-muted-foreground">
                              Организация / филиал RU
                            </span>
                            <Input
                              value={draft.branchRu}
                              onChange={(e) => setStaffField(row.id, "branchRu", e.target.value)}
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="block text-xs font-medium text-muted-foreground">
                              Организация / филиал KZ
                            </span>
                            <Input
                              value={draft.branchKz ?? ""}
                              onChange={(e) => setStaffField(row.id, "branchKz", e.target.value || null)}
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="block text-xs font-medium text-muted-foreground">Телефон</span>
                            <Input
                              value={draft.phone ?? ""}
                              onChange={(e) => setStaffField(row.id, "phone", e.target.value || null)}
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="block text-xs font-medium text-muted-foreground">Email</span>
                            <Input
                              type="email"
                              value={draft.email ?? ""}
                              onChange={(e) => setStaffField(row.id, "email", e.target.value || null)}
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="block text-xs font-medium text-muted-foreground">Дата рождения</span>
                            <Input
                              type="date"
                              value={dateInputValue(draft.birthDate)}
                              onChange={(e) => setStaffField(row.id, "birthDate", e.target.value || null)}
                            />
                          </label>
                        </div>

                        <AdminImageUrlField
                          label="Фото"
                          value={draft.imageUrl ?? ""}
                          onChange={(url) => setStaffField(row.id, "imageUrl", url || null)}
                          urlPlaceholder="URL фото или загрузите файл"
                          onUploadError={(msg) => setError(msg)}
                        />
                          </>
                        ) : null}
                      </article>
                    )
                  })}
                </div>
              )}
                </>
              ) : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}
