/** YouTube video IDs are 11 chars from [A-Za-z0-9_-]. */
const ID_RE = /^[a-zA-Z0-9_-]{11}$/

export function parseYoutubeVideoId(raw: string | null | undefined): string | null {
  const input = (raw ?? "").trim()
  if (!input) return null
  if (ID_RE.test(input)) return input

  try {
    const url = new URL(
      input.startsWith("http://") || input.startsWith("https://")
        ? input
        : `https://${input}`
    )
    const host = url.hostname.replace(/^www\./, "")

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0] ?? ""
      return ID_RE.test(id) ? id : null
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com"
    ) {
      if (url.pathname === "/watch" || url.pathname.startsWith("/watch")) {
        const v = url.searchParams.get("v")
        return v && ID_RE.test(v) ? v : null
      }
      const embed = url.pathname.match(/^\/embed\/([a-zA-Z0-9_-]{11})/)
      if (embed?.[1]) return embed[1]
      const shorts = url.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]{11})/)
      if (shorts?.[1]) return shorts[1]
      const live = url.pathname.match(/^\/live\/([a-zA-Z0-9_-]{11})/)
      if (live?.[1]) return live[1]
    }
  } catch {
    return null
  }

  return null
}

export function youtubeThumbnailHq(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`
}
