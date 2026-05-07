/** Публичный путь к материалу: сегмент кодируется для кириллицы и спецсимволов. */
export function newsArticlePublicPath(
  article: Pick<{ slug: string; id: string }, "slug" | "id">
): string {
  const raw = article.slug?.trim()
  const segment =
    raw && !/[/?#]/.test(raw) ? raw : (article.id?.trim() ?? "")
  if (!segment) return "/news"
  return `/news/${encodeURIComponent(segment)}`
}
