/* ------------------------------------------ *
 *  components/content/MoreLikeThis.tsx       *
 * ------------------------------------------ */
'use client'

import { useEffect, useState } from 'react'
import Link  from 'next/link'
import { useRouter } from 'next/navigation'
import JetLoader from '@/components/ui/jet-loader'

interface Card {
  id : string
  title: string
  thumbnail: string
  genre: string[]
  type : 'movie' | 'series'
}

interface Props {
  currentId : string        // अभी जिस टाइटल पर हैं
  genre     : string[]      // current के genre list
  type      : 'movie' | 'series'
}

export default function MoreLikeThis ({ currentId, genre, type }: Props) {
  const [loading, setLoading] = useState(true)
  const [data,    setData]    = useState<Card[]>([])
  const router = useRouter()

  /* fetch once */
  useEffect(() => {
    let cancel = false
    ;(async () => {
      try {
        // first genre keyword (e.g. "Action")
        const g = genre[0] ?? ''
        const res  = await fetch(
          `/api/content?genre=${encodeURIComponent(g)}&type=${type}&limit=12`,
          { cache:'no-store' }
        )
        const json = await res.json()
        if (!cancel && json.success){
          const filtered = json.data.filter((it:Card)=> it.id !== currentId)
          setData(filtered)
        }
      } catch { /* ignore */ }
      finally   { if (!cancel) setLoading(false) }
    })()
    return () => { cancel = true }
  }, [currentId, genre, type])

  /* loading / empty */
  if (loading) return <JetLoader />
  if (!data.length)
    return <p className="text-gray-400">No similar titles found.</p>

  /* grid */
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {data.map(item => (
        <Link
          key={item.id}
          href={`/content/${item.id}`}
          onClick={()=> router.refresh()}   // SSR डेटा री-फेच कर ले
          className="group cursor-pointer"
        >
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={item.thumbnail || '/placeholder.svg'}
              alt={item.title}
              className="w-full h-64 object-contsins transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="mt-2 font-semibold">{item.title}</h3>
          <p className="text-xs text-gray-400 line-clamp-1">{item.genre.join(', ')}</p>
        </Link>
      ))}
    </div>
  )
}
