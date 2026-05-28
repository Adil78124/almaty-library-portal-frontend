import path from "node:path"

export function uploadsRootDir(): string {
  const fromEnv =
    process.env.UPLOAD_DIR?.trim() || process.env.NEXT_UPLOAD_DIR?.trim()

  if (fromEnv) {
    return path.isAbsolute(fromEnv)
      ? fromEnv
      : path.resolve(/*turbopackIgnore: true*/ process.cwd(), fromEnv)
  }

  return path.join(process.cwd(), "public", "uploads")
}

export function safeUploadName(name: string): string {
  const base = (name || "file").replaceAll("\\", "/").split("/").pop() || "file"
  return base.replace(/[^\p{L}\p{N}._-]+/gu, "_").slice(0, 80) || "file"
}

export function resolveUploadedFilePath(parts: string[]): string | null {
  if (!parts.length) return null

  for (const part of parts) {
    if (
      !part ||
      part === "." ||
      part === ".." ||
      part.includes("/") ||
      part.includes("\\") ||
      part.includes("\0")
    ) {
      return null
    }
  }

  const root = uploadsRootDir()
  const filePath = path.resolve(root, ...parts)
  const relative = path.relative(root, filePath)

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return null
  }

  return filePath
}
