export default function Card({ title, children, className = "" }) {
  return (
    <div className={`bg-blue-900/50 backdrop-blur-sm rounded-lg shadow-lg border border-blue-800 ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-blue-800">
          <h3 className="text-lg font-medium text-blue-100">{title}</h3>
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
    </div>
  )
}
