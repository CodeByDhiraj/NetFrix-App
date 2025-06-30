'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function ComingSoonToast({ open }: { open: boolean }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted || !open) return null
  return createPortal(
    <div className="fixed top-6 left-1/2 z-[9999] -translate-x-1/2 animate-slideDown">
      <div className="flex flex-col items-center rounded-xl bg-white px-6 py-4 shadow-xl">
        <div className=" flex items-center justify-center">
           <img
                        src="/netfrix-logo.png"
                        alt="logo"
                        width={90}
                        height={90}
                        className="mx-auto mb-4 rounded-full border-[5px] border-red-600"
                      />
        </div>
        <p className="text-sm font-semibold text-black text-center leading-5">
          My List Feature<br />
          Coming Soon...
        </p>
      </div>
    </div>,
    document.body
  )
}
