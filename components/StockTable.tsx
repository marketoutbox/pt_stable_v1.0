export default function StockTable({ stocks }) {
  if (stocks.length === 0)
    return (
      <div className="text-center py-8">
        <p className="text-blue-200">No data available.</p>
      </div>
    )

  return (
    <div className="mt-6 overflow-hidden rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-blue-800">
          <thead className="bg-blue-900/70">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider"
              >
                Symbol
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider"
              >
                Open
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider"
              >
                High
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider"
              >
                Low
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider"
              >
                Close
              </th>
            </tr>
          </thead>
          <tbody className="bg-blue-900/40 divide-y divide-blue-800">
            {stocks.map((stock, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-blue-900/20" : "bg-blue-900/40"}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{stock.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-yellow-400">{stock.symbol}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{stock.open.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{stock.high.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{stock.low.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{stock.close.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
