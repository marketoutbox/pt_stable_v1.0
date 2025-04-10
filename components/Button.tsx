"use client"

export default function Button({ children, onClick, disabled = false, primary = false, className = "" }) {
  const baseClasses =
    "px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-900 transition-colors"

  const variantClasses = primary
    ? "bg-yellow-400 hover:bg-yellow-500 text-blue-900 focus:ring-yellow-400 disabled:bg-yellow-400/50"
    : "bg-blue-800 hover:bg-blue-700 text-blue-100 focus:ring-blue-500 disabled:bg-blue-800/50"

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${className} ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
    >
      {children}
    </button>
  )
}
