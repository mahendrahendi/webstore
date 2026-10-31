const pad = (n: number) => String(n).padStart(2, "0")

/** 00:00:00 */
export function hms(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds))
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`
}

/** 00:00 */
export function ms(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds))
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`
}

/** Wall-clock time of a timestamp, 24h. */
export function clockTime(t: number) {
  const d = new Date(t)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/** Seconds from `now` until the next local midnight. */
export function secondsToMidnight(now: number) {
  const mid = new Date(now)
  mid.setHours(24, 0, 0, 0)
  return Math.floor((mid.getTime() - now) / 1000)
}
