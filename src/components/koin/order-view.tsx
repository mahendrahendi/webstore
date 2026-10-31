"use client"

import { useEffect, useReducer, useState } from "react"
import Link from "next/link"
import { ArrowRight, Check, MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CheckDot, ErrorNote, SummaryList } from "@/components/koin/parts"
import { useNow } from "@/hooks/use-now"
import { type Game, getGame, getPaymentMethod, rp } from "@/lib/catalog"
import { csWhatsAppUrl } from "@/lib/config"
import { clockTime, ms } from "@/lib/format"
import { type Order, eventLabel, getOrder, idDisplay, simulatePaid } from "@/lib/mock-api"

export function OrderView({ invoice }: { invoice: string }) {
  const now = useNow()
  // Bumped after the simulated payment so the page re-reads the store right away.
  const [, refresh] = useReducer((n: number) => n + 1, 0)

  if (now === null) return <div className="min-h-[60vh]" aria-busy />

  const order = getOrder(invoice, now)
  const game = order ? getGame(order.gameSlug) : undefined

  if (!order || !game) {
    return (
      <div className="mx-auto max-w-[1200px] px-5 pt-12 pb-16">
        <div className="max-w-[680px]">
          <h1 className="m-0 font-display text-[clamp(28px,5vw,44px)] font-extrabold tracking-[-0.02em]">
            Order not found
          </h1>
          <ErrorNote className="mt-6">
            We couldn’t find order {invoice}. Check the number on your receipt.
          </ErrorNote>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Button asChild>
              <Link href="/track">Track another order</Link>
            </Button>
            <CsButton invoice={invoice} />
          </div>
        </div>
      </div>
    )
  }

  if (order.status === "success") return <DoneView order={order} game={game} />
  return (
    <PayView
      order={order}
      game={game}
      now={now}
      onPaid={() => {
        simulatePaid(order.invoiceNo)
        refresh()
      }}
    />
  )
}

// ─── waiting for payment / sending ─────────────────────────────────────────

function PayView({ order, game, now, onPaid }: { order: Order; game: Game; now: number; onPaid: () => void }) {
  const pay = getPaymentMethod(order.paymentMethod)
  const total = rp(order.total)
  const isQr = pay.kind === "qr"
  const isVa = pay.kind === "va"
  const waiting = order.status === "created"
  const inFlight = order.status === "paid" || order.status === "processing"
  const expired = order.status === "expired"

  return (
    <div className="mx-auto max-w-[1200px] px-5 pt-7 pb-16">
      <div className="text-[13px] font-bold text-muted-foreground">Order {order.invoiceNo}</div>
      <h1 className="mt-1.5 mb-0 font-display text-[clamp(28px,5vw,48px)] font-extrabold tracking-[-0.02em]">
        {inFlight ? `Paid ${total}` : `Pay ${total}`}
      </h1>

      <div aria-live="polite">
        {waiting && (
          <StatusPill tone="pink">
            <span>Waiting for payment · expires in</span>
            <span className="font-display font-extrabold tabular-nums">{ms((order.expiresAt - now) / 1000)}</span>
          </StatusPill>
        )}
        {inFlight && (
          <StatusPill tone="lime">
            <span className="size-2 animate-pulse rounded-full bg-lime" aria-hidden />
            {order.status === "paid"
              ? "Payment received · starting delivery…"
              : `Sending to ${game.publisher}…`}
          </StatusPill>
        )}
        {expired && <StatusPill tone="muted">This payment window has expired</StatusPill>}
        {(order.status === "failed" || order.status === "refunded") && (
          <StatusPill tone="muted">
            {order.status === "failed" ? "Delivery failed — we’re retrying" : "Refunded to your payment method"}
          </StatusPill>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-6">
        <div className="min-w-0 flex-[1_1_420px] rounded-3xl bg-surface p-6">
          {expired ? (
            <p className="m-0 max-w-[52ch] text-[15px] text-soft">
              Nothing was charged. Start again and your account details will be filled in for you.
            </p>
          ) : isQr ? (
            <div className="flex flex-wrap items-start gap-6">
              <div className="flex size-60 flex-none flex-col justify-between rounded-[20px] bg-ink p-4 text-bg">
                <span className="font-display text-[22px] font-black">QRIS</span>
                <span className="text-xs text-[#4A4860]">Payment QR from the gateway appears here</span>
              </div>
              <ol className="m-0 flex max-w-[36ch] list-decimal flex-col gap-3 pl-5 text-[15px] text-soft">
                <li>Open {pay.id === "qris" ? "your e-wallet or bank app" : pay.name} (or any app that supports QRIS).</li>
                <li>
                  Scan the code and check the amount is <strong className="text-ink">{total}</strong>.
                </li>
                <li>Confirm. This page updates by itself — no need to upload proof.</li>
              </ol>
            </div>
          ) : (
            <PayCode
              label={isVa ? "BCA Virtual Account number" : "Alfamart payment code"}
              code={isVa ? "8808 0812 3456 7890" : "KOIN 4821 9930"}
              help={
                isVa
                  ? "Pay via m-BCA → Transfer → BCA Virtual Account. The amount fills in automatically."
                  : "Show this code at any Alfamart cashier and pay in cash. Keep the receipt."
              }
            />
          )}

          <div className="mt-7 flex flex-wrap gap-2.5">
            {waiting && (
              <>
                <Button onClick={onPaid}>Simulate payment received</Button>
                <Button asChild variant="outline" className="font-bold">
                  <Link href={`/games/${game.slug}?edit=${order.invoiceNo}`}>Change payment method</Link>
                </Button>
              </>
            )}
            {expired && (
              <Button asChild>
                <Link href={`/games/${game.slug}?edit=${order.invoiceNo}`}>Start a new order</Link>
              </Button>
            )}
          </div>
        </div>

        <aside className="flex flex-[1_1_280px] flex-col gap-2.5 self-start">
          <div className="rounded-3xl bg-raised p-[22px]">
            <SummaryList
              rows={[
                { label: "Game", value: game.name },
                { label: "Account", value: order.nickname, strong: true },
                { label: "ID", value: idDisplay(order), numeric: true },
                { label: "Item", value: order.item, strong: true },
                { label: "Method", value: pay.name },
              ]}
            />
          </div>
          <CsButton invoice={order.invoiceNo} />
        </aside>
      </div>
    </div>
  )
}

function PayCode({ label, code, help }: { label: string; code: string; help: string }) {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(t)
  }, [copied])

  return (
    <>
      <div className="text-[13px] font-bold text-muted-foreground">{label}</div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <span className="font-display text-[clamp(22px,4vw,32px)] font-extrabold tracking-[0.03em] tabular-nums">
          {code}
        </span>
        <Button
          variant="tonal"
          size="sm"
          onClick={() => {
            navigator.clipboard?.writeText(code.replace(/\s/g, "")).catch(() => {})
            setCopied(true)
          }}
        >
          {copied ? "Copied ✓" : "Copy"}
        </Button>
      </div>
      <p className="mt-4 mb-0 max-w-[52ch] text-[15px] text-soft">{help}</p>
    </>
  )
}

