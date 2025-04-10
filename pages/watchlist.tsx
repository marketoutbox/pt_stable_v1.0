// WatchlistPage.jsx
"use client";

import React, { useEffect, useState } from "react";
import { openDB } from "idb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { v4 as uuidv4 } from 'uuid';

export default function WatchlistPage() {
  const [db, setDb] = useState(null);
  const [symbols, setSymbols] = useState([]);
  const [watchlistName, setWatchlistName] = useState("");
  const [selectedPairs, setSelectedPairs] = useState([]);
  const [existingWatchlists, setExistingWatchlists] = useState([]);

  useEffect(() => {
    const init = async () => {
      const database = await openDB("StockDatabase", 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains("watchlists")) {
            db.createObjectStore("watchlists", { keyPath: "id" });
          }
        },
      });
      setDb(database);
      const tx = database.transaction("stocks", "readonly");
      const store = tx.objectStore("stocks");
      const allSymbols = await store.getAllKeys();
      setSymbols(allSymbols.sort());

      const watchTx = database.transaction("watchlists", "readonly");
      const watchStore = watchTx.objectStore("watchlists");
      const allWatchlists = await watchStore.getAll();
      setExistingWatchlists(allWatchlists);
    };
    init();
  }, []);

  const addPair = () => {
    setSelectedPairs([...selectedPairs, { symbolA: "", symbolB: "" }]);
  };

  const updatePair = (index, field, value) => {
    const newPairs = [...selectedPairs];
    newPairs[index][field] = value;
    setSelectedPairs(newPairs);
  };

  const saveWatchlist = async () => {
    if (!watchlistName.trim()) return alert("Please enter a watchlist name");
    const cleanPairs = selectedPairs.filter(p => p.symbolA && p.symbolB && p.symbolA !== p.symbolB);

    const duplicates = new Set();
    for (let p of cleanPairs) {
      const key = [p.symbolA, p.symbolB].sort().join("-");
      if (duplicates.has(key)) return alert("Duplicate pairs not allowed");
      duplicates.add(key);
    }

    const existing = existingWatchlists.find(w => w.name === watchlistName);
    const watchlistObj = {
      id: existing?.id || uuidv4(),
      name: watchlistName,
      pairs: cleanPairs,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const tx = db.transaction("watchlists", "readwrite");
    const store = tx.objectStore("watchlists");
    await store.put(watchlistObj);
    const allWatchlists = await store.getAll();
    setExistingWatchlists(allWatchlists);
    alert("Watchlist saved successfully");
  };

  const loadWatchlist = (id) => {
    const selected = existingWatchlists.find(w => w.id === id);
    if (selected) {
      setWatchlistName(selected.name);
      setSelectedPairs(selected.pairs);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Watchlist Creator</h2>

      <Label>Watchlist Name</Label>
      <Input className="mb-4" value={watchlistName} onChange={e => setWatchlistName(e.target.value)} />

      <Button className="mb-4" onClick={addPair}>Add Pair</Button>
      {selectedPairs.map((pair, index) => (
        <div key={index} className="flex gap-2 mb-2">
          <Select value={pair.symbolA} onValueChange={val => updatePair(index, "symbolA", val)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Symbol A" />
            </SelectTrigger>
            <SelectContent>
              {symbols.map((sym, i) => <SelectItem key={i} value={sym}>{sym}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={pair.symbolB} onValueChange={val => updatePair(index, "symbolB", val)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Symbol B" />
            </SelectTrigger>
            <SelectContent>
              {symbols.map((sym, i) => <SelectItem key={i} value={sym}>{sym}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      ))}

      <Button className="mt-4" onClick={saveWatchlist}>Save Watchlist</Button>

      <h3 className="text-xl font-semibold mt-8 mb-2">Existing Watchlists</h3>
      <div className="grid grid-cols-1 gap-4">
        {existingWatchlists.map(w => (
          <Card key={w.id} className="cursor-pointer hover:shadow-lg" onClick={() => loadWatchlist(w.id)}>
            <CardContent className="p-4">
              <p className="font-bold">{w.name}</p>
              <p className="text-sm text-muted">{w.pairs.length} pair(s)</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
