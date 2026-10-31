/**
 * Static catalog for the UI build. Shapes follow the planned data model
 * (games / products); later this comes from Payload CMS + Digiflazz price sync.
 * Prices are rough Rupiah estimates carried over from the design prototype.
 */

export type Game = {
  slug: string
  name: string
  /** Two-letter tile label — we don't use publisher logos. */
  short: string
  publisher: string
  unit: string
  /** Mobile Legends style games need a Server/Zone ID next to the User ID. */
  needsServerId: boolean
  tag?: string
  color: string
  help: string
  active: boolean
  products: Product[]
}

export type Product = {
  sku: string
  gameSlug: string
  amount: number
  /** Sell price before any promo, in Rupiah. */
  sellPrice: number
  active: boolean
}

export type PaymentKind = "qr" | "va" | "store"

export type PaymentMethod = {
  id: string
  name: string
  sub: string
  kind: PaymentKind
  /** Percentage fee, e.g. 0.7 means 0.7%. */
  feePct?: number
  /** Flat fee in Rupiah. */
  feeFlat?: number
}

type GameSeed = Omit<Game, "products" | "active"> & {
  /** Rupiah per 100 units — only used to derive sample prices. */
  rate: number
  amounts: number[]
}

const SEEDS: GameSeed[] = [
  { slug: "mobile-legends", name: "Mobile Legends", short: "ML", publisher: "Moonton", unit: "Diamonds", needsServerId: true, tag: "#1 pick", color: "#5B8CFF", rate: 225, amounts: [86, 172, 257, 344, 429, 514, 706, 1050], help: "Open Mobile Legends and tap your avatar (top left). The numbers under your name are your User ID, and the number in brackets is your Zone ID." },
  { slug: "free-fire", name: "Free Fire", short: "FF", publisher: "Garena", unit: "Diamonds", needsServerId: false, tag: "Hot", color: "#FF8A3D", rate: 143, amounts: [70, 140, 355, 720, 1450, 3640], help: "Open Free Fire and tap your profile. Your Player ID is under your nickname." },
  { slug: "pubg-mobile", name: "PUBG Mobile", short: "PB", publisher: "Level Infinite", unit: "UC", needsServerId: false, color: "#F7C948", rate: 250, amounts: [60, 325, 660, 1800, 3850, 8100], help: "Open PUBG Mobile, tap your avatar. Copy the number labelled ID." },
  { slug: "genshin-impact", name: "Genshin Impact", short: "GI", publisher: "HoYoverse", unit: "Genesis Crystals", needsServerId: false, color: "#5EE0C8", rate: 270, amounts: [60, 330, 1090, 2240, 3880, 8080], help: "Open the Paimon menu — your UID is at the bottom right of the screen." },
  { slug: "honor-of-kings", name: "Honor of Kings", short: "HK", publisher: "Level Infinite", unit: "Tokens", needsServerId: false, color: "#E8B04A", rate: 200, amounts: [80, 240, 400, 800, 1200, 2400], help: "Tap your avatar on the lobby screen and copy your Player ID." },
  { slug: "valorant", name: "Valorant", short: "VA", publisher: "Riot Games", unit: "VP", needsServerId: false, color: "#FF5A6A", rate: 115, amounts: [475, 1000, 2050, 3650, 5350, 11000], help: "Use the numeric account ID shown in your Riot account settings." },
  { slug: "roblox", name: "Roblox", short: "RB", publisher: "Roblox Corp.", unit: "Robux", needsServerId: false, color: "#C6FF3D", rate: 160, amounts: [80, 400, 800, 1700, 4500, 10000], help: "Open your profile on roblox.com — the number in the page address is your User ID." },
  { slug: "honkai-star-rail", name: "Honkai: Star Rail", short: "HS", publisher: "HoYoverse", unit: "Oneiric Shards", needsServerId: false, color: "#B79CFF", rate: 270, amounts: [60, 330, 1090, 2240, 3880, 8080], help: "Open the phone menu — your UID is under your Trailblazer name." },
]

/**
 * The MVP plan launches with Mobile Legends and Free Fire only. The design
 * shows all eight; flip `active` to false here to hide the rest.
 */
const ACTIVE_SLUGS = "all" as string[] | "all" // e.g. ["mobile-legends", "free-fire"]

export const GAMES: Game[] = SEEDS.map(({ rate, amounts, ...g }) => ({
  ...g,
  active: ACTIVE_SLUGS === "all" || ACTIVE_SLUGS.includes(g.slug),
  products: amounts.map((amount) => ({
    sku: `${g.slug}-${amount}`,
    gameSlug: g.slug,
    amount,
    sellPrice: Math.round((amount * rate) / 100) * 100,
    active: true,
  })),
}))

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "qris", name: "QRIS", sub: "Any e-wallet or bank app", feePct: 0.7, kind: "qr" },
  { id: "gopay", name: "GoPay", sub: "Pay in the Gojek app", feePct: 2, kind: "qr" },
  { id: "dana", name: "DANA", sub: "DANA balance", feePct: 1.5, kind: "qr" },
  { id: "ovo", name: "OVO", sub: "OVO balance", feePct: 1.5, kind: "qr" },
  { id: "shopeepay", name: "ShopeePay", sub: "Pay in the Shopee app", feePct: 1.5, kind: "qr" },
  { id: "bca-va", name: "BCA Virtual Account", sub: "m-BCA, KlikBCA or ATM", feeFlat: 4000, kind: "va" },
  { id: "alfamart", name: "Alfamart", sub: "Cash at the counter", feeFlat: 2500, kind: "store" },
]

/** Flash sale: −10% on the third pack of every game, until midnight. */
export const FLASH_SALE_ENABLED = process.env.NEXT_PUBLIC_FLASH_SALE !== "off"
export const FLASH_SALE_INDEX = 2
const FLASH_SALE_FACTOR = 0.9

export function activeGames() {
  return GAMES.filter((g) => g.active)
}

export function getGame(slug: string) {
  return GAMES.find((g) => g.slug === slug && g.active)
}

export function getPaymentMethod(id: string) {
  return PAYMENT_METHODS.find((p) => p.id === id) ?? PAYMENT_METHODS[0]
}

export function priceOf(game: Game, index: number, flash = FLASH_SALE_ENABLED) {
  const base = game.products[index].sellPrice
  const deal = flash && index === FLASH_SALE_INDEX
  const price = deal ? Math.round((base * FLASH_SALE_FACTOR) / 100) * 100 : base
  return { base, deal, price }
}

/** Fee rounded up to the next Rp 100. */
export function feeOf(method: PaymentMethod, price: number) {
  if (method.feeFlat) return method.feeFlat
  return Math.ceil((price * (method.feePct ?? 0)) / 10000) * 100
}

export function feeLabel(method: PaymentMethod, price: number) {
  if (method.feeFlat) return `+${rp(method.feeFlat)}`
  if (price) return `+${rp(feeOf(method, price))}`
  return `+${String(method.feePct).replace(".", ",")}%`
}

export function rp(n: number) {
  return "Rp " + Math.round(n).toLocaleString("id-ID")
}

export function formatAmount(n: number) {
  return n.toLocaleString("id-ID")
}

export function itemLabel(game: Game, product: Product) {
  return `${formatAmount(product.amount)} ${game.unit}`
}

export const PACKAGE_TAGS: Record<number, string> = { 1: "Popular", 3: "Best value" }
