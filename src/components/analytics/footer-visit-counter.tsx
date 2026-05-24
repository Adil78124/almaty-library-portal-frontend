"use client"

import { useEffect, useState } from "react"

type PublicStats = {
  online: number
  totalVisits: number
}

export function FooterVisitCounter() {
  const [stats, setStats] = useState<PublicStats>({ online: 0, totalVisits: 0 })

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/analytics/public", { cache: "no-store" })
        if (!res.ok) return
        const data = (await res.json()) as PublicStats
        if (!cancelled) {
          setStats({
            online: Number(data.online) || 0,
            totalVisits: Number(data.totalVisits) || 0,
          })
        }
      } catch {
        // Footer counters are informational only.
      }
    }
    void load()
    const id = window.setInterval(() => void load(), 30_000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  return (
    <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-[11px] text-white/45">
      <span>Сейчас на сайте: {stats.online.toLocaleString("ru-RU")}</span>
      <span>Посещений за все время: {stats.totalVisits.toLocaleString("ru-RU")}</span>
    </div>
  )
}
