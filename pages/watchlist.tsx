'use client';

import React, { useEffect, useState } from 'react';
import { openDB } from 'idb';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../components/ui/select';

const WatchlistPage = () => {
  const [symbolOptions, setSymbolOptions] = useState<string[]>([]);
  const [watchlistName, setWatchlistName] = useState('');
  const [selectedPairs, setSelectedPairs] = useState<[string, string][]>([]);
  const [pairA, setPairA] = useState('');
  const [pairB, setPairB] = useState('');
  const [existingWatchlists, setExistingWatchlists] = useState<
    { id: string; name: string; pairs: [string, string][] }[]
  >([]);

  useEffect(() => {
    const loadSymbols = async () => {
      const db = await openDB('StockDatabase', 2, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('watchlists')) {
            db.createObjectStore('watchlists', { keyPath: 'id' });
          }
        },
      });
      const tx = db.transaction('stocks', 'readonly');
      const store = tx.objectStore('stocks');
      const keys = await store.getAllKeys();
      setSymbolOptions(keys as string[]);
    };

    const loadWatchlists = async () => {
      const db = await openDB('StockDatabase', 2);
      const tx = db.transaction('watchlists', 'readonly');
      const store = tx.objectStore('watchlists');
      const all = await store.getAll();
      setExistingWatchlists(all);
    };

    loadSymbols();
    loadWatchlists();
  }, []);

  const addPair = () => {
    if (
      pairA &&
      pairB &&
      pairA !== pairB &&
      !selectedPairs.some(
        ([a, b]) => (a === pairA && b === pairB) || (a === pairB && b === pairA)
      )
    ) {
      setSelectedPairs([...selectedPairs, [pairA, pairB]]);
    }
  };

  const saveWatchlist = async () => {
    if (!watchlistName || selectedPairs.length === 0) return;

    const db = await openDB('StockDatabase', 2);
    const tx = db.transaction('watchlists', 'readwrite');
    const store = tx.objectStore('watchlists');
    const newWatchlist = {
      id: uuidv4(),
      name: watchlistName,
      pairs: selectedPairs,
    };
    await store.put(newWatchlist);
    await tx.done;
    setExistingWatchlists([...existingWatchlists, newWatchlist]);
    setWatchlistName('');
    setSelectedPairs([]);
  };

  return (
    <div className="p-4 space-y-6 max-w-3xl mx-auto">
      <Card>
        <CardContent className="space-y-4 p-4">
          <Label>Watchlist Name</Label>
          <Input
            value={watchlistName}
            onChange={(e) => setWatchlistName(e.target.value)}
            placeholder="e.g., Automobiles"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Stock A</Label>
              <Select onValueChange={(val) => setPairA(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Stock A" />
                </SelectTrigger>
                <SelectContent>
                  {symbolOptions.map((symbol) => (
                    <SelectItem key={symbol} value={symbol}>
                      {symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Stock B</Label>
              <Select onValueChange={(val) => setPairB(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Stock B" />
                </SelectTrigger>
                <SelectContent>
                  {symbolOptions.map((symbol) => (
                    <SelectItem key={symbol} value={symbol}>
                      {symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={addPair}>Add Pair</Button>

          {selectedPairs.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Pairs</Label>
              {selectedPairs.map(([a, b], idx) => (
                <div key={idx}>
                  {a} - {b}
                </div>
              ))}
            </div>
          )}

          <Button onClick={saveWatchlist}>Save Watchlist</Button>
        </CardContent>
      </Card>

      {existingWatchlists.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Existing Watchlists</h2>
          {existingWatchlists.map((watchlist) => (
            <Card key={watchlist.id}>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-medium">{watchlist.name}</h3>
                {watchlist.pairs.map(([a, b], i) => (
                  <div key={i}>
                    {a} - {b}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchlistPage;
