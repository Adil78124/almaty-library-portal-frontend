"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"

export function BranchDeleteButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function remove() {
    if (
      !confirm(
        `Удалить филиал «${name}»? Допустимо только если нет админов и материалов этого филиала.`
      )
    ) {
      return
    }
    setPending(true)
    try {
      const res = await fetch(`/api/branches/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        alert(data.error ?? "Не удалось удалить")
        return
      }
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={() => void remove()}
    >
      Удалить
    </Button>
  )
}
