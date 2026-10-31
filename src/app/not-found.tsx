import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[1200px] px-5 pt-12 pb-16">
      <h1 className="m-0 font-display text-[clamp(28px,5vw,44px)] font-extrabold tracking-[-0.02em]">
        Page not found
      </h1>
      <p className="mt-2.5 mb-6 text-base text-soft">That game or page isn’t on KOIN.</p>
      <Button asChild>
        <Link href="/">Back to games</Link>
      </Button>
    </div>
  )
}
