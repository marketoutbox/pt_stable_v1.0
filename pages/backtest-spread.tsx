"use client"

import { useState, useEffect } from "react"
import { openDB } from "idb"
import calculateZScore from "../utils/calculations"
import Card from "../components/Card"
import Button from "../components/Button"
import Input from "../components/Input"
import Select from "../components/Select"

const BacktestSpread = () => {
  const [stocks, setStocks] = useState([])
  const [selectedPair, setSelectedPair] = useState({ stockA: "", stockB: "" })
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [entryZ, setEntryZ] = useState(2.5)
  const [exitZ, setExitZ] = useState(1.5)
  const [backtestData, setBacktestData] = useState([])
  const [tradeResults, setTradeResults] = useState([])
  const [lookbackPeriod, setLookbackPeriod] = useState(50) // For hedge ratio calculation
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const db = await openDB("StockDatabase", 1)
        const tx = db.transaction("stocks", "readonly")
        const store = tx.objectStore("stocks")
        const allStocks = await store.getAll()
        if (!allStocks.length) return
        setStocks(allStocks.map((stock) => stock.symbol))
      } catch (error) {
        console.error("Error fetching stocks:", error)
      }
    }
    fetchStocks()
  }, [])

  const handleSelection = (event) => {
    const { name, value } = event.target
    setSelectedPair((prev) => ({ ...prev, [name]: value }))
  }

  const filterByDate = (data) => {
    return data.filter((entry) => entry.date >= fromDate && entry.date <= toDate)
  }

  const calculateHedgeRatio = (pricesA, pricesB, currentIndex, windowSize) => {
    const startIdx = Math.max(0, currentIndex - windowSize + 1)
    const endIdx = currentIndex + 1

    let sumA = 0,
      sumB = 0,
      sumAB = 0,
      sumB2 = 0
    let count = 0

    for (let i = startIdx; i < endIdx; i++) {
      sumA += pricesA[i].close
      sumB += pricesB[i].close
      sumAB += pricesA[i].close * pricesB[i].close
      sumB2 += pricesB[i].close * pricesB[i].close
      count++
    }

    // Avoid division by zero
    if (count === 0 || count * sumB2 - sumB * sumB === 0) return 1

    return (count * sumAB - sumA * sumB) / (count * sumB2 - sumB * sumB)
  }

  const runBacktest = async () => {
    if (!selectedPair.stockA || !selectedPair.stockB) {
      alert("Please select two stocks.")
      return
    }

    setIsLoading(true)

    try {
      const db = await openDB("StockDatabase", 1)
      const tx = db.transaction("stocks", "readonly")
      const store = tx.objectStore("stocks")
      const stockAData = await store.get(selectedPair.stockA)
      const stockBData = await store.get(selectedPair.stockB)
      if (!stockAData || !stockBData) {
        alert("Stock data not found.")
        setIsLoading(false)
        return
      }

      const pricesA = filterByDate(stockAData.data)
      const pricesB = filterByDate(stockBData.data)
      const minLength = Math.min(pricesA.length, pricesB.length)

      const spreads = []
      const hedgeRatios = []

      // Calculate rolling hedge ratios and spreads
      for (let i = 0; i < minLength; i++) {
        // Use same lookback period for both hedge ratio and z-score for consistency
        const currentHedgeRatio = calculateHedgeRatio(pricesA, pricesB, i, lookbackPeriod)
        hedgeRatios.push(currentHedgeRatio)

        spreads.push({
          date: pricesA[i].date,
          spread: pricesA[i].close - currentHedgeRatio * pricesB[i].close,
          stockAClose: pricesA[i].close,
          stockBClose: pricesB[i].close,
          hedgeRatio: currentHedgeRatio,
        })
      }

      // Calculate z-scores for spreads
      const zScores = []
      for (let i = 0; i < spreads.length; i++) {
        const windowData = spreads.slice(Math.max(0, i - lookbackPeriod + 1), i + 1).map((s) => s.spread)
        zScores.push(calculateZScore(windowData).pop())
      }

      const tableData = spreads.map((item, index) => ({
        date: item.date,
        stockAClose: item.stockAClose,
        stockBClose: item.stockBClose,
        spread: item.spread,
        zScore: zScores[index] || 0,
        hedgeRatio: item.hedgeRatio,
      }))
      setBacktestData(tableData)

      const trades = []
      let openTrade = null

      for (let i = 1; i < tableData.length; i++) {
        const prevZ = tableData[i - 1].zScore
        const currZ = tableData[i].zScore
        const { date, spread, hedgeRatio } = tableData[i]

        if (!openTrade) {
          if (prevZ > -entryZ && currZ <= -entryZ) {
            openTrade = {
              entryDate: date,
              type: "LONG",
              entryIndex: i,
              entrySpread: spread,
              entryHedgeRatio: hedgeRatio,
            }
          } else if (prevZ < entryZ && currZ >= entryZ) {
            openTrade = {
              entryDate: date,
              type: "SHORT",
              entryIndex: i,
              entrySpread: spread,
              entryHedgeRatio: hedgeRatio,
            }
          }
        } else {
          const holdingPeriod = (new Date(date) - new Date(openTrade.entryDate)) / (1000 * 60 * 60 * 24)
          const exitCondition =
            (openTrade.type === "LONG" && prevZ < -exitZ && currZ >= -exitZ) ||
            (openTrade.type === "SHORT" && prevZ > exitZ && currZ <= exitZ) ||
            holdingPeriod >= 15

          if (exitCondition) {
            const exitIndex = i
            const exitSpread = spread
            const currentHedgeRatio = hedgeRatio

            const tradeSlice = tableData.slice(openTrade.entryIndex, exitIndex + 1)
            const spreadSeries = tradeSlice.map((s) => s.spread)
            const drawdowns = spreadSeries.map((s) => {
              if (openTrade.type === "LONG") return s - openTrade.entrySpread
              else return openTrade.entrySpread - s
            })
            const maxDrawdown = Math.max(...drawdowns.map((d) => -d))

            // Calculate profit using entry hedge ratio for consistency
            const profit =
              openTrade.type === "LONG" ? exitSpread - openTrade.entrySpread : openTrade.entrySpread - exitSpread

            trades.push({
              entryDate: openTrade.entryDate,
              exitDate: date,
              type: openTrade.type,
              holdingPeriod: holdingPeriod.toFixed(0),
              profit: profit.toFixed(2),
              maxDrawdown: maxDrawdown.toFixed(2),
              hedgeRatio: openTrade.entryHedgeRatio.toFixed(4),
              exitHedgeRatio: currentHedgeRatio.toFixed(4),
              hedgeRatioChange: (
                ((currentHedgeRatio - openTrade.entryHedgeRatio) / openTrade.entryHedgeRatio) *
                100
              ).toFixed(2),
            })

            openTrade = null
          }
        }
      }

      setTradeResults(trades)
    } catch (error) {
      console.error("Error in backtest:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate summary statistics
  const profitableTrades = tradeResults.filter((t) => Number.parseFloat(t.profit) > 0).length
  const winRate = tradeResults.length > 0 ? (profitableTrades / tradeResults.length) * 100 : 0
  const totalProfit = tradeResults.reduce((sum, trade) => sum + Number.parseFloat(trade.profit), 0)
  const avgProfit = tradeResults.length > 0 ? totalProfit / tradeResults.length : 0

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-100">Pair Trading Backtest</h1>
        <p className="text-blue-200 mt-2">Dynamic Spread Model</p>
      </div>

      <Card title="Backtest Parameters">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-1">Date Range</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-blue-300 mb-1">From:</label>
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-blue-300 mb-1">To:</label>
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-1">Stock Selection</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-blue-300 mb-1">Stock A:</label>
                <Select name="stockA" value={selectedPair.stockA} onChange={handleSelection}>
                  <option value="">-- Select --</option>
                  {stocks.map((symbol) => (
                    <option key={symbol} value={symbol}>
                      {symbol}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-xs text-blue-300 mb-1">Stock B:</label>
                <Select name="stockB" value={selectedPair.stockB} onChange={handleSelection}>
                  <option value="">-- Select --</option>
                  {stocks.map((symbol) => (
                    <option key={symbol} value={symbol}>
                      {symbol}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-1">Lookback Period (days)</label>
            <Input
              type="number"
              value={lookbackPeriod}
              onChange={(e) => setLookbackPeriod(Number.parseInt(e.target.value))}
              min="10"
              max="252"
            />
            <p className="mt-1 text-xs text-blue-300">Window size for calculating hedge ratio and z-score</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-1">Entry Z-score</label>
            <Input
              type="number"
              step="0.1"
              value={entryZ}
              onChange={(e) => setEntryZ(Number.parseFloat(e.target.value))}
            />
            <p className="mt-1 text-xs text-blue-300">Threshold for entering a trade position</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-1">Exit Z-score</label>
            <Input
              type="number"
              step="0.1"
              value={exitZ}
              onChange={(e) => setExitZ(Number.parseFloat(e.target.value))}
            />
            <p className="mt-1 text-xs text-blue-300">Threshold for exiting a trade position</p>
          </div>
        </div>

        <div className="flex justify-center">
          <Button onClick={runBacktest} disabled={isLoading} primary className="px-8">
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-900"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Run Backtest"
            )}
          </Button>
        </div>
      </Card>

      {isLoading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        </div>
      )}

      {backtestData.length > 0 && !isLoading && (
        <Card title="Backtest Data">
          <div className="overflow-x-auto">
            <div className="max-h-64 overflow-y-auto">
              <table className="min-w-full divide-y divide-blue-800">
                <thead className="bg-blue-900/70 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                      {selectedPair.stockA} Close
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                      {selectedPair.stockB} Close
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                      Hedge Ratio (β)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                      Spread (A - βB)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                      Z-score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-blue-900/40 divide-y divide-blue-800">
                  {backtestData.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-blue-900/20" : "bg-blue-900/40"}>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-blue-100">{row.date}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-blue-100">
                        {row.stockAClose.toFixed(2)}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-blue-100">
                        {row.stockBClose.toFixed(2)}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-blue-100">{row.hedgeRatio.toFixed(4)}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-blue-100">{row.spread.toFixed(4)}</td>
                      <td
                        className={`px-6 py-2 whitespace-nowrap text-sm font-medium ${
                          row.zScore > entryZ || row.zScore < -entryZ
                            ? "text-yellow-400"
                            : row.zScore > exitZ || row.zScore < -exitZ
                              ? "text-yellow-300/70"
                              : "text-blue-100"
                        }`}
                      >
                        {row.zScore.toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {tradeResults.length > 0 && !isLoading && (
        <Card title="Trade Results">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-blue-800">
              <thead className="bg-blue-900/70">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                    Entry Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                    Exit Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                    Days
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                    Profit ($)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                    Drawdown ($)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                    Entry β
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                    Exit β
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                    β Change (%)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-blue-900/40 divide-y divide-blue-800">
                {tradeResults.map((trade, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-blue-900/20" : "bg-blue-900/40"}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-100">{trade.entryDate}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-100">{trade.exitDate}</td>
                    <td
                      className={`px-4 py-2 whitespace-nowrap text-sm font-medium ${
                        trade.type === "LONG" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {trade.type}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-100">{trade.holdingPeriod}</td>
                    <td
                      className={`px-4 py-2 whitespace-nowrap text-sm font-medium ${
                        Number.parseFloat(trade.profit) >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      ${trade.profit}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-red-400">${trade.maxDrawdown}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-100">{trade.hedgeRatio}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-100">{trade.exitHedgeRatio}</td>
                    <td
                      className={`px-4 py-2 whitespace-nowrap text-sm ${
                        Number.parseFloat(trade.hedgeRatioChange) >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {trade.hedgeRatioChange}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-800">
              <p className="text-sm text-blue-300">Total Trades</p>
              <p className="text-2xl font-bold text-yellow-400">{tradeResults.length}</p>
            </div>
            <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-800">
              <p className="text-sm text-blue-300">Profitable Trades</p>
              <p className="text-2xl font-bold text-green-400">{profitableTrades}</p>
            </div>
            <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-800">
              <p className="text-sm text-blue-300">Win Rate</p>
              <p className="text-2xl font-bold text-yellow-400">{winRate.toFixed(1)}%</p>
            </div>
            <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-800">
              <p className="text-sm text-blue-300">Avg. Profit per Trade</p>
              <p className={`text-2xl font-bold ${avgProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                ${avgProfit.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default BacktestSpread
