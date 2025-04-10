export default function StockTable({ stocks }) {
  if (stocks.length === 0)
    return (
      <div className="text-center py-8">
        <p className="text-navy-200">No data available.</p>
      </div>
    )

  return (
    <div className="mt-6 overflow-hidden rounded-lg shadow-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-navy-700/20">
          <thead className="bg-gradient-to-r from-navy-900/90 to-navy-800/90">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-navy-200 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-navy-200 uppercase tracking-wider"
              >
                Symbol
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-navy-200 uppercase tracking-wider"
              >
                Open
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-navy-200 uppercase tracking-wider"
              >
                High
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-navy-200 uppercase tracking-wider"
              >
                Low
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-navy-200 uppercase tracking-wider"
              >
                Close
              </th>
            </tr>
          </thead>
          <tbody className="bg-navy-900/20 divide-y divide-navy-700/10">
            {stocks.map((stock, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-navy-900/10" : "bg-navy-800/10"}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-100">{stock.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium gold-gradient-text">{stock.symbol}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-100">{stock.open.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-100">{stock.high.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-100">{stock.low.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-100">{stock.close.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
