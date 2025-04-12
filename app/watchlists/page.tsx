import WatchlistManager from "@/components/watchlist/watchlist-manager"

export const dynamic = "force-dynamic"

export default function WatchlistsPage() {
  return (
    <div className="container mx-auto py-6">
      <WatchlistManager />
    </div>
  )
}
