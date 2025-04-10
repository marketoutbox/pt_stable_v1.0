"use client"

import { useState, useEffect } from "react"
import { openDB } from "idb"
import { saveWatchlist, getWatchlists, deleteWatchlist } from "../lib/watchlistDB"

export default function Watchlist() {
  const [stocks, setStocks] = useState([])
  const [watchlists, setWatchlists] = useState([])
  const [currentWatchlist, setCurrentWatchlist] = useState({ name: "", pairs: [] })
  const [selectedPair, setSelectedPair] = useState({ stockA: "", stockB: "" })
  const [editMode, setEditMode] = useState(false)
  const [editId, setEditId] = useState(null)
  const [message, setMessage] = useState({ text: "", type: "" })
  const [isLoading, setIsLoading] = useState(false)

  // Fetch stocks and watchlists on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stocks from IndexedDB
        const db = await openDB("StockDatabase", 2) // Match version with watchlistDB.js
        const tx = db.transaction("stocks", "readonly")
        const store = tx.objectStore("stocks")
        const allStocks = await store.getAll()
        if (allStocks.length) {
          setStocks(allStocks.map((stock) => stock.symbol))
        }

        // Fetch watchlists
        const watchlistData = await getWatchlists()
        setWatchlists(watchlistData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        setMessage({ text: "Failed to load data: " + error.message, type: "error" })
      }
    }

    fetchData()
  }, [])

  const handlePairSelection = (event) => {
    const { name, value } = event.target
    setSelectedPair((prev) => ({ ...prev, [name]: value }))
  }

  const addPairToWatchlist = () => {
    if (!selectedPair.stockA || !selectedPair.stockB) {
      setMessage({ text: "Please select both stocks for the pair", type: "error" })
      return
    }

    if (selectedPair.stockA === selectedPair.stockB) {
      setMessage({ text: "Please select different stocks for the pair", type: "error" })
      return
    }

    // Check if pair already exists in the watchlist
    const pairExists = currentWatchlist.pairs.some(
      (pair) => pair.stockA === selectedPair.stockA && pair.stockB === selectedPair.stockB,
    )

    if (pairExists) {
      setMessage({ text: "This pair already exists in the watchlist", type: "error" })
      return
    }

    setCurrentWatchlist((prev) => ({
      ...prev,
      pairs: [...prev.pairs, { ...selectedPair }],
    }))

    setSelectedPair({ stockA: "", stockB: "" })
    setMessage({ text: "Pair added to watchlist", type: "success" })
  }

  const removePairFromWatchlist = (index) => {
    setCurrentWatchlist((prev) => ({
      ...prev,
      pairs: prev.pairs.filter((_, i) => i !== index),
    }))
    setMessage({ text: "Pair removed from watchlist", type: "success" })
  }

  const handleSaveWatchlist = async () => {
    if (!currentWatchlist.name.trim()) {
      setMessage({ text: "Please enter a watchlist name", type: "error" })
      return
    }

    if (currentWatchlist.pairs.length === 0) {
      setMessage({ text: "Please add at least one pair to the watchlist", type: "error" })
      return
    }

    setIsLoading(true)
    setMessage({ text: "Saving watchlist...", type: "info" })

    try {
      // If not in edit mode, check if watchlist name already exists
      if (!editMode && watchlists.some((w) => w.name === currentWatchlist.name)) {
        setMessage({ text: "A watchlist with this name already exists", type: "error" })
        setIsLoading(false)
        return
      }

      // Save the watchlist
      await saveWatchlist(currentWatchlist, editId)

      // Refresh watchlists
      const updatedWatchlists = await getWatchlists()
      setWatchlists(updatedWatchlists)

      // Reset form
      setCurrentWatchlist({ name: "", pairs: [] })
      setEditMode(false)
      setEditId(null)

      setMessage({
        text: editMode ? "Watchlist updated successfully" : "Watchlist created successfully",
        type: "success",
      })
    } catch (error) {
      console.error("Error saving watchlist:", error)
      setMessage({ text: "Failed to save watchlist: " + error.message, type: "error" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditWatchlist = (watchlist) => {
    setCurrentWatchlist({
      name: watchlist.name,
      pairs: [...watchlist.pairs],
    })
    setEditMode(true)
    setEditId(watchlist.id)
    setMessage({ text: "Editing watchlist", type: "info" })
  }

  const handleDeleteWatchlist = async (id) => {
    if (confirm("Are you sure you want to delete this watchlist?")) {
      try {
        setIsLoading(true)
        await deleteWatchlist(id)

        // Refresh watchlists
        const updatedWatchlists = await getWatchlists()
        setWatchlists(updatedWatchlists)

        setMessage({ text: "Watchlist deleted successfully", type: "success" })
      } catch (error) {
        console.error("Error deleting watchlist:", error)
        setMessage({ text: "Failed to delete watchlist: " + error.message, type: "error" })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const cancelEdit = () => {
    setCurrentWatchlist({ name: "", pairs: [] })
    setEditMode(false)
    setEditId(null)
    setMessage({ text: "Edit cancelled", type: "info" })
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-bold text-white">Watchlist Management</h1>
        <p className="text-xl text-gray-300">Create and manage your pair trading watchlists</p>
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold text-white mb-6">{editMode ? "Edit Watchlist" : "Create New Watchlist"}</h2>

        <div className="space-y-6">
          <div>
            <label htmlFor="watchlistName" className="block text-base font-medium text-gray-300 mb-2">
              Watchlist Name
            </label>
            <input
              id="watchlistName"
              value={currentWatchlist.name}
              onChange={(e) => setCurrentWatchlist((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter watchlist name (e.g., Automobiles, Tech Stocks)"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Stock A</label>
              <select name="stockA" value={selectedPair.stockA} onChange={handlePairSelection} className="input-field">
                <option value="">Select Stock A</option>
                {stocks.map((symbol) => (
                  <option key={`a-${symbol}`} value={symbol}>
                    {symbol}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Stock B</label>
              <select name="stockB" value={selectedPair.stockB} onChange={handlePairSelection} className="input-field">
                <option value="">Select Stock B</option>
                {stocks.map((symbol) => (
                  <option key={`b-${symbol}`} value={symbol}>
                    {symbol}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={addPairToWatchlist} className="btn-secondary w-full">
                Add Pair
              </button>
            </div>
          </div>

          {currentWatchlist.pairs.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Pairs in this Watchlist</h3>
              <div className="bg-navy-800/50 rounded-lg border border-navy-700 overflow-hidden">
                <table className="min-w-full divide-y divide-navy-700">
                  <thead className="bg-navy-800">
                    <tr>
                      <th className="table-header">Stock A</th>
                      <th className="table-header">Stock B</th>
                      <th className="table-header w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-800">
                    {currentWatchlist.pairs.map((pair, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-navy-900/50" : "bg-navy-900/30"}>
                        <td className="table-cell text-gold-400">{pair.stockA}</td>
                        <td className="table-cell">{pair.stockB}</td>
                        <td className="table-cell">
                          <button
                            onClick={() => removePairFromWatchlist(index)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {message.text && (
            <div
              className={`p-4 rounded-md ${
                message.type === "success"
                  ? "bg-green-900/30 text-green-300 border border-green-800"
                  : message.type === "error"
                    ? "bg-red-900/30 text-red-300 border border-red-800"
                    : "bg-blue-900/30 text-blue-300 border border-blue-800"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <button onClick={handleSaveWatchlist} disabled={isLoading} className="btn-primary">
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {editMode ? "Updating..." : "Saving..."}
                </span>
              ) : editMode ? (
                "Update Watchlist"
              ) : (
                "Save Watchlist"
              )}
            </button>
            {editMode && (
              <button onClick={cancelEdit} className="btn-secondary" disabled={isLoading}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {watchlists.length > 0 && (
        <div className="card">
          <h2 className="text-2xl font-bold text-white mb-6">Your Watchlists</h2>
          <div className="space-y-6">
            {watchlists.map((watchlist) => (
              <div key={watchlist.id} className="bg-navy-800/50 rounded-lg border border-navy-700 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gold-400">{watchlist.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditWatchlist(watchlist)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      disabled={isLoading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteWatchlist(watchlist.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-navy-700">
                    <thead className="bg-navy-900">
                      <tr>
                        <th className="table-header">Stock A</th>
                        <th className="table-header">Stock B</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-900">
                      {watchlist.pairs && watchlist.pairs.length > 0 ? (
                        watchlist.pairs.map((pair, pairIndex) => (
                          <tr key={pairIndex} className="bg-navy-800/30">
                            <td className="table-cell text-gold-400">{pair.stockA}</td>
                            <td className="table-cell">{pair.stockB}</td>
                          </tr>
                        ))
                      ) : (
                        <tr className="bg-navy-800/30">
                          <td colSpan={2} className="table-cell text-center text-gray-400">
                            No pairs in this watchlist
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
