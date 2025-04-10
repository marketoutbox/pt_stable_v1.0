"use client"

export default function Select({ value, onChange, children, className = "", ...props }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2 bg-blue-900/70 border border-blue-700 rounded-md text-blue-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}
