import { openDB } from "idb"

const DB_NAME = "StockDatabase"
const STORE_NAME = "watchlists"

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      // Create stocks store if it doesn't exist
      if (!db.objectStoreNames.contains("stocks")) {
        db.createObjectStore("stocks", { keyPath: "symbol" })
      }

      // Create watchlists store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { autoIncrement: true })
      }
    },
  })
}

// Save watchlist data
export async function saveWatchlist(watchlist, index = null) {
  const db = await getDB()
  const tx = db.transaction(STORE_NAME, "readwrite")
  const store = tx.objectStore(STORE_NAME)

  if (index !== null) {
    // Update existing watchlist
    await store.put(watchlist, index)
  } else {
    // Add new watchlist
    await store.add(watchlist)
  }

  await tx.done
}

// Get all watchlists
export async function getWatchlists() {
  const db = await getDB()
  const tx = db.transaction(STORE_NAME, "readonly")
  const store = tx.objectStore(STORE_NAME)
  const watchlists = await store.getAll()

  return watchlists
}

// Get a specific watchlist by index
export async function getWatchlist(index) {
  const db = await getDB()
  const tx = db.transaction(STORE_NAME, "readonly")
  const store = tx.objectStore(STORE_NAME)
  const watchlist = await store.get(index)

  return watchlist
}

// Delete a watchlist
export async function deleteWatchlist(index) {
  const db = await getDB()
  const tx = db.transaction(STORE_NAME, "readwrite")
  const store = tx.objectStore(STORE_NAME)
  await store.delete(index)
  await tx.done
}
