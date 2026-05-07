/** Безопасный decodeURIComponent для сегмента пути (slug / id). */
export function safeDecodePathSegment(segment: string): string {
  const t = segment.trim()
  if (!t) return t
  try {
    return decodeURIComponent(t)
  } catch {
    return t
  }
}
