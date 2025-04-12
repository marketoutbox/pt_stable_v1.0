"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Plus, Trash2, Edit, X } from "lucide-react"
import { useWatchlists } from "@/hooks/use-watchlists"

export default function WatchlistManager() {
  const {
    watchlists,
    selectedWatchlist,
    setSelectedWatchlist,
    createWatchlist,
    updateWatchlist,
    deleteWatchlist,
    addPairToWatchlist,
    removePairFromWatchlist,
  } = useWatchlists()

  const [newWatchlistName, setNewWatchlistName] = useState("")
  const [newPair, setNewPair] = useState({ stock1: "", stock2: "" })
  const [isAddingPair, setIsAddingPair] = useState(false)
  const [isEditingWatchlist, setIsEditingWatchlist] = useState(false)
  const [isValidating, setIsValidating] = useState(false)

  const handleCreateWatchlist = async () => {
    if (!newWatchlistName.trim()) return

    try {
      await createWatchlist({
        name: newWatchlistName,
        description: "",
        pairs: [],
      })
      setNewWatchlistName("")
      toast({
        title: "Success",
        description: "Watchlist created successfully",
      })
    } catch (error) {
      console.error("Error creating watchlist:", error)
      toast({
        title: "Error",
        description: "Failed to create watchlist",
        variant: "destructive",
      })
    }
  }

  const handleUpdateWatchlist = async (id, updates) => {
    try {
      await updateWatchlist(id, updates)
      setIsEditingWatchlist(false)
      toast({
        title: "Success",
        description: "Watchlist updated successfully",
      })
    } catch (error) {
      console.error("Error updating watchlist:", error)
      toast({
        title: "Error",
        description: "Failed to update watchlist",
        variant: "destructive",
      })
    }
  }

  const handleDeleteWatchlist = async (id) => {
    try {
      await deleteWatchlist(id)
      toast({
        title: "Success",
        description: "Watchlist deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting watchlist:", error)
      toast({
        title: "Error",
        description: "Failed to delete watchlist",
        variant: "destructive",
      })
    }
  }

  const handleAddPair = async () => {
    if (!newPair.stock1 || !newPair.stock2 || !selectedWatchlist) return
    setIsValidating(true)

    try {
      await addPairToWatchlist(selectedWatchlist.id, newPair.stock1, newPair.stock2)
      setNewPair({ stock1: "", stock2: "" })
      setIsAddingPair(false)
      toast({
        title: "Success",
        description: "Pair added successfully",
      })
    } catch (error) {
      console.error("Error adding pair:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add pair",
        variant: "destructive",
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleRemovePair = async (stock1, stock2) => {
    if (!selectedWatchlist) return

    try {
      await removePairFromWatchlist(selectedWatchlist.id, stock1, stock2)
      toast({
        title: "Success",
        description: "Pair removed successfully",
      })
    } catch (error) {
      console.error("Error removing pair:", error)
      toast({
        title: "Error",
        description: "Failed to remove pair",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Watchlists</h1>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Watchlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Watchlist</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Watchlist Name"
                value={newWatchlistName}
                onChange={(e) => setNewWatchlistName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={handleCreateWatchlist}>Create</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Watchlist Sidebar */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>My Watchlists</CardTitle>
            </CardHeader>
            <CardContent>
              {watchlists.length > 0 ? (
                <ul className="space-y-2">
                  {watchlists.map((list) => (
                    <li
                      key={list.id}
                      className={`flex justify-between items-center p-2 rounded cursor-pointer ${
                        selectedWatchlist && selectedWatchlist.id === list.id
                          ? "bg-primary/10"
                          : "hover:bg-secondary/10"
                      }`}
                      onClick={() => setSelectedWatchlist(list)}
                    >
                      <span>{list.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteWatchlist(list.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-center">No watchlists yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Watchlist Details */}
        <div className="md:col-span-3">
          {selectedWatchlist ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                {isEditingWatchlist ? (
                  <Input
                    value={selectedWatchlist.name}
                    onChange={(e) =>
                      setSelectedWatchlist({
                        ...selectedWatchlist,
                        name: e.target.value,
                      })
                    }
                    className="max-w-xs"
                  />
                ) : (
                  <CardTitle>{selectedWatchlist.name}</CardTitle>
                )}
                <div className="flex space-x-2">
                  {isEditingWatchlist ? (
                    <Button
                      onClick={() => {
                        handleUpdateWatchlist(selectedWatchlist.id, { name: selectedWatchlist.name })
                      }}
                    >
                      Save
                    </Button>
                  ) : (
                    <Button variant="outline" size="icon" onClick={() => setIsEditingWatchlist(true)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-medium mb-4">Pairs</h3>

                {selectedWatchlist.pairs && selectedWatchlist.pairs.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedWatchlist.pairs.map((pair, index) => (
                      <li key={index} className="flex justify-between items-center p-2 border rounded">
                        <span>
                          {pair.stock1} - {pair.stock2}
                        </span>
                        <Button variant="ghost" size="icon" onClick={() => handleRemovePair(pair.stock1, pair.stock2)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No pairs added yet.</p>
                )}

                {isAddingPair ? (
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Stock 1 (e.g., AAPL)"
                        value={newPair.stock1}
                        onChange={(e) => setNewPair({ ...newPair, stock1: e.target.value.toUpperCase() })}
                      />
                      <Input
                        placeholder="Stock 2 (e.g., MSFT)"
                        value={newPair.stock2}
                        onChange={(e) => setNewPair({ ...newPair, stock2: e.target.value.toUpperCase() })}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAddingPair(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddPair} disabled={isValidating}>
                        {isValidating ? "Validating..." : "Add Pair"}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </CardContent>
              <CardFooter>
                {!isAddingPair && (
                  <Button onClick={() => setIsAddingPair(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Pair
                  </Button>
                )}
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <p className="text-muted-foreground mb-4">Select a watchlist or create a new one</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      New Watchlist
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Watchlist</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <Input
                        placeholder="Watchlist Name"
                        value={newWatchlistName}
                        onChange={(e) => setNewWatchlistName(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button onClick={handleCreateWatchlist}>Create</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
