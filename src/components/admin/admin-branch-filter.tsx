"use client"

import { useRouter, useSearchParams } from "next/navigation"

type BranchOption = {
  id: string
  titleRu: string
}

export function AdminBranchFilter({
  branches,
  selectedBranchId,
}: {
  branches: BranchOption[]
  selectedBranchId?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-muted-foreground text-sm">Филиал</span>
      <select
        className="border-input bg-background h-9 max-w-72 rounded-md border px-3 text-sm"
        value={selectedBranchId ?? ""}
        aria-label="Филиал"
        onChange={(event) => {
          const params = new URLSearchParams(searchParams.toString())
          params.set("type", "branches")
          if (event.target.value) {
            params.set("branchId", event.target.value)
          } else {
            params.delete("branchId")
          }
          router.push(`?${params.toString()}`)
          router.refresh()
        }}
      >
        <option value="">Все филиалы</option>
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.titleRu}
          </option>
        ))}
      </select>
    </div>
  )
}
