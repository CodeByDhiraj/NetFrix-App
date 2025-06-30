'use client'

import { useEffect, useState, MouseEvent } from 'react'
import Cookies from 'js-cookie'

interface Props {
  open: boolean
  onClose: () => void
}

export default function SettingsPanel({ open, onClose }: Props) {
  const [enabled, setEnabled] = useState(Cookies.get('hd-enabled') === '1')

  const toggle = () => {
    const next = !enabled
    setEnabled(next)
    Cookies.set('hd-enabled', next ? '1' : '0', { sameSite: 'strict', expires: 365 })
    window.dispatchEvent(new CustomEvent('hd-change', { detail: { enabled: next } }))
  }

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[99] flex items-start justify-around pt-16"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        onClick={(e: MouseEvent) => e.stopPropagation()}
        className="relative w-[92%]  sm:w-[480px] bg-gray-400 text-zinc-800
                   rounded-xl shadow-2xl animate-[slideDown_.35s_ease-out] mt-18"
      >
        <h2 className="text-center tracking-[0.35em] text-3xl font-semibold py-7 select-none">
          SETTING
        </h2>

        {/* Toggle Switch */}
        <div className="px-6 pb-10">
          <div
            onClick={toggle}
            role="button"
            aria-pressed={enabled}
            className="relative h-14 w-full rounded-full cursor-pointer select-none overflow-hidden
                       bg-[#7b0000] focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            {/* Label */}
            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-semibold text-white pointer-events-none">
              1080p on/off
            </span>

            {/* Right black mask */}
            <span
              className={`absolute top-0 right-0 h-full bg-black transition-all duration-300
                          ${enabled ? 'w-[34%]' : 'w-[34%]'}`}
            />

            {/* Knob */}
            <span
              className={`absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center
                          text-xs font-extrabold transition-all duration-300
                          ${enabled
                            ? 'right-2 bg-green-500 text-red-600'
                            : 'left-[calc(66%-0.5rem)] bg-slate-700 text-red-800'}`}
            >
              {enabled ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      </div>

      {/* Slide animation */}
      <style jsx>{`
        @keyframes slideDown {
          from { transform: translateY(-40px); opacity: 0 }
          to { transform: translateY(0); opacity: 1 }
        }
      `}</style>
    </div>
  )
}
