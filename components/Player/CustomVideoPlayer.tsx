/* ------------------------------------------- *
 * components/Player/CustomVideoPlayer.tsx     *
 * ------------------------------------------- */
'use client'

import { useEffect, useRef } from 'react'
import Hls  from 'hls.js'
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'

interface SubtitleTrack { label:string; src:string; lang:string }
interface Props {
  hlsUrl:   string
  poster?:  string
  subtitles?: SubtitleTrack[]
}

export default function CustomVideoPlayer ({
  hlsUrl, poster, subtitles = [],
}: Props) {

  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef   = useRef<Hls|null>(null)
  const plyrRef  = useRef<Plyr|null>(null)

  /* one-time Netflix theme + spinner CSS */
  useEffect(() => {
    if (document.getElementById('nf-plyr-theme')) return
    const style = document.createElement('style')
    style.id  = 'nf-plyr-theme'
    style.textContent = `
      :root{ --plyr-color-main:#a30008 !important }        /* Netflix red */
      .nf-spinner{
        position:absolute;top:50%;left:50%;
        width:60px;height:60px;margin:-30px 0 0 -30px;
        border:4px solid rgba(255,255,255,.35);
        border-top-color:#e50914;border-radius:50%;
        animation:spin .75s linear infinite;pointer-events:none;
        display:none;z-index:7
      }
      .plyr--fullscreen .nf-spinner{
        width:70px;height:70px;margin:-35px 0 0 -35px;
      }
      @keyframes spin{to{transform:rotate(360deg)}}
    `
    document.head.appendChild(style)
  }, [])

  /* build / rebuild on URL */
  useEffect(() => {
    if (typeof window === 'undefined') return
    const video = videoRef.current
    if (!video) return

    /* prevent save-as */
    const banCtx = (e:MouseEvent)=>e.preventDefault()
    video.addEventListener('contextmenu', banCtx)

    /* Plyr opts */
    const opts: Plyr.Options & any = {
      controls:[
        'play-large','rewind','fast-forward','play','progress','current-time',
        'mute','volume','captions','settings','pip','fullscreen',
      ],
      settings:['captions','quality','speed'],
      speed:{ selected:1, options:[0.5,0.75,1,1.25,1.5,2] },
      seekTime:10,
      disableContextMenu:true,
      i18n:{ qualityLabel:(q:number)=> q===0?'Auto':`${q}p` },
    }

    /* helper ⇒ init Plyr + spinner + events */
    const makePlayer = () => {
      plyrRef.current = new Plyr(video, opts)
      const box = plyrRef.current.elements.container

      /* spinner */
      const spin = document.createElement('div')
      spin.className = 'nf-spinner'
      if (box) {
        box.appendChild(spin)
      }

      const show = () => (spin.style.display='block')
      const hide = () => (spin.style.display='none')

      plyrRef.current.on('waiting', show)
      plyrRef.current.on('seeking', show)
      plyrRef.current.on('playing', hide)
      plyrRef.current.on('canplay', hide)
    }

    /* ─── HLS ─── */
    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker:true })
      hlsRef.current = hls
      hls.loadSource(hlsUrl)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        /* quality menu */
        const heights = [...new Set(hls.levels.map(l=>l.height).filter(Boolean))]
                         .sort((a,b)=>b-a)
        if (heights.length > 1){
          heights.unshift(0)                  // 0 = Auto
          opts.quality = {
            default:0, options:heights, forced:true,
            onChange:(v:number)=>{
              hls.currentLevel = v===0 ? -1
                                       : hls.levels.findIndex(l=>l.height===v)
            },
          }
        }
        makePlayer()
      })

      hls.on(Hls.Events.ERROR,(_,d)=>{
        console.error('[HLS]', d)
        if (d?.fatal){
          plyrRef.current?.destroy(); hls.destroy()
          video.innerHTML = '<span style="color:white">Stream error</span>'
        }
      })
    } else {        /* Safari */
      video.src = hlsUrl
      makePlayer()
    }

    /* ±10-sec tap zones (mobile) */
    const zone = (side:'left'|'right',delta:number)=>{
      const z = document.createElement('div')
      z.style.cssText=`position:absolute;top:0;bottom:0;${side}:0;width:40%;z-index:4`
      const seek = ()=>{
        if(!videoRef.current)return
        const v = videoRef.current
        v.currentTime = Math.max(0,Math.min(v.duration,v.currentTime+delta))
      }
      z.addEventListener('click', seek)
      z.addEventListener('touchstart', seek)
      video.parentElement?.appendChild(z)
      return ()=>z.remove()
    }
    const disposeL = zone('left',-10)
    const disposeR = zone('right',10)

    /* cleanup */
    return ()=>{
      video.removeEventListener('contextmenu',banCtx)
      disposeL();disposeR()
      plyrRef.current?.destroy()
      hlsRef.current?.destroy()
    }
  }, [hlsUrl])

  return (
    <video
      ref={videoRef}
      poster={poster}
      preload="metadata"
      playsInline
      crossOrigin="anonymous"
      controls
      controlsList="nodownload"
      className="w-full h-full object-contain bg-black"
    >
      {subtitles.map((t,i)=>(
        <track key={i} kind="subtitles" label={t.label} src={t.src} srcLang={t.lang}/>
      ))}
    </video>
  )
}
