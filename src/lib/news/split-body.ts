export function splitBodyParagraphs(body: string | null | undefined): string[] {
  const s = (body ?? "").toString()
  if (!s.trim()) return []
  return s
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
}
