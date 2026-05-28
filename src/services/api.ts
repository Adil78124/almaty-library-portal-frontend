const JSON_HDR = { "Content-Type": "application/json" } as const

/** Публичная лента новостей (главная, polling). */
export async function fetchPublishedNews(
  limit: number,
  sort: string,
  lang: "ru" | "kz"
) {
  const q = new URLSearchParams({
    limit: String(limit),
    sort,
    lang,
  })
  return fetch(`/api/news?${q.toString()}`, { cache: "no-store" })
}

/** Публичная афиша для главной (polling). */
export async function fetchPublishedEventsHome(
  limit: number,
  lang: "ru" | "kz"
) {
  const q = new URLSearchParams({
    limit: String(limit),
    sort: "asc",
    lang,
  })
  return fetch(`/api/events?${q.toString()}`, { cache: "no-store" })
}

const adminFetchInit: RequestInit = { credentials: "include" }

export async function createNewsArticle(body: Record<string, unknown>) {
  return fetch("/api/news", {
    method: "POST",
    headers: JSON_HDR,
    body: JSON.stringify(body),
    ...adminFetchInit,
  })
}

export async function updateNewsArticle(
  id: string,
  body: Record<string, unknown>
) {
  return fetch(`/api/news/${id}`, {
    method: "PUT",
    headers: JSON_HDR,
    body: JSON.stringify(body),
    ...adminFetchInit,
  })
}

export async function deleteNewsArticle(id: string) {
  return fetch(`/api/news/${id}`, { method: "DELETE" })
}

export async function createEvent(body: Record<string, unknown>) {
  return fetch("/api/events", {
    method: "POST",
    headers: JSON_HDR,
    body: JSON.stringify(body),
    ...adminFetchInit,
  })
}

export async function updateEvent(id: string, body: Record<string, unknown>) {
  return fetch(`/api/events/${id}`, {
    method: "PATCH",
    headers: JSON_HDR,
    body: JSON.stringify(body),
    ...adminFetchInit,
  })
}

export async function deleteEvent(id: string) {
  return fetch(`/api/events/${id}`, { method: "DELETE", ...adminFetchInit })
}

export async function patchSiteSettingsHome(body: Record<string, unknown>) {
  return fetch("/api/site-settings", {
    method: "PATCH",
    headers: JSON_HDR,
    body: JSON.stringify(body),
  })
}

export async function uploadAdminImage(file: File) {
  const fd = new FormData()
  fd.append("file", file)
  return fetch("/api/upload", { method: "POST", body: fd })
}

export async function fetchDigitalBooks(activeOnly: boolean) {
  const qs = activeOnly ? "?activeOnly=1" : ""
  return fetch(`/api/digital-books${qs}`, { cache: "no-store" })
}

export async function fetchPopularBooks(activeOnly: boolean) {
  const qs = activeOnly ? "?activeOnly=1" : ""
  return fetch(`/api/popular-books${qs}`, { cache: "no-store" })
}

export async function createDigitalBook(body: Record<string, unknown>) {
  return fetch("/api/digital-books", {
    method: "POST",
    headers: JSON_HDR,
    body: JSON.stringify(body),
    ...adminFetchInit,
  })
}

export async function updateDigitalBook(id: string, body: Record<string, unknown>) {
  return fetch(`/api/digital-books/${id}`, {
    method: "PUT",
    headers: JSON_HDR,
    body: JSON.stringify(body),
    ...adminFetchInit,
  })
}

export async function deleteDigitalBook(id: string) {
  return fetch(`/api/digital-books/${id}`, { method: "DELETE", ...adminFetchInit })
}

export async function createPopularBook(body: Record<string, unknown>) {
  return fetch("/api/popular-books", {
    method: "POST",
    headers: JSON_HDR,
    body: JSON.stringify(body),
    ...adminFetchInit,
  })
}

export async function updatePopularBook(id: string, body: Record<string, unknown>) {
  return fetch(`/api/popular-books/${id}`, {
    method: "PUT",
    headers: JSON_HDR,
    body: JSON.stringify(body),
    ...adminFetchInit,
  })
}

export async function deletePopularBook(id: string) {
  return fetch(`/api/popular-books/${id}`, { method: "DELETE", ...adminFetchInit })
}

export async function createNewArrival(body: Record<string, unknown>) {
  return fetch("/api/new-arrivals", {
    method: "POST",
    headers: JSON_HDR,
    body: JSON.stringify(body),
    ...adminFetchInit,
  })
}
