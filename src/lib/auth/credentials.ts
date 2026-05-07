export function getExpectedAdminCredentials(): { email: string; password: string } {
  const email =
    process.env.ADMIN_EMAIL?.trim() ||
    (process.env.NODE_ENV !== "production" ? "admin@library.local" : "")
  const password =
    process.env.ADMIN_PASSWORD ??
    (process.env.NODE_ENV !== "production" ? "admin" : "")

  return { email, password }
}

export function validateAdminLogin(
  email: string,
  password: string
): boolean {
  const expected = getExpectedAdminCredentials()
  if (!expected.email || !expected.password) {
    return false
  }
  return (
    email.trim().toLowerCase() === expected.email.toLowerCase() &&
    password === expected.password
  )
}
