// File: components/ui/announcement-bell.tsx (responsive dropdown)
"use client"

import { useEffect, useState } from "react"
import { Bell, CheckCircle, Info, AlertTriangle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import axios from "axios"

interface Announcement {
  _id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  priority: "low" | "medium" | "high"
  endDate: string
}

const iconMap: Record<Announcement["type"], JSX.Element> = {
  info: <Info className="h-4 w-4 text-blue-600" />,
  success: <CheckCircle className="h-4 w-4 text-green-400" />,
  warning: <AlertTriangle className="h-4 w-4 text-yellow-400" />,
  error: <AlertCircle className="h-4 w-4 text-red-600" />,
}

export default function AnnouncementBell() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [readIds, setReadIds] = useState<string[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)

  /* ───────── Fetch every 30 s ───────── */
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get("/api/announcements")
        if (res.data.success) setAnnouncements(res.data.data as Announcement[])
      } catch (err) {
        console.error("Error fetching announcements", err)
      }
    }
    fetchAnnouncements()
    const id = setInterval(fetchAnnouncements, 30_000)
    return () => clearInterval(id)
  }, [])

  const unread = announcements.filter((a) => !readIds.includes(a._id))

  const markAsRead = (id: string) => setReadIds((prev) => [...prev, id])

  return (
    <div className="relative">
      {/* Bell button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setDropdownOpen((o) => !o)}
        className="relative"
      >
        <Bell className="h-5 w-5 text-white" />
        {unread.length > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center px-1 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">
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
            announcements.map((a) => (
              <div
                key={a._id}
                className="flex gap-3 items-start px-4 py-3 border-b border-gray-800 hover:bg-gray-800 transition-colors"
              >
                <div className="pt-1">{iconMap[a.type]}</div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-white mb-0.5 leading-tight">
                    {a.title}
                  </p>
                  <p className="text-xs text-gray-300 leading-snug">
                    {a.message}
                  </p>
                </div>
                {!readIds.includes(a._id) && (
                  <button
                    className="text-xs text-blue-400 hover:underline"
                    onClick={() => markAsRead(a._id)}
                  >
                    Mark as read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
