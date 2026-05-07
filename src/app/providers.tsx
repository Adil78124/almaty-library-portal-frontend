"use client"

import { LocaleProvider } from "@/components/i18n/locale-provider"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>
}
