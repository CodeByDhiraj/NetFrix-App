"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Bell, User, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <header className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-red-600">
            NetFrix
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="hover:text-gray-300 transition-colors">
              Home
            </Link>
            <Link href="/movies" className="hover:text-gray-300 transition-colors">
              Movies
            </Link>
            <Link href="/series" className="hover:text-gray-300 transition-colors">
              TV Series
            </Link>
            <Link href="/my-list" className="hover:text-gray-300 transition-colors">
              My List
            </Link>
          </nav>

          {/* Search and User Actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <Search className="w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
            </div>

            <Button variant="ghost" size="icon" className="text-white hover:text-gray-300">
              <Bell className="w-5 h-5" />
            </Button>

            <Button variant="ghost" size="icon" className="text-white hover:text-gray-300">
              <User className="w-5 h-5" />
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-800">
            <nav className="flex flex-col space-y-4 mt-4">
              <Link href="/" className="hover:text-gray-300 transition-colors">
                Home
              </Link>
              <Link href="/movies" className="hover:text-gray-300 transition-colors">
                Movies
              </Link>
              <Link href="/series" className="hover:text-gray-300 transition-colors">
                TV Series
              </Link>
              <Link href="/my-list" className="hover:text-gray-300 transition-colors">
                My List
              </Link>
              <div className="flex items-center space-x-2 pt-2">
                <Search className="w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
