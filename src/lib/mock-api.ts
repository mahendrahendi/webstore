/**
 * MOCK backend for the UI-only build. Everything here runs in the browser and
 * keeps orders in localStorage. Each function matches a planned server
 * endpoint, so the pages keep working when these are swapped for real calls:
 *
 *   checkNickname  → POST /api/nickname   (Digiflazz nickname check, Turnstile + rate limit)
 *   createOrder    → POST /api/orders     (creates order + Tripay/Duitku invoice)
 *   getOrder       → GET  /api/orders/:invoice
 *   simulatePaid   → (none — in production only the payment webhook marks an order paid)
 */

import {
  type Game,
  feeOf,
  getGame,
  getPaymentMethod,
  itemLabel,
  priceOf,
} from "@/lib/catalog"

export type OrderStatus =
  | "created"
  | "paid"
  | "processing"
  | "success"
  | "failed"
  | "refunded"
  | "expired"

export type OrderEvent = { status: OrderStatus; at: number }

export type Order = {
  invoiceNo: string
  gameSlug: string
  userId: string
  serverId: string
  nickname: string
  productSku: string
  productIndex: number
  item: string
  price: number
  fee: number
  total: number
  paymentMethod: string
  paymentRef: string
  contact: string
  status: OrderStatus
  createdAt: number
  expiresAt: number
  events: OrderEvent[]
}

export const PAYMENT_WINDOW_MS = 15 * 60 * 1000
const STORAGE_KEY = "koin.orders.v1"
const NICKS = ["ShadowRaja", "KopiSusuGG", "LunaMain99", "Rizky.EXP", "NasiGorengPro", "BimaSakti7"]

/** Mock fulfilment timing after the (simulated) payment webhook. */
const MS_TO_PROCESSING = 2500
const MS_TO_SUCCESS = 6000

export const DEMO_INVOICE = "KN-2611-48210"

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// ─── nickname check ────────────────────────────────────────────────────────

export type NicknameResult = { ok: true; nickname: string } | { ok: false }

export async function checkNickname(
  game: Game,
  userId: string,
  serverId: string
): Promise<NicknameResult> {
  if (userId.length < 5 || (game.needsServerId && serverId.length < 3)) {
    return { ok: false }
  }
  await sleep(900)
  const sum = [...(userId + serverId)].reduce((a, c) => a + Number(c), 0)
  return { ok: true, nickname: NICKS[sum % NICKS.length] }
}

// ─── order store ───────────────────────────────────────────────────────────

function readAll(): Record<string, Order> {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const all = raw ? (JSON.parse(raw) as Record<string, Order>) : {}
    if (!all[DEMO_INVOICE]) all[DEMO_INVOICE] = demoOrder()
    return all
  } catch {
    return { [DEMO_INVOICE]: demoOrder() }
  }
}

function writeAll(all: Record<string, Order>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    // Storage blocked (private mode etc.) — orders just won't survive a reload.
  }
}

function save(order: Order) {
  const all = readAll()
  all[order.invoiceNo] = order
  writeAll(all)
}

function demoOrder(): Order {
  const game = getGame("mobile-legends")!
  const at = Date.now() - 60 * 60 * 1000
  const { price } = priceOf(game, 1, false)
  const fee = feeOf(getPaymentMethod("qris"), price)
  return {
    invoiceNo: DEMO_INVOICE,
    gameSlug: game.slug,
    userId: "84120377",
    serverId: "2041",
    nickname: "KopiSusuGG",
    productSku: game.products[1].sku,
    productIndex: 1,
    item: itemLabel(game, game.products[1]),
    price,
    fee,
    total: price + fee,
    paymentMethod: "qris",
    paymentRef: "MOCK-QRIS-DEMO",
    contact: "",
    status: "success",
    createdAt: at,
    expiresAt: at + PAYMENT_WINDOW_MS,
    events: [
      { status: "created", at },
      { status: "paid", at: at + 20000 },
      { status: "processing", at: at + 23000 },
      { status: "success", at: at + 41000 },
    ],
  }
}

