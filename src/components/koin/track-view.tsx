"use client"

import { useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ErrorNote, GameBadge } from "@/components/koin/parts"
import { getGame } from "@/lib/catalog"
import { DEMO_INVOICE, type Order, type OrderStatus, STATUS_LABEL, getOrder } from "@/lib/mock-api"
import { cn } from "@/lib/utils"

const PILL: Record<OrderStatus, string> = {
  success: "bg-lime/14 text-lime",
  created: "bg-pink/12 text-pink-soft",
  paid: "bg-pink/12 text-pink-soft",
  processing: "bg-pink/12 text-pink-soft",
  failed: "bg-white/8 text-soft",
  refunded: "bg-white/8 text-soft",
  expired: "bg-white/8 text-soft",
}

export function TrackView() {
  const [query, setQuery] = useState("")
  const [result, setResult] = useState<Order | null | undefined>(undefined)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setResult(query.trim() ? getOrder(query) : undefined)
  }

  const game = result ? getGame(result.gameSlug) : undefined

  return (
    <div className="mx-auto max-w-[1200px] px-5 pt-12 pb-16">
      <div className="max-w-[680px]">
        <h1 className="m-0 font-display text-[clamp(28px,5vw,44px)] font-extrabold tracking-[-0.02em]">
          Track your order
        </h1>
        <p className="mt-2.5 mb-6 text-base text-soft">
          Use the order number from your receipt. No account needed.
        </p>
        <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-2.5">
          <label className="flex flex-[1_1_260px] flex-col gap-1.5 text-[13px] font-bold text-muted-foreground">
            Order number
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={DEMO_INVOICE}
              autoComplete="off"
              spellCheck={false}
              className="bg-surface font-bold"
            />
          </label>
          <Button type="submit" className="px-[22px]">
            Check status
          </Button>
        </form>

        <div aria-live="polite">
          {result && game && (
            <Link
              href={`/orders/${result.invoiceNo}`}
              className="mt-6 flex flex-wrap items-center gap-4 rounded-[20px] border border-transparent bg-surface p-5 text-ink transition-colors hover:border-lime/40 hover:text-ink"
            >
              <GameBadge game={game} size="sm" />
              <div className="min-w-[180px] flex-1">
                <div className="text-[13px] text-muted-foreground">{result.invoiceNo}</div>
                <div className="text-lg font-extrabold">
                  {result.item} · {game.name}
                </div>
              </div>
              <span className={cn("rounded-full px-3 py-1.5 text-[13px] font-extrabold", PILL[result.status])}>
                {STATUS_LABEL[result.status]}
              </span>
            </Link>
          )}
          {result === null && (
            <ErrorNote className="mt-6">
              We couldn’t find that order. Check the number on your receipt and try again.
            </ErrorNote>
          )}
        </div>
      </div>
    </div>
  )
}
