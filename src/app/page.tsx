import { FlashBanner } from "@/components/koin/flash-banner"
import { HomeView } from "@/components/koin/home-view"
import { FLASH_SALE_ENABLED, activeGames } from "@/lib/catalog"

export default function HomePage() {
  return (
    <>
      {FLASH_SALE_ENABLED && <FlashBanner />}
      <HomeView games={activeGames()} />
    </>
  )
}
