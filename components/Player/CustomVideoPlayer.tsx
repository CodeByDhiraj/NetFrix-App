// -------------------------------------------------
// components/Player/CustomVideoPlayer.tsx  (v4)
// -------------------------------------------------
'use client'

import { useEffect, useRef, useMemo, useState } from 'react'
import Hls from 'hls.js'
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'

interface SubtitleTrack {
  label: string
  src: string
  lang: string
}
interface Props {
  hlsUrl: string
  poster?: string
  subtitles?: SubtitleTrack[]
  autoplay?: boolean
}

export default function CustomVideoPlayer({ hlsUrl, poster, autoplay = false }: Props) {
  /* refs */
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef   = useRef<Hls | null>(null)
  const plyrRef  = useRef<Plyr | null>(null)

  /* ui‑state */
  const [flash,  setFlash]  = useState<'left' | 'right' | null>(null)
  const [locked, setLocked] = useState(false)
  const [bright, setBright] = useState(1)     // 0.2 – 1.2 visual only
  const [vol,    setVol]    = useState(1)     // 0 – 1 video volume

  /* ───── Device check ───── */
  const device = useMemo(() => ({
    isMobile: /Android|iP(hone|od)|Mobi/i.test(
      typeof navigator !== 'undefined' ? navigator.userAgent : ''
    )
  }), [])

  /* ───── CSS once ───── */
  useEffect(() => {
    if (document.getElementById('plyr-css')) return
    const s = document.createElement('style')
    s.id = 'plyr-css'
    s.textContent = `
      :root{--plyr-color-main:#a30008!important}
      .nf-spinner{position:absolute;top:50%;left:50%;width:60px;height:60px;margin:-30px 0 0 -30px;border:4px solid rgba(255,255,255,.35);border-top-color:#e50914;border-radius:50%;animation:spin .75s linear infinite;display:none;pointer-events:none;z-index:7}@keyframes spin{to{transform:rotate(360deg)}}
      .seek-flash,.info-flash{position:absolute;top:0;bottom:25%;width:32%;display:flex;align-items:center;justify-content:center;font-size:2rem;color:#fff;opacity:0;pointer-events:none;transition:opacity .15s}
      .seek-flash.left{left:0}.seek-flash.right{right:0}.seek-flash.show{opacity:.9}
      .info-flash{left:50%;transform:translateX(-50%);width:60%;font-size:1.2rem;background:rgba(0,0,0,.5);border-radius:8px}
      .info-flash.show{opacity:.95}
      .plyr__menu [data-plyr="lock"]{padding:.4rem .8rem;cursor:pointer}
    `
    document.head.appendChild(s)
  }, [])

  /* ───── Build player + attach listeners ───── */
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    /* block context‑menu */
    const ctx = (e: MouseEvent) => e.preventDefault()
    video.addEventListener('contextmenu', ctx)

    /* Plyr options */
    const opts: Plyr.Options = {
      autoplay,
      seekTime: 10,
      disableContextMenu: true,
      controls: [
        'play-large','rewind','fast-forward','play','progress','current-time',
        'mute','volume','captions','settings','pip','airplay','fullscreen'
      ],
      settings: ['captions','quality','speed']
    }

    /* build Plyr wrapper */
    const makePlayer = () => {
      plyrRef.current = new Plyr(video, opts)
      plyrRef.current.volume = vol

      /* spinner */
      const box = plyrRef.current.elements.container
      if (!box) return
      const sp = document.createElement('div')
      sp.className = 'nf-spinner'
      box.appendChild(sp)
      const show = () => (sp.style.display = 'block')
      const hide = () => (sp.style.display = 'none')
      plyrRef.current.on('waiting', show)
      plyrRef.current.on('seeking', show)
      plyrRef.current.on('playing', hide)
      plyrRef.current.on('canplay', hide)

      /* add Lock item once menu is built */
      setTimeout(() => {
        const menu = box.querySelector('.plyr__menu__container ul') as HTMLElement | null
        if (menu && !menu.querySelector('[data-plyr="lock"]')) {
          const li = document.createElement('li')
          li.setAttribute('data-plyr', 'lock')
          li.textContent = 'Lock Controls'
          menu.appendChild(li)
          li.addEventListener('click', () => {
            setLocked(prev => {
              const nxt = !prev
              li.textContent = nxt ? 'Unlock Controls' : 'Lock Controls'
              return nxt
            })
          })
        }
      }, 400)

      /* prevent body scroll in fullscreen (mobile) */
      const lockScroll   = () => { if (device.isMobile) document.body.style.overflow = 'hidden' }
      const unlockScroll = () => { if (device.isMobile) document.body.style.overflow = '' }
      plyrRef.current.on('enterfullscreen', lockScroll)
      plyrRef.current.on('exitfullscreen', unlockScroll)
    }

    /* attach HLS */
    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true })
      hlsRef.current = hls
      hls.loadSource(hlsUrl)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, makePlayer)
    } else {
      video.src = hlsUrl
      makePlayer()
    }

    /* ── 1080p preference listener ── */
    const prefListener = (e: any) => {
      const enable1080 = !!e.detail
      const hls = hlsRef.current
      if (!hls || !hls.levels?.length) return

      // sort levels low→high by height
      const sorted = [...hls.levels].sort((a,b) => a.height - b.height)
      const target = enable1080 ? sorted.at(-1) : sorted[0]
      const idx    = hls.levels.indexOf(target!)
      if (idx >= 0) hls.currentLevel = idx
    }
    window.addEventListener('pref-1080-change', prefListener)

    /* double‑tap seek zones + swipe gestures (unchanged) */
    const mkZone = (side: 'left' | 'right', delta: number) => {
      let lastTap = 0
      const z = document.createElement('div')
      z.style.cssText = `position:absolute;top:0;bottom:25%;${side}:0;width:32%;z-index:6;`
      const fl = document.createElement('div')
      fl.className = `seek-flash ${side}`
      fl.textContent = delta > 0 ? '⏩ 10s' : '⏪ 10s'
      z.appendChild(fl)
      z.addEventListener('click', () => {
        const n = Date.now()
        if (n - lastTap < 300 && !locked) {
          const v = videoRef.current!
          v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + delta))
          setFlash(side)
          setTimeout(() => setFlash(null), 250)
        }
        lastTap = n
      })
      video.parentElement?.appendChild(z)
      return () => z.remove()
    }
    const dL = mkZone('left', -10)
    const dR = mkZone('right', 10)

    /* swipe vol / brightness (unchanged) */
    let startX = 0, startY = 0, mode: 'vol'|'bright'|null = null
    const info = document.createElement('div')
    info.className = 'info-flash'
    video.parentElement?.appendChild(info)

    const touchStart = (e: TouchEvent) => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; mode = null }
    const touchMove  = (e: TouchEvent) => {
      if (locked) return
      const dx = e.touches[0].clientX - startX
      const dy = e.touches[0].clientY - startY
      if (!mode) {
        if (Math.abs(dy) > Math.abs(dx)) mode = startX < window.innerWidth/2 ? 'bright' : 'vol'; else return
      }
      e.preventDefault()
      if (mode === 'vol') {
        const nv = Math.max(0, Math.min(1, vol - dy/300))
        setVol(nv)
        plyrRef.current && (plyrRef.current.volume = nv)
        info.textContent = `Volume ${(nv*100)|0}%`
      }
      if (mode === 'bright') {
        const nb = Math.max(.2, Math.min(1.2, bright - dy/300))
        setBright(nb)
        ;(video.parentElement as HTMLElement).style.filter = `brightness(${nb})`
        info.textContent = `Brightness ${Math.round(nb*100)}%`
      }
      info.classList.add('show')
    }
    const touchEnd = () => { info.classList.remove('show'); mode = null }
    video.addEventListener('touchstart', touchStart, { passive: true })
    video.addEventListener('touchmove',  touchMove,  { passive: false })
    video.addEventListener('touchend',   touchEnd)

    /* auto fullscreen on orientation */
    const ori = () => {
      if (!device.isMobile) return
      if (window.screen.orientation?.type.startsWith('landscape')) video.requestFullscreen?.()
      else document.exitFullscreen?.()
    }
    window.addEventListener('orientationchange', ori)

    /* cleanup */
    return () => {
      video.removeEventListener('contextmenu', ctx)
      dL()
      dR()
      video.removeEventListener('touchstart', touchStart)
      video.removeEventListener('touchmove',  touchMove)
      video.removeEventListener('touchend',   touchEnd)
      window.removeEventListener('orientationchange', ori)
      window.removeEventListener('pref-1080-change', prefListener)
      plyrRef.current?.destroy()
      hlsRef.current?.destroy()
    }
  }, [hlsUrl, autoplay, vol, bright, locked, device])

  /* ───── JSX ───── */
  return (
    <div className={`relative w-full ${device.isMobile ? 'aspect-video' : ''}`}>
      <video
        ref={videoRef}
        poster={poster}
        preload="metadata"
        playsInline
        crossOrigin="anonymous"
        controls
        controlsList="nodownload"
        className="w-full h-full object-contain bg-black"
      />
      <div className={`seek-flash left  ${flash==='left' ? 'show' : ''}`}>⏪ 10s</div>
      <div className={`seek-flash right ${flash==='right'? 'show' : ''}`}>⏩ 10s</div>
      {/* lock overlay */}
      {locked && <div className="absolute inset-0 z-10" onClick={() => setLocked(false)}></div>}
    </div>
  )
}
