"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { deleteEvent } from "@/services/api"
import { pathsAfterEventDelete, requestRevalidate } from "@/services/revalidate"

type Props = {
  id: string
  slug: string
  title: string
}

export function EventDeleteButton({ id, slug, title }: Props) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function onDelete() {
    if (!confirm(`Удалить мероприятие «${title}»? Это действие нельзя отменить.`)) {
      return
    }

    setPending(true)
    try {
      const res = await deleteEvent(id)
      if (!res.ok) {
        alert("Не удалось удалить мероприятие")
        return
      }

      await requestRevalidate(pathsAfterEventDelete({ id, slug }))
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
      onClick={onDelete}
    >
      {pending ? "Удаление..." : "Удалить"}
    </Button>
  )
}
