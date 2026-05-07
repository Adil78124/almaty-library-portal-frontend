"use client"

import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadAdminImage } from "@/lib/admin/upload-image"
import { cn } from "@/lib/utils"
import { parseYoutubeVideoId, youtubeThumbnailHq } from "@/lib/youtube"

export type AdminImageUrlFieldProps = {
  label?: string
  /** Пустая строка, если в данных нет URL (из CMS может прийти null/undefined). */
  value: string | null | undefined
  onChange: (url: string) => void
  urlPlaceholder?: string
  id?: string
  className?: string
  onUploadError?: (message: string) => void
  /** Компактный вид для строк таблиц / карточек */
  compact?: boolean
}

export function AdminImageUrlField({
  label,
  value,
  onChange,
  urlPlaceholder = "URL изображения (https://… или /uploads/…)",
  id,
  className,
  onUploadError,
  compact,
}: AdminImageUrlFieldProps) {
  const safeValue = value == null ? "" : String(value)
  const [mode, setMode] = useState<"url" | "file">("url")
  const [localError, setLocalError] = useState<string | null>(null)
  const [uploadPending, startUpload] = useTransition()
  const inputKey = `${id ?? "admin-image"}-${mode}`

  function reportError(msg: string) {
    setLocalError(msg)
    onUploadError?.(msg)
  }

  function handleFile(file: File | undefined) {
    if (!file) return
    setLocalError(null)
    startUpload(async () => {
      const r = await uploadAdminImage(file)
      if (!r.ok) {
        reportError(r.error)
        return
      }
      onChange(r.url)
      setMode("url")
    })
  }

  const v = safeValue.trim()
  const ytId = v ? parseYoutubeVideoId(v) : null

  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <Label htmlFor={id} className={compact ? "text-xs" : undefined}>
          {label}
        </Label>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={mode === "url" ? "default" : "outline"}
          size={compact ? "sm" : "sm"}
          className="h-8"
          onClick={() => {
            setMode("url")
            setLocalError(null)
          }}
        >
          URL
        </Button>
        <Button
          type="button"
          variant={mode === "file" ? "default" : "outline"}
          size={compact ? "sm" : "sm"}
          className="h-8"
          onClick={() => {
            setMode("file")
            setLocalError(null)
          }}
        >
          Загрузить файл
        </Button>
      </div>
      {mode === "url" ? (
        <Input
          key={inputKey}
          id={id}
          type="text"
          value={safeValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={urlPlaceholder}
          className={compact ? "text-sm" : undefined}
        />
      ) : (
        <Input
          key={inputKey}
          type="file"
          accept="image/*"
          disabled={uploadPending}
          className={compact ? "text-sm" : undefined}
          onChange={(e) => {
            handleFile(e.target.files?.[0])
            e.target.value = ""
          }}
        />
      )}
      {uploadPending ? (
        <p className="text-muted-foreground text-xs">Загрузка…</p>
      ) : null}
      {localError && mode === "file" ? (
        <p className="text-destructive text-xs">{localError}</p>
      ) : null}
      {v ? (
        <div className="mt-1">
          {ytId ? (
            <>
              <img
                alt=""
                width={200}
                height={112}
                className="rounded-md border border-border object-cover"
                src={youtubeThumbnailHq(ytId)}
              />
              <p className="text-muted-foreground mt-1 text-xs">
                Превью YouTube по ссылке в поле
              </p>
            </>
          ) : (
            <img
              alt=""
              width={200}
              className="max-h-40 w-auto rounded-md border border-border object-cover"
              src={v}
            />
          )}
        </div>
      ) : null}
    </div>
  )
}
