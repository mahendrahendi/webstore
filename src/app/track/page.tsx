import type { Metadata } from "next"

import { TrackView } from "@/components/koin/track-view"

export const metadata: Metadata = { title: "Track your order" }

export default function TrackPage() {
  return <TrackView />
}
