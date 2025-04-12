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
      <Layout>
        <div style={{ visibility: "hidden" }}>
          <Component {...pageProps} />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}

export default MyApp
