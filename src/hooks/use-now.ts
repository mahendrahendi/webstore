"use client"

import { useSyncExternalStore } from "react"

// One shared 1-second clock for countdowns. Returns null during SSR and
// hydration so server and client markup always match.
let now = 0
let timer: ReturnType<typeof setInterval> | undefined
const listeners = new Set<() => void>()

function subscribe(cb: () => void) {
  listeners.add(cb)
  if (!timer) {
    now = Date.now()
    timer = setInterval(() => {
      now = Date.now()
      listeners.forEach((l) => l())
    }, 1000)
  }
  return () => {
    listeners.delete(cb)
    if (!listeners.size && timer) {
      clearInterval(timer)
      timer = undefined
      now = 0
    }
  }
}

export function useNow(): number | null {
  return useSyncExternalStore(
    subscribe,
    () => (now === 0 ? null : now),
    () => null
  )
}
