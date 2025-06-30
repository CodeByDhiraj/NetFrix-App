/* ---------------------------------------------
   app/movies/page.tsx   (या जहाँ भी फाइल है)
----------------------------------------------*/
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import Navbar    from '@/components/layout/navbar'
import JetLoader from '@/components/ui/jet-loader'

export default function MoviesPage () {
  const router = useRouter()

  const [movies , setMovies ] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  /* fetch once */
  useEffect(() => { (async () => {
      try {
        const res  = await fetch('/api/content?type=movie')
        const json = await res.json()
        setMovies(json.data ?? [])
      } catch (err) {
        console.error('Movies fetch error:', err)
      } finally { setLoading(false) }
  })() }, [])

  /* ─────────── UI ─────────── */
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="pt-20 px-4 py-8">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-8">Movies</h1>

          {loading ? (
            <JetLoader />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {movies.map(movie => (
                /* ---- card ---- */
                <div
                  key={movie.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/content/${movie.id}`)}
                  onKeyDown={e => e.key === 'Enter' && router.push(`/content/${movie.id}`)}
                  className="group cursor-pointer outline-none"
                >
                  {/* image */}
                  <div className="relative overflow-hidden rounded-lg">
                    <img
                      src={movie.thumbnail || '/placeholder.svg?height=300&width=200'}
                      alt={movie.title}
                      className="w-full h-64  object-contains transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* hover overlay */}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={e => { e.stopPropagation(); router.push(`/content/${movie.id}`) }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
                      >
                        Play&nbsp;Now
                      </button>
                    </div>
                  </div>

                  {/* meta */}
                  <h3 className="mt-2 font-semibold">{movie.title}</h3>
                  <p  className="text-sm text-gray-400">
                    {movie.year}&nbsp;•&nbsp;{movie.rating}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
