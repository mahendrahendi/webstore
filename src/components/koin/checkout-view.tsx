"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Gem, RotateCcw, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { CheckDot, ErrorNote, GameBadge, StepCard, SummaryList } from "@/components/koin/parts"
import {
  type Game,
  PACKAGE_TAGS,
  PAYMENT_METHODS,
  feeLabel,
  feeOf,
  formatAmount,
  getPaymentMethod,
  itemLabel,
  priceOf,
  rp,
} from "@/lib/catalog"
import { checkNickname, createOrder, idDisplay } from "@/lib/mock-api"
import { cn } from "@/lib/utils"

type IdStatus = "idle" | "checking" | "ok" | "err"

export type CheckoutPrefill = {
  userId: string
  serverId: string
  nickname: string
  productIndex: number | null
  paymentMethod: string
  contact: string
}

const digits = (v: string, max: number) => v.replace(/\D/g, "").slice(0, max)

export function CheckoutView({ game, prefill }: { game: Game; prefill?: CheckoutPrefill }) {
  const router = useRouter()

  const [userId, setUserId] = useState(prefill?.userId ?? "")
  const [serverId, setServerId] = useState(prefill?.serverId ?? "")
  const [idStatus, setIdStatus] = useState<IdStatus>(prefill?.nickname ? "ok" : "idle")
  const [nickname, setNickname] = useState(prefill?.nickname ?? "")
  const [pkgIdx, setPkgIdx] = useState<number | null>(prefill?.productIndex ?? null)
  const [payId, setPayId] = useState(prefill?.paymentMethod ?? PAYMENT_METHODS[0].id)
  const [contact, setContact] = useState(prefill?.contact ?? "")
  const [showHelp, setShowHelp] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const checkSeq = useRef(0)

  const idOk = idStatus === "ok"
  const pay = getPaymentMethod(payId)
  const product = pkgIdx == null ? null : game.products[pkgIdx]
  const price = pkgIdx == null ? 0 : priceOf(game, pkgIdx).price
  const fee = price ? feeOf(pay, price) : 0
  const item = product ? itemLabel(game, product) : "—"
  const missing = !idOk
    ? "Check your player ID first (step 1)."
    : pkgIdx == null
      ? "Pick a package (step 2)."
      : ""
  const idFull = idDisplay({ userId, serverId: game.needsServerId ? serverId : "" })

  function editId(next: { userId?: string; serverId?: string }) {
    checkSeq.current++ // drop any lookup still in flight
    if (next.userId !== undefined) setUserId(next.userId)
    if (next.serverId !== undefined) setServerId(next.serverId)
    setIdStatus("idle")
    setNickname("")
  }

  async function onCheck(e: React.FormEvent) {
    e.preventDefault()
    const seq = ++checkSeq.current
    setIdStatus("checking")
    const res = await checkNickname(game, userId, serverId)
    if (seq !== checkSeq.current) return
    if (res.ok) {
      setNickname(res.nickname)
      setIdStatus("ok")
    } else {
      setIdStatus("err")
    }
  }

  async function onConfirmPay() {
    if (missing || pkgIdx == null || submitting) return
    setSubmitting(true)
    try {
      const order = await createOrder({
        gameSlug: game.slug,
        userId,
        serverId,
        nickname,
        productIndex: pkgIdx,
        paymentMethod: payId,
        contact,
      })
      router.push(`/orders/${order.invoiceNo}`)
    } catch {
      setSubmitting(false)
    }
  }

  const checkLabel =
    idStatus === "checking" ? "Checking…" : idOk ? "Checked ✓" : "Check account"

  return (
    <div className="mx-auto max-w-[1200px] px-5 pt-5 pb-16">
      <Link
        href="/"
        className="mb-3 inline-flex items-center gap-2 py-2 text-sm font-bold text-muted-foreground hover:text-ink"
      >
        <ArrowLeft size={16} strokeWidth={2} aria-hidden />
        All games
      </Link>

      <div className="flex flex-wrap items-center gap-[18px] rounded-3xl bg-surface p-4">
        <GameBadge game={game} size="lg" />
        <div className="min-w-[200px] flex-1">
          <h1 className="m-0 font-display text-[clamp(24px,3.6vw,36px)] font-extrabold tracking-[-0.02em]">
            {game.name}
          </h1>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Chip className="bg-white/8 text-soft">{game.publisher}</Chip>
            <Chip className="bg-lime/12 text-lime">Instant delivery</Chip>
            <Chip className="bg-[rgba(139,92,246,0.18)] text-violet">Name check</Chip>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[1_1_560px] flex-col gap-4">
          {/* 1 — account */}
          <StepCard n={1} state={idOk ? "done" : "todo"} title="Your account">
            <form onSubmit={onCheck} className="flex flex-wrap items-end gap-2.5">
              <label className="flex flex-[2_1_200px] flex-col gap-1.5 text-[13px] font-bold text-muted-foreground">
                {game.needsServerId ? "User ID" : "Player ID"}
                <Input
                  inputMode="numeric"
                  autoComplete="off"
                  value={userId}
                  onChange={(e) => editId({ userId: digits(e.target.value, 12) })}
                  placeholder="e.g. 12345678"
                  className="text-[17px] font-bold tracking-[0.02em]"
                  aria-invalid={idStatus === "err" || undefined}
                />
              </label>
              {game.needsServerId && (
                <label className="flex flex-[1_1_110px] flex-col gap-1.5 text-[13px] font-bold text-muted-foreground">
                  Zone ID
                  <Input
                    inputMode="numeric"
                    autoComplete="off"
                    value={serverId}
                    onChange={(e) => editId({ serverId: digits(e.target.value, 6) })}
                    placeholder="e.g. 2041"
                    className="text-[17px] font-bold"
                    aria-invalid={idStatus === "err" || undefined}
                  />
                </label>
              )}
              <Button type="submit" variant="secondary" press disabled={idStatus === "checking"}>
                {checkLabel}
              </Button>
            </form>

            <div aria-live="polite">
              {idOk && (
                <div className="mt-3.5 flex items-center gap-3.5 rounded-2xl border border-lime/40 bg-lime/10 px-4 py-3.5">
                  <CheckDot size="lg" />
                  <div>
                    <div className="text-[13px] font-bold text-lime">Account found — is this you?</div>
                    <div className="font-display text-xl font-extrabold">{nickname}</div>
                  </div>
                </div>
              )}
            </div>
            {idStatus === "err" && (
              <ErrorNote className="mt-3.5">
                We couldn’t find that account. Check the numbers and try again.
              </ErrorNote>
            )}

            <button
              type="button"
              onClick={() => setShowHelp((v) => !v)}
              aria-expanded={showHelp}
              className="mt-3 cursor-pointer text-sm font-bold text-violet hover:text-violet-hover"
            >
              {showHelp ? "Hide help" : "Where do I find my ID?"}
            </button>
            {showHelp && <p className="mt-2 mb-0 max-w-[60ch] text-sm text-soft">{game.help}</p>}
          </StepCard>

          {/* 2 — package */}
          <StepCard n={2} state={pkgIdx != null ? "done" : "todo"} title={`Choose ${game.unit}`}>
            <div
              role="radiogroup"
              aria-labelledby="step-2"
              className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5"
            >
              {game.products.map((p, i) => {
                const pr = priceOf(game, i)
                const sel = pkgIdx === i
                const tag = PACKAGE_TAGS[i]
                return (
                  <button
                    key={p.sku}
                    type="button"
                    role="radio"
                    aria-checked={sel}
                    onClick={() => setPkgIdx(i)}
                    className={cn(
                      "relative flex min-h-[136px] cursor-pointer flex-col gap-1 rounded-2xl border-2 p-3.5 text-left text-ink transition-transform duration-[120ms] hover:-translate-y-0.5 active:scale-[0.97]",
                      sel ? "border-lime bg-lime/10" : "border-white/8 bg-bg"
                    )}
                  >
                    <div className="flex min-h-[22px] flex-wrap gap-1.5">
                      {pr.deal && (
                        <span className="rounded-full bg-pink px-2 py-[3px] text-[11px] font-extrabold text-bg">
                          −10%
                        </span>
                      )}
                      {tag && (
                        <span className="rounded-full bg-[rgba(139,92,246,0.22)] px-2 py-[3px] text-[11px] font-extrabold text-violet-tag">
                          {tag}
                        </span>
                      )}
                    </div>
                    <div className="mt-auto flex items-center gap-1.5">
                      <Gem size={18} strokeWidth={2.2} style={{ color: game.color }} className="flex-none" aria-hidden />
                      <span className="font-display text-2xl leading-none font-extrabold tracking-[-0.02em]">
                        {formatAmount(p.amount)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">{game.unit}</div>
                    <div className="mt-0.5 flex flex-wrap items-baseline gap-1.5">
                      <span className="text-[15px] font-extrabold">{rp(pr.price)}</span>
                      {pr.deal && (
                        <span className="text-xs text-faint line-through">
                          <span className="sr-only">was </span>
                          {rp(pr.base)}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </StepCard>

          {/* 3 — payment */}
          <StepCard n={3} state="set" title="Pay with">
            <div
              role="radiogroup"
              aria-labelledby="step-3"
              className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-2"
            >
              {PAYMENT_METHODS.map((m) => {
                const sel = m.id === payId
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={sel}
                    onClick={() => setPayId(m.id)}
                    className={cn(
                      "flex min-h-[62px] cursor-pointer items-center gap-3 rounded-[14px] border-2 px-3.5 py-3 text-left text-ink transition-colors",
                      sel ? "border-lime bg-lime/8" : "border-white/8 bg-bg hover:border-lime/50"
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "size-5 flex-none rounded-full border-2 shadow-[inset_0_0_0_3px_var(--koin-surface)]",
                        sel ? "border-lime bg-lime" : "border-white/25 bg-transparent"
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-extrabold">{m.name}</span>
                      <span className="block text-xs text-muted-foreground">{m.sub}</span>
                    </span>
                    <span className="text-xs font-bold text-soft tabular-nums">
                      <span className="sr-only">Fee </span>
                      {feeLabel(m, price)}
                    </span>
                  </button>
                )
              })}
            </div>
          </StepCard>

          {/* 4 — receipt */}
          <StepCard
            n={4}
            state="optional"
            title="Receipt"
            aside={<span className="text-[13px] font-bold text-faint">Optional</span>}
          >
            <label className="flex max-w-[420px] flex-col gap-1.5 text-[13px] font-bold text-muted-foreground">
              WhatsApp number or email
              <Input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="0812… or you@mail.com"
                autoComplete="email"
              />
            </label>
          </StepCard>
        </div>

        <aside className="sticky top-[84px] flex flex-[1_1_300px] flex-col gap-3" aria-label="Order summary">
          <div className="rounded-3xl border border-white/8 bg-raised p-[22px]">
            <div className="mb-3.5 font-display text-[15px] font-bold">Your order</div>
            <SummaryList
              rows={[
                { label: "Account", value: idOk ? nickname : "—", strong: true },
                { label: "Item", value: item, strong: true },
                { label: "Payment", value: pay.name },
                { label: "Price", value: price ? rp(price) : "—", numeric: true },
                { label: "Fee", value: price ? rp(fee) : "—", numeric: true },
              ]}
            />
            <div className="my-4 h-px bg-white/10" />
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-extrabold text-muted-foreground">Total</span>
              <span className="font-display text-[26px] font-extrabold tracking-[-0.02em] tabular-nums">
                {price ? rp(price + fee) : "—"}
              </span>
            </div>
            <Button
              size="lg"
              disabled={!!missing}
              onClick={() => setConfirmOpen(true)}
              aria-describedby={missing ? "buy-missing" : undefined}
              className={cn(
                "mt-4 w-full justify-start active:scale-[0.98] disabled:opacity-40",
                !missing && "shadow-[0_8px_28px_rgba(198,255,61,0.35)]"
              )}
            >
              Buy now
              <ArrowRight size={20} strokeWidth={2.5} className="ml-auto" aria-hidden />
            </Button>
            {missing && (
              <div id="buy-missing" className="mt-2.5 text-[13px] font-semibold text-pink-text">
                {missing}
              </div>
            )}
          </div>
          <ul className="m-0 flex list-none flex-col gap-2.5 px-2 py-1 text-[13px] text-soft">
            <li className="flex gap-2.5">
              <Shield size={16} strokeWidth={2} className="mt-0.5 flex-none text-lime" aria-hidden />
              <span>We never ask for your game password or login.</span>
            </li>
            <li className="flex gap-2.5">
              <RotateCcw size={16} strokeWidth={2} className="mt-0.5 flex-none text-lime" aria-hidden />
              <span>Not delivered in 1 hour? Automatic full refund.</span>
            </li>
          </ul>
        </aside>
      </div>

      <Dialog open={confirmOpen} onOpenChange={(o) => !submitting && setConfirmOpen(o)}>
        <DialogContent showCloseButton={false}>
          <DialogTitle>Check before you pay</DialogTitle>
          <div className="flex items-center gap-3.5 rounded-[18px] bg-bg p-4">
            <GameBadge game={game} size="md" />
            <div className="min-w-0">
              <div className="text-xs font-bold text-muted-foreground">Sending to</div>
              <div className="font-display text-[22px] leading-[1.15] font-extrabold">{nickname}</div>
              <div className="text-[13px] text-muted-foreground tabular-nums">ID {idFull}</div>
            </div>
          </div>
          <div className="flex justify-between gap-3 text-[15px]">
            <span>{item}</span>
            <strong>{price ? rp(price + fee) : "—"}</strong>
          </div>
          <DialogDescription>Credits can’t be moved to another account once delivered.</DialogDescription>
          <div className="flex flex-wrap gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="min-h-[54px] px-[18px] text-base font-bold" disabled={submitting}>
                Edit
              </Button>
            </DialogClose>
            <Button className="min-h-[54px] flex-1 px-[18px] text-base" onClick={onConfirmPay} disabled={submitting}>
              {submitting ? "Creating order…" : `That’s me — pay ${price ? rp(price + fee) : ""}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Chip({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", className)}>{children}</span>
}
