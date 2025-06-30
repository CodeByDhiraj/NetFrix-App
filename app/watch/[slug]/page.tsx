/* ----------------------------------------------- */
/*  app/watch/[slug]/page.tsx                      */
/*  (uses the updated CustomVideoPlayer component) */
/* ----------------------------------------------- */
'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import dynamic from 'next/dynamic'

const CustomVideoPlayer = dynamic(
  () => import('@/components/Player/CustomVideoPlayer'),
  { ssr: false }
)

import JetLoader from '@/components/ui/jet-loader'
import { Button } from '@/components/ui/button'

/* ── API / DB shapes ───────────────────────────── */
interface Episode   { number: number; hlsUrl: string }
interface Season    { number: number; episodes: Episode[] }
interface Subtitle  { language: string; url: string }
interface ContentDoc {
  _id: string
  title: string
  thumbnail: string
  type: 'movie' | 'series'
  hlsUrl?: string            // movie OR series fallback trailer
  subtitles?: Subtitle[]
  seasons?: Season[]         // series-only
}

/* ── Page ──────────────────────────────────────── */
export default function WatchPage () {
  /* params & router */
  const { slug }       = useParams<{ slug: string }>()
  const search         = useSearchParams()
  const router         = useRouter()

  /* ui state */
  const [data, setData] = useState<ContentDoc | null>(null)
  const [error, setErr] = useState('')

  /* fetch once on mount */
  useEffect(() => {
    let cancel = false
    ;(async () => {
      try {
        const res  = await fetch(`/api/content/${slug}`)
        const json = await res.json()
        if (!cancel) {
          if (json?.success) setData(json.data)
          else {
            setErr('Content not found')
          }
        }
      } catch (e) {
        if (!cancel) setErr('Network error')
      }
    })()
    return () => { cancel = true }
  }, [slug])

  /* loading / error states */
  if (error) return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      {error} — <button className="underline ml-2" onClick={() => router.back()}>Go back</button>
    </div>
  )
  if (!data) return <JetLoader />

  /* ── decide actual .m3u8 to play ─────────────── */
  let playUrl = data.hlsUrl ?? ''
  if (data.type === 'series' && data.seasons?.length) {
    const sNum = Number(search.get('s') ?? 1)
    const eNum = Number(search.get('e') ?? 1)
    const ep   = data.seasons
                    .find(s => s.number === sNum)
                    ?.episodes.find(e => e.number === eNum)
    if (ep?.hlsUrl) playUrl = ep.hlsUrl
  }

  /* safety fallback */
  if (!playUrl) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        No playable source
      </div>
    )
  }

  /* subtitles → CustomVideoPlayer shape */
  const tracks = (data.subtitles ?? []).map<{
    label: string
    src: string
    lang: string
  }>(s => ({ label: s.language, src: s.url, lang: s.language }))

  /* ── UI ──────────────────────────────────────── */
  return (
    <div className="relative w-full h-screen bg-black">
      {/* back button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-20 text-white hover:bg-white/20"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-6 h-6" />
      </Button>

      {/* video player fills screen */}
      <CustomVideoPlayer
        hlsUrl={playUrl}
        poster={data.thumbnail}
        subtitles={tracks}
      />
    </div>
  )
}
