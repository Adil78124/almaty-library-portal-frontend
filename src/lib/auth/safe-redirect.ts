/** Разрешить только относительные пути приложения (без open redirect). */
export function safeAdminRedirectPath(from: string | undefined): string {
  if (!from || !from.startsWith("/") || from.startsWith("//")) {
    return "/admin"
  }
  if (from.includes(":")) {
    return "/admin"
  }
  return from
}
