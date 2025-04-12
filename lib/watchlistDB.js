// Watchlist-specific IndexedDB operations in a separate database

// Open the watchlist database connection
const openWatchlistDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("WatchlistDatabase", 1)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains("watchlists")) {
        db.createObjectStore("watchlists", { keyPath: "id", autoIncrement: true })
      }
    }

    request.onsuccess = (event) => {
      resolve(event.target.result)
    }

    request.onerror = (event) => {
      reject("Error opening watchlist database: " + event.target.error)
    }
  })
}

// Create a new watchlist
export const createWatchlist = async (watchlistData) => {
  const db = await openWatchlistDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["watchlists"], "readwrite")
    const store = transaction.objectStore("watchlists")

    const watchlist = {
      ...watchlistData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const request = store.add(watchlist)

    request.onsuccess = (event) => {
      resolve(event.target.result) // Returns the new ID
    }

    request.onerror = (event) => {
      reject("Error creating watchlist: " + event.target.error)
    }
  })
}

// Get all watchlists
export const getAllWatchlists = async () => {
  const db = await openWatchlistDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["watchlists"], "readonly")
    const store = transaction.objectStore("watchlists")
    const request = store.getAll()

    request.onsuccess = (event) => {
      resolve(event.target.result)
    }

    request.onerror = (event) => {
      reject("Error getting watchlists: " + event.target.error)
    }
  })
}

// Get a specific watchlist by ID
export const getWatchlistById = async (id) => {
  const db = await openWatchlistDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["watchlists"], "readonly")
    const store = transaction.objectStore("watchlists")
    const request = store.get(id)

    request.onsuccess = (event) => {
      resolve(event.target.result)
    }

    request.onerror = (event) => {
      reject("Error getting watchlist: " + event.target.error)
    }
  })
}

// Update a watchlist
export const updateWatchlist = async (id, updates) => {
  const db = await openWatchlistDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["watchlists"], "readwrite")
    const store = transaction.objectStore("watchlists")

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
        resolve(updatedWatchlist)
      }

      putRequest.onerror = (event) => {
        reject("Error updating watchlist: " + event.target.error)
      }
    }

    getRequest.onerror = (event) => {
      reject("Error getting watchlist for update: " + event.target.error)
    }
  })
}

// Delete a watchlist
export const deleteWatchlist = async (id) => {
  const db = await openWatchlistDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["watchlists"], "readwrite")
    const store = transaction.objectStore("watchlists")
    const request = store.delete(id)

    request.onsuccess = () => {
      resolve(true)
    }

    request.onerror = (event) => {
      reject("Error deleting watchlist: " + event.target.error)
    }
  })
}

// Add a pair to a watchlist
export const addPairToWatchlist = async (watchlistId, stock1, stock2) => {
  const watchlist = await getWatchlistById(watchlistId)
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
}

// Remove a pair from a watchlist
export const removePairFromWatchlist = async (watchlistId, stock1, stock2) => {
  const watchlist = await getWatchlistById(watchlistId)
  if (!watchlist) {
    throw new Error("Watchlist not found")
  }

  // Filter out the pair to remove
  const updatedPairs = (watchlist.pairs || []).filter((pair) => !(pair.stock1 === stock1 && pair.stock2 === stock2))

  return updateWatchlist(watchlistId, { pairs: updatedPairs })
}

// Function to check if a stock exists in your stock database
// This connects to your existing database without modifying it
export const checkStockExists = async (symbol) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("StockDatabase", 1) // Use your existing version

    request.onsuccess = (event) => {
      const db = event.target.result
      const transaction = db.transaction(["stocks"], "readonly")
      const store = transaction.objectStore("stocks")
      const getRequest = store.get(symbol)

      getRequest.onsuccess = (event) => {
        resolve(!!event.target.result) // Convert to boolean
      }

      getRequest.onerror = (event) => {
        reject("Error checking stock: " + event.target.error)
      }
    }

    request.onerror = (event) => {
      reject("Error opening stock database: " + event.target.error)
    }
  })
}
