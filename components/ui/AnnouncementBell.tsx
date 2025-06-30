// File: components/ui/announcement-bell.tsx
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

const iconMap = {
  info: <Info className="h-4 w-4 text-blue-600" />,
  success: <CheckCircle className="h-4 w-4 text-green-400" />,
  warning: <AlertTriangle className="h-4 w-4 text-yellow-400" />,
  error: <AlertCircle className="h-4 w-4 text-red-600" />,
}

export default function AnnouncementBell() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [readIds, setReadIds] = useState<string[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
  fetchAnnouncements(); // pehli baar load karo

  const interval = setInterval(() => {
    fetchAnnouncements(); // har 30 second mein dubara check karo
  }, 30000);

  return () => clearInterval(interval); // cleanup
}, []);


  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get("/api/announcements")
      if (res.data.success) setAnnouncements(res.data.data)
    } catch (err) {
      console.error("Error fetching announcements", err)
    }
  }

  const markAsRead = (id: string) => {
    setReadIds((prev) => [...prev, id])
  }

  const unread = announcements.filter((a) => !readIds.includes(a._id))

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5 text-transparnt" />
        {unread.length > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center px-1 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">
            {unread.length}
          </span>
        )}
      </Button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-50 max-h-[400px] overflow-y-auto">
          <div className="px-4 py-2 border-b border-gray-700 text-white font-semibold text-sm">Announcements</div>

          {announcements.length === 0 ? (
            <p className="p-4 text-sm text-gray-400">No announcements</p>
          ) : (
            announcements.map((a) => (
              <div
                key={a._id}
                className={`flex gap-3 items-start px-4 py-3 border-b border-gray-800 hover:bg-gray-800 transition-all duration-150`}
              >
                <div className="pt-1">{iconMap[a.type]}</div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-white mb-1 leading-tight">{a.title}</p>
                  <p className="text-xs text-gray-300 leading-snug">{a.message}</p>
                </div>
                {!readIds.includes(a._id) && (
                  <button
                    className="text-xs text-blue-400 hover:underline"
                    onClick={() => markAsRead(a._id)}
                  >
                    Mark as Read
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