// ─── delivered ─────────────────────────────────────────────────────────────

function DoneView({ order, game }: { order: Order; game: Game }) {
  const pay = getPaymentMethod(order.paymentMethod)
  const timeline = order.events.filter((e) => e.status !== "created")

  return (
    <>
      <div className="mx-auto max-w-[1200px] px-5 pt-6">
        <section className="rounded-[28px] bg-lime p-[clamp(28px,5vw,56px)] text-bg">
          <div className="inline-flex items-center gap-2 rounded-full bg-bg px-3 py-1.5 text-[13px] font-extrabold text-lime">
            <Check size={14} strokeWidth={3} aria-hidden />
            Delivered · {order.invoiceNo}
          </div>
          <h1 className="mt-[18px] mb-0 font-display text-[clamp(36px,7vw,84px)] leading-[0.98] font-black tracking-[-0.035em] text-balance">
            {order.item} sent to {order.nickname}. GG!
          </h1>
          <p className="mt-[18px] mb-0 max-w-[48ch] text-lg font-semibold">
            Open {game.name} — they’re already in your account.
          </p>
        </section>
      </div>

      <div className="mx-auto flex max-w-[1200px] flex-wrap gap-6 px-5 pt-6 pb-16">
        <div className="flex-[1_1_360px] rounded-3xl bg-surface p-[22px]">
          <h2 className="mt-0 mb-2 font-display text-base font-bold">Timeline</h2>
          <ol className="m-0 list-none p-0">
            {timeline.map((e) => (
              <li key={e.status} className="flex items-center gap-3.5 border-t border-white/8 py-3">
                <CheckDot size="sm" />
                <span className="flex-1 font-bold">{eventLabel(e, order, game)}</span>
                <time dateTime={new Date(e.at).toISOString()} className="text-[13px] text-muted-foreground tabular-nums">
                  {clockTime(e.at)}
                </time>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-[1_1_320px] flex-col gap-2.5">
          <div className="rounded-3xl bg-raised p-[22px]">
            <SummaryList
              rows={[
                { label: "Paid", value: rp(order.total), strong: true },
                { label: "Method", value: pay.name },
                { label: "Receipt", value: order.contact || "Not requested" },
              ]}
            />
          </div>
          <Button asChild size="lg" className="text-[15px]">
            <Link href={`/games/${game.slug}?again=${order.invoiceNo}`}>
              Top up {order.nickname} again
              <ArrowRight size={20} strokeWidth={2.5} className="ml-auto" aria-hidden />
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-2xl font-bold">
            <Link href="/">Browse other games</Link>
          </Button>
          <CsButton invoice={order.invoiceNo} />
        </div>
      </div>
    </>
  )
}

// ─── shared ────────────────────────────────────────────────────────────────

function StatusPill({ tone, children }: { tone: "pink" | "lime" | "muted"; children: React.ReactNode }) {
  const tones = {
    pink: "bg-pink/12 text-pink-soft",
    lime: "bg-lime/12 text-lime",
    muted: "bg-white/8 text-soft",
  }
  return (
    <div className={`mt-3 inline-flex items-center gap-2.5 rounded-full px-3.5 py-2 text-sm font-bold ${tones[tone]}`}>
      {children}
    </div>
  )
}

function CsButton({ invoice }: { invoice: string }) {
  return (
    <a
      href={csWhatsAppUrl(invoice)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 self-start px-2 py-1 text-sm font-bold text-violet hover:text-violet-hover"
    >
      <MessageCircle size={16} strokeWidth={2} aria-hidden />
      Need help? Chat with CS on WhatsApp
    </a>
  )
}
