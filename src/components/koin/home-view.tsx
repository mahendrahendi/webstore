"use client"

import { useState } from "react"
import Link from "next/link"
import { Lock, RotateCcw, Search, ShieldCheck, Zap, type LucideIcon } from "lucide-react"

import { type Game, priceOf, rp } from "@/lib/catalog"
import { cn } from "@/lib/utils"

const FEATURES: { icon: LucideIcon; title: string; sub: string; tone: string }[] = [
  { icon: Zap, title: "Instant, 24/7", sub: "Lands in ~30 seconds", tone: "bg-lime/12 text-lime" },
  { icon: ShieldCheck, title: "Name check first", sub: "No wrong-account top-ups", tone: "bg-[rgba(139,92,246,0.18)] text-violet" },
  { icon: RotateCcw, title: "Auto refund", sub: "If it’s not delivered in 1h", tone: "bg-pink/15 text-pink-soft" },
  { icon: Lock, title: "Licensed payments", sub: "QRIS, e-wallets, bank VA", tone: "bg-[rgba(61,210,255,0.14)] text-cyan" },
]

const STEPS = [
  { title: "Drop your player ID", body: "We find your in-game name so you know it’s the right account.", tone: "text-lime" },
  { title: "Pick a pack, pay your way", body: "QRIS, GoPay, DANA, OVO, ShopeePay, bank VA or Alfamart.", tone: "text-violet" },
  { title: "GG — go play", body: "Credits land in about 30 seconds. Receipt on WhatsApp.", tone: "text-pink-soft" },
]

export function HomeView({ games }: { games: Game[] }) {
  const [query, setQuery] = useState("")
  const q = query.trim().toLowerCase()
  const shown = games.filter(
    (g) => !q || g.name.toLowerCase().includes(q) || g.unit.toLowerCase().includes(q)
  )

  return (
    <>
      <section className="mx-auto max-w-[1200px] px-5 pt-12 pb-8">
        <div className="mb-[18px] inline-flex items-center gap-2 text-[13px] font-bold text-muted-foreground">
          <span aria-hidden className="size-2 rounded-full bg-lime shadow-[0_0_12px_var(--koin-lime)]" />
          All systems online · avg delivery 30 sec
        </div>
        <h1 className="m-0 max-w-[14ch] font-display text-[clamp(40px,7.5vw,88px)] leading-[0.98] font-black tracking-[-0.03em] text-balance">
          Top up. <span className="text-lime">Back in</span> the game.
        </h1>
        <p className="mt-5 mb-0 max-w-[46ch] text-lg leading-normal text-pretty text-soft">
          Diamonds, UC and credits in seconds. No login, no password — just your player ID. We show
          your in-game name before you pay.
        </p>
        <label className="mt-7 flex min-h-[58px] max-w-[560px] items-center gap-3 rounded-2xl border border-white/10 bg-surface px-[18px] transition-colors hover:border-lime/50 focus-within:border-lime/50">
          <Search size={20} strokeWidth={2} className="flex-none text-muted-foreground" aria-hidden />
          <span className="sr-only">Search games</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a game — Mobile Legends, Free Fire…"
            className="min-h-[54px] min-w-0 flex-1 bg-transparent text-base text-ink outline-none focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
        </label>
      </section>

      <section className="mx-auto max-w-[1200px] px-5" aria-label="Why KOIN">
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-2.5 p-0">
          {FEATURES.map(({ icon: Icon, title, sub, tone }) => (
            <li key={title} className="flex items-center gap-3 rounded-2xl bg-surface px-[18px] py-4">
              <span className={cn("flex size-10 flex-none items-center justify-center rounded-xl", tone)}>
                <Icon size={20} strokeWidth={2} aria-hidden />
              </span>
              <div>
                <div className="font-extrabold">{title}</div>
                <div className="text-[13px] text-muted-foreground">{sub}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 py-12" aria-labelledby="pick-game">
        <div className="mb-[18px] flex flex-wrap items-baseline gap-3.5">
          <h2 id="pick-game" className="m-0 font-display text-[26px] font-extrabold">
            Pick your game
          </h2>
          <span className="text-sm text-muted-foreground">
            {shown.length} games · prices in Rupiah, tax included
          </span>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-3">
          {shown.map((g) => (
            <GameTile key={g.slug} game={g} />
          ))}
        </div>
        {shown.length === 0 && (
          <div className="flex flex-wrap items-center gap-3 py-8 text-[15px]">
            No game matches “{query}”.
            <button
              type="button"
              onClick={() => setQuery("")}
              className="cursor-pointer font-extrabold text-lime"
            >
              Show all games
            </button>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-[1200px] px-5 pb-14" aria-labelledby="how-it-works">
        <h2 id="how-it-works" className="mt-0 mb-[18px] font-display text-[26px] font-extrabold">
          3 steps. That’s it.
        </h2>
        <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3 p-0">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-[20px] bg-surface p-[22px]">
              <div className={cn("font-display text-4xl leading-none font-black", s.tone)}>{i + 1}</div>
              <div className="mt-3 text-lg font-extrabold">{s.title}</div>
              <p className="mt-1.5 mb-0 text-sm text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}

function GameTile({ game }: { game: Game }) {
  return (
    <Link
      href={`/games/${game.slug}`}
      className="flex flex-col gap-2.5 rounded-[20px] border border-white/6 bg-surface p-2.5 text-ink transition-[transform,border-color] duration-150 hover:-translate-y-1 hover:border-lime/60 hover:text-ink"
    >
      <div
        className="flex aspect-square flex-col justify-between rounded-[14px] p-3 text-bg"
        style={{ background: game.color }}
      >
        <div className="flex min-h-[22px] justify-end">
          {game.tag && (
            <span className="rounded-full bg-bg px-2 py-1 text-[11px] font-extrabold text-ink">
              {game.tag}
            </span>
          )}
        </div>
        <span aria-hidden className="font-display text-[44px] leading-[0.9] font-black tracking-[-0.04em]">
          {game.short}
        </span>
      </div>
      <div className="px-1 pb-1">
        <div className="text-[15px] leading-[1.25] font-extrabold">{game.name}</div>
        <div className="text-[13px] text-muted-foreground">
          {game.unit} · from {rp(priceOf(game, 0, false).price)}
        </div>
      </div>
    </Link>
  )
}
