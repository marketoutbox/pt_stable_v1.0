import { openDB, deleteDB } from "idb"

const DB_NAME = "StockDatabase"
const STORE_NAME = "watchlists"
const DB_VERSION = 10 // Significantly increased to force upgrade

// Initialize the database
export async function initDatabase() {
  console.log("Initializing database...")

  try {
    // First, check if we need to delete the existing database
    const needsReset = await checkIfNeedsReset()

    if (needsReset) {
      console.log("Database needs reset, deleting existing database...")
      await deleteDB(DB_NAME)
      console.log("Database deleted successfully")
    }

    // Open and initialize the database
    const db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`)

        // Create stocks store if it doesn't exist
        if (!db.objectStoreNames.contains("stocks")) {
          console.log("Creating stocks store")
          db.createObjectStore("stocks", { keyPath: "symbol" })
        }

        // Always recreate the watchlists store to ensure it's correct
        if (db.objectStoreNames.contains(STORE_NAME)) {
          console.log("Deleting existing watchlists store")
          db.deleteObjectStore(STORE_NAME)
        }

        console.log("Creating watchlists store")
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true })
      },
    })

    console.log("Database initialized successfully")
    console.log("Object stores:", Array.from(db.objectStoreNames))
    return db
  } catch (error) {
    console.error("Error initializing database:", error)
    throw error
  }
}

// Check if database needs to be reset
async function checkIfNeedsReset() {
  try {
    const db = await openDB(DB_NAME, 1, { blocking: true })
    const hasWatchlistsStore = db.objectStoreNames.contains(STORE_NAME)
    await db.close()
    return !hasWatchlistsStore
  } catch (error) {
    console.log("Error checking database, will reset:", error)
    return true
  }
}

// Get database connection
async function getDB() {
  try {
    return await openDB(DB_NAME, DB_VERSION)
  } catch (error) {
    console.error("Error opening database:", error)
    // Try to initialize if opening fails
    return await initDatabase()
  }
}

// Save watchlist data
export async function saveWatchlist(watchlist, id = null) {
  try {
    // Make sure database is initialized
    await initDatabase()

    const db = await getDB()

    // Verify the store exists
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      throw new Error(`Object store ${STORE_NAME} not found in database`)
    }

    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)

    let result
    if (id !== null) {
      // Update existing watchlist
      result = await store.put({ ...watchlist, id })
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
    // Make sure database is initialized
    await initDatabase()

    const db = await getDB()

    // Verify the store exists
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      console.warn(`Object store ${STORE_NAME} not found in database, returning empty array`)
      return []
    }

    const tx = db.transaction(STORE_NAME, "readonly")
    const store = tx.objectStore(STORE_NAME)
    const watchlists = await store.getAll()

    return watchlists
  } catch (error) {
    console.error("Error in getWatchlists:", error)
    return []
  }
}

// Get a specific watchlist by id
export async function getWatchlist(id) {
  try {
    const db = await getDB()

    // Verify the store exists
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      throw new Error(`Object store ${STORE_NAME} not found in database`)
    }

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

    // Verify the store exists
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      throw new Error(`Object store ${STORE_NAME} not found in database`)
    }

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
