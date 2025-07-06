// components/ui/announcement-bell.tsx
"use client"

import { useEffect, useState } from "react"
import {
  Bell,
  CheckCircle,
  Info,
  AlertTriangle,
  AlertCircle,
  CircleCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import axios from "axios"

/* ─── Persistence helpers (localStorage ➜ cookie fallback) ─── */
const KEY = "nf_readAnn"

const getPersisted = (): string[] => {
  /* 1️⃣ try localStorage (WebView survives app restart) */
  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(KEY)
      if (raw) return JSON.parse(raw)
    }
  } catch {/* ignore quota / security errors */}

  /* 2️⃣ cookie fallback (desktop browsers) */
  if (typeof document !== "undefined") {
    const m = document.cookie.match(new RegExp(`(?:^|; )${KEY}=([^;]*)`))
    if (m) return JSON.parse(decodeURIComponent(m[1]))
  }
  return []
}

const savePersisted = (ids: string[]) => {
  /* save to localStorage if possible */
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(ids))
    }
  } catch {/* ignore */}

  /* write a cookie too (30 days) */
  if (typeof document !== "undefined") {
    const maxAge = 60 * 60 * 24 * 30
    document.cookie =
      `${KEY}=${encodeURIComponent(JSON.stringify(ids))}; path=/; max-age=${maxAge}`
  }
}
/* ──────────────────────────────────────────────────────────── */

interface Announcement {
  _id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  priority: "low" | "medium" | "high"
  endDate: string
}

const iconMap: Record<Announcement["type"], JSX.Element> = {
  info: <Info className="h-4 w-4 text-blue-500" />,
  success: <CheckCircle className="h-4 w-4 text-green-400" />,
  warning: <AlertTriangle className="h-4 w-4 text-yellow-400" />,
  error: <AlertCircle className="h-4 w-4 text-red-500" />,
}

export default function AnnouncementBell() {
  /* SSR-safe initial state; badge never flashes */
  const [readIds, setReadIds] = useState<string[]>(
    typeof window === "undefined" ? [] : getPersisted()
  )

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)

  /* Fetch every 30 s */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get("/api/announcements")
        if (res.data.success) setAnnouncements(res.data.data)
      } catch (e) {
        console.error("ann fetch failed:", e)
      }
    }
    load()
    const id = setInterval(load, 30_000)
    return () => clearInterval(id)
  }, [])

  /* Helpers */
  const unread = announcements.filter((a) => !readIds.includes(a._id)).length

  const markAsRead = (id: string) => {
    if (readIds.includes(id)) return
    const updated = [...readIds, id]
    setReadIds(updated)
    savePersisted(updated)        // ← cookie + localStorage
  }

  return (
    <div className="relative">
      {/* Bell */}
     <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-md transition
             bg-transparent text-white
             hover:bg-white active:bg-white/80
             data-[state=open]:bg-white
             data-[state=open]:text-neutral-900"
      >
        <Bell className="h-5 w-5" />

        {unread.length > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center
                     px-1 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">
            {unread.length}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      {dropdownOpen && (
        <div
          className="absolute top-full mt-2 z-50
             right-1/2 translate-x-[42%] sm:right-0 sm:translate-x-0
             w-[90vw] sm:w-80 md:w-96
             max-h-96 overflow-y-auto
             bg-gray-900 border border-gray-700 rounded-md shadow-lg"
        >
          <div className="px-4 py-2 border-b border-gray-700 text-white font-semibold text-sm">
            Announcements
          </div>

          {announcements.length === 0 ? (
            <p className="p-4 text-sm text-gray-400">No announcements</p>
          ) : (
            announcements.map((a) => {
              const already = readIds.includes(a._id)
              return (
                <div
                  key={a._id}
                  className="flex gap-3 items-start px-4 py-3 border-b border-gray-800 hover:bg-gray-800 transition-colors"
                >
                  <div className="pt-1">
                    {already ? (
                      <CircleCheck className="h-4 w-4 text-gray-500" />
                    ) : (
                      iconMap[a.type]
                    )}
                  </div>

                  <div className="flex-1">
                    <p
                      className={`font-medium text-sm leading-tight ${
                        already ? "text-gray-400" : "text-white"
                      }`}
                    >
                      {a.title}
                    </p>
                    <p
                      className={`text-xs leading-snug ${
                        already ? "text-gray-500" : "text-gray-300"
                      }`}
                    >
                      {a.message}
                    </p>
                  </div>

                  {!already && (
                    <button
                      className="text-xs text-blue-400 hover:underline"
                      onClick={() => markAsRead(a._id)}
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
