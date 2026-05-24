"use client"

import { useEffect, useMemo, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"

const VISITOR_KEY = "libraryAnalyticsVisitorId"
const SESSION_KEY = "libraryAnalyticsSessionId"

function makeId(prefix: string): string {
  const cryptoObj = globalThis.crypto
  if (cryptoObj?.randomUUID) return `${prefix}_${cryptoObj.randomUUID()}`
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

function getStoredId(key: string, prefix: string, storage: Storage): string {
  const existing = storage.getItem(key)
  if (existing) return existing
  const next = makeId(prefix)
  storage.setItem(key, next)
  return next
}

function sectionFromPath(path: string): string {
  if (path === "/") return "home"
  return path.split("/").filter(Boolean)[0] || "home"
}

function branchIdFromPath(path: string): string | null {
  const m = /^\/branches\/([^/?#]+)/.exec(path)
  return m?.[1] ?? null
}

function shouldTrack(path: string): boolean {
  return !(
    path.startsWith("/admin") ||
    path.startsWith("/login") ||
    path.startsWith("/api")
  )
}

async function sendAnalytics(endpoint: "visit" | "heartbeat", payload: Record<string, unknown>) {
  try {
    await fetch(`/api/analytics/${endpoint}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    })
  } catch {
    // Analytics must never break navigation.
  }
}

export function SiteAnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastTracked = useRef<string | null>(null)
  const route = useMemo(() => {
    const qs = searchParams.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }, [pathname, searchParams])

  useEffect(() => {
    if (!shouldTrack(pathname)) return

    const visitorId = getStoredId(VISITOR_KEY, "v", window.localStorage)
    const sessionId = getStoredId(SESSION_KEY, "s", window.sessionStorage)
    const payload = {
      path: route,
      pageTitle: document.title || null,
      section: sectionFromPath(pathname),
      branchId: branchIdFromPath(pathname),
      visitorId,
      sessionId,
      referrer: document.referrer || null,
    }

    if (lastTracked.current !== route) {
      lastTracked.current = route
      void sendAnalytics("visit", payload)
    }

    void sendAnalytics("heartbeat", payload)
    const id = window.setInterval(() => {
      void sendAnalytics("heartbeat", {
        path: route,
        branchId: branchIdFromPath(pathname),
        visitorId,
        sessionId,
      })
    }, 30_000)

    return () => window.clearInterval(id)
  }, [pathname, route])

  return null
}
