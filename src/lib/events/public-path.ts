/** Публичный путь к мероприятию: сегмент кодируется для кириллицы и спецсимволов. */
export function eventPublicPath(
  ev: Pick<{ slug: string; id: string }, "slug" | "id">
): string {
  const raw = ev.slug?.trim()
  const segment = raw && !/[/?#]/.test(raw) ? raw : (ev.id?.trim() ?? "")
  if (!segment) return "/events"
  return `/events/${encodeURIComponent(segment)}`
}

