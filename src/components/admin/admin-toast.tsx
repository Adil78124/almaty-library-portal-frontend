"use client"

import { Check } from "lucide-react"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"

import { cn } from "@/lib/utils"

const DISMISS_MS = 3400

type AdminToastContextValue = {
  success: (message?: string) => void
}

const AdminToastContext = createContext<AdminToastContextValue | null>(null)

/** Тост успеха справа; безопасен вне провайдера (no-op). */
export function useAdminToast(): AdminToastContextValue {
  const ctx = useContext(AdminToastContext)
  return ctx ?? { success: () => {} }
}

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState("Сохранено")
  const [enter, setEnter] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current)
      hideTimer.current = null
    }
    if (exitTimer.current) {
      clearTimeout(exitTimer.current)
      exitTimer.current = null
    }
  }, [])

  const success = useCallback(
    (msg = "Сохранено") => {
      clearTimers()
      setMessage(msg)
      setVisible(true)
      requestAnimationFrame(() => setEnter(true))
      hideTimer.current = setTimeout(() => {
        setEnter(false)
        exitTimer.current = setTimeout(() => {
          setVisible(false)
        }, 380)
      }, DISMISS_MS)
    },
    [clearTimers]
  )

  useEffect(() => () => clearTimers(), [clearTimers])

  return (
    <AdminToastContext.Provider value={{ success }}>
      {children}
      {visible ? (
        <div
          aria-live="polite"
          role="status"
          className={cn(
            "pointer-events-none fixed top-20 right-4 z-[200] max-w-[min(100vw-2rem,20rem)] md:right-6",
            "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            enter
              ? "translate-x-0 opacity-100"
              : "translate-x-[calc(100%+2rem)] opacity-0"
          )}
        >
          <div
            className={cn(
              "pointer-events-auto flex items-center gap-3 rounded-xl border border-border/60",
              "bg-background/95 px-4 py-3 shadow-lg backdrop-blur-md",
              "ring-1 ring-black/5 dark:ring-white/10"
            )}
          >
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400"
              aria-hidden
            >
              <Check className="size-[18px] stroke-[2.5]" />
            </span>
            <p className="text-foreground text-sm font-medium leading-snug">
              {message}
            </p>
          </div>
        </div>
      ) : null}
    </AdminToastContext.Provider>
  )
}
