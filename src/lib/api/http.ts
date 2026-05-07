import { NextResponse } from "next/server"
import type { ZodError } from "zod"

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export function jsonValidationError(error: ZodError) {
  return NextResponse.json(
    {
      error: "Ошибка валидации",
      issues: error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    },
    { status: 400 }
  )
}

export async function parseJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T
  } catch {
    return null
  }
}
