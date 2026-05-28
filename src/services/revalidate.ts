/** Инвалидация кэша Next после мутаций, обработанных внешним API. */
export async function requestRevalidate(paths: string[]): Promise<void> {
  const unique = [
    ...new Set(
      paths.filter((p): p is string => typeof p === "string" && p.startsWith("/"))
    ),
  ]
  if (unique.length === 0) return

  await fetch("/api/revalidate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paths: unique }),
  })
}

export function pathsAfterNewsMutation(opts: {
  slug: string
  id: string
  previousSlug?: string
}): string[] {
  const s = new Set<string>([
    "/",
    "/branches",
    "/news",
    `/news/${opts.slug}`,
    `/news/${opts.id}`,
  ])
  if (opts.previousSlug && opts.previousSlug !== opts.slug) {
    s.add(`/news/${opts.previousSlug}`)
  }
  return [...s]
}

export function pathsAfterNewsDelete(opts: { id: string; slug: string }): string[] {
  return ["/", "/branches", "/news", `/news/${opts.slug}`, `/news/${opts.id}`]
}

export function pathsAfterEventMutation(item: { slug: string; id: string }): string[] {
  return [
    "/",
    "/branches",
    "/events",
    `/events/${item.slug}`,
    `/events/${item.id}`,
  ]
}

export function pathsAfterEventDelete(item: { slug: string; id: string }): string[] {
  return ["/", "/branches", "/events", `/events/${item.slug}`, `/events/${item.id}`]
}

export function pathsAfterSiteSettingsHomePatch(): string[] {
  return ["/"]
}
