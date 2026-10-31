import { Suspense } from "react"
import type { Metadata } from "next"

import { OrderView } from "@/components/koin/order-view"

export const metadata: Metadata = { title: "Your order", robots: { index: false } }

async function Order({ params }: { params: PageProps<"/orders/[invoice]">["params"] }) {
  const { invoice } = await params
  return <OrderView invoice={decodeURIComponent(invoice)} />
}

export default function OrderPage(props: PageProps<"/orders/[invoice]">) {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" aria-busy />}>
      <Order params={props.params} />
    </Suspense>
  )
}
