import { readFile, stat } from "node:fs/promises"
import path from "node:path"

import { resolveUploadedFilePath } from "@/lib/uploads"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Params = { params: Promise<{ path: string[] }> }

const CONTENT_TYPES: Record<string, string> = {
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
}

function contentTypeFor(filePath: string): string {
  return (
    CONTENT_TYPES[path.extname(filePath).toLowerCase()] ??
    "application/octet-stream"
  )
}

export async function GET(_request: Request, { params }: Params) {
  const { path: requestedPath } = await params
  const filePath = resolveUploadedFilePath(requestedPath)
  if (!filePath) {
    return new Response(null, { status: 404 })
  }

  try {
    const info = await stat(filePath)
    if (!info.isFile()) {
      return new Response(null, { status: 404 })
    }

    const file = await readFile(filePath)
    const contentType = contentTypeFor(filePath)
    return new Response(new Blob([file], { type: contentType }), {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(info.size),
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch {
    const backend =
      process.env.BACKEND_URL?.trim().replace(/\/$/, "") ||
      process.env.API_INTERNAL_URL?.trim().replace(/\/$/, "") ||
      process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "")

    if (!backend) return new Response(null, { status: 404 })

    try {
      const uploadPath = requestedPath.map(encodeURIComponent).join("/")
      const upstream = await fetch(`${backend}/uploads/${uploadPath}`, {
        cache: "no-store",
      })
      if (!upstream.ok || !upstream.body) {
        return new Response(null, { status: 404 })
      }

      return new Response(upstream.body, {
        status: upstream.status,
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
          "Content-Type":
            upstream.headers.get("content-type") ?? contentTypeFor(filePath),
          "X-Content-Type-Options": "nosniff",
        },
      })
    } catch {
      return new Response(null, { status: 404 })
    }
  }
}
