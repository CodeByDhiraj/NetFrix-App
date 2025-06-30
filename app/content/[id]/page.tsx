/* -------------------------------------------------
   app/content/[id]/page.tsx
   -------------------------------------------------*/
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ChevronLeft, Play } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from '@/components/ui/tabs'
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from '@/components/ui/select'
import JetLoader from '@/components/ui/jet-loader'
import MoreLikeThis from '@/components/content/MoreLikeThis'

const CustomVideoPlayer = dynamic(
  () => import('@/components/Player/CustomVideoPlayer'),
  { ssr: false },
)

/* ─── types that match the API ─────────────────── */
interface Subtitle { language: string; url: string }
interface Episode {
  number: number
  title: string
  description: string
  duration: number         // minutes
  hlsUrl: string
  thumbnail?: string
  subtitles?: Subtitle[]
}
interface Season { number: number; title?: string; episodes: Episode[] }

interface ContentDoc {
  _id: string
  title: string
  description: string
  thumbnail: string
  backdrop?: string
  year: number
  duration: number
  rating: string
  languages: string[]
  cast: string[]
  genre: string[]
  type: 'movie' | 'series'
  hlsUrl?: string
  subtitles?: Subtitle[]
  seasons?: Season[]
}

/* ─── component ────────────────────────────────── */
export default function ContentDetail() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ContentDoc | null>(null)
  const [season, setSeason] = useState(0)   // index
  const [episode, setEpisode] = useState(0)   // index

  /* fetch once */
  useEffect(() => {
    let cancel = false
      ; (async () => {
        try {
          const res = await fetch(`/api/content/${id}`)
          const json = await res.json()
          if (!cancel) setData(json.success ? json.data : null)
        } catch { if (!cancel) setData(null) }
        finally { if (!cancel) setLoading(false) }
      })()
    return () => { cancel = true }
  }, [id])

  /* skeletons / 404 */
  if (loading) return <JetLoader />
  if (!data) return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      Content not found &nbsp;—&nbsp;
      <button className="underline" onClick={() => router.back()}>go back</button>
    </div>
  )

  /* helpers */
  const isSeries = data.type === 'series'
  const seasonsArr = data.seasons ?? []
  const activeEp = isSeries && seasonsArr[season]?.episodes
    ? seasonsArr[season].episodes[episode]
    : null
  const playerSrc = isSeries ? activeEp?.hlsUrl : data.hlsUrl
  const tracks = (isSeries ? activeEp?.subtitles : data.subtitles) ?? []

  /* navigate to watch page */
  const play = () => {
    if (isSeries && activeEp)
      router.push(`/watch/${data._id}?s=${seasonsArr[season].number}&e=${activeEp.number}`)
    else
      router.push(`/watch/${data._id}`)
  }

  /* ─── UI ─────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-black text-white">
      {/* hero */}
      <div className="relative w-full  aspect-square sm:aspect-[16/9] lg:aspect-video bg-black">
        {playerSrc ? (
          <CustomVideoPlayer
            hlsUrl={playerSrc}
            poster={data.backdrop ?? data.thumbnail}
            subtitles={tracks.map(t => ({
              label: t.language,
              src: t.url,
              lang: t.language,
            }))}
          />
        ) : (
          <img src={data.backdrop ?? data.thumbnail} className="w-full h-full object-cover" />
        )}

        {/* back */}
        <button
          onClick={() => router.back()}
          className="absolute top-3 left-3 bg-black/60 hover:bg-black/80 p-2 rounded-full"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* details */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-screen-lg mx-auto space-y-5">
      <h1 className="text-3xl font-bold">{data.title}</h1>

      <div className="flex flex-wrap gap-3 text-sm text-gray-300">
        <span>{data.year}</span>
        <span>{data.rating}</span>
        {!isSeries && <span>{data.duration} min</span>}
        {isSeries && <span>{seasonsArr.length} Season{seasonsArr.length > 1 && 's'}</span>}
      </div>

      <div className="flex gap-3 mt-4 flex-wrap">
        <Button onClick={play} className="bg-red-600 hover:bg-red-700 flex-1">
          <Play className="mr-2 h-5 w-5" /> Play
        </Button>
        <Button disabled variant="secondary" className="flex-1 opacity-40 cursor-not-allowed">
          Download
        </Button>
      </div>

      <p className="text-sm text-gray-300">{data.description}</p>
    </div>

      {/* tabs */ }
  <Tabs defaultValue={isSeries ? 'episodes' : 'moreLike'}>
    <TabsList className="flex gap-6 mx-4 max-w-screen-lg border-b border-red-600/40">
      {isSeries && <TabsTrigger value="episodes"
   className="data-[state=active]:text-red-500 data-[state=active]:border-b-2
              border-red-600 pb-2">Episodes</TabsTrigger>}
      <TabsTrigger value="moreLike"
   className="data-[state=active]:text-red-500 data-[state=active]:border-b-2
              border-red-600 pb-2">More Like This</TabsTrigger>
      <TabsTrigger value="details"
   className="data-[state=active]:text-red-500 data-[state=active]:border-b-2
              border-red-600 pb-2">More Details</TabsTrigger>
    </TabsList>

    {/* EPISODES */}
    {isSeries && (
      <TabsContent value="episodes" className="px-4 max-w-4xl mx-auto">
        {/* season select */}
        <Select
          value={String(season)}
          onValueChange={v => { setSeason(+v); setEpisode(0) }}
        >
          <SelectTrigger className="w-44 bg-transparent border-none font-semibold underline hover:opacity-80 my-4">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            {seasonsArr.map((s, i) => (
              <SelectItem key={s.number} value={String(i)}>
                {s.title || `Season ${s.number}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* episode rows */}
        <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-4">
          {seasonsArr[season]?.episodes.map((ep, idx) => (
            <div
              key={ep.number}
              onClick={() => setEpisode(idx)}
              className={`group flex gap-4 rounded-lg overflow-hidden
                              cursor-pointer transition
                              border border-transparent
                              hover:border-gray-600 hover:bg-gray-800/50
                              ${idx === episode ? 'bg-gray-800/70 border-gray-600' : ''}`}
            >
              <div className="w-40 h-24 bg-gray-900 shrink-0">
                <img
                  src={ep.thumbnail || data.thumbnail}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  alt={ep.title}
                />
              </div>

              <div className="py-1 pr-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{ep.title}</span>
                  {idx === episode &&
                    <span className="text-[10px] bg-red-600 px-1 rounded">NOW</span>}
                </div>
                <div className="text-xs text-gray-400 space-x-2">
                  <span>E{ep.number}</span><span>&bull;</span><span>{ep.duration} min</span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2">{ep.description}</p>
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
    )}

    {/* MORE LIKE THIS */}
    <TabsContent value="moreLike" className="px-4">
      <MoreLikeThis currentId={data._id} genre={data.genre} type={data.type} />
    </TabsContent>

    {/* DETAILS */}
    <TabsContent value="details" className="px-4">
      <div className="grid grid-cols-[120px_1fr] gap-y-2 text-sm max-w-4xl mx-auto">
        <span className="text-gray-400">Genres</span>
        <span>{data.genre.join(', ')}</span>
        <span className="text-gray-400">Cast</span>
        <span>{(data.cast ?? []).slice(0, 10).join(', ')}</span>
        <span className="text-gray-400">Languages</span>
        <span>{(data.languages ?? []).join(', ')}</span>
      </div>
    </TabsContent>
  </Tabs>
    </div >
  )
}
