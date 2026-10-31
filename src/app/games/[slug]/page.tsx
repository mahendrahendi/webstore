import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { CheckoutLoader } from "@/components/koin/checkout-loader"
import { CheckoutView } from "@/components/koin/checkout-view"
import { activeGames, getGame } from "@/lib/catalog"

export function generateStaticParams() {
  return activeGames().map((g) => ({ slug: g.slug }))
}

export async function generateMetadata(props: PageProps<"/games/[slug]">): Promise<Metadata> {
  const { slug } = await props.params
  const game = getGame(slug)
  return game ? { title: `Top up ${game.name} ${game.unit}` } : {}
}

export default async function GamePage(props: PageProps<"/games/[slug]">) {
  const { slug } = await props.params
  const game = getGame(slug)
  if (!game) notFound()

  // The blank form is prerendered; ?again= / ?edit= prefill is read on the client.
  return (
    <Suspense fallback={<CheckoutView game={game} />}>
      <CheckoutLoader game={game} />
    </Suspense>
  )
}
