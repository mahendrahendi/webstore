import Link from "next/link"
import { Gem, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/8 bg-[rgba(11,11,18,0.85)] backdrop-blur-[12px]">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-4 px-5 py-3">
        <Link href="/" className="mr-auto flex items-center gap-2.5 text-ink hover:text-ink">
          <span className="flex size-8 -rotate-8 items-center justify-center rounded-[10px] bg-lime text-bg">
            <Gem size={18} strokeWidth={2.5} aria-hidden />
          </span>
          <span className="font-display text-xl font-black tracking-[-0.02em]">KOIN</span>
        </Link>
        <nav aria-label="Main" className="flex flex-wrap items-center gap-1.5">
          <Button asChild variant="ghost" size="pill">
            <Link href="/">Games</Link>
          </Button>
          <Button asChild variant="ghost" size="pill">
            <Link href="/track">Track order</Link>
          </Button>
          <span className="flex items-center gap-1.5 rounded-full bg-lime/10 px-3 py-2 text-xs font-bold text-lime">
            <Lock size={14} strokeWidth={2.5} aria-hidden />
            Secure checkout
          </span>
        </nav>
      </div>
    </header>
  )
}
