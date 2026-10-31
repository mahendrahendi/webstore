"use client"

import { useSyncExternalStore } from "react"

const noop = () => () => {}

/** false on the server and during hydration, true afterwards. */
export function useMounted() {
  return useSyncExternalStore(noop, () => true, () => false)
}
