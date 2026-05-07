"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

type Scope = "main" | "branches" | "all"

const LS_KEY = "adminContentScope"

function isScope(v: unknown): v is Scope {
  return v === "main" || v === "branches" || v === "all"
}

export function AdminContentScopeFilter({
  label,
  defaultValue,
}: {
  label: string
  defaultValue: Scope
}) {
  const router = useRouter()
  const sp = useSearchParams()

  const urlScope = sp.get("type")
  const initial = isScope(urlScope) ? urlScope : defaultValue

  const [value, setValue] = useState<Scope>(initial)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY)
      if (isScope(stored) && !isScope(urlScope)) {
        setValue(stored)
        router.replace(`?type=${stored}`)
        router.refresh()
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isScope(urlScope) && urlScope !== value) {
      setValue(urlScope)
    }
  }, [urlScope, value])

  const title = useMemo(() => {
    if (value === "main") return "Только сайт"
    if (value === "branches") return "Только филиалы"
    return "Все"
  }, [value])

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <select
        className="border-input bg-background h-9 rounded-md border px-3 text-sm"
        value={value}
        aria-label={label}
        onChange={(e) => {
          const next = e.target.value as Scope
          setValue(next)
          try {
            localStorage.setItem(LS_KEY, next)
          } catch {
            /* ignore */
          }
          router.push(`?type=${next}`)
          router.refresh()
        }}
        title={title}
      >
        <option value="main">Только сайт</option>
        <option value="branches">Только филиалы</option>
        <option value="all">Все</option>
      </select>
    </div>
  )
}

