"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  type AppLocale,
  htmlLangFromAppLocale,
  isAppLocale,
  LOCALE_STORAGE_KEY,
} from "@/lib/i18n/app-locale"

const LOCALE_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 365

function writeLocaleCookie(lang: AppLocale) {
  try {
    document.cookie = `${LOCALE_STORAGE_KEY}=${lang};path=/;max-age=${LOCALE_COOKIE_MAX_AGE_SEC};SameSite=Lax`
  } catch {
    /* ignore */
  }
}

type LocaleContextValue = {
  locale: AppLocale
  setLocale: (next: AppLocale) => void
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>("ru")

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(LOCALE_STORAGE_KEY)
        if (isAppLocale(raw)) {
          setLocaleState(raw)
          writeLocaleCookie(raw)
          document.documentElement.lang = htmlLangFromAppLocale(raw)
        }
      } catch {
        /* ignore */
      }
    })
    return () => window.cancelAnimationFrame(id)
  }, [])

  const setLocale = useCallback((next: AppLocale) => {
    setLocaleState(next)
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
    writeLocaleCookie(next)
    try {
      document.documentElement.lang = htmlLangFromAppLocale(next)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(
    () => ({ locale, setLocale }),
    [locale, setLocale]
  )

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  )
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider")
  }
  return ctx
}
