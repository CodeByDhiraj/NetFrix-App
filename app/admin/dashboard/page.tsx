"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Eye, Upload, Users, PlayCircle, TrendingUp, Search, Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import JetLoader from "@/components/ui/jet-loader"
import { categories } from '@/lib/categories'


// ─── Cloudinary unsigned upload helper ───
const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const data = new FormData()
  data.append("file", file)
  data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!) // netfrix_unsigned
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_NAME}/image/upload`,
    { method: "POST", body: data },
  )
  return (await res.json()).secure_url as string
}


interface DashboardStats {
  totalUsers: number
  totalContent: number
  totalViews: number
  activeUsers: number
}

interface ContentItem {
  _id: string
  title: string
  type: string
  status: string
  views: number
  createdAt: string
  thumbnail: string
  description: string
  genre: string[]
  rating: string
  year: number
  duration: number
  categories: string[]
  seasons?: NewSeason[] 
}

/* put these right below your existing Episode / Season interfaces */
interface NewEpisode {
  number: number
  title: string
  description: string
  duration: number
  hlsUrl: string
  thumbnail?: string
  subtitles?: { language: string; url: string }[]
}
interface NewSeason {
  number: number
  title: string
  episodes: NewEpisode[]
}


interface Announcement {
  _id: string
  title: string
  message: string
  type: string
  priority: string
  targetAudience: string
  isActive: boolean
  startDate: string
  endDate?: string
  createdAt: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [content, setContent] = useState<ContentItem[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false)
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [seasons, setSeasons] = useState<NewSeason[]>([])


  // Form state for adding/editing content
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "movie",
    genre: "",
    rating: "PG-13",
    year: new Date().getFullYear(),
    duration: 120,
    thumbnail: "",
    hlsUrl: "",
    categories: [] as string[],
  })

  // Announcement form state
  const [announcementData, setAnnouncementData] = useState({
    title: "",
    message: "",
    type: "info",
    priority: "medium",
    targetAudience: "all",
    startDate: new Date().toISOString().slice(0, 16),
    endDate: "",
  })


  useEffect(() => {
    fetchDashboardData()
  }, [refreshKey])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch dashboard stats
      const statsResponse = await fetch("/api/admin/stats")
      const statsData = await statsResponse.json()

      // Fetch content
      const contentResponse = await fetch("/api/admin/content")
      const contentData = await contentResponse.json()

      // Fetch announcements
      const announcementsResponse = await fetch("/api/admin/announcements")
      const announcementsData = await announcementsResponse.json()

      if (statsData.success) {
        setStats(statsData.data)
      }

      if (contentData.success) {
        setContent(contentData.data)
      }

      if (announcementsData.success) {
        setAnnouncements(announcementsData.data)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.type === 'series' && seasons.length === 0) {
      alert('Please add at least 1 season')
      return
    }

    try {
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          
          genre: formData.genre.split(",").map((g) => g.trim()),
          categories: formData.categories,
          seasons: formData.type === 'series' ? seasons : undefined
        }),
      })
      // Reset seasons after adding content if needed
      setSeasons([])

      const data = await response.json()

      if (data.success) {
        setIsAddDialogOpen(false)
         setSeasons([])
        setFormData({
          title: "",
          description: "",
          type: "movie",
          genre: "",
          rating: "PG-13",
          year: new Date().getFullYear(),
          duration: 120,
          thumbnail: "",
          hlsUrl: "",
          categories: [] as string[],
        })
        setRefreshKey((prev) => prev + 1)
        alert("Content added successfully!")
      } else {
        alert(data.error || "Failed to add content")
        console.error("Add content error:", data)
      }
    } catch (error) {
      alert("Network error. Please try again.")
      console.error("Network error:", error)
    }
  }

  const handleEditContent = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingContent) return

    if (formData.type === 'series' && seasons.length === 0) {
    alert('Please add at least 1 season')
    return
  }

    try {
      const response = await fetch(`/api/admin/content/${editingContent._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          genre: formData.genre.split(",").map((g) => g.trim()),
          categories: formData.categories,
          seasons: formData.type === 'series' ? seasons : undefined
        }),
      })

      const data = await response.json()

      if (data.success) {
        setIsEditDialogOpen(false)
        setEditingContent(null)
        setSeasons([]) // Reset seasons after editing content if needed
        setRefreshKey((prev) => prev + 1)
        alert("Content updated successfully!")
      } else {
        alert(data.error || "Failed to update content")
      }
    } catch (error) {
      alert("Network error. Please try again.")
    }
  }

  const handleDeleteContent = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return

    try {
      const response = await fetch(`/api/admin/content/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        setRefreshKey((prev) => prev + 1)
        alert("Content deleted successfully!")
      } else {
        alert(data.error || "Failed to delete content")
      }
    } catch (error) {
      alert("Network error. Please try again.")
    }
  }

 const handleAddAnnouncement = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    // 👉 payload बनाने का सही तरीका
    const payload = {
      ...announcementData,
      startDate: new Date(announcementData.startDate).toISOString(),
      ...(announcementData.endDate
        ? { endDate: new Date(announcementData.endDate).toISOString() }
        : {}),
    };

    const response = await fetch("/api/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),   // ⬅️  अब यहाँ payload जा रहा है
    });

    const data = await response.json();

    if (data.success) {
      setIsAnnouncementDialogOpen(false);
      setAnnouncementData({
        title: "",
        message: "",
        type: "info",
        priority: "medium",
        targetAudience: "all",
        startDate: new Date().toISOString().slice(0, 16),
        endDate: "",
      });
      setRefreshKey((prev) => prev + 1);
      alert("Announcement created successfully!");
    } else {
      alert(data.error || "Failed to create announcement");
    }
  } catch (error) {
    alert("Network error. Please try again.");
    console.error("Network error:", error);
  }
};

  const handleDeleteAnnouncement = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete announcement "${title}"?`)) return

    try {
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        setRefreshKey((prev) => prev + 1)
        alert("Announcement deleted successfully!")
      } else {
        alert(data.error || "Failed to delete announcement")
      }
    } catch (error) {
      alert("Network error. Please try again.")
    }
  }

  const openEditDialog = (item: ContentItem) => {
    setEditingContent(item)
    setSeasons(item.type === 'series' ? (item as any).seasons ?? [] : [])
    setFormData({
      title: item.title,
      description: item.description,
      type: item.type,
      genre: item.genre.join(", "),
      rating: item.rating,
      year: item.year,
      duration: item.duration,
      thumbnail: item.thumbnail,
      hlsUrl: "", // Don't expose hlsurl in edit form
      categories: item.categories,
    })
    setIsEditDialogOpen(true)
  }

  const filteredContent = content.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.genre.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase())),
  )

