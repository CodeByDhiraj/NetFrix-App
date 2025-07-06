/* -------------------------------------------------
   app/search/page.tsx
   -------------------------------------------------*/
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import JetLoader from '@/components/ui/jet-loader'

export default function SearchPage () {
  /* ── query params ─ */
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  /* ── state ─ */
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  /* ── fetch whenever query changes ─ */
  useEffect(() => {
    if (!query) return
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/content?search=${encodeURIComponent(query)}`,
          { cache: 'no-store' } // Force fresh data on all devices
        )
        const json = await res.json()
        setResults(json?.data ?? [])
      } catch (e) {
        console.error('Search failed:', e)
        setResults([])
      } finally {
        setLoading(false)
      }
    })()
  }, [query])

  /* ── helpers ─ */
  const router = useRouter()
  const openDetail = (id: string) => router.push(`/content/${id}`)

  /* ── UI ─ */
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="pt-20 px-4 py-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-2">Search Results</h1>
          <p className="text-gray-400 mb-8">
            {query ? `Results for "${query}"` : 'Enter a search term'}
          </p>

          {loading ? (
            <JetLoader />
          ) : results.length ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {results.map(item => (
                <button
                  key={item._id}
                  onClick={() => openDetail(item._id)}
                  className="group text-left cursor-pointer focus:outline-none"
                >
                  <div className="relative overflow-hidden rounded-lg">
                    <img
                      src={item.thumbnail || '/placeholder.svg?height=300&width=200'}
                      alt={item.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0
                                    group-hover:opacity-100 transition-opacity duration-300
                                    flex items-center justify-center">
                      <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
                        View
                      </span>
                    </div>
                  </div>

                  <h3 className="text-white font-semibold mt-2 line-clamp-1">
                    {item.title}
                  </h3>

                  <p className="text-gray-400 text-sm">
                    {item.year} • {item.rating}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                No results found for &quot;{query}&quot;
              </p>
              <p className="text-gray-500 mt-2">
                Try searching for something else — we soon will have more content! Keep supporting us.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
