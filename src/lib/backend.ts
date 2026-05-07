export function getBackendBaseUrl() {
  return process.env.BACKEND_URL || "http://127.0.0.1:4000"
}

export async function fetchBackendJson<T>(
  path: string,
  init?: RequestInit & { next?: { revalidate?: number } }
): Promise<T> {
  const base = getBackendBaseUrl()
  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`
  const res = await fetch(url, init)
  if (!res.ok) {
    throw new Error(`Backend request failed: ${res.status} ${res.statusText} (${url})`)
  }
  return (await res.json()) as T
}