// Season/Episode helpers
const addSeason = () => setSeasons(p => [
  ...p,
  { number: p.length + 1, title: `Season ${p.length + 1}`, episodes: [] }
])

const deleteSeason = (idx: number) =>
  setSeasons(p => p.filter((_, i) => i !== idx))

const addEpisode = (sIdx: number) =>
  setSeasons(p => {
    const copy = structuredClone(p)
    copy[sIdx].episodes.push({
      number: copy[sIdx].episodes.length + 1,
      title: "", description: "", duration: 0, hlsUrl: ""
    })
    return copy
  })


  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="flex items-center justify-center min-h-screen">
          <JetLoader />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-red-600">NetFrix Admin</h1>
            <p className="text-gray-400 mt-1">Content Management System</p>
          </div>
          <div className="flex space-x-3">
            <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Megaphone className="w-4 h-4 mr-2" />
                  New Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Announcement</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddAnnouncement} className="space-y-4">
                  <div>
                    <Label htmlFor="ann-title">Title</Label>
                    <Input
                      id="ann-title"
                      value={announcementData.title}
                      onChange={(e) => setAnnouncementData({ ...announcementData, title: e.target.value })}
                      className="bg-gray-800 border-gray-700"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="ann-message">Message</Label>
                    <Textarea
                      id="ann-message"
                      value={announcementData.message}
                      onChange={(e) => setAnnouncementData({ ...announcementData, message: e.target.value })}
                      className="bg-gray-800 border-gray-700"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="ann-type">Type</Label>
                      <Select
                        value={announcementData.type}
                        onValueChange={(value) => setAnnouncementData({ ...announcementData, type: value })}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="success">Success</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="error">Error</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="ann-priority">Priority</Label>
                      <Select
                        value={announcementData.priority}
                        onValueChange={(value) => setAnnouncementData({ ...announcementData, priority: value })}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="ann-audience">Target Audience</Label>
                      <Select
                        value={announcementData.targetAudience}
                        onValueChange={(value) => setAnnouncementData({ ...announcementData, targetAudience: value })}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="users">Users Only</SelectItem>
                          <SelectItem value="admins">Admins Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ann-start">Start Date</Label>
                      <Input
                        id="ann-start"
                        type="datetime-local"
                        value={announcementData.startDate}
                        onChange={(e) => setAnnouncementData({ ...announcementData, startDate: e.target.value })}
                        className="bg-gray-800 border-gray-700"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="ann-end">End Date (Optional)</Label>
                      <Input
                        id="ann-end"
                        type="datetime-local"
                        value={announcementData.endDate}
                        onChange={(e) => setAnnouncementData({ ...announcementData, endDate: e.target.value })}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAnnouncementDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      Create Announcement
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Content
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Content</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddContent} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="bg-gray-800 border-gray-700"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="movie">Movie</SelectItem>
                          <SelectItem value="series">Series</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-gray-800 border-gray-700"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="rating">Rating</Label>
                      <Select
                        value={formData.rating}
                        onValueChange={(value) => setFormData({ ...formData, rating: value })}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="G">G</SelectItem>
                          <SelectItem value="PG">PG</SelectItem>
                          <SelectItem value="PG-13">PG-13</SelectItem>
                          <SelectItem value="R">R</SelectItem>
                          <SelectItem value="TV-MA">TV-MA</SelectItem>
                          <SelectItem value="TV-14">TV-14</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: Number.parseInt(e.target.value) })}
                        className="bg-gray-800 border-gray-700"
                        min="1900"
                        max="2030"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) })}
                        className="bg-gray-800 border-gray-700"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="genre">Genres (comma separated)</Label>
                    <Input
                      id="genre"
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      className="bg-gray-800 border-gray-700"
                      placeholder="Action, Drama, Thriller"
                      required
                    />
                  </div>

                  {/* Categories (multi-select check-boxes) */}
                  <div>
                    <Label>Categories</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                      {categories.map((c) => (
                        <label key={c.value} className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            className="accent-red-600"
                            checked={formData.categories.includes(c.value)}
                            onChange={(e) => {
                              setFormData((prev) => {
                                const list = new Set(prev.categories)
                                e.target.checked ? list.add(c.value) : list.delete(c.value)
                                return { ...prev, categories: [...list] }
                              })
                            }}
                          />
                          <span>{c.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* ── ONLY show when it’s a series ─────────────────── */}
                  {formData.type === 'series' && (
                    <div className="space-y-4 border-t border-gray-700 pt-6">
                      <h3 className="text-lg font-semibold">Seasons & Episodes</h3>

                      {/* list every season */}
                      {seasons.map((s, sIdx) => (
                        <div key={sIdx} className="border border-gray-700 rounded p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <Label className="shrink-0">Season title</Label>
                            <Input
                              value={s.title}
                              onChange={e => {
                                const copy = [...seasons]
                                copy[sIdx].title = e.target.value
                                setSeasons(copy)
                              }}
                              className="bg-gray-800 border-gray-700 flex-1"
                            />
                            {/* delete season */}
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => setSeasons(prev => prev.filter((_, i) => i !== sIdx))}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* EPISODE LIST */}
                          {s.episodes.map((ep, eIdx) => (
                            <div key={eIdx} className="border border-gray-600 rounded p-3 space-y-2">
                              <div className="flex items-center gap-2">
                                <Label className="shrink-0">Ep Title</Label>
                                <Input
                                  value={ep.title}
                                  onChange={e => {
                                    const copy = [...seasons]
                                    copy[sIdx].episodes[eIdx].title = e.target.value
                                    setSeasons(copy)
                                  }}
                                  className="bg-gray-800 border-gray-700 flex-1"
                                />
                                {/* delete episode */}
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => {
                                    setSeasons(prev => {
                                      const copy = [...prev]
                                      copy[sIdx].episodes = copy[sIdx].episodes.filter((_, i) => i !== eIdx)
                                      return copy
                                    })
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>

                              <Input
                                placeholder="HLS URL (.m3u8)"
                                value={ep.hlsUrl}
                                onChange={e => {
                                  const copy = [...seasons]
                                  copy[sIdx].episodes[eIdx].hlsUrl = e.target.value
                                  setSeasons(copy)
                                }}
                                className="bg-gray-800 border-gray-700"
                              />

                              <div className="flex gap-2">
                                <Input
                                  placeholder="Duration (min)"
                                  type="number"
                                  value={ep.duration || ''}
                                  onChange={e => {
                                    const copy = [...seasons]
                                    copy[sIdx].episodes[eIdx].duration = +e.target.value
                                    setSeasons(copy)
                                  }}
                                  className="bg-gray-800 border-gray-700 w-32"
                                />
                                <Input
                                  placeholder="Thumbnail URL (optional)"
                                  value={ep.thumbnail || ''}
                                  onChange={e => {
                                    const copy = [...seasons]
                                    copy[sIdx].episodes[eIdx].thumbnail = e.target.value
                                    setSeasons(copy)
                                  }}
                                  className="bg-gray-800 border-gray-700 flex-1"
                                />
                              </div>

                              <Textarea
                                placeholder="Episode description"
                                value={ep.description}
                                onChange={e => {
                                  const copy = [...seasons]
                                  copy[sIdx].episodes[eIdx].description = e.target.value
                                  setSeasons(copy)
                                }}
                                className="bg-gray-800 border-gray-700"
                                rows={2}
                              />
                            </div>
                          ))}

                          {/* add episode btn */}
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setSeasons(prev => {
                              const copy = [...prev]
                              copy[sIdx].episodes.push({
                                number: copy[sIdx].episodes.length + 1,
                                title: '',
                                description: '',
                                duration: 0,
                                hlsUrl: ''
                              })
                              return copy
                            })}
                          >
                            + Add Episode
                          </Button>
                        </div>
                      ))}

                      {/* add season btn */}
                      <Button
                        type="button"
                        onClick={() => setSeasons(prev => [
                          ...prev,
                          { number: prev.length + 1, title: `Season ${prev.length + 1}`, episodes: [] }
                        ])}
                      >
                        + Add Season
                      </Button>
                    </div>
                  )}



                  <div>
                    <Label htmlFor="thumbnail">Thumbnail / Poster</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      className="bg-gray-800 border-gray-700"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        // Cloudinary upload
                        const data = new FormData();
                        data.append("file", file);
                        data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!);

                        const res = await fetch(
                          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_NAME}/image/upload`,
                          { method: "POST", body: data }
                        );

                        const result = await res.json();
                        setFormData({ ...formData, thumbnail: result.secure_url });
                      }}
                    />
                    {formData.thumbnail && (
                      <img
                        src={formData.thumbnail}
                        alt="Preview"
                        className="h-24 mt-2 rounded border border-gray-700"
                      />
                    )}
                  </div>

                  <div>
                    <Label htmlFor="hlsUrl">HLS Playlist (.m3u8)</Label>
                    <Input
                      id="hlsUrl"
                      value={formData.hlsUrl}
                      onChange={(e) => setFormData({ ...formData, hlsUrl: e.target.value })}
                      className="bg-gray-800 border-gray-700"
                     placeholder="https://fallmodz.in/vd/v0/index.m3u8"
                  required={formData.type === 'movie'}
                        />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-red-600 hover:bg-red-700">
                      Add Content
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
              <Users className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.totalUsers.toLocaleString() || 0}</div>
              <p className="text-xs text-green-500 mt-1">Live data</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Content</CardTitle>
              <PlayCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.totalContent.toLocaleString() || 0}</div>
              <p className="text-xs text-green-500 mt-1">Live data</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{((stats?.totalViews || 0) / 1000000).toFixed(1)}M</div>
              <p className="text-xs text-green-500 mt-1">Live data</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Users</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.activeUsers.toLocaleString() || 0}</div>
              <p className="text-xs text-green-500 mt-1">Live data</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Content and Announcements */}
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="bg-gray-900 border-gray-800">
            <TabsTrigger value="content" className="data-[state=active]:bg-red-600">
              Content Management
            </TabsTrigger>
            <TabsTrigger value="announcements" className="data-[state=active]:bg-blue-600">
              Announcements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Content Management</CardTitle>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search content..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64 bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <Button className="bg-red-600 hover:bg-red-700" onClick={() => setRefreshKey((prev) => prev + 1)}>
                      <Upload className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-400">Content</TableHead>
                      <TableHead className="text-gray-400">Type</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Views</TableHead>
                      <TableHead className="text-gray-400">Upload Date</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContent.map((item) => (
                      <TableRow key={item._id} className="border-gray-800">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <img
                              src={item.thumbnail || "/placeholder.svg?height=60&width=100"}
                              alt={item.title}
                              className="w-16 h-10 object-cover rounded"
                            />
                            <div>
                              <div className="font-medium text-white">{item.title}</div>
                              <div className="text-sm text-gray-400">{item.genre.join(", ")}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.type === "movie" ? "default" : "secondary"}>
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={item.status === "published" ? "default" : "secondary"}
                            className={item.status === "published" ? "bg-green-600" : "bg-yellow-600"}
                          >
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">{item.views.toLocaleString()}</TableCell>
                        <TableCell className="text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button size="icon" variant="ghost" className="text-blue-400 hover:text-blue-300">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-green-400 hover:text-green-300"
                              onClick={() => openEditDialog(item)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-400 hover:text-red-300"
                              onClick={() => handleDeleteContent(item._id, item.title)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredContent.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    {searchQuery ? "No content found matching your search." : "No content available."}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Announcements</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-400">Title</TableHead>
                      <TableHead className="text-gray-400">Type</TableHead>
                      <TableHead className="text-gray-400">Priority</TableHead>
                      <TableHead className="text-gray-400">Audience</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Created</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {announcements.map((announcement) => (
                      <TableRow key={announcement._id} className="border-gray-800">
                        <TableCell>
                          <div>
                            <div className="font-medium text-white">{announcement.title}</div>
                            <div className="text-sm text-gray-400 truncate max-w-xs">{announcement.message}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              announcement.type === "info"
                                ? "bg-blue-600"
                                : announcement.type === "success"
                                  ? "bg-green-600"
                                  : announcement.type === "warning"
                                    ? "bg-yellow-600"
                                    : "bg-red-600"
                            }
                          >
                            {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={announcement.priority === "high" ? "destructive" : "secondary"}
                            className={
                              announcement.priority === "high"
                                ? "bg-red-600"
                                : announcement.priority === "medium"
                                  ? "bg-yellow-600"
                                  : "bg-gray-600"
                            }
                          >
                            {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">{announcement.targetAudience}</TableCell>
                        <TableCell>
                          <Badge className={announcement.isActive ? "bg-green-600" : "bg-red-600"}>
                            {announcement.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-400 hover:text-red-300"
                              onClick={() => handleDeleteAnnouncement(announcement._id, announcement.title)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {announcements.length === 0 && (
                  <div className="text-center py-8 text-gray-400">No announcements available.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditContent} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-gray-800 border-gray-700"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="movie">Movie</SelectItem>
                    <SelectItem value="series">Series</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>



            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-gray-800 border-gray-700"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-rating">Rating</Label>
                <Select value={formData.rating} onValueChange={(value) => setFormData({ ...formData, rating: value })}>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="G">G</SelectItem>
                    <SelectItem value="PG">PG</SelectItem>
                    <SelectItem value="PG-13">PG-13</SelectItem>
                    <SelectItem value="R">R</SelectItem>
                    <SelectItem value="TV-MA">TV-MA</SelectItem>
                    <SelectItem value="TV-14">TV-14</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-year">Year</Label>
                <Input
                  id="edit-year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: Number.parseInt(e.target.value) })}
                  className="bg-gray-800 border-gray-700"
                  min="1900"
                  max="2030"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-duration">Duration (minutes)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) })}
                  className="bg-gray-800 border-gray-700"
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-genre">Genres (comma separated)</Label>
              <Input
                id="edit-genre"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="bg-gray-800 border-gray-700"
                placeholder="Action, Drama, Thriller"
                required
              />
            </div>

            {/* Categories (multi-select check-boxes) */}
            <div>
              <Label>Categories</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                {categories.map((c) => (
                  <label key={c.value} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      className="accent-red-600"
                      checked={formData.categories.includes(c.value)}
                      onChange={(e) => {
                        setFormData((prev) => {
                          const list = new Set(prev.categories)
                          e.target.checked ? list.add(c.value) : list.delete(c.value)
                          return { ...prev, categories: [...list] }
                        })
                      }}
                    />
                    <span>{c.title}</span>
                  </label>
                ))}
              </div>
            </div>


            <div>
              <Label htmlFor="edit-thumbnail">Thumbnail / Poster</Label>
              <Input
                type="file"
                accept="image/*"
                className="bg-gray-800 border-gray-700"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const data = new FormData();
                  data.append("file", file);
                  data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!);

                  const res = await fetch(
                    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_NAME}/image/upload`,
                    { method: "POST", body: data }
                  );

                  const result = await res.json();
                  setFormData({ ...formData, thumbnail: result.secure_url });
                }}
              />

              {formData.thumbnail && (
                <img
                  src={formData.thumbnail}
                  alt="Thumbnail Preview"
                  className="h-24 mt-2 rounded border border-gray-700"
                />
              )}
            </div>


            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700">
                Update Content
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
