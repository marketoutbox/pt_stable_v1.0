"use client"

import Link from "next/link"
import { useRouter } from "next/router"

export default function Layout({ children }) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-900">
      <nav className="bg-blue-900/50 backdrop-blur-sm border-b border-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0">
                <span className="text-yellow-400 font-bold text-xl">PairTrade</span>
              </Link>
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink href="/" current={router.pathname === "/"}>
                  Home
                </NavLink>
                <NavLink href="/stocks" current={router.pathname === "/stocks"}>
                  Stocks
                </NavLink>
                <NavLink href="/backtest" current={router.pathname === "/backtest"}>
                  Ratio Backtest
                </NavLink>
                <NavLink href="/backtest-spread" current={router.pathname === "/backtest-spread"}>
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
      className={`px-3 py-2 rounded-md text-sm font-medium ${
        current ? "bg-blue-800 text-white" : "text-blue-100 hover:bg-blue-800/50 hover:text-white"
      }`}
    >
      {children}
    </Link>
  )
}
