# KOIN storefront (UI)

Next.js 16 (App Router, TypeScript) + Tailwind v4 + shadcn/ui implementation of the
`KOIN Top-Up v2` design (`../project/KOIN Top-Up v2.dc.html`). **UI only** — the backend is mocked.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Routes

| Route | Screen |
| --- | --- |
| `/` | Home: flash-sale banner, hero + game search, trust tiles, game grid, 3 steps |
| `/games/[slug]` | Checkout: account ID + nickname check → package → payment → receipt, order summary, confirm dialog |
| `/orders/[invoice]` | Order status: pay (QRIS / VA / Alfamart code, 15-min countdown) → sending → delivered (timeline, “top up again”), plus expired/failed states and a WhatsApp CS link |
| `/track` | Order lookup by invoice number (guest only) |

`?again=<invoice>` / `?edit=<invoice>` on a game page pre-fill the account (and, for `edit`, the package/method) from an earlier order.

## Where things live

- `src/lib/catalog.ts` — games, products, payment methods, pricing/fees, flash sale. Set `ACTIVE_SLUGS` to `["mobile-legends", "free-fire"]` for the MVP launch line-up.
- `src/lib/mock-api.ts` — **the mock backend** (localStorage). Each function maps to a planned endpoint (nickname check, create order/invoice, get order). Order statuses follow the planned flow: `created → paid → processing → success`, plus `failed`, `refunded`, `expired`. Replace these with real API calls; the demo-only `simulatePaid` goes away (only the payment webhook marks orders paid).
- `src/components/ui/*` — shadcn/ui primitives (Button, Input, Dialog) themed with the KOIN tokens in `src/app/globals.css`.
- `src/components/koin/*` — screens and shared pieces.

The demo order `KN-2611-48210` always exists so `/track` can be tried immediately.

## Notes

- The shadcn registry (`ui.shadcn.com`) was not reachable from the build environment, so the three components were written by hand from the shadcn source; `components.json` is in place so `npx shadcn add …` works normally on your machine.
- With Cache Components on (the Next 16 default here), an unknown game slug renders the not-found page but with HTTP 200, because the response is already streaming.
