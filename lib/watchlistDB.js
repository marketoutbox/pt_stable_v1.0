import { openDB } from "idb"

const DB_NAME = "StockDatabase"
const STORE_NAME = "watchlists"
const DB_VERSION = 2 // Increased version number to trigger upgrade

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`)

      // Create stocks store if it doesn't exist
      if (!db.objectStoreNames.contains("stocks")) {
        console.log("Creating stocks store")
        db.createObjectStore("stocks", { keyPath: "symbol" })
      }

      // Create watchlists store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        console.log("Creating watchlists store")
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true })
      }
    },
  })
}

// Save watchlist data
export async function saveWatchlist(watchlist, index = null) {
  try {
    const db = await getDB()
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)

    let result
    if (index !== null) {
      // Update existing watchlist
      const existingWatchlist = await store.get(index)
      if (existingWatchlist) {
        result = await store.put({ ...watchlist, id: index })
      } else {
        throw new Error(`Watchlist with index ${index} not found`)
      }
    } else {
      // Add new watchlist
      result = await store.add(watchlist)
    }

    await tx.done
    return result
  } catch (error) {
    console.error("Error in saveWatchlist:", error)
    throw error
  }
}

// Get all watchlists
export async function getWatchlists() {
  try {
    const db = await getDB()
    const tx = db.transaction(STORE_NAME, "readonly")
    const store = tx.objectStore(STORE_NAME)
    const watchlists = await store.getAll()
    return watchlists
  } catch (error) {
    console.error("Error in getWatchlists:", error)
    return []
  }
}

// Get a specific watchlist by index
export async function getWatchlist(id) {
  try {
    const db = await getDB()
    const tx = db.transaction(STORE_NAME, "readonly")
    const store = tx.objectStore(STORE_NAME)
    const watchlist = await store.get(id)
    return watchlist
  } catch (error) {
    console.error("Error in getWatchlist:", error)
    return null
  }
}

// Delete a watchlist
export async function deleteWatchlist(id) {
  try {
    const db = await getDB()
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)
    await store.delete(id)
    await tx.done
    return true
  } catch (error) {
    console.error("Error in deleteWatchlist:", error)
    throw error
  }
}
