"use client"

export default function JetLoader() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="relative">
        {/* Jet Animation */}
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-red-400 border-b-transparent rounded-full animate-spin animate-reverse"></div>
          <div className="absolute inset-4 border-4 border-red-300 border-l-transparent rounded-full animate-spin"></div>
        </div>

        {/* NetFrix Text */}
        <div className="mt-4 text-center">
          <div className="text-red-600 font-bold text-lg animate-pulse">NetFrix</div>
          <div className="text-gray-400 text-sm mt-1">Loading content...</div>
        </div>
      </div>
    </div>
  )
}
