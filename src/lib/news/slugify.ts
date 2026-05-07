/** URL-slug из заголовка (латиница, кириллица, цифры, дефис). */
export function slugifyNewsTitle(title: string): string {
  const s = title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^0-9a-zа-яёәіңғүұқөһ\-]+/gi, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 150)
  return s.length > 0 ? s : "novost"
}
