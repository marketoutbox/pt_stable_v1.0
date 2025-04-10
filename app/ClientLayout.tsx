"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function ClientLayout({ children }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 bg-fixed">
      <nav className="bg-gradient-to-r from-navy-900/80 to-navy-800/80 backdrop-blur-sm border-b border-navy-700/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0">
                <span className="gold-gradient-text font-bold text-xl">PairTrade</span>
              </Link>
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink href="/" current={pathname === "/"}>
                  Home
                </NavLink>
                <NavLink href="/stocks" current={pathname === "/stocks"}>
                  Stocks
                </NavLink>
                <NavLink href="/watchlist" current={pathname === "/watchlist"}>
                  Watchlists
                </NavLink>
                <NavLink href="/backtest" current={pathname === "/backtest"}>
                  Ratio Backtest
                </NavLink>
                <NavLink href="/backtest-spread" current={pathname === "/backtest-spread"}>
                  Spread Backtest
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>
    </div>
  )
}

function NavLink({ href, current, children }) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        current
          ? "bg-gradient-to-r from-navy-800 to-navy-700 text-white shadow-sm"
          : "text-navy-100 hover:bg-navy-800/30 hover:text-white"
      }`}
    >
      {children}
    </Link>
  )
}
