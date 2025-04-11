"use client"

import Link from "next/link"
import { useRouter } from "next/router"

export default function Layout({ children }) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-navy-950">
      <nav className="border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-white">
              PairTrade
            </Link>

            <div className="flex space-x-8">
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
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  )
}

function NavLink({ href, current, children }) {
  return (
    <Link
      href={href}
      className={`text-base font-medium transition-colors ${current ? "text-white" : "text-gray-300 hover:text-white"}`}
    >
      {children}
    </Link>
  )
}
