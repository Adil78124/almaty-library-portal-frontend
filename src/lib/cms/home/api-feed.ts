import {
  mapEventApiRowsToAfisha,
  mapNewsApiRowsToManual,
  type ApiEventRow,
  type ApiNewsRow,
} from "@/lib/cms/home/map-from-public-api"
import type { AfishaItemManual, NewsItemManual } from "@/lib/cms/home/types"
import type { AppLocale } from "@/lib/i18n/app-locale"
import { getBackendBaseUrl as getConfiguredBackendBaseUrl } from "@/lib/backend"

/** Как в `next.config.mjs` rewrites → тот же бэкенд, что и у браузера. */
export function getBackendBaseUrl(): string {
  return getConfiguredBackendBaseUrl()
}

/**
 * Те же данные, что и у клиентского `fetchPublishedNews` / блока на главной.
 * GET /api/news?limit=&sort=desc
 */
export async function fetchNewsItemsViaPublicApi(
  limit: number,
  lang: AppLocale
): Promise<NewsItemManual[]> {
  const base = getBackendBaseUrl().replace(/\/$/, "")
  const q = new URLSearchParams({
    limit: String(limit),
    sort: "desc",
    lang,
  })
  const url = `${base}/api/news?${q.toString()}`
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) {
    throw new Error(`[home] GET ${url} → ${res.status}`)
  }
  const data = (await res.json()) as unknown
  if (!Array.isArray(data)) {
    throw new Error("[home] /api/news: expected array")
  }
  return mapNewsApiRowsToManual(data as ApiNewsRow[])
}

/**
 * Те же данные, что и у `fetchPublishedEventsHome` на клиенте.
 * GET /api/events?limit=&sort=asc
 */
export async function fetchAfishaItemsViaPublicApi(
  limit: number,
  lang: AppLocale
): Promise<AfishaItemManual[]> {
  const base = getBackendBaseUrl().replace(/\/$/, "")
  const q = new URLSearchParams({
    limit: String(limit),
    sort: "asc",
    lang,
  })
  const url = `${base}/api/events?${q.toString()}`
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) {
    throw new Error(`[home] GET ${url} → ${res.status}`)
  }
  const data = (await res.json()) as unknown
  if (!Array.isArray(data)) {
    throw new Error("[home] /api/events: expected array")
  }
  return mapEventApiRowsToAfisha(data as ApiEventRow[])
}
