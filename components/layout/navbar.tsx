"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Bell, User, Menu, X, LogOut, Settings, Sliders } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSession } from "next-auth/react"
import AnnouncementBell from "@/components/ui/AnnouncementBell";
import ProfilePopup from "@/components/ui/ProfilePopup"
import ComingSoonToast from '@/components/ComingSoonToast'
import SettingsPanel from "@/components/ui/SettingsPanel"


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showToast, setShowToast] = useState(false)
  const [isProfilePopupOpen, setProfilePopupOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()




  const userRole = session?.user?.role || "user"

  /* toast helper */
  const triggerToast = () => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)               // 3 sec auto hide
  }

  const isActive = (path: string) => pathname === path

  const handleLogout = () => {
    document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    window.location.href = "/auth/login"
  }

  const handleToggle1080 = (enabled: boolean) => {
    window.dispatchEvent(new CustomEvent("pref-1080-change", { detail: enabled }))
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-red-600 hover:text-red-500 transition-colors">
            NetFrix
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className={`hover:text-gray-300 transition-colors ${isActive("/") ? "text-white font-semibold" : "text-gray-400"}`}>Home</Link>
            <Link href="/movies" className={`hover:text-gray-300 transition-colors ${isActive("/movies") ? "text-white font-semibold" : "text-gray-400"}`}>Movies</Link>
            <Link href="/series" className={`hover:text-gray-300 transition-colors ${isActive("/series") ? "text-white font-semibold" : "text-gray-400"}`}>TV Series</Link>
            <button
              onClick={triggerToast}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              My List
            </button>
          </nav>

          {/* Search and User Actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <Search className="w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search movies, series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
                  }
                }}
                className="w-64 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
            </div>

            <AnnouncementBell />


            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white  hover:text-gray-900">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent sideOffset={4} className="bg-gray-900 border-gray-800 text-white overflow-hidden">
                <DropdownMenuItem
                  onClick={() => setProfilePopupOpen(true)}
                  className="flex items-center cursor-pointer"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>

                {/* settings / quality */}
                <DropdownMenuItem onClick={() => setSettingsOpen(true)} className="flex items-center">
                  <Sliders className="w-4 h-4 mr-2" />
                  Streaming Settings
                </DropdownMenuItem>



                {/* ✅ Only show if admin */}
                {userRole === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard" className="flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center text-red-400">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Toggle */}
            <Button variant="ghost" size="icon" className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-800">
            <nav className="flex flex-col space-y-4 mt-4">
              <Link href="/" className="hover:text-gray-300 transition-colors">Home</Link>
              <Link href="/movies" className="hover:text-gray-300 transition-colors">Movies</Link>
              <Link href="/series" className="hover:text-gray-300 transition-colors">TV Series</Link>
              <button onClick={triggerToast} className="flex items-center cursor-pointer">My List</button>

             <Input
                type="text"
                  placeholder="Search content..."
                   value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                          if (e.key === "Enter" && searchQuery.trim()) {
                        window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
                            }
                       }}
                       className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                    />

              </div>
            </nav>
          </div>
        )}
      </div>
      {/* Profile Popup */}
      <ProfilePopup isOpen={isProfilePopupOpen} onClose={() => setProfilePopupOpen(false)} />
      <ComingSoonToast open={showToast} />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </header>
  )
}
