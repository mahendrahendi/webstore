import * as React from "react"
import { Check } from "lucide-react"

import type { Game } from "@/lib/catalog"
import { cn } from "@/lib/utils"

/** Colored letter tile standing in for a game logo. */
export function GameBadge({
  game,
  size,
  className,
}: {
  game: Pick<Game, "short" | "color">
  size: "sm" | "md" | "lg"
  className?: string
}) {
  const sizes = {
    sm: "size-[52px] rounded-[14px] p-1.5 text-lg", // track result
    md: "size-14 rounded-[14px] p-1.5 text-xl", // confirm dialog
    lg: "size-[84px] rounded-[18px] p-2.5 text-[32px] leading-[0.9] tracking-[-0.04em]", // game header
  }
  return (
    <div
      aria-hidden
      className={cn("flex flex-none items-end font-display font-black text-bg", sizes[size], className)}
      style={{ background: game.color }}
    >
      {game.short}
    </div>
  )
}

type StepState = "done" | "set" | "todo" | "optional"

/** Numbered checkout section. "done" swaps the number for a ✓. */
export function StepCard({
  n,
  state,
  title,
  aside,
  children,
}: {
  n: number
  state: StepState
  title: React.ReactNode
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  const badge = {
    done: "bg-lime text-bg",
    set: "bg-lime text-bg",
    todo: "bg-white/8 text-ink",
    optional: "bg-white/8 text-muted-foreground",
  }[state]
  return (
    <section className="rounded-3xl bg-surface p-[22px]" aria-labelledby={`step-${n}`}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-[10px] font-display text-sm font-extrabold",
            badge
          )}
        >
          {state === "done" ? (
            <>
              <span aria-hidden>✓</span>
              <span className="sr-only">Step {n} done</span>
            </>
          ) : (
            n
          )}
        </span>
        <h2 id={`step-${n}`} className="m-0 font-display text-lg font-bold">
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

/** Two-column label/value list used in order summaries. */
export function SummaryList({
  rows,
  className,
}: {
  rows: { label: string; value: React.ReactNode; strong?: boolean; numeric?: boolean }[]
  className?: string
}) {
  return (
    <dl className={cn("m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-sm", className)}>
      {rows.map((r) => (
        <React.Fragment key={r.label}>
          <dt className="text-muted-foreground">{r.label}</dt>
          <dd className={cn("m-0 text-right", r.strong && "font-extrabold", r.numeric && "tabular-nums")}>
            {r.value}
          </dd>
        </React.Fragment>
      ))}
    </dl>
  )
}

/** Lime check circle used in the account-found box and the timeline. */
export function CheckDot({ size }: { size: "sm" | "lg" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex flex-none items-center justify-center rounded-full bg-lime text-bg",
        size === "lg" ? "size-11" : "size-[26px]"
      )}
    >
      <Check size={size === "lg" ? 22 : 14} strokeWidth={3} />
    </span>
  )
}

export function ErrorNote({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-2xl border border-danger/45 bg-danger/10 px-4 py-3.5 text-sm font-semibold text-danger-text",
        className
      )}
    >
      {children}
    </div>
  )
}

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto max-w-[1200px] px-5", className)}>{children}</div>
}
