import type { Metadata, Viewport } from "next"
import { Manrope, Unbounded } from "next/font/google"

import { SiteFooter } from "@/components/koin/site-footer"
import { SiteHeader } from "@/components/koin/site-header"
import "./globals.css"

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  weight: ["500", "700", "800", "900"],
})

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: {
    default: "KOIN — Top up. Back in the game.",
    template: "%s · KOIN",
  },
  description:
    "Diamonds, UC and credits in seconds. No login, no password — just your player ID.",
}

export const viewport: Viewport = {
  themeColor: "#0B0B12",
  colorScheme: "dark",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${unbounded.variable} ${manrope.variable} antialiased`}>
      <body className="flex min-h-screen flex-col bg-bg font-sans text-ink">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
