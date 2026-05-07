"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { ChevronDown } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

type Ctx = {
  collapseAll: () => void
  expandAll: () => void
  subscribeCollapse: (fn: () => void) => () => void
  subscribeExpand: (fn: () => void) => () => void
}

const RepeatableListContext = createContext<Ctx | null>(null)

export function RepeatableListProvider({ children }: { children: ReactNode }) {
  const collapseSubs = useRef(new Set<() => void>())
  const expandSubs = useRef(new Set<() => void>())

  const subscribeCollapse = useCallback((fn: () => void) => {
    collapseSubs.current.add(fn)
    return () => {
      collapseSubs.current.delete(fn)
    }
  }, [])

  const subscribeExpand = useCallback((fn: () => void) => {
    expandSubs.current.add(fn)
    return () => {
      expandSubs.current.delete(fn)
    }
  }, [])

  const collapseAll = useCallback(() => {
    collapseSubs.current.forEach((fn) => {
      fn()
    })
  }, [])

  const expandAll = useCallback(() => {
    expandSubs.current.forEach((fn) => {
      fn()
    })
  }, [])

  const value = useMemo(
    () => ({
      collapseAll,
      expandAll,
      subscribeCollapse,
      subscribeExpand,
    }),
    [collapseAll, expandAll, subscribeCollapse, subscribeExpand]
  )

  return (
    <RepeatableListContext.Provider value={value}>
      {children}
    </RepeatableListContext.Provider>
  )
}

export function useRepeatableListControls() {
  const ctx = useContext(RepeatableListContext)
  if (!ctx) {
    throw new Error(
      "useRepeatableListControls must be used within RepeatableListProvider"
    )
  }
  return ctx
}

export function confirmListDelete(message: string): boolean {
  return typeof window !== "undefined" && window.confirm(message)
}

export function RepeatableEditorRow({
  summary,
  children,
}: {
  summary: ReactNode
  children: ReactNode
}) {
  const ctx = useContext(RepeatableListContext)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!ctx) return
    const unsubCollapse = ctx.subscribeCollapse(() => {
      setOpen(false)
    })
    const unsubExpand = ctx.subscribeExpand(() => {
      setOpen(true)
    })
    return () => {
      unsubCollapse()
      unsubExpand()
    }
  }, [ctx])

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="bg-card/30 overflow-hidden rounded-lg border border-border/80"
    >
      <CollapsibleTrigger className="hover:bg-muted/60 flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium transition-colors">
        <ChevronDown
          className={cn(
            "text-muted-foreground size-4 shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
        <span className="min-w-0 flex-1 truncate">{summary}</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t border-border/60 px-3 py-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
