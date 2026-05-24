import type { Metadata } from "next"
import { cookies } from "next/headers"
import { Inter } from "next/font/google"

import { ConditionalHeader } from "@/components/conditional-header"
import { SiteAnalyticsTracker } from "@/components/analytics/site-analytics-tracker"
import { AppProviders } from "@/app/providers"
import {
  appLocaleFromRequestValue,
  htmlLangFromAppLocale,
  LOCALE_STORAGE_KEY,
} from "@/lib/i18n/app-locale"
import "./globals.css"

const inter = Inter({
  subsets: ["cyrillic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
})

export async function generateMetadata(): Promise<Metadata> {
  const jar = await cookies()
  const locale = appLocaleFromRequestValue(jar.get(LOCALE_STORAGE_KEY)?.value)
  const isKz = locale === "kz"
  return {
    title: isKz
      ? "Алматы облыстық әмбебап кітапханасы"
      : "Алматинская областная универсальная библиотека",
    description: isKz
      ? "Алматы облыстық әмбебап кітапханасы — кітапхана жүйесінің ресми порталы."
      : "Алматинская областная универсальная библиотека — официальный портал библиотечной сети.",
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jar = await cookies()
  const htmlLang = htmlLangFromAppLocale(
    appLocaleFromRequestValue(jar.get(LOCALE_STORAGE_KEY)?.value)
  )

  return (
    <html
      lang={htmlLang}
      className={`light font-sans ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.className} bg-surface text-on-surface selection:bg-primary/10 overflow-x-hidden`}
      >
        <AppProviders>
          <ConditionalHeader />
          <SiteAnalyticsTracker />
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
