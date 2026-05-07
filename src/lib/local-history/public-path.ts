/** Публичная страница карточки краеведения. */
export function localHistoryPublicPath(slug: string) {
  const s = slug.trim()
  if (!s) return "/local-history"
  return `/local-history/${encodeURIComponent(s)}`
}
