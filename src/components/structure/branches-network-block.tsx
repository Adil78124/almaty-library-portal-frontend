"use client"

import type { BranchesNetworkData } from "@/lib/cms/branches-network/types"
import { useLocale } from "@/components/i18n/locale-provider"
import { pickDbField } from "@/lib/i18n/app-locale"

export function BranchesNetworkBlock({ network }: { network: BranchesNetworkData }) {
  const { locale } = useLocale()

  const title = pickDbField(network.titleRu, network.titleKz ?? null, locale)
  const lead = pickDbField(network.leadRu, network.leadKz ?? null, locale)
  const body = pickDbField(network.bodyRu, network.bodyKz ?? null, locale)

  const lines = body.split(/\r?\n/).map((l) => l.trim())
  const paragraphs: string[] = []
  const bullets: string[] = []
  for (const line of lines) {
    if (!line) continue
    if (line.startsWith("*")) {
      bullets.push(line.replace(/^\*\s*/, ""))
      continue
    }
    paragraphs.push(line)
  }

  return (
    <section className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-8">
      <h2 className="text-3xl font-bold tracking-tight text-primary">{title}</h2>
      <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">{lead}</p>
      <div className="mt-6 space-y-4 text-on-surface-variant">
        {paragraphs.map((p, idx) => (
          <p key={idx} className="text-base leading-relaxed">
            {p}
          </p>
        ))}
        {bullets.length ? (
          <ul className="list-disc space-y-2 pl-6 text-base leading-relaxed">
            {bullets.map((b, idx) => (
              <li key={idx}>{b}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}

