/* ------------------------------------------------------------------
   ContentGrid  – horizontal Netflix‑style rows (mobile swipeable)
------------------------------------------------------------------- */
'use client'

import { useState, useEffect } from 'react'
import Link  from 'next/link'
import { useRouter } from 'next/navigation'
import { Play, ThumbsUp, ChevronDown, Heart } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card }   from '@/components/ui/card'
import JetLoader  from '@/components/ui/jet-loader'
import { categories } from '@/lib/categories'
import HorizontalSlider from '@/components/Slider/HorizontalSlider'

/* ─────────────── Types ─────────────── */
interface ContentItem {
  id: string
  title: string
  thumbnail: string
  genre: string[]
  rating: string
  duration: string
  year: number
  description: string
  type: 'movie' | 'series'
  hlsUrl: string
  categories?: string[]
}

/* ─────────────── Grid ─────────────── */
export default function ContentGrid() {
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [hovered, setHovered] = useState<string | null>(null)

  /* fetch once */
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch('/api/content?limit=120')
        const json = await res.json()
        if (json.success) setContent(json.data)
      } catch (err) {
        console.error('Failed to fetch content:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <JetLoader />

  if (!content.length)
    return (
      <div className="py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">No Content Available</h2>
        <p className="text-gray-400">Check back later for new movies and series!</p>
      </div>
    )

  /* build every section from category map */
  return (
    <div className="space-y-12">
      {categories.map(({ title, value }) => {
        const list = content.filter(c => c.categories?.includes(value))
        if (!list.length) return null
        return (
          <Section
            key={value}
            title={title}
            items={list}
            hovered={hovered}
            setHovered={setHovered}
          />
        )
      })}
    </div>
  )
}

/* ─────────────── Section ─────────────── */
function Section({
  title,
  items,
  hovered,
  setHovered,
}: {
  title: string
  items: ContentItem[]
  hovered: string | null
  setHovered: (id: string | null) => void
}) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6 text-white">{title}</h2>

      {/* horizontal swiper row */}
      <HorizontalSlider
        items={items}
        renderItem={(it) => (
          <CardItem
            item={it}
            isHovered={hovered === it.id}
            onHover={() => setHovered(it.id)}
            onLeave={() => setHovered(null)}
          />
        )}
      />
    </section>
  )
}

/* ─────────────── Single Card ─────────────── */
function CardItem({ item, isHovered, onHover, onLeave }: {
  item: ContentItem
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
}) {
  const router        = useRouter()
  const [fav, setFav] = useState(false)

  return (
    <Link
      href={`/content/${item.id}`}
      className="block group relative cursor-pointer transition-transform duration-300 hover:scale-105 min-w-[150px] sm:min-w-[180px]"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Thumb + title */}
      <Card className="bg-gray-900 border-gray-800 overflow-hidden">
        <img
          src={item.thumbnail || '/placeholder.svg'}
          alt={item.title}
          className="w-full h-48 md:h-64  object-contains  object-center bg-black"
        />
        <div className="p-3">
          <h3 className="font-semibold text-sm truncate text-white">{item.title}</h3>
          <p className="text-xs text-gray-400 line-clamp-2">{item.description}</p>
        </div>
      </Card>

      {/* Hover overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="text-center space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center gap-2">
              <Button size="icon" className="bg-white text-black" onClick={() => router.push(`/watch/${item.id}`)}>
                <Play className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="secondary" className="bg-gray-600 text-white" onClick={() => setFav(!fav)}>
                <Heart className={`w-4 h-4 ${fav ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button size="icon" variant="secondary" className="bg-gray-600 text-white">
                <ThumbsUp className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="secondary" className="bg-gray-600 text-white">
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>

            <div className="text-sm text-white">
              <div className="flex justify-center gap-2 mb-1">
                <span className="bg-red-600 text-xs px-1 rounded">{item.rating}</span>
                <span>{item.year}</span>
                <span>{item.duration}</span>
              </div>
              <div className="flex justify-center gap-1 text-xs text-gray-300">
                {item.genre.slice(0, 2).join(' • ')}
              </div>
            </div>
          </div>
        </div>
      )}
    </Link>
  )
}