function newInvoiceNo() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  const rand = 10000 + Math.floor(Math.random() * 89999)
  return `KN-${pad(d.getMonth() + 1)}${pad(d.getDate())}-${rand}`
}

/** Moves a mock order along its lifecycle based on the clock. */
function advance(order: Order, now: number): Order {
  const last = order.events[order.events.length - 1]
  if (order.status === "created" && now >= order.expiresAt) {
    return { ...order, status: "expired", events: [...order.events, { status: "expired", at: order.expiresAt }] }
  }
  if (order.status === "paid" && now >= last.at + MS_TO_PROCESSING) {
    const o: Order = { ...order, status: "processing", events: [...order.events, { status: "processing", at: last.at + MS_TO_PROCESSING }] }
    return advance(o, now)
  }
  if (order.status === "processing" && now >= last.at + (MS_TO_SUCCESS - MS_TO_PROCESSING)) {
    return { ...order, status: "success", events: [...order.events, { status: "success", at: last.at + (MS_TO_SUCCESS - MS_TO_PROCESSING) }] }
  }
  return order
}

export type CreateOrderInput = {
  gameSlug: string
  userId: string
  serverId: string
  nickname: string
  productIndex: number
  paymentMethod: string
  contact: string
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const game = getGame(input.gameSlug)
  if (!game) throw new Error("Unknown game")
  const product = game.products[input.productIndex]
  const { price } = priceOf(game, input.productIndex)
  const fee = feeOf(getPaymentMethod(input.paymentMethod), price)
  const now = Date.now()
  const order: Order = {
    invoiceNo: newInvoiceNo(),
    gameSlug: game.slug,
    userId: input.userId,
    serverId: game.needsServerId ? input.serverId : "",
    nickname: input.nickname,
    productSku: product.sku,
    productIndex: input.productIndex,
    item: itemLabel(game, product),
    price,
    fee,
    total: price + fee,
    paymentMethod: input.paymentMethod,
    paymentRef: `MOCK-${input.paymentMethod.toUpperCase()}-${now}`,
    contact: input.contact.trim(),
    status: "created",
    createdAt: now,
    expiresAt: now + PAYMENT_WINDOW_MS,
    events: [{ status: "created", at: now }],
  }
  save(order)
  return order
}

/**
 * Reads an order and derives its current mock status from the clock.
 * Pure read (no writes), so it is safe to call while rendering.
 */
export function getOrder(invoiceNo: string, now = Date.now()): Order | null {
  const all = readAll()
  const key = Object.keys(all).find((k) => k.toLowerCase() === invoiceNo.trim().toLowerCase())
  if (!key) return null
  return advance(all[key], now)
}

/** Demo only: stands in for the payment gateway webhook. */
export function simulatePaid(invoiceNo: string): Order | null {
  const order = getOrder(invoiceNo)
  if (!order || order.status !== "created") return order
  const paid: Order = { ...order, status: "paid", events: [...order.events, { status: "paid", at: Date.now() }] }
  save(paid)
  return paid
}

// ─── display helpers ───────────────────────────────────────────────────────

export function idDisplay(order: Pick<Order, "userId" | "serverId">) {
  return order.userId + (order.serverId ? ` (${order.serverId})` : "")
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  created: "Waiting for payment",
  paid: "Payment received",
  processing: "Sending",
  success: "Delivered",
  failed: "Failed — retrying",
  refunded: "Refunded",
  expired: "Expired",
}

export function eventLabel(e: OrderEvent, order: Order, game: Game | undefined) {
  switch (e.status) {
    case "created": return "Order created"
    case "paid": return "Payment received"
    case "processing": return `Sent to ${game?.publisher ?? "publisher"}`
    case "success": return `Delivered to ${order.nickname || "account"}`
    case "failed": return "Delivery failed"
    case "refunded": return "Refunded"
    case "expired": return "Payment window expired"
  }
}
