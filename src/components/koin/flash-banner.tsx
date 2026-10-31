"use client"

import { Zap } from "lucide-react"

import { useNow } from "@/hooks/use-now"
import { hms, secondsToMidnight } from "@/lib/format"

export function FlashBanner() {
  const now = useNow()
  return (
    <div className="mx-auto mt-4 max-w-[1200px] px-5">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-pink px-[18px] py-3 text-sm font-bold text-bg">
        <Zap size={18} strokeWidth={2.5} aria-hidden />
        <span className="font-display font-extrabold tracking-[0.04em] uppercase">Flash sale</span>
        <span>−10% on the third pack in every game</span>
        <span
          className="ml-auto rounded-lg bg-bg px-2.5 py-1 font-display font-extrabold text-pink tabular-nums"
          aria-label="Time left in the flash sale"
        >
          {now === null ? "--:--:--" : hms(secondsToMidnight(now))}
        </span>
      </div>
    </div>
  )
}
