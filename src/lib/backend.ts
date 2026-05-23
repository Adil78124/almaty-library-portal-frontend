export function getBackendBaseUrl() {
  const url =
    process.env.BACKEND_URL ||
    process.env.API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL

  if (url?.trim()) {
    const normalized = url.trim().replace(/\/$/, "")
    if (
      process.env.NODE_ENV === "production" &&
      /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(normalized)
    ) {
      throw new Error(
        `Backend URL points to localhost in production: ${normalized}. Set BACKEND_URL to the deployed backend origin.`
      )
    }
    return normalized
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "BACKEND_URL is not set in production. Set it to the public or internal backend origin, for example https://api.example.kz."
    )
  }

  return "http://127.0.0.1:4000"
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

