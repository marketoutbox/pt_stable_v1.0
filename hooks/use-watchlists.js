"use client"

import { useState, useEffect } from "react"

// Watchlist database operations
const DB_NAME = "WatchlistDatabase"
const DB_VERSION = 1
const STORE_NAME = "watchlists"

export function useWatchlists() {
  const [db, setDb] = useState(null)
  const [watchlists, setWatchlists] = useState([])
  const [selectedWatchlist, setSelectedWatchlist] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize the database
  useEffect(() => {
    const initDb = async () => {
      if (typeof window === "undefined" || typeof indexedDB === "undefined") {
        return // Skip on server-side
      }

      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onupgradeneeded = (event) => {
          const db = event.target.result
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true })
          }
        }

        request.onsuccess = (event) => {
          const db = event.target.result
          setDb(db)
          loadWatchlists(db)
        }

        request.onerror = (event) => {
          console.error("Error opening watchlist database:", event.target.error)
        }
      } catch (error) {
        console.error("Error initializing database:", error)
      }
    }

    initDb()
  }, [])

  // Load all watchlists
  const loadWatchlists = async (database) => {
    if (!database) return

    try {
      setIsLoading(true)
      const transaction = database.transaction([STORE_NAME], "readonly")
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onsuccess = (event) => {
        const lists = event.target.result
        setWatchlists(lists)

        // If we have a selected watchlist, update it with fresh data
        if (selectedWatchlist) {
          const updated = lists.find((list) => list.id === selectedWatchlist.id)
          if (updated) {
            setSelectedWatchlist(updated)
          } else if (lists.length > 0) {
            setSelectedWatchlist(lists[0])
          } else {
            setSelectedWatchlist(null)
          }
        } else if (lists.length > 0) {
          setSelectedWatchlist(lists[0])
        }

        setIsLoading(false)
      }

      request.onerror = (event) => {
        console.error("Error loading watchlists:", event.target.error)
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error in loadWatchlists:", error)
      setIsLoading(false)
    }
  }

  // Create a new watchlist
  const createWatchlist = async (watchlistData) => {
    if (!db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([STORE_NAME], "readwrite")
        const store = transaction.objectStore(STORE_NAME)

        const watchlist = {
          ...watchlistData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        const request = store.add(watchlist)

        request.onsuccess = (event) => {
          const id = event.target.result
          loadWatchlists(db)
          resolve(id)
        }

        request.onerror = (event) => {
          reject(new Error("Error creating watchlist: " + event.target.error))
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  // Update a watchlist
  const updateWatchlist = async (id, updates) => {
    if (!db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([STORE_NAME], "readwrite")
        const store = transaction.objectStore(STORE_NAME)

        // First get the current watchlist
        const getRequest = store.get(id)

        getRequest.onsuccess = (event) => {
          const watchlist = event.target.result
          if (!watchlist) {
            reject(new Error("Watchlist not found"))
            return
          }

          // Apply updates and update timestamp
          const updatedWatchlist = {
            ...watchlist,
            ...updates,
            updatedAt: new Date().toISOString(),
          }

          // Put the updated watchlist back
          const putRequest = store.put(updatedWatchlist)

          putRequest.onsuccess = () => {
            loadWatchlists(db)
            resolve(updatedWatchlist)
          }

          putRequest.onerror = (event) => {
            reject(new Error("Error updating watchlist: " + event.target.error))
          }
        }

        getRequest.onerror = (event) => {
          reject(new Error("Error getting watchlist for update: " + event.target.error))
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  // Delete a watchlist
  const deleteWatchlist = async (id) => {
    if (!db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([STORE_NAME], "readwrite")
        const store = transaction.objectStore(STORE_NAME)
        const request = store.delete(id)

        request.onsuccess = () => {
          // If we deleted the currently selected watchlist, select another one
          if (selectedWatchlist && selectedWatchlist.id === id) {
            setSelectedWatchlist(null)
          }

          loadWatchlists(db)
          resolve(true)
        }

        request.onerror = (event) => {
          reject(new Error("Error deleting watchlist: " + event.target.error))
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  // Check if a stock exists in the stock database
  const checkStockExists = async (symbol) => {
    if (typeof indexedDB === "undefined") return false

    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open("StockDatabase", 1) // Use existing version

        request.onsuccess = (event) => {
          const stockDb = event.target.result
          const transaction = stockDb.transaction(["stocks"], "readonly")
          const store = transaction.objectStore("stocks")
          const getRequest = store.get(symbol)

          getRequest.onsuccess = (event) => {
            resolve(!!event.target.result) // Convert to boolean
          }

          getRequest.onerror = (event) => {
            reject(new Error("Error checking stock: " + event.target.error))
          }
        }

        request.onerror = (event) => {
          reject(new Error("Error opening stock database: " + event.target.error))
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  // Add a pair to a watchlist
  const addPairToWatchlist = async (watchlistId, stock1, stock2) => {
    if (!db) throw new Error("Database not initialized")

    // Validate that both stocks exist
    try {
      const stock1Exists = await checkStockExists(stock1)
      const stock2Exists = await checkStockExists(stock2)

      if (!stock1Exists) {
        throw new Error(`Stock ${stock1} not found in your database`)
      }

      if (!stock2Exists) {
        throw new Error(`Stock ${stock2} not found in your database`)
      }

      // Get the current watchlist
      const watchlist = watchlists.find((w) => w.id === watchlistId)
      if (!watchlist) {
        throw new Error("Watchlist not found")
      }

      // Initialize pairs array if it doesn't exist
      const pairs = watchlist.pairs || []

      // Check if pair already exists
      const pairExists = pairs.some((pair) => pair.stock1 === stock1 && pair.stock2 === stock2)

      if (pairExists) {
        return watchlist // Pair already exists, no change needed
      }

      // Add the new pair
      const updatedPairs = [...pairs, { stock1, stock2 }]
      return updateWatchlist(watchlistId, { pairs: updatedPairs })
    } catch (error) {
      throw error
    }
  }

  // Remove a pair from a watchlist
  const removePairFromWatchlist = async (watchlistId, stock1, stock2) => {
    if (!db) throw new Error("Database not initialized")

    // Get the current watchlist
    const watchlist = watchlists.find((w) => w.id === watchlistId)
    if (!watchlist) {
      throw new Error("Watchlist not found")
    }

    // Filter out the pair to remove
    const updatedPairs = (watchlist.pairs || []).filter((pair) => !(pair.stock1 === stock1 && pair.stock2 === stock2))

    return updateWatchlist(watchlistId, { pairs: updatedPairs })
  }

  return {
    watchlists,
    selectedWatchlist,
    setSelectedWatchlist,
    isLoading,
    createWatchlist,
    updateWatchlist,
    deleteWatchlist,
    addPairToWatchlist,
    removePairFromWatchlist,
  }
}
