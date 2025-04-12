"use client"

import "../styles/globals.css"
import Layout from "../components/Layout"
import { useEffect, useState } from "react"

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // If the component hasn't mounted yet, render a minimal version
  // This prevents hydration errors with useRouter
  if (!mounted) {
    return (
      <div className="min-h-screen bg-navy-950">
        <nav className="border-b border-navy-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="text-2xl font-bold text-white">PairTrade</div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div style={{ visibility: "hidden" }}>
            <Component {...pageProps} />
          </div>
        </main>
      </div>
    )
  }

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}

export default MyApp
