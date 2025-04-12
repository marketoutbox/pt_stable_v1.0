"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function NotFound() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="bg-navy-800/50 p-8 rounded-lg border border-navy-700 max-w-md">
        <h1 className="text-4xl font-bold text-gold-400 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-6">Page Not Found</h2>
        <p className="text-gray-300 mb-8">The page you are looking for doesn't exist or has been moved.</p>
        <Link
          href="/"
          className="px-6 py-3 bg-gold-400 hover:bg-gold-500 text-navy-950 font-medium rounded-md 
          transition-colors focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2 
          focus:ring-offset-navy-950"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}
