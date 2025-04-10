import Link from "next/link"
import Card from "../components/Card"

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-100 mb-4">Pair Trading Platform</h1>
        <p className="text-xl text-blue-200 max-w-3xl mx-auto">
          A comprehensive platform for statistical arbitrage and pair trading strategies
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <Link href="/stocks" className="block">
          <Card className="h-full transition-transform hover:scale-105">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 bg-blue-800 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-yellow-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-yellow-400 mb-2">Stock Data</h3>
              <p className="text-blue-200">Fetch and manage stock data from various sources</p>
            </div>
          </Card>
        </Link>

        <Link href="/backtest" className="block">
          <Card className="h-full transition-transform hover:scale-105">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 bg-blue-800 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-yellow-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-yellow-400 mb-2">Ratio Backtest</h3>
              <p className="text-blue-200">Backtest pair trading strategies using price ratios</p>
            </div>
          </Card>
        </Link>

        <Link href="/backtest-spread" className="block">
          <Card className="h-full transition-transform hover:scale-105">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 bg-blue-800 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-yellow-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-yellow-400 mb-2">Spread Backtest</h3>
              <p className="text-blue-200">Backtest pair trading strategies using price spreads</p>
            </div>
          </Card>
        </Link>
      </div>

      <Card className="mt-12">
        <div className="p-4">
          <h2 className="text-2xl font-bold text-blue-100 mb-4">About Pair Trading</h2>
          <p className="text-blue-200 mb-4">
            Pair trading is a market-neutral trading strategy that matches a long position with a short position in a
            pair of highly correlated instruments. The strategy tracks the performance of two historically correlated
            securities. When the correlation between the two securities temporarily weakens, i.e., one stock moves up
            while the other moves down, the pairs trade would be to short the outperforming stock and to long the
            underperforming one, betting that the "spread" between the two would eventually converge.
          </p>
          <p className="text-blue-200">
            This platform provides tools to identify potential pairs, backtest strategies, and analyze performance
            metrics to help you make informed trading decisions.
          </p>
        </div>
      </Card>
    </div>
  )
}
