import { uploadAdminImage as postUpload } from "@/services/api"

/** Загрузка изображения в админке (POST /api/upload). */
export async function uploadAdminImage(
  file: File
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const res = await postUpload(file)
  const data = (await res.json().catch(() => ({}))) as {
    url?: string
    error?: string
  }
  if (!res.ok) {
    return {
      ok: false,
      error: data.error ?? "Не удалось загрузить файл",
    }
  }
  if (!data.url?.trim()) {
    return { ok: false, error: "Некорректный ответ сервера" }
  }
  return { ok: true, url: data.url.trim() }
}
