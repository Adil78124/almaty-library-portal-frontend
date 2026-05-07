"use client"

import { useEffect } from "react"

import { useLocale } from "@/components/i18n/locale-provider"

export function HomeCountersScript() {
  const { locale } = useLocale()

  useEffect(() => {
    let online = 10
    let total = 7533

    const tick = () => {
      online = Math.floor(Math.random() * 20) + 5
      total += Math.floor(Math.random() * 3)

      const onlineEl = document.getElementById("onlineCount")
      const totalEl = document.getElementById("totalCount")

      if (onlineEl) onlineEl.innerText = String(online)
      if (totalEl) {
        totalEl.innerText = total.toLocaleString(
          locale === "kz" ? "kk-KZ" : "ru-RU"
        )
      }
    }

    const interval = window.setInterval(tick, 3000)
    return () => window.clearInterval(interval)
  }, [locale])

  return null
}
