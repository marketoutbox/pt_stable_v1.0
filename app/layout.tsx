import "../styles/globals.css"
import Link from "next/link"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 bg-fixed">
        <nav className="bg-gradient-to-r from-navy-900/80 to-navy-800/80 backdrop-blur-sm border-b border-navy-700/10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="flex-shrink-0">
                  <span className="gold-gradient-text font-bold text-xl">PairTrade</span>
                </Link>
                <div className="ml-10 flex items-baseline space-x-4">
                  <NavLink href="/">Home</NavLink>
                  <NavLink href="/stocks">Stocks</NavLink>
                  <NavLink href="/watchlists">Watchlists</NavLink>
                  <NavLink href="/backtest">Ratio Backtest</NavLink>
                  <NavLink href="/backtest-spread">Spread Backtest</NavLink>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>
      </body>
    </html>
  )
}

function NavLink({ href, children }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-navy-100 hover:bg-navy-800/30 hover:text-white"
    >
      {children}
    </Link>
  )
}
