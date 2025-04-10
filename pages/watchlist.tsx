'use client';

import { useEffect, useState } from 'react';
import Select from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { openDB } from 'idb';

type Pair = {
  stockA: string;
  stockB: string;
};

type Watchlist = {
  name: string;
  pairs: Pair[];
};

export default function WatchlistPage() {
  const [watchlistName, setWatchlistName] = useState('');
  const [selectedStockA, setSelectedStockA] = useState('');
  const [selectedStockB, setSelectedStockB] = useState('');
  const [stockSymbols, setStockSymbols] = useState<string[]>([]);
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState<string>('');

  // Load symbols from IndexedDB
  useEffect(() => {
    const loadSymbols = async () => {
      const db = await openDB('StockDatabase', 1);
      const tx = db.transaction('stocks', 'readonly');
      const store = tx.objectStore('stocks');
      const allKeys = await store.getAllKeys();
      setStockSymbols(allKeys as string[]);
    };
    loadSymbols();
    loadAllWatchlists();
  }, []);

  // Save a new watchlist
  const saveWatchlist = async () => {
    if (!watchlistName) return;
    const db = await openDB('StockDatabase', 1);
    const tx = db.transaction('watchlists', 'readwrite');
    const store = tx.objectStore('watchlists');
    const existing = await store.get(watchlistName);
    if (!existing) {
      await store.put({ name: watchlistName, pairs: [] });
      setWatchlists((prev) => [...prev, { name: watchlistName, pairs: [] }]);
    }
    setSelectedWatchlist(watchlistName);
    setWatchlistName('');
  };

  // Add a pair to an existing watchlist
  const addPairToWatchlist = async () => {
    if (!selectedStockA || !selectedStockB || !selectedWatchlist) return;
    const db = await openDB('StockDatabase', 1);
    const tx = db.transaction('watchlists', 'readwrite');
    const store = tx.objectStore('watchlists');
    const current = (await store.get(selectedWatchlist)) as Watchlist;

    const exists = current.pairs.some(
      (p) =>
        (p.stockA === selectedStockA && p.stockB === selectedStockB) ||
        (p.stockA === selectedStockB && p.stockB === selectedStockA)
    );

    if (!exists) {
      current.pairs.push({ stockA: selectedStockA, stockB: selectedStockB });
      await store.put(current);
      loadAllWatchlists();
    }

    setSelectedStockA('');
    setSelectedStockB('');
  };

  const loadAllWatchlists = async () => {
    const db = await openDB('StockDatabase', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('watchlists')) {
          db.createObjectStore('watchlists', { keyPath: 'name' });
        }
      },
    });
    const tx = db.transaction('watchlists', 'readonly');
    const store = tx.objectStore('watchlists');
    const all = await store.getAll();
    setWatchlists(all as Watchlist[]);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-4">📋 Create or Edit Watchlists</h1>

      {/* Create a new watchlist */}
      <div className="mb-4">
        <Input
          placeholder="Enter Watchlist Name (e.g., Automobiles)"
          value={watchlistName}
          onChange={(e) => setWatchlistName(e.target.value)}
        />
        <Button className="mt-2" onClick={saveWatchlist}>
          Create Watchlist
        </Button>
      </div>

      {/* Select watchlist */}
      <div className="mb-4">
        <label className="block mb-1">Select Watchlist</label>
        <Select
          value={selectedWatchlist}
          onChange={(e) => setSelectedWatchlist(e.target.value)}
        >
          <option value="">-- Select --</option>
          {watchlists.map((w) => (
            <option key={w.name} value={w.name}>
              {w.name}
            </option>
          ))}
        </Select>
      </div>

      {/* Select Pair */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-1">Stock A</label>
          <Select
            value={selectedStockA}
            onChange={(e) => setSelectedStockA(e.target.value)}
          >
            <option value="">Select Stock A</option>
            {stockSymbols.map((symbol) => (
              <option key={symbol} value={symbol}>
                {symbol}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block mb-1">Stock B</label>
          <Select
            value={selectedStockB}
            onChange={(e) => setSelectedStockB(e.target.value)}
          >
            <option value="">Select Stock B</option>
            {stockSymbols.map((symbol) => (
              <option key={symbol} value={symbol}>
                {symbol}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Button onClick={addPairToWatchlist} className="mb-6">
        ➕ Add Pair to Watchlist
      </Button>

      {/* Existing Watchlists Display */}
      <div>
        <h2 className="text-xl font-semibold mb-2">📑 Existing Watchlists</h2>
        {watchlists.map((wl) => (
          <div key={wl.name} className="border p-3 mb-4 rounded bg-navy-800/50">
            <h3 className="font-bold mb-2">{wl.name}</h3>
            {wl.pairs.length === 0 ? (
              <p className="text-sm text-gray-400">No pairs yet.</p>
            ) : (
              <ul className="list-disc ml-5 text-sm">
                {wl.pairs.map((pair, idx) => (
                  <li key={idx}>
                    {pair.stockA} - {pair.stockB}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

