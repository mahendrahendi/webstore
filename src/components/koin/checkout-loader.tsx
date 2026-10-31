"use client"

import { useSearchParams } from "next/navigation"

import { type Game } from "@/lib/catalog"
import { getOrder } from "@/lib/mock-api"
import { useMounted } from "@/hooks/use-mounted"
import { CheckoutView, type CheckoutPrefill } from "@/components/koin/checkout-view"

/**
 * Restores account details from an earlier order:
 *  - "again": keep the account, payment and receipt, pick a new package
 *  - "edit":  keep everything (used by "Change payment method")
 */
export function CheckoutLoader({ game }: { game: Game }) {
  const params = useSearchParams()
  const mounted = useMounted()
  const edit = params.get("edit")
  const fromInvoice = edit ?? params.get("again")
  const mode = edit ? "edit" : "again"

  let prefill: CheckoutPrefill | undefined
  if (mounted && fromInvoice) {
    const o = getOrder(fromInvoice)
    if (o && o.gameSlug === game.slug) {
      prefill = {
        userId: o.userId,
        serverId: o.serverId,
        nickname: o.nickname,
        productIndex: mode === "edit" ? o.productIndex : null,
        paymentMethod: o.paymentMethod,
        contact: o.contact,
      }
    }
  }

  // Remount once the stored order has been read so the form starts pre-filled.
  return <CheckoutView key={prefill ? "prefilled" : "blank"} game={game} prefill={prefill} />
}
