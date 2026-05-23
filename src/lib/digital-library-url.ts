const FALLBACK_DIGITAL_LIBRARY_URL = "https://elib.obllibrary.kz"

function normalizeExternalUrl(raw: string | null | undefined): string {
  const value = raw?.trim() || FALLBACK_DIGITAL_LIBRARY_URL
  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith("//")) return `https:${value}`
  return `https://${value}`
}

export const DIGITAL_LIBRARY_URL = normalizeExternalUrl(
  process.env.NEXT_PUBLIC_DIGITAL_LIBRARY_URL
)

export function digitalLibraryHref(raw: string | null | undefined): string {
  return normalizeExternalUrl(raw)
}

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href) || href.startsWith("//")
}
